import api from "./api";

export const uploadDocument = async (formData, onUploadProgress) => {
  return await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }
  );
};

export const getDocuments = async () => {
  return await api.get("/documents");
};

export const getDocumentDetail = async (id) => {
  return await api.get(`/documents/${id}`);
};

export const deleteDocument = async (id) => {
  return await api.delete(`/documents/${id}`);
};

export const downloadDocument = async (id) => {
  return await api.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
};

export const saveSignature = async (data) => {
  return await api.post("/signatures/", data);
};

export const getSignatures = async (documentId) => {
  return await api.get(`/signatures/${documentId}`);
};
