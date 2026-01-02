const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    dateDebut: {
      type: Date,
      required: true,
    },

    dateFin: {
      type: Date,
      required: true,
    },

    statut: {
      type: String,
      enum: [
        "en attente",
        "validée",
        "en cours",
        "terminé",
        "annulée",
      ],
      default: "en attente",
    },

    prixTotal: {
      type: Number,
      required: true,
    },

    pickupLocation: { type: String, default: "Main Office" },
    returnLocation: { type: String },
    driverAge: { type: Number },
    licenseNumber: { type: String },
    licenseCountry: { type: String },
    specialRequests: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
