import api from './api';

export const userService = {
    getUsers: async (restaurantId = null) => {
        // Use provided restaurantId or fall back to localStorage
        const idToUse = restaurantId || localStorage.getItem('restaurantId');
        
        try {
            const params = {};
            if (idToUse && idToUse !== 'null') {
                params.restaurant_id = idToUse;
            }
            
            const response = await api.get(`/user/list-users`, { params });
            return {
                success: true,
                data: response.data.data,
                message: 'Users fetched successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch users.',
                details: error.response?.data
            };
        }
    }
}
