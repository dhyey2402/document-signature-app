import os
import uuid
import fitz
from fastapi import HTTPException
from app.core.config import SIGNED_DIR


def generate_signed_pdf(original_file_path: str, signature_asset_path: str, signatures, document_id: int) -> str:
    if not os.path.exists(original_file_path):
        raise HTTPException(status_code=400, detail="Original PDF file missing on server")
    if not os.path.exists(signature_asset_path):
        raise HTTPException(status_code=400, detail="Signature image asset file missing on server")

    doc = None
    try:
        doc = fitz.open(original_file_path)
        total_pages = len(doc)

        for sig in signatures:
            if sig.page_number < 1 or sig.page_number > total_pages:
                raise HTTPException(
                    status_code=400,
                    detail=f"Signature placeholder refers to invalid page number {sig.page_number}. Document has {total_pages} page(s)."
                )

            page = doc.load_page(sig.page_number - 1)

            page_rect = page.rect
            page_w = float(page_rect.width)
            page_h = float(page_rect.height)

            x = float(sig.x_coordinate)
            y = float(sig.y_coordinate)
            w = float(sig.width)
            h = float(sig.height)

            x0 = page_rect.x0 + x * page_w
            y0 = page_rect.y0 + y * page_h
            x1 = x0 + w * page_w
            y1 = y0 + h * page_h

            rect = fitz.Rect(x0, y0, x1, y1)

            # Insert image covering rect
            page.insert_image(rect, filename=signature_asset_path, keep_proportion=False)

        signed_asset_id = str(uuid.uuid4())
        signed_file_name = f"signed_{document_id}_{signed_asset_id}.pdf"
        signed_file_path = os.path.join(SIGNED_DIR, signed_file_name)

        doc.save(signed_file_path)
        return signed_file_path
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate signed PDF: {e}")
    finally:
        if doc is not None:
            doc.close()
