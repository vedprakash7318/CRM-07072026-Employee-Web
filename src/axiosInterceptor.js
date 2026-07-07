import axios from 'axios';

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('Token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Optionally handle 401 Unauthorized errors globally here
    return Promise.reject(error);
  }
);

export default axios;
