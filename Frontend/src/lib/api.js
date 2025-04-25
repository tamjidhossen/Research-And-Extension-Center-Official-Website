import axios from "axios";
import Cookies from "js-cookie";

// Get the base URL from environment or use the default
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  // Use specific tokens based on the endpoint being called
  const url = config.url;

  if (url && url.includes('/api/reviewer/research-proposal/submit/invoice')) {
    const reviewerToken = Cookies.get("invoiceToken");
    if (reviewerToken) {
      config.headers.Authorization = `Bearer ${reviewerToken}`;
      return config;
    }
  }

  // For reviewer endpoints, prioritize reviewer token
  if (url && url.includes("/api/reviewer/")) {
    const reviewerToken = Cookies.get("reviewerToken");
    if (reviewerToken) {
      config.headers.Authorization = `Bearer ${reviewerToken}`;
      return config;
    }
  }

  // For notice manager endpoints, prioritize notice manager token
  if (url && (url.includes("/api/admin/noticer") || url.includes("/api/notice/"))) {
    const noticeManagerToken = Cookies.get("noticeManagerToken");
    if (noticeManagerToken) {
      config.headers.Authorization = `Bearer ${noticeManagerToken}`;
      return config;
    }
  }

  // For admin endpoints or any other endpoint, use admin token
  const adminToken = Cookies.get("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check which API was called
      const requestUrl = error.config.url;
      // console.log("URL___>: " + requestUrl)

      if (requestUrl.includes('/api/reviewer/research-proposal/submit/invoice')) {
        Cookies.remove("invoiceToken");
        return Promise.reject(error);
      } else if (requestUrl.includes("/api/reviewer/")) {
        // Only clear reviewer token if reviewer endpoints fail
        Cookies.remove("reviewerToken");
        // console.error("Reviewer authentication failed");
        return Promise.reject(error);
      } else if (requestUrl.includes("/api/admin/noticer")) {
        Cookies.remove("noticeManagerToken");
        localStorage.removeItem("noticeManagerData");
        window.location.href = "/notice-manager/login";
      } else if (requestUrl.includes("/api/admin/")) {
        Cookies.remove("adminToken");
        localStorage.removeItem("adminData");
        localStorage.removeItem("dashboardView");
        window.location.href = "/admin/login";
      }
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
