import fitz  # PyMuPDF
from typing import Optional, List, Dict, Tuple
import os
import io
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

# Initialize RapidOCR globally for reuse
engine = RapidOCR()

def extract_text_from_pdf(file_path: str) -> Optional[str]:
    """
    Extracts text from a given PDF file path using PyMuPDF.
    
    Args:
        file_path (str): The absolute path to the PDF file.
        
    Returns:
        Optional[str]: The extracted text, or None if extraction fails.
    """
    try:
        doc = fitz.open(file_path)
        extracted_text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            
            # OCR Fallback
            if len(text.strip()) < 50:
                try:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_bytes = pix.tobytes("png")
                    result, _ = engine(img_bytes)
                    if result:
                        ocr_text = "\n".join([line[1] for line in result])
                        if ocr_text.strip():
                            text += "\n[OCR Content]:\n" + ocr_text
                except Exception as ocr_err:
                    print(f"RapidOCR fallback failed on page {page_num}: {ocr_err}")

            extracted_text += text + "\n\n"
            
        doc.close()
        
        if not extracted_text.strip():
            print(f"Warning: No text could be extracted from {file_path}. It might be a scanned image.")
            return None
            
        return extracted_text.strip()
        
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return None

def extract_text_from_bytes(pdf_bytes: bytes) -> Optional[str]:
    """
    Extracts text directly from PDF bytes in memory.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            
            # Simple OCR Fallback check: if page has very little text but has images
            if len(text.strip()) < 50:
                try:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Higher res
                    img_bytes = pix.tobytes("png")
                    
                    # RapidOCR can take bytes, ndarray, or path
                    result, _ = engine(img_bytes)
                    
                    if result:
                        ocr_text = "\n".join([line[1] for line in result])
                        if ocr_text.strip():
                            text += "\n[OCR Content]:\n" + ocr_text
                except Exception as ocr_err:
                    print(f"RapidOCR fallback failed on page {page_num}: {ocr_err}")

            extracted_text += text + "\n\n"
            
        doc.close()
        
        if not extracted_text.strip():
            return None
            
        return extracted_text.strip()
        
    except Exception as e:
        print(f"Error extracting text from PDF bytes: {e}")
        return None

def extract_diagrams_from_pdf(pdf_bytes: bytes) -> List[Dict]:
    """
    Identifies and extracts visual blocks (images/drawings) from the PDF.
    Returns a list of dicts with image data and page context.
    """
    diagrams = []
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # 1. Extract Images
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                
                # Get image location for context
                # Note: get_image_info() gives us the boundary on the page
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
                    "id": f"p{page_num+1}_img{img_index}"
                })

            # 2. Extract Vector Drawings (Experimental)
            # If a page has many drawings but no images, it's likely a vector diagram
            drawings = page.get_drawings()
            if drawings and len(drawings) > 10: # Threshold for "complex drawing"
                # For vector diagrams, we take a screenshot of the whole page or clusters
                # Since defining clusters is hard, we'll capture the whole page as a reference if it has drawings
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                diagrams.append({
                    "page": page_num + 1,
                    "type": "vector_context",
                    "bytes": pix.tobytes(),
                    "extension": "png",
                    "bbox": list(page.rect),
                    "id": f"p{page_num+1}_vector"
                })

        doc.close()
    except Exception as e:
        print(f"Error extracting diagrams: {e}")
        
    return diagrams
