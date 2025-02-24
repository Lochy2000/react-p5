import axios from "axios";

axios.defaults.baseURL = 'https://react-p5-test-3e9d984aefe4.herokuapp.com/'
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
axios.defaults.withCredentials = true;