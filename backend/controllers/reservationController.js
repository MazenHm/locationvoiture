const Reservation = require("../models/Reservation");
const Vehicle = require("../models/Vehicle");

// ✅ CREATE RESERVATION (CLIENT)
exports.createReservation = async (req, res) => {
  try {
    const {
      client,
      vehicle,
      dateDebut,
      dateFin,
      prixTotal,
      pickupLocation,
      returnLocation,
      driverAge,
      licenseNumber,
      licenseCountry,
      specialRequests,
    } = req.body;

    // ---- VALIDATION ----
    if (!client || !vehicle || !dateDebut || !dateFin) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      return res.status(400).json({ msg: "Invalid reservation dates" });
    }

    // ---- VEHICLE CHECK ----
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }

    if (vehicleDoc.statut !== "disponible") {
      return res
        .status(400)
        .json({ msg: "Vehicle is not available" });
    }

    // ---- CREATE RESERVATION ----
    const reservation = await Reservation.create({
      client,
      vehicle,
      dateDebut,
      dateFin,
      prixTotal,
      pickupLocation,
      returnLocation: returnLocation || pickupLocation,
      driverAge,
      licenseNumber,
      licenseCountry,
      specialRequests,
      statut: "en attente",
    });

    // ---- UPDATE VEHICLE STATUS ----
    vehicleDoc.statut = "loué";
    await vehicleDoc.save();

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// ✅ GET ALL RESERVATIONS (ADMIN)
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("client", "name email")
      .populate("vehicle");

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ GET RESERVATION BY ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("client", "name email")
      .populate("vehicle");

    if (!reservation) {
      return res.status(404).json({ msg: "Reservation not found" });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ UPDATE RESERVATION (ADMIN)
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ msg: "Reservation not found" });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ DELETE RESERVATION
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(
      req.params.id
    );

    if (!reservation) {
      return res.status(404).json({ msg: "Reservation not found" });
    }

    // 🔁 Restore vehicle availability
    await Vehicle.findByIdAndUpdate(reservation.vehicle, {
      statut: "disponible",
    });

    res.json({ msg: "Reservation deleted" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
