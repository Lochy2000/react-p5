import axios from "axios";

// Set the base URL to your Django API (without trailing slash)
axios.defaults.baseURL = "https://drftesting-caf88c0c0aca.herokuapp.com";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
// Enable credentials to ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Create instances for request and response
export const axiosReq = axios.create();
export const axiosRes = axios.create();

// Apply the same defaults to our custom instances
axiosReq.defaults.baseURL = axios.defaults.baseURL;
axiosReq.defaults.withCredentials = true;
axiosRes.defaults.baseURL = axios.defaults.baseURL;
axiosRes.defaults.withCredentials = true;