import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.stellaeai.com";
const CHAT_BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || "https://restaurant.stellaeai.com"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const apiClient2 = axios.create({
  baseURL: CHAT_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});
