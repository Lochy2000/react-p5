import axios from "axios";

axios.defaults.baseURL = "https://drftesting-caf88c0c0aca.herokuapp.com/";
axios.defaults.withCredentials = true;  // Ensures cookies are sent

export const axiosReq = axios.create();
export const axiosRes = axios.create();

// Attach JWT token to requests (if using JWT authentication)
axiosReq.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");  // JWT stored in local storage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});