import api from "./api";

export const vehicleAPI = {
  getAll: () => api.get("/vehicles"),
  getStats: () => api.get("/vehicles/stats"),

  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),

  delete: (id) => api.delete(`/vehicles/${id}`)
};

