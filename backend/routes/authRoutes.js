const express = require("express");
const router = express.Router();

// استيراد controller واحد فقط لأن كل الدوال موجودة فيه
const authController = require("../controllers/authController");

const { protect, admin } = require("../middleware/authMiddleware");

// ==========================
// Public routes
// ==========================
// Public
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected
router.get("/:id", protect, authController.getUserById);
router.put("/profile/:id", protect, authController.updateProfile);
router.put("/password/:id", protect, authController.changePassword);

// Admin only
router.get("/", protect, admin, authController.getAllUsers);
router.put("/:id", protect, admin, authController.updateUser);
router.delete("/:id", protect, admin, authController.deleteUser);

module.exports = router;