import api from './api';

export const userService = {
    getUsers: async (restaurantId = null) => {
        // Use provided restaurantId or fall back to localStorage
        const idToUse = restaurantId || localStorage.getItem('restaurantId');

        try {
            const params = {};
            if (idToUse && idToUse !== 'null') {
                params.business_id = idToUse;
            }

            const response = await api.get(`/business/business-members`, { params });
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
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/user/register', userData);
            return {
                success: true,
                data: response.data,
                message: 'User created successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create user.',
                details: error.response?.data
            };
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await api.put(`/user/update-user/${userId}`, userData);
            return {
                success: true,
                data: response.data.data,
                message: 'User updated successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update user.',
                details: error.response?.data
            };
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/user/delete-user/${userId}`);
            return {
                success: true,
                data: response.data.data,
                message: 'User deleted successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete user.',
                details: error.response?.data
            };
        }
    }
}
