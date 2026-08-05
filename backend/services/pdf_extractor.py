import fitz  # PyMuPDF
from typing import Optional, List, Dict, Tuple
import os
import io
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

# Initialize RapidOCR globally for reuse
engine = RapidOCR()


def _ocr_page(page) -> str:
    """Run RapidOCR on a single page. Returns OCR text (empty string if nothing found)."""
    try:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Higher res
        img_bytes = pix.tobytes("png")

        # RapidOCR can take bytes, ndarray, or path
        result, _ = engine(img_bytes)

        if result:
            ocr_text = "\n".join([line[1] for line in result])
            if ocr_text.strip():
                return "\n[OCR Content]:\n" + ocr_text
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
    extracted_text = ""
    diagrams = []
    for page_num in range(len(doc)):
        try:
            page = doc.load_page(page_num)
            text = page.get_text()

            # OCR fallback: only when the page has images AND little embedded text.
            # get_images() is cheap; RapidOCR is seconds-per-page — don't burn it on
            # plain text pages (title pages, text PDFs) that just have short text.
            if len(text.strip()) < 50 and page.get_images(full=True):
                text += _ocr_page(page)

            extracted_text += text + "\n\n"

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
