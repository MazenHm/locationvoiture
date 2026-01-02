import React, { useState, useEffect } from 'react';
import VehicleList from '../components/VehicleList';
import VehicleForm from '../components/VehicleForm';
import { vehicleAPI } from "../../services/vehicleAPI";
import { mapVehicleFromBackend, mapStatusToBackend } from "../../utils/vehicleMapper";
import './Vehicles.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([loadVehicles(), loadStats()]);
  };

  const loadVehicles = async () => {
    try {
      const res = await vehicleAPI.getAll();
          console.log("RAW VEHICLES FROM API:", res.data);

      const mapped = res.data.map(mapVehicleFromBackend);
      setVehicles(mapped);
      setFilteredVehicles(mapped);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await vehicleAPI.getStats();
      setStats({
        total: res.data.total || 0,
        available: res.data.disponible || 0,
        rented: res.data["loué"] || 0,
        maintenance: res.data.maintenance || 0
      });
    } catch (err) {
      console.error("Failed to load vehicle stats:", err);
      setStats({
        total: vehicles.length,
        available: vehicles.filter(v => v.status === "available").length,
        rented: vehicles.filter(v => v.status === "rented").length,
        maintenance: vehicles.filter(v => v.status === "maintenance").length
      });
    }
  };

  useEffect(() => {
    filterVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType, filterStatus, vehicles]);

  const filterVehicles = () => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        (vehicle.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === filterStatus);
    }

    setFilteredVehicles(filtered);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await vehicleAPI.delete(id);
      await loadAll();
    } catch (err) {
      console.error("Delete vehicle failed:", err);
      alert("Delete failed. Check console.");
    }
  };

const handleSaveVehicle = async (vehicleData) => {
  try {
    // 🔥 vehicleData IS FormData now
    if (editingVehicle) {
      await vehicleAPI.update(editingVehicle.id, vehicleData);
    } else {
      await vehicleAPI.create(vehicleData);
    }

    setShowForm(false);
    setEditingVehicle(null);
    await loadAll();
  } catch (err) {
    console.error("Save vehicle failed:", err.response?.data || err);
    alert(err.response?.data?.msg || "Save failed. Check backend console.");
  }
};



  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await vehicleAPI.update(id, { statut: mapStatusToBackend(newStatus) });
      await loadAll();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Status update failed. Check console.");
    }
  };

 
  const dynamicTypes = Array.from(new Set(vehicles.map(v => v.type).filter(Boolean)));
  const vehicleTypes = ['all', ...dynamicTypes];

  const statusTypes = ['all', 'available', 'rented', 'maintenance'];

  return (
    <div className="vehicles-page">
      <div className="vehicles-header">
        <h1 className="page-title">Vehicle Management</h1>
        <button className="btn btn-primary" onClick={handleAddVehicle}>
          <i className="fas fa-plus"></i> Add New Vehicle
        </button>
      </div>

      <div className="vehicles-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-car"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.available}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rented">
            <i className="fas fa-road"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.rented}</h3>
            <p>Rented</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon maintenance">
            <i className="fas fa-tools"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.maintenance}</h3>
            <p>Maintenance</p>
          </div>
        </div>
      </div>

      {/* ✅ SAME DESIGN: Filters */}
      <div className="vehicles-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search vehicles by name, model, or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {vehicleTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {statusTypes.map(status => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'All'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-outline clear-filters-btn"
          onClick={() => {
            setSearchTerm('');
            setFilterType('all');
            setFilterStatus('all');
          }}
        >
          Clear Filters
        </button>
      </div>

      {showForm ? (
        <VehicleForm
          vehicle={editingVehicle}
          onSave={handleSaveVehicle}
          onCancel={handleCancelForm}
        />
      ) : (
        <VehicleList
          vehicles={filteredVehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
          onStatusChange={handleStatusChange}
        />
      )}

      {!showForm && (
        <div className="results-info">
          <p>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
