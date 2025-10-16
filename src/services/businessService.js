import api from './api';

export const businessService = {
    getBusinessCategories: async () => {
        try {
            const response = await api.get('/business/business-types');
            return {
                success: true,
                data: response.data.data,
                message: 'Business categories fetched successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch business categories.',
                details: error.response?.data
            };
        }
    }
}