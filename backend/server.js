// server.js - CORRECTED VERSION

// ====================
// LOAD ENV VARIABLES FIRST!
// ====================
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));

app.get("/", (req, res) => {
  res.json({ 
    message: "Car Rental System Backend Running",
    database: "MongoDB Atlas Connected",
    status: "Active"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    mongodb: "Connected"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});