// services/api.js
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  // ❌ DO NOT SET Content-Type HERE
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Let Axios decide Content-Type
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if 401 response returned from api
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH API ================= */

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("token"),

  getUserProfile: (userId) => api.get(`/auth/${userId}`),
  updateProfile: (userId, userData) =>
    api.put(`/auth/profile/${userId}`, userData),
  changePassword: (userId, passwordData) =>
    api.put(`/auth/password/${userId}`, passwordData),
};

/* ================= VEHICLE API ================= */

export const vehicleAPI = {
  // GET all vehicles
  getAll: () => api.get("/vehicles"),
  
  // GET vehicle by ID
  getById: (id) => api.get(`/vehicles/${id}`),
  
  // GET vehicle stats
  getStats: () => api.get("/vehicles/stats"),
  
  // CREATE new vehicle (admin only)
  create: (data) => {
    // For file uploads, use FormData
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });
      return api.post("/vehicles", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post("/vehicles", data);
  },
  
  // UPDATE vehicle (admin only)
  update: (id, data) => {
    // For file uploads, use FormData
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key] instanceof File) {
          formData.append('image', data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });
      return api.put(`/vehicles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/vehicles/${id}`, data);
  },
  
  // DELETE vehicle (admin only)
  delete: (id) => api.delete(`/vehicles/${id}`)
};

/* ================= RESERVATION API ================= */

export const reservationAPI = {
  // CLIENT: Create new reservation
  create: (data) => api.post("/reservations", data),
  
  // CLIENT: Get my reservations
  getMyReservations: () => api.get("/reservations/my"),
  
  // CLIENT & ADMIN: Get reservation by ID
  getById: (id) => api.get(`/reservations/${id}`),
  
  // CLIENT: Cancel reservation
  cancel: (id) => api.put(`/reservations/${id}/cancel`, { statut: "cancelled" }),
  
  // ADMIN: Get all reservations
  getAll: () => api.get("/reservations"),
  
  // ADMIN: Update reservation status
  updateStatus: (id, statusData) => api.put(`/reservations/${id}`, statusData),
  
  // ADMIN: Delete reservation
  delete: (id) => api.delete(`/reservations/${id}`)
};

/* ================= USER PROFILE API ================= */

export const userAPI = {
  // Get current user profile
  getProfile: () => api.get("/users/profile"),
  
  // Update profile
  updateProfile: (data) => api.put("/users/profile", data),
  
  // Change password
  changePassword: (data) => api.put("/users/change-password", data),
  
  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/users/avatar", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

/* ================= CATEGORY API ================= */

export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export default api;