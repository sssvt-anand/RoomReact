import axios from "axios";
import { message } from "antd";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    message.error(error.response?.data?.message || "Something went wrong");
    return Promise.reject(error);
  }
);

export default api;
