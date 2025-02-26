import axios from "axios";

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Set the base URL to your Django API (without trailing slash)
axios.defaults.baseURL = "https://drftesting-caf88c0c0aca.herokuapp.com";

// Enable credentials to ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Create instances for request and response
export const axiosReq = axios.create();
export const axiosRes = axios.create();

// Add CSRF token to relevant requests automatically
axios.interceptors.request.use(
  function(config) {
    // Only add CSRF token for methods that could modify data
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      // Get CSRF token from cookie
      config.headers["X-CSRFToken"] = getCookie("csrftoken");
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

// Apply the same interceptor to axiosReq
axiosReq.interceptors.request.use(
  function(config) {
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      config.headers["X-CSRFToken"] = getCookie("csrftoken");
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);