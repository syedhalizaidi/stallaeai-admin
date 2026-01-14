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
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.detail || 'Login failed. Please try again.',
      };
    }
  },

  forgotPassword: async (payload) => {
    try {
      const response = await api.post('/user/forgot-password', payload);
      return {
        success: true,
        data: response.data,
        message: 'Password reset email sent successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email. Please try again.',
      };
    }
  },

  resetPassword: async (payload) => {
    try {
      const response = await api.post('/user/reset-password', payload);
      return {
        success: true,
        data: response.data,
        message: 'Password reset successful!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password. Please try again.',
      };
    }
  }
};

export default authService;
