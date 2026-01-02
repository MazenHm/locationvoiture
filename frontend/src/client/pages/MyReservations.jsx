import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../admin/context/AuthContext';
import { reservationAPI } from '../../services/api';
import { mapReservationFromBackend } from '../../utils/reservationMapper';
import styles from './MyReservations.module.css';

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [cancelingId, setCancelingId] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Reservations' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (user?.id) fetchReservations();
  }, [user?.id]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationAPI.getAll();
      const userReservations = res.data.filter(
        r => r.client?._id === user.id || r.client === user.id
      );
      const mapped = userReservations.map(mapReservationFromBackend);
      setReservations(mapped);
      applyFilter(mapped, activeFilter);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (list, filter) => {
    setFilteredReservations(
      filter === 'all' ? list : list.filter(r => r.status === filter)
    );
  };

  const handleCancelReservation = async id => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      setCancelingId(id);
      await reservationAPI.cancel(id);
      const updated = reservations.map(r =>
        r.id === id ? { ...r, status: 'cancelled' } : r
      );
      setReservations(updated);
      applyFilter(updated, activeFilter);
    } finally {
      setCancelingId(null);
    }
  };

  const statusClass = status => styles[`badge_${status}`];

  if (loading) {
    return (
      <div className={styles.myReservations}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.myReservations}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1>My Reservations</h1>
          <p>View and manage all your bookings</p>
        </div>
        <Link to="/client/cars" className={styles.btnPrimary}>
          <i className="fas fa-car"></i> Book Vehicle
        </Link>
      </div>

      {/* FILTERS */}
      <div className={styles.filterTabs}>
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            className={`${styles.filterTab} ${
              activeFilter === opt.value ? styles.active : ''
            }`}
            onClick={() => {
              setActiveFilter(opt.value);
              applyFilter(reservations, opt.value);
            }}
          >
            {opt.label}
            <span className={styles.tabCount}>
              {opt.value === 'all'
                ? reservations.length
                : reservations.filter(r => r.status === opt.value).length}
            </span>
          </button>
        ))}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* GRID */}
      <div className={styles.reservationsGrid}>
        {filteredReservations.map(res => (
          <div key={res.id} className={styles.reservationCard}>
            <div className={styles.cardHeader}>
              <h3>{res.vehicleName}</h3>
              <span className={`${styles.statusBadge} ${statusClass(res.status)}`}>
                {res.status}
              </span>
            </div>

            <div className={styles.cardFooter}>
              {res.status === 'pending' && (
                <button
                  className={`${styles.btnOutline} ${styles.danger}`}
                  disabled={cancelingId === res.id}
                  onClick={() => handleCancelReservation(res.id)}
                >
                  Cancel
                </button>
              )}
              <Link
                to={`/client/reservations/${res.id}`}
                className={styles.btnOutline}
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReservations;
