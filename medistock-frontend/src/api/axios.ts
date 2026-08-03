import axios from "axios";

// Backend API URL
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// Request Interceptor - Attach JWT Token
axiosInstance.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    console.log("API Request:", config.url);
    console.log("JWT Token:", token ? "Token Attached" : "No Token Found");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// Response Interceptor - Handle Errors
axiosInstance.interceptors.response.use(

  (response) => {
    return response;
  },


  (error) => {

    if (error.response) {

      console.error(
        "API Error:",
        error.response.status,
        error.response.data
      );


      // Unauthorized
      if (error.response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");


        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
      }

    }
    else {
      console.error("Network Error:", error.message);
    }


    return Promise.reject(error);
  }

);


export default axiosInstance;