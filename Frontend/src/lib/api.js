import axios from "axios";
import Cookies from "js-cookie";

// Get the base URL from environment or use the default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // For reviewer token
  const reviewerToken = Cookies.get('reviewerToken');
  if (reviewerToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${reviewerToken}`;
  }


  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Token expired or invalid
      Cookies.remove("adminToken");
      Cookies.remove("reviewerToken");
      localStorage.removeItem("adminData"); // We can keep non-sensitive data in localStorage
      localStorage.removeItem("dashboardView");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// request interceptor to attach token from localStorage
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("reviewerToken");
//     if (token && !config.headers.Authorization) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export function setupNoticeManagerInterceptor(api) {
  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get("noticeManagerToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export default api;
