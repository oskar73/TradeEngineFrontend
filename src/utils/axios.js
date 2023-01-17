import axios from 'axios';
import global from './global';
import config from '../config';

// Create an instance of axios
const axiosInstance = axios.create({
  baseURL: config.BackendEndpoint, // Replace with your API base URL
});
// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage or another source
    const token = localStorage.getItem("tradeToken")

    // If the token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `${token}`;
    }

    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
