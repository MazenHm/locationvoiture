// src/utils/vehicleMapper.js

/**
 * Map vehicle from backend format to frontend format
 * @param {Object} v - Vehicle object from backend
 * @returns {Object} Frontend-ready vehicle
 */
export const mapVehicleFromBackend = (v) => {
  if (!v) return null;

  // ---- STATUS MAPPING (SAFE) ----
  const status =
    v.statut === "disponible"
      ? "available"
      : v.statut === "loué"
      ? "rented"
      : "maintenance";

  // ---- SAFE PRICE ----
  const dailyRate = Number(v.prixParJour) || 0;

  return {
    // IDs
    id: v._id,

    // Display
    name: `${v.marque || "Unknown"} ${v.modele || ""}`.trim(),
    brand: v.marque || "",
    model: v.modele || "",
    year: v.annee || "",

    // Classification
    type: v.categorie?.nom || "Other",

    // Vehicle info
    color: v.color || "Gray",
    plateNumber: v.plateNumber || "",

    // Pricing (🔥 THIS FIXES YOUR ERROR)
    dailyRate: dailyRate,
    hourlyRate: dailyRate ? dailyRate / 5 : 0,

    // Status
    status,

    // Features
    features: v.categorie?.nom ? [v.categorie.nom] : [],

    // Image (already base64 or URL)
    image: v.image || "",
  };
};

/**
 * Map vehicle status from frontend to backend
 * @param {string} status - Frontend status
 * @returns {string} Backend status
 */
export const mapStatusToBackend = (status) => {
  if (status === "available") return "disponible";
  if (status === "rented") return "loué";
  return "maintenance";
};
