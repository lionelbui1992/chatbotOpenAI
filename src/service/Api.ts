import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ENDPOINT } from '../constants/apiEndpoints';

const Api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

Api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const refreshToken = Cookies.get('refresh_token');
    console.log(refreshToken)
    if (refreshToken && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await Api.post('/auth/refreshtoken');
        if (response.status === 200) {
          return Api(originalRequest);
        }
      } catch (err) {
        return Promise.reject(new Error(err as string));
      }
    }
    return Promise.reject(new Error(error));
  }
);

export default Api;
