import api from './api';

export const restaurantService = {
    getRestaurants: async () => {
        try {
            const response = await api.get('/business');
            return {
                success: true,
                data: response.data,
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
            const response = await api.delete(`/business/${restaurantId}`);
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
            const response = await api.post('/business', restaurantData);
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

    updateRestaurant: async (restaurantId, restaurantData) => {
        try {
            const response = await api.put(`/business/${restaurantId}`, restaurantData);
            return {
                success: true,
                data: response.data,
                restaurantId: response.data?.id || response.data?.data?.id,
                message: 'Restaurant updated successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message ||
                    error.response?.data?.detail ||
                    'Restaurant update failed',
            };
        }
    },

    getRestaurantDetails: async (restaurantId) => {
        try {
            const response = await api.get(`/business/${restaurantId}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message ||
                    error.response?.data?.detail ||
                    'Restaurant details retrieval failed',
            };
        }
    },

    createRestaurantLocation: async (restaurantId, locationData) => {
        try {
            const response = await api.put(`/business/${restaurantId}`, locationData);
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
    },

    uploadRestaurantImages: async (formData) => {
        try {
            const response = await api.post(
                `/upload/restaurant-images`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return {
                success: true,
                data: response.data,
                message: "Restaurant images uploaded successfully!",
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Failed to upload Images",
            };
        }
    },

    getRestaurantImages: async (restaurantId) => {
        try {
            const response = await api.get(`/upload/restaurant-images/${restaurantId}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.detail || "Failed to get restaurant images",
            };
        }
    },

    updateRestaurantImages: async (restaurantId, formData) => {
        try {
            const response = await api.put(
                `/upload/restaurant-images/${restaurantId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return {
                success: true,
                data: response.data,
                message: "Restaurant images updated successfully!",
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.detail || "Failed to update restaurant images",
            };
        }
    },
}
