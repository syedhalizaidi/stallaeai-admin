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
                error: error.response?.data?.message || 'Failed to add barber business.',
                details: error.response?.data
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
                error: error.response?.data?.message || 'Failed to add car dealership business.',
                details: error.response?.data
            };
        }
    }
}