import api from './api';

export const userService = {
    getUsers: async () => {
        try {
            const response = await api.get('/user/list-users');
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
