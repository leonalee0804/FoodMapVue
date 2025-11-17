import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8082', // 你的 Spring Boot 後端
    timeout: 10000,
    withCredentials: true
});

export default instance;
