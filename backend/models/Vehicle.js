const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    marque: { type: String, required: true },
    modele: { type: String, required: true },
    annee: { type: Number, required: true },

    prixParJour: { type: Number, required: true },

    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    color: {
      type: String,
      required: true
    },

    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    // ✅ BASE64 IMAGE
    image: {
      type: String,
      required: true
    },

    statut: {
      type: String,
      enum: ["disponible", "loué", "maintenance"],
      default: "disponible"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
