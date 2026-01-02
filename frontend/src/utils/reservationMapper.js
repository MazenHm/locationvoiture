// src/utils/reservationMapper.js

/**
 * Map reservation status from backend to frontend
 * @param {string} backendStatus
 * @returns {string}
 */
export const mapReservationStatus = (backendStatus) => {
  const statusMap = {
    // French (backend) → English (frontend)
    "en attente": "pending",
    "validée": "confirmed",
    "confirmé": "confirmed",
    "en cours": "active",
    "terminé": "completed",
    "annulée": "cancelled",
    "annulé": "cancelled",

    // English → English (fallback)
    "pending": "pending",
    "confirmed": "confirmed",
    "active": "active",
    "completed": "completed",
    "cancelled": "cancelled",
  };

  return statusMap[backendStatus?.toLowerCase()] || "pending";
};

/**
 * Map reservation status from frontend to backend
 * @param {string} frontendStatus
 * @returns {string}
 */
export const mapStatusToBackend = (frontendStatus) => {
  const statusMap = {
    pending: "en attente",
    confirmed: "validée",
    active: "en cours",
    completed: "terminé",
    cancelled: "annulée",
  };

  return statusMap[frontendStatus] || "en attente";
};

/**
 * Map reservation from backend to frontend
 * @param {Object} r
 * @returns {Object}
 */
export const mapReservationFromBackend = (r) => {
  if (!r) return null;

  const startDate = new Date(r.dateDebut);
  const endDate = new Date(r.dateFin);

  const rentalDays =
    startDate instanceof Date &&
    endDate instanceof Date &&
    !isNaN(startDate) &&
    !isNaN(endDate)
      ? Math.max(
          1,
          Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        )
      : 1;

  const status = mapReservationStatus(r.statut);

  return {
    // IDs
    id: r._id,

    // Status
    status,

    // Price
    totalPrice: Number(r.prixTotal) || 0,

    // Dates
    startDate: r.dateDebut,
    endDate: r.dateFin,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,

    // Calculated
    rentalDays,

    formattedStartDate: startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),

    formattedEndDate: endDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),

    // Client
    clientId: r.client?._id || r.client,
    clientName: r.client?.name || "Unknown Client",
    clientEmail: r.client?.email || "",

    // Vehicle
    vehicleId: r.vehicle?._id || r.vehicle,
    vehicleName: r.vehicle
      ? `${r.vehicle.marque} ${r.vehicle.modele}`
      : "Unknown Vehicle",
    vehicleImage: r.vehicle?.image || "",
    vehicleType: r.vehicle?.categorie?.nom || "",
    vehicleYear: r.vehicle?.annee || "",
    vehicleColor: r.vehicle?.color || "",
    vehiclePlate: r.vehicle?.plateNumber || "",
    vehicleDailyRate: Number(r.vehicle?.prixParJour) || 0,

    // Booking details
    pickupLocation: r.pickupLocation || "Main Office",
    returnLocation:
      r.returnLocation || r.pickupLocation || "Main Office",
    driverAge: r.driverAge || "",
    licenseNumber: r.licenseNumber || "",
    licenseCountry: r.licenseCountry || "",
    specialRequests: r.specialRequests || "",

    // Helpers
    isPending: status === "pending",
    isConfirmed: status === "confirmed",
    isActive: status === "active",
    isCompleted: status === "completed",
    isCancelled: status === "cancelled",
  };
};

/**
 * Map reservation from frontend to backend
 * @param {Object} reservation
 * @returns {Object}
 */
export const mapReservationToBackend = (reservation) => {
  if (!reservation) return null;

  return {
    client: reservation.clientId,
    vehicle: reservation.vehicleId,
    dateDebut: reservation.startDate,
    dateFin: reservation.endDate,
    prixTotal: Number(reservation.totalPrice) || 0,
    statut: mapStatusToBackend(reservation.status || "pending"),

    pickupLocation: reservation.pickupLocation,
    returnLocation:
      reservation.returnLocation || reservation.pickupLocation,
    driverAge: reservation.driverAge,
    licenseNumber: reservation.licenseNumber,
    licenseCountry: reservation.licenseCountry,
    specialRequests: reservation.specialRequests,
  };
};

/**
 * Status display helper
 */
export const getReservationStatusInfo = (status) => {
  const map = {
    pending: {
      label: "Pending Approval",
      color: "#ffc107",
      bgColor: "rgba(255,193,7,0.1)",
      textColor: "#ffc107",
    },
    confirmed: {
      label: "Confirmed",
      color: "#28a745",
      bgColor: "rgba(40,167,69,0.1)",
      textColor: "#28a745",
    },
    active: {
      label: "Active",
      color: "#007bff",
      bgColor: "rgba(0,123,255,0.1)",
      textColor: "#007bff",
    },
    completed: {
      label: "Completed",
      color: "#6c757d",
      bgColor: "rgba(108,117,125,0.1)",
      textColor: "#6c757d",
    },
    cancelled: {
      label: "Cancelled",
      color: "#dc3545",
      bgColor: "rgba(220,53,69,0.1)",
      textColor: "#dc3545",
    },
  };

  return map[status] || map.pending;
};

/**
 * Calculate total price safely
 */
export const calculateTotalPrice = (dailyRate, startDate, endDate) => {
  const rate = Number(dailyRate) || 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end) || end <= start) return 0;

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const subtotal = rate * Math.max(1, days);
  return subtotal + subtotal * 0.1;
};

/**
 * Format price
 */
export const formatPrice = (price) =>
  `$${Number(price || 0).toFixed(2)}`;

/**
 * Permissions
 */
export const canCancelReservation = (r) =>
  ["pending", "confirmed"].includes(
    r?.status || mapReservationStatus(r?.statut)
  );

export const canModifyReservation = canCancelReservation;

export default {
  mapReservationStatus,
  mapStatusToBackend,
  mapReservationFromBackend,
  mapReservationToBackend,
  getReservationStatusInfo,
  calculateTotalPrice,
  formatPrice,
  canCancelReservation,
  canModifyReservation,
};
