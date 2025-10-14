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
    },

    registerRestaurant: async (restaurantData) => {
        try {
            const response = await api.post('/restaurant/register-restaurant', restaurantData);
            return {
                success: true,
                data: response.data,
                restaurantId: response.data?.id || response.data?.data?.id,
                message: 'Restaurant registered successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message ||
                    error.response?.data?.detail ||
                    'Restaurant registration failed',
            };
        }
    },

    createRestaurantLocation: async (restaurantId, locationData) => {
        try {
            const response = await api.post(`/location/restaurant-location/${restaurantId}`, locationData);
            return {
                success: true,
                data: response.data,
                message: 'Restaurant location created successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Location creation failed",
            };
        }
    },

    createMenuItem: async (formData) => {
        try {
            const response = await api.post('/upload/menu-item', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {
                success: true,
                data: response.data,
                menuItemId: response.data?.id || response.data?.data?.id,
                message: 'Menu saved successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Menu Save failed",
            };
        }
    },

    getMenuItems: async (restaurant_id) => {
        try {
            const response = await api.get(`/upload/menu-items/restaurant/${restaurant_id}`);

            return {
                success: true,
                data: response.data,
                message: "Menu Items retrieved successfully!",
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Failed to retrieve Menu Items",
            };
        }
    },

    updateMenuItem: async (menuItemId, formData) => {
        try {
            const response = await api.put(`/upload/menu-item/${menuItemId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {
                success: true,
                data: response.data,
                message: 'Menu item updated successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Failed to update Menu Item",
            };
        }
    },

    deleteMenuItem: async (menuItemId) => {
        try {
            const response = await api.delete(`/upload/menu-item/${menuItemId}`);
            return {
                success: true,
                data: response.data,
                message: 'Menu item deleted successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Failed to delete Menu Item",
            };
        }
    }
}
