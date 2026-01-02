const express = require("express");
const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation
} = require("../controllers/reservationController");

const { protect, admin } = require("../middleware/authMiddleware");

// Client + Admin
router.post("/", protect, createReservation);
router.get("/", protect, getReservations);

// Client/Admin both can view
router.get("/:id", protect, getReservationById);

// Admin only
router.put("/:id", protect, admin, updateReservation);
router.delete("/:id", protect, admin, deleteReservation);

module.exports = router;
