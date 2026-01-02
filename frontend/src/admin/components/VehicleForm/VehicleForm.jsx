import React, { useState, useEffect } from "react";
import "./VehicleForm.css";

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    brand: "",
    type: "SUV",
    year: new Date().getFullYear(),
    color: "Black",
    plateNumber: "",
    dailyRate: 0,
    hourlyRate: 0,
    status: "available",
    features: [],
    image: null
  });

  const [featureInput, setFeatureInput] = useState("");

  const vehicleTypes = ["SUV", "Sedan", "Coupe", "Hatchback", "MVP", "Sport"];
  const colors = ["Black", "White", "Red", "Blue", "Gray", "Silver", "Green"];
  const statuses = ["available", "rented", "maintenance"];
  const brands = ["Tesla", "Toyota", "BMW", "Honda", "Mercedes", "Audi", "Ford"];

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        image: null // keep old image unless changed
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature)
    }));
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  const data = new FormData();

  data.append("marque", formData.brand);
  data.append("modele", formData.model);
  data.append("annee", formData.year);
  data.append("prixParJour", formData.dailyRate);
  data.append("plateNumber", formData.plateNumber);
  data.append("color", formData.color);
  data.append(
    "statut",
    formData.status === "available"
      ? "disponible"
      : formData.status === "rented"
      ? "loué"
      : "maintenance"
  );

  // 🔥 REQUIRED ON CREATE
  if (formData.image) {
    data.append("image", formData.image);
  }

  onSave(data);
};


  return (
    <div className="vehicle-form-container">
      <div className="form-header">
        <h2>{vehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
        <p>Fill in the vehicle details below</p>
      </div>

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-grid">

          {/* BASIC INFO */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="form-group">
              <label>Brand *</label>
              <select name="brand" value={formData.brand} onChange={handleChange} required>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Model *</label>
                <input name="model" value={formData.model} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {vehicleTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <select name="color" value={formData.color} onChange={handleChange}>
                  {colors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Plate Number *</label>
              <input
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* ✅ IMAGE INPUT (DESIGN SAFE) */}
            <div className="form-group">
              <label>Vehicle Image {vehicle ? "(optional)" : "*"}</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required={!vehicle}
              />
            </div>
          </div>

          {/* RATES & STATUS */}
          <div className="form-section">
            <h3 className="section-title">Rates & Status</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Daily Rate</label>
                <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Hourly Rate</label>
                <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <div className="status-options">
                {statuses.map((s) => (
                  <label key={s} className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={formData.status === s}
                      onChange={handleChange}
                    />
                    <span className={`status-label status-${s}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {vehicle ? "Update Vehicle" : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
