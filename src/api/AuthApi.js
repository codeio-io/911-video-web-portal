import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const initiate_login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/customer-video-login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setup_mfa = async (session) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/setup-mfa`, {
      session,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
