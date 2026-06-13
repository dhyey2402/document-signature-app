# Day 6: Generate Signed PDFs — Implementation Checklist

## Plan items
- [ ] Backend: Add `signed_file_path` to `Document` model.
- [ ] Backend: Add `SignatureAsset` model/table for uploaded signature images.
- [ ] Backend: Add backend upload signature endpoint `POST /api/signatures/upload`.
- [ ] Backend: Add backend sign endpoint `POST /api/documents/{id}/sign` using PyMuPDF.
- [ ] Backend: Add backend signed file endpoint `GET /api/documents/{id}/signed`.
- [ ] Backend: Save uploads to `backend/uploads/signatures/`.
- [ ] Backend: Save signed PDFs to `backend/uploads/signed/`.
- [ ] Backend: Fail conditions enforced (no coords, no signature asset).
- [ ] Backend: Convert relative coords using PyMuPDF page dimensions.
- [ ] Frontend: Add signature creation (draw canvas + upload image) and upload asset via API.
- [ ] Frontend: Add “Sign Document” action and “Download Signed PDF”.
- [ ] Frontend: Keep existing placeholder placement + preview intact.
- [ ] Add/Update frontend API calls.
- [ ] Verify: `npm run build` succeeds.
- [ ] Verify: backend starts without migration/runtime errors.

