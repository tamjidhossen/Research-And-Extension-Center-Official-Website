import axios from 'axios';
import { JWT_TOKEN_KEY } from './authConfig';

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(JWT_TOKEN_KEY, token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(JWT_TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem(JWT_TOKEN_KEY);
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  }
  return false;
};