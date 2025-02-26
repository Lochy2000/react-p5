import axios from "axios";

// Set the base URL to your Django API (without trailing slash)
axios.defaults.baseURL = "https://drftesting-caf88c0c0aca.herokuapp.com";

// Enable credentials to ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Create instances for request and response
export const axiosReq = axios.create();
export const axiosRes = axios.create();

// We don't need to manually add Authorization headers when using JWT cookies
// The cookies will be automatically sent with each request
// Remove the token-based interceptor since we're using cookie-based auth

// Optional: Add an interceptor to handle common request needs
axiosReq.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie if needed
    // const csrfToken = getCookie("csrftoken");
    // if (csrfToken) {
    //   config.headers["X-CSRFToken"] = csrfToken;
    // }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);