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
    },

    addBarberBusiness: async (data) => {
        try {
            const response = await api.post('/business', data);
            return {
                success: true,
                data: response.data.data,
                message: 'Barber business added successfully!'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.detail || 'Failed to add barber business.',
            };
        }
    },

    addCarDealershipBusiness: async (data) => {
        try {
            const response = await api.post('/business', data);
            return {
                success: true,
                data: response.data.data,
                message: 'Car dealership business added successfully!'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.detail || 'Failed to add car dealership business.',
            };
        }
    },

    updateBusiness: async (businessId, data) => {
        try {
            const response = await api.put(`/business/${businessId}`, data);
            return {
                success: true,
                data: response.data.data,
                message: 'Barber business updated successfully!'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update barber business.',
                details: error.response?.data
            };
        }
    },

    getBusinessById: async (businessId) => {
        try {
            const response = await api.get(`/business/${businessId}`);
            return {
                success: true,
                data: response.data,
                message: 'Business fetched successfully!'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.message ||  'Failed to fetch business.',
            };
        }
    }
}