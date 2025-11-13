import api from './api';

export const knowledgeBaseService = {
  // Upload FAQ file
  uploadFAQ: async (businessId, formData) => {
    try {
      const response = await api.post(
        `/upload/business/${businessId}/faq/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return {
        success: true,
        data: response.data,
        message: "FAQ file uploaded successfully!",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to upload FAQ file.",
        details: error.response?.data,
      };
    }
  },



  // Get all FAQ files for a business
  getFAQFiles: async (businessId) => {
    try {
      const response = await api.get(`/upload/business/${businessId}/faq/files`);
      return {
        success: true,
        data: response.data,
        message: 'FAQ files retrieved successfully!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch FAQ files.',
      };
    }
  },

  // Delete a specific FAQ file
  deleteFAQFile: async (businessId, fileId) => {
    try {
      const response = await api.delete(`/upload/business/${businessId}/faq/files/${fileId}`);
      return {
        success: true,
        data: response.data,
        message: 'FAQ file deleted successfully!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete FAQ file.',
        details: error.response?.data,
      };
    }
  },
};

export default knowledgeBaseService;
