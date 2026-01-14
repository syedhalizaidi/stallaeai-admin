import api from './api';

export const dashboardService = {
    getDashboardStats: async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                return {
                    success: false,
                    error: 'Authentication token missing',
                };
            }
            const response = await api.get('/dashboard/business-status');
            return {
                success: true,
                data: response.data.data,
                message: 'Business stats fetched successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch business stats.',
                details: error.response?.data
            };
        }
    },

}