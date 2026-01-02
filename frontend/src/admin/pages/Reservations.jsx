import React, { useState, useEffect } from "react";
import ReservationList from "../components/ReservationList";
import ReservationForm from "../components/ReservationForm";
import { reservationAPI } from "../../services/api";
import {
  mapReservationFromBackend,
  mapStatusToBackend,
} from "../../utils/reservationMapper";
import "./Reservations.css";

/**
 * Adapt reservationMapper output to ADMIN UI structure
 */
const adaptReservationForAdminUI = (r) => {
  if (!r) return null;

  return {
    id: r.id,
    reservationNumber: `RES-${r.id.slice(-6).toUpperCase()}`,

    customerName: r.clientName,
    customerEmail: r.clientEmail,
    customerPhone: "",

    vehicle: {
      id: r.vehicleId,
      name: r.vehicleName,
      plateNumber: r.vehiclePlate,
      type: r.vehicleType,
    },

    startDate: r.startDate.split("T")[0],
    endDate: r.endDate.split("T")[0],

    pickupTime: "--",
    returnTime: "--",

    totalDays: r.rentalDays,
    totalAmount: r.totalPrice,

    status: r.status,
    paymentStatus: "paid",

    createdAt: r.createdAt,
    notes: r.specialRequests || "",
  };
};

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  // ================= FETCH FROM DATABASE =================
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getAll();

      const mapped = response.data
        .map(mapReservationFromBackend)
        .map(adaptReservationForAdminUI);

      setReservations(mapped);
      setFilteredReservations(mapped);
      calculateStats(mapped);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservations) => {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const active = reservations.filter(r => r.status === 'active').length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const completed = reservations.filter(r => r.status === 'completed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    const revenue = reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + parseFloat(r.totalAmount || 0), 0);

    setStats({
      total,
      confirmed,
      active,
      pending,
      completed,
      cancelled,
      revenue
    });
  };

  // ================= FILTERING =================
  useEffect(() => {
    let filtered = reservations;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.reservationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter(
        (r) => r.startDate === filterDate || r.endDate === filterDate
      );
    }

    setFilteredReservations(filtered);
  }, [searchTerm, filterStatus, filterDate, reservations]);

  // ================= STATUS UPDATE (ADMIN) =================
  const handleStatusChange = async (id, newStatus) => {
    try {
      await reservationAPI.updateStatus(id, {
        statut: mapStatusToBackend(newStatus),
      });

      setReservations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );
    } catch (error) {
      console.error("Failed to update reservation status:", error);
    }
  };

  // ================= DELETE (ADMIN) =================
  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reservation?"))
      return;

    try {
      await reservationAPI.delete(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    }
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="reservations-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>Loading Reservations</h3>
          <p>Please wait while we fetch your reservation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-page">
      {/* HEADER */}
      <div className="reservations-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Reservation Management</h1>
            <p className="page-subtitle">Manage and monitor all vehicle reservations</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <i className="fas fa-plus"></i>
            <span>Add New Reservation</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Reservations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon confirmed">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-car"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Now</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Approval</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <i className="fas fa-flag-checkered"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cancelled">
            <i className="fas fa-ban"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.cancelled}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      {/* REVENUE CARD */}
      <div className="revenue-card">
        <div className="revenue-icon">
          <i className="fas fa-dollar-sign"></i>
        </div>
        <div className="revenue-info">
          <div>
            <span className="revenue-label">Total Revenue</span>
            <h3>${stats.revenue.toLocaleString()}</h3>
          </div>
          <span className="revenue-trend">
            <i className="fas fa-arrow-up"></i> 12% from last month
          </span>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search reservations, customers, or vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="filter-actions">
          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-filter"></i> Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              {["all", "pending", "confirmed", "active", "completed", "cancelled"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-calendar"></i> Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-select date-filter"
            />
          </div>

          <button
            className="btn-outline"
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
              setFilterDate("");
            }}
          >
            <i className="fas fa-undo"></i>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {showForm ? (
          <div className="form-section">
            <div className="form-header">
              <h2>
                <i className="fas fa-edit"></i>
                {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
              </h2>
              <button 
                className="btn-outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingReservation(null);
                }}
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back to List</span>
              </button>
            </div>
            <ReservationForm
              reservation={editingReservation}
              onCancel={() => {
                setShowForm(false);
                setEditingReservation(null);
              }}
            />
          </div>
        ) : (
          <div className="list-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-list"></i>
                All Reservations
              </h2>
              <div className="header-actions">
                <button className="btn-outline">
                  <i className="fas fa-download"></i>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
            
            {filteredReservations.length > 0 ? (
              <ReservationList
                reservations={filteredReservations}
                onEdit={setEditingReservation}
                onDelete={handleDeleteReservation}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <h3>No Reservations Found</h3>
                <p>No reservations match your current filters. Try adjusting your search criteria.</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterDate("");
                  }}
                >
                  <i className="fas fa-undo"></i>
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      {!showForm && filteredReservations.length > 0 && (
        <div className="results-info">
          <div className="info-content">
            <i className="fas fa-info-circle"></i>
            <p>
              Showing <strong>{filteredReservations.length}</strong> of <strong>{reservations.length}</strong> reservations
              {searchTerm && ` for "${searchTerm}"`}
              {filterStatus !== 'all' && ` with status "${filterStatus}"`}
              {filterDate && ` on ${filterDate}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;