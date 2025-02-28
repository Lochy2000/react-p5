import axios from "axios";

axios.defaults.baseURL = "https://drftesting-caf88c0c0aca.herokuapp.com";
// Remove the incorrect Content-Type header - let axios handle it automatically
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();