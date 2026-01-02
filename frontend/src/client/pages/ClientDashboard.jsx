import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../admin/context/AuthContext";
import { reservationAPI } from "../../services/api";
import {
  mapReservationFromBackend,
  formatPrice,
} from "../../utils/reservationMapper";
import styles from "./ClientDashboard.module.css";

const ClientDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    activeBookings: 0,
    totalBookings: 0,
    favoriteCar: "None",
    loyaltyPoints: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBooking, setUpcomingBooking] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reservationAPI.getMyReservations();

      console.log("CLIENT DASHBOARD RESERVATIONS:", response.data);

      const reservations = response.data.map(mapReservationFromBackend);

      // ===== STATS =====
      const totalBookings = reservations.length;
      const activeBookings = reservations.filter(
        (r) => r.status === "active" || r.status === "confirmed"
      ).length;

      // Favorite car
      const carCount = {};
      reservations.forEach((r) => {
        if (r.vehicleName) {
          carCount[r.vehicleName] = (carCount[r.vehicleName] || 0) + 1;
        }
      });

      const favoriteCar =
        Object.keys(carCount).length > 0
          ? Object.keys(carCount).reduce((a, b) =>
              carCount[a] > carCount[b] ? a : b
            )
          : "None";

      setStats({
        activeBookings,
        totalBookings,
        favoriteCar,
        loyaltyPoints: totalBookings * 50, // simple logic
      });

      // ===== UPCOMING BOOKING =====
      const today = new Date();

      const upcoming = reservations
        .filter((r) => new Date(r.startDate) >= today)
        .sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )[0];

      setUpcomingBooking(upcoming || null);

      // ===== RECENT BOOKINGS =====
      const recent = reservations
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          car: r.vehicleName,
          dates: `${r.formattedStartDate} - ${r.formattedEndDate}`,
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          total: formatPrice(r.totalPrice),
        }));

      setRecentBookings(recent);
    } catch (err) {
      console.error("Client dashboard fetch failed:", err);
    }
  };

  return (
    <div className={styles.clientDashboard}>
      {/* HEADER */}
      <div className={styles.dashboardHeader}>
        <div className={styles.welcomeSection}>
          <h1>Welcome back, {user?.name || "Client"}!</h1>
          <p>Here's what's happening with your bookings today.</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/client/cars" className={styles.btnPrimary}>
            <i className="fas fa-car"></i> Book New Car
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(58, 134, 255, 0.1)" }}
          >
            <i
              className="fas fa-calendar-check"
              style={{ color: "#3a86ff" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.activeBookings}</h3>
            <p>Active Bookings</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(255, 193, 7, 0.1)" }}
          >
            <i
              className="fas fa-history"
              style={{ color: "#ffc107" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(40, 167, 69, 0.1)" }}
          >
            <i
              className="fas fa-crown"
              style={{ color: "#28a745" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.loyaltyPoints}</h3>
            <p>Loyalty Points</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(220, 53, 69, 0.1)" }}
          >
            <i
              className="fas fa-star"
              style={{ color: "#dc3545" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.favoriteCar}</h3>
            <p>Favorite Car</p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.dashboardContent}>
        {/* UPCOMING */}
        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fas fa-calendar-alt"></i> Upcoming Booking
            </h2>
            {upcomingBooking && (
              <Link to="/client/reservations" className={styles.viewAll}>
                View All
              </Link>
            )}
          </div>

          {upcomingBooking ? (
            <div className={styles.upcomingBookingCard}>
              <div className={styles.bookingHeader}>
                <h3>{upcomingBooking.vehicleName}</h3>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status${upcomingBooking.status}`]
                  }`}
                >
                  {upcomingBooking.status}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.noUpcoming}>
              <i className="fas fa-calendar-times"></i>
              <h3>No Upcoming Bookings</h3>
              <Link to="/client/cars" className={styles.btnPrimary}>
                Browse Available Cars
              </Link>
            </div>
          )}
        </div>

        {/* RECENT */}
        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fas fa-history"></i> Recent Bookings
            </h2>
            <Link to="/client/reservations" className={styles.viewAll}>
              View All
            </Link>
          </div>

          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>Car</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.car}</td>
                    <td>{b.dates}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${b.status.toLowerCase()}`]
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className={styles.totalAmount}>{b.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className={styles.quickActions}>
        <h2>
          <i className="fas fa-bolt"></i> Quick Actions
        </h2>
        <div className={styles.actionsGrid}>
          <Link to="/client/cars" className={styles.actionCard}>
            <i className="fas fa-search"></i>
            <h4>Find a Car</h4>
            <p>Browse available vehicles</p>
          </Link>

          <Link to="/client/reservations" className={styles.actionCard}>
            <i className="fas fa-list"></i>
            <h4>My Bookings</h4>
            <p>View all reservations</p>
          </Link>

          <Link to="/client/profile" className={styles.actionCard}>
            <i className="fas fa-user"></i>
            <h4>Update Profile</h4>
            <p>Edit personal details</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
