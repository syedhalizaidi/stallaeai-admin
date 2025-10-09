import api from './api';

export const authService = {
  signup: async (payload) => {
    try {
      const response = await api.post('/user/register', payload);
      return {
        success: true,
        data: response.data,
        message: 'Account created successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed. Please try again.',
        details: error.response?.data
      };
    }
  },

  login: async (payload) => {
    try {
      const response = await api.post('/user/login', payload);
      return {
        success: true,
        data: response.data.data,
        message: 'Login successful!'
      };
    } catch (error) {
      return error.response.data;
    }
  }
};

export default authService;
