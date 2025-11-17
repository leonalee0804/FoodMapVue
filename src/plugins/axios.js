import axios from "axios";

const axiosapi = axios.create({
    baseURL: "http://localhost:8082/api",
    withCredentials: true,
});

export default axiosapi;