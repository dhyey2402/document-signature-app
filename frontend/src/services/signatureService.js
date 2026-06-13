import api from "./api";

export const uploadSignatureAsset = async (formData) => {
  return await api.post("/signatures/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const signDocument = async (documentId, payload) => {
  return await api.post(`/documents/${documentId}/sign`, payload);
};

export const downloadSignedDocument = async (documentId) => {
  return await api.get(`/documents/${documentId}/signed`, {
    responseType: "blob",
  });
};

export const generateSigningLink = async (payload) => {
  return await api.post("/signing-links/", payload);
};

