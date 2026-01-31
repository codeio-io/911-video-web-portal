import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
// Get auth token from localStorage
const getAuthToken = () => {
  return sessionStorage.getItem("token") || "";
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAvailableLanguages = async () => {
  try {
    const response = await apiClient.get("/get-availability-by-languages");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch available languages:", error);
    throw error;
  }
};

export const getCallHistory = async () => {
  try {
    const response = await apiClient.get("/customer/call-history");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch call history:", error);
    throw error;
  }
};

export const listCallsHistoryVideo = async (params = {}) => {
  try {
    const response = await apiClient.get("/list-calls-history-video", {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 10,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch calls history:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get("/customer/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put("/customer/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

export const getCustomerVideoAccountById = async () => {
  try {
    const response = await apiClient.get("/get-customer-video-account-by-id", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch customer video account:", error);
    throw error;
  }
};

export const userUpdateCustomerVideoAccount = async (data) => {
  try {
    const response = await apiClient.post(
      "/user-update-customer-video-account",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update customer video account:", error);
    throw error;
  }
};

export const storeVideoFlowData = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/store-video-flow-data`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to store video flow data:", error);
    throw error;
  }
};
