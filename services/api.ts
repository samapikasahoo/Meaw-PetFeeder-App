import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.15.39",
  timeout: 10000,
});

export default api;