import api from "./api";

export const uploadDocument = async (formData, onUploadProgress) => {
  return await api.post(
    "/documents/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }
  );
};

export const getDocuments = async () => api.get("/documents");

export const getDocumentDetail = async (id) => api.get(`/documents/${id}`);

export const deleteDocument = async (id) => api.delete(`/documents/${id}`);

export const downloadDocument = async (id) =>
  api.get(`/documents/${id}/download`, { responseType: "blob" });

export const previewDocument = async (id) =>
  api.get(`/documents/${id}/download`, { params: { preview: true }, responseType: "blob" });

export const saveSignature = async (data) => api.post("/signatures/", data);

export const getSignatures = async (documentId) => api.get(`/signatures/${documentId}`);

export const getAuditLog = async (documentId) => api.get(`/documents/${documentId}/audit`);

export const rejectDocument = async (documentId, reason) =>
  api.post(`/documents/${documentId}/reject`, { reason });

export const getNotifications = async () => api.get("/documents/notifications");

export const getSigningLinks = async () => api.get("/signing-links/");

export const downloadDashboardReport = async () =>
  api.get("/reports/dashboard", { responseType: "blob" });

