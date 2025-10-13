import api from './api';

export const restaurantService = {
    getRestaurants: async () => {
        try {
            const response = await api.get('/restaurant/user-restaurant');
            return {
                success: true,
                data: response.data.data,
                message: 'Restaurants fetched successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch restaurants.',
                details: error.response?.data
            };
        }
    },

    deleteRestaurant: async (restaurantId) => {
        try {
            const response = await api.delete(`/restaurant/delete-restaurant/${restaurantId}`);
            return {
                success: true,
                data: response.data.data,
                message: 'Restaurant deleted successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete restaurant.',
                details: error.response?.data
            };
        }
    }
}
