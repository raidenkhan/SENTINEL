import fitz  # PyMuPDF
from typing import Optional, List, Dict, Tuple
import os
import io
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

# RapidOCR instances are created per-worker: the ONNX inference session isn't
# guaranteed thread-safe for concurrent calls on one instance, so each OCR
# worker thread lazily builds its own engine (model load ~1-2s, one-time cost).
_thread_local = threading.local()

# Cap OCR input so very large rendered pages don't take seconds each. RapidOCR
# downscales internally anyway; this only stops pathological extremes.
OCR_MAX_SIDE = 1600


def _get_engine():
    """Per-thread RapidOCR instance (lazy, cached on the worker thread)."""
    eng = getattr(_thread_local, "ocr_engine", None)
    if eng is None:
        eng = RapidOCR()
        _thread_local.ocr_engine = eng
    return eng


def _ocr_image(img) -> str:
    """Run RapidOCR on a PIL image. Returns OCR text ('' if nothing found)."""
    try:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        # RapidOCR can take bytes, ndarray, or path
        result, _ = _get_engine()(buf.getvalue())
        if result:
            ocr_text = "\n".join([line[1] for line in result])
            if ocr_text.strip():
                return "\n[OCR Content]:\n" + ocr_text
    except Exception as ocr_err:
        print(f"RapidOCR failed: {ocr_err}")
    return ""


def _render_ocr_input(page) -> Image.Image:
    """Render a page at 2x (higher res for OCR), capping pathologically large pages."""
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    if pix.n > 3:
        # CMYK / alpha pixmaps must be converted to RGB for PIL
        pix = fitz.Pixmap(fitz.csRGB, pix)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    if max(img.size) > OCR_MAX_SIDE:
        img.thumbnail((OCR_MAX_SIDE, OCR_MAX_SIDE), Image.LANCZOS)
    return img


def _ocr_page(page) -> str:
    """Run RapidOCR on a single page (compat wrapper). Returns OCR text ('' if nothing found)."""
    try:
        return _ocr_image(_render_ocr_input(page))
    except Exception as ocr_err:
        print(f"RapidOCR fallback failed on page {page.number}: {ocr_err}")
    return ""


def _scan_doc(doc) -> Tuple[Optional[str], List[Dict]]:
    """
    Scans an already-open PyMuPDF document once, extracting text AND diagrams.

    Returns (extracted_text, diagrams). Text is None if nothing was extracted.

    - Per-page error handling: a corrupt page is skipped without losing the
      rest of the document (previously one bad page killed the whole parse).
    - OCR only runs on pages that have images AND very little embedded text,
      so clean digital PDFs skip the (very slow) RapidOCR entirely.
    """
    texts_by_page: Dict[int, str] = {}
    ocr_jobs: List[Tuple[int, Image.Image]] = []
    diagrams = []
    for page_num in range(len(doc)):
        try:
            page = doc.load_page(page_num)
            text = page.get_text()

            # OCR fallback: only when the page has images AND little embedded text.
            # get_images() is cheap; RapidOCR is seconds-per-page — don't burn it on
            # plain text pages (title pages, text PDFs) that just have short text.
            # Pages are rendered here (fast) but OCR'd later, in parallel.
            if len(text.strip()) < 50 and page.get_images(full=True):
                ocr_jobs.append((page_num, _render_ocr_input(page)))

            texts_by_page[page_num] = text

            # ---- Diagram extraction (images + vector drawings) ----
            # 1. Extract embedded Images
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]

                # Get image location for context
                infos = page.get_image_info()
                rect = [0, 0, 0, 0]
                for info in infos:
                    if info['xref'] == xref:
                        rect = info['bbox']
                        break

                diagrams.append({
                    "page": page_num + 1,
                    "type": "image",
                    "bytes": image_bytes,
                    "extension": base_image["ext"],
                    "bbox": rect,
                    "id": f"p{page_num + 1}_img{img_index}"
                })

            # 2. Extract Vector Drawings (Experimental)
            # If a page has many drawings but no images, it's likely a vector diagram
            drawings = page.get_drawings()
            if drawings and len(drawings) > 10:  # Threshold for "complex drawing"
                # Capture the whole page as a reference if it has dense drawings.
                # 1.5x instead of 2x keeps quality while cutting raster cost ~40%.
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                diagrams.append({
                    "page": page_num + 1,
                    "type": "vector_context",
                    "bytes": pix.tobytes(),
                    "extension": "png",
                    "bbox": list(page.rect),
                    "id": f"p{page_num + 1}_vector"
                })
        except Exception as page_err:
            print(f"Error scanning page {page_num + 1}: {page_err}")
            continue

    # ---- OCR in parallel (the slow stage) ----
    # Each worker thread owns its own RapidOCR instance; results are keyed by
    # page so the final text is reassembled in document order below.
    ocr_texts: Dict[int, str] = {}
    if ocr_jobs:
        workers = min(2, len(ocr_jobs))
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {pool.submit(_ocr_image, img): pn for pn, img in ocr_jobs}
            for fut in as_completed(futures):
                pn = futures[fut]
                try:
                    ocr_texts[pn] = fut.result()
                except Exception as e:
                    print(f"OCR failed on page {pn + 1}: {e}")

    # Reassemble in page order (OCR text appended after each page's own text)
    extracted_text = ""
    for pn in range(len(doc)):
        part = texts_by_page.get(pn, "")
        ocr_part = ocr_texts.get(pn, "")
        if ocr_part:
            part += ocr_part
        extracted_text += part + "\n\n"

    return extracted_text.strip() or None, diagrams


def parse_pdf(pdf_bytes: bytes) -> Tuple[Optional[str], List[Dict]]:
    """
    Single-pass PDF parse: extracts text AND diagrams in one scan of the document.
    The PDF is opened/parsed exactly once (previously two full scans).
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return None, []
    try:
        return _scan_doc(doc)
    finally:
        doc.close()


def extract_text_from_pdf(file_path: str) -> Optional[str]:
    """Extracts text from a given PDF file path (streams directly from disk)."""
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return None
    try:
        text, _ = _scan_doc(doc)
        if text is None:
            print(f"Warning: No text could be extracted from {file_path}. It might be a scanned image.")
        return text
    finally:
        doc.close()


def extract_text_from_bytes(pdf_bytes: bytes) -> Optional[str]:
    """Extracts text directly from PDF bytes in memory (compat wrapper)."""
    text, _ = parse_pdf(pdf_bytes)
    return text


def extract_diagrams_from_pdf(pdf_bytes: bytes) -> List[Dict]:
    """Extracts diagrams from PDF bytes in memory (compat wrapper)."""
    _, diagrams = parse_pdf(pdf_bytes)
    return diagrams
