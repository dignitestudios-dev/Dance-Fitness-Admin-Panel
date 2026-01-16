import { API } from './axios';

// Login API call
export interface LoginPayload {
  email: string;
  password: string;
}

export const loginApi = async (credentials: LoginPayload) => {
  const response = await API.post("/admin/login", credentials);
  if (response.data?.token) {
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("userData", response.data?.admin_details);
  }

  return response.data;
};

// Register API call
export const register = async (credentials: any) => {
  const response = await API.post('/auth/register', credentials);
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

// Logout API call
export const logout = async () => {
  try {
    await API.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token locally
    localStorage.removeItem('authToken');
  }
};

// Get current user profile
export const getProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

// Refresh token (if needed)
export const refreshToken = async () => {
  const response = await API.post('/auth/refresh');
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};