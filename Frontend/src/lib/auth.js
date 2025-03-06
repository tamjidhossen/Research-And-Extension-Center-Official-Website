import axios from 'axios';
import { JWT_TOKEN_KEY } from './authConfig';
import Cookies from 'js-cookie';

export const setAuthToken = (token) => {
  if (token) {
    Cookies.set(JWT_TOKEN_KEY, token, { secure: true, sameSite: 'strict' });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    Cookies.remove(JWT_TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const isAuthenticated = () => {
  const token = Cookies.get(JWT_TOKEN_KEY);
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  }
  return false;
};