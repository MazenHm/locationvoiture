const Vehicle = require("../models/Vehicle");

const imageToBase64 = (file) =>
  file ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}` : null;

// ================= GET ALL =================
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("categorie");
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= GET BY ID =================
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("categorie");
    if (!vehicle) return res.status(404).json({ msg: "Véhicule introuvable" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= CREATE =================
exports.createVehicle = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ msg: "Vehicle image is required" });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      image: imageToBase64(req.file)
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("CREATE VEHICLE ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
};

// ================= UPDATE =================
exports.updateVehicle = async (req, res) => {
  try {
 
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = imageToBase64(req.file);
    }

    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Véhicule introuvable" });
    }

    res.json(updated);
  } catch (error) {
    console.error("UPDATE VEHICLE ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
};

// ================= DELETE =================
exports.deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Véhicule introuvable" });
    res.json({ msg: "Véhicule supprimé" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= STATS =================
exports.getVehicleStats = async (req, res) => {
  try {
    const statsAgg = await Vehicle.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } }
    ]);

    const statsObj = statsAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const total = await Vehicle.countDocuments();

    res.json({
      total,
      disponible: statsObj["disponible"] || 0,
      "loué": statsObj["loué"] || 0,
      maintenance: statsObj["maintenance"] || 0
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
