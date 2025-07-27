// src/axiosInstance.js
import axios from 'axios';
// DO NOT IMPORT STORE HERE ANYMORE
import { logout } from './redux/slice/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A variable to hold the store instance, initialized later
let reduxStore = null;

// Function to set the store, called once during app initialization
export const setStore = (storeInstance) => {
  reduxStore = storeInstance;
};
    
api.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("JWT token expired or unauthorized. Initiating logout and redirect.");

      // Use the 'reduxStore' variable here
      if (reduxStore) { // Ensure store is available before dispatching
        reduxStore.dispatch(logout());
      } else {
        console.error("Redux store not yet initialized for interceptor logout.");
        // Fallback: Clear local storage even if store isn't ready for dispatch
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userToken");
        localStorage.removeItem("guestId");
      }

      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.removeItem("guestId");

      window.location.replace(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      
      return new Promise(() => {}); // Stop propagation
    }
    
    return Promise.reject(error);
  }
);

export default api;