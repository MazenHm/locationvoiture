const express = require("express");
const router = express.Router();

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
} = require("../controllers/vehicleController");

const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// STATS
router.get("/stats", getVehicleStats);

// PUBLIC
router.get("/", getVehicles);
router.get("/:id", getVehicleById);

// ADMIN + IMAGE UPLOAD (✅ CORRECT ORDER)
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createVehicle
);

router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateVehicle
);

router.delete("/:id", protect, admin, deleteVehicle);

module.exports = router;
