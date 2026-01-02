import React from 'react';
import './ReservationList.css';

const ReservationList = ({ reservations, onEdit, onDelete, onStatusChange }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'payment-paid';
      case 'pending':
        return 'payment-pending';
      case 'refunded':
        return 'payment-refunded';
      default:
        return '';
    }
  };

  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'refunded':
        return 'Refunded';
      default:
        return paymentStatus;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (reservations.length === 0) {
    return (
      <div className="no-reservations">
        <i className="fas fa-calendar-alt"></i>
        <h3>No reservations found</h3>
        <p>Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="reservation-list-container">
      <div className="reservation-grid">
        {reservations.map((reservation) => {
          const daysRemaining = calculateDaysRemaining(reservation.startDate);
          
          return (
            <div key={reservation.id} className="reservation-item">
              <div className="reservation-header">
                <div className="reservation-number">
                  <span className="reservation-id">{reservation.reservationNumber}</span>
                  <span className="created-date">
                    Created: {formatDate(reservation.createdAt)}
                  </span>
                </div>
                <div className="reservation-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit(reservation)}
                    title="Edit reservation"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete(reservation.id)}
                    title="Delete reservation"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="reservation-content">
                <div className="customer-info">
                  <h3 className="customer-name">{reservation.customerName}</h3>
                  <div className="customer-contact">
                    <span><i className="fas fa-envelope"></i> {reservation.customerEmail}</span>
                    <span><i className="fas fa-phone"></i> {reservation.customerPhone}</span>
                  </div>
                </div>

                <div className="vehicle-info">
                  <div className="vehicle-details">
                    <h4 className="vehicle-name">{reservation.vehicle.name}</h4>
                    <div className="vehicle-meta">
                      <span className="vehicle-type">{reservation.vehicle.type}</span>
                      <span className="vehicle-plate">{reservation.vehicle.plateNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="reservation-dates">
                  <div className="date-section">
                    <div className="date-label">Pickup</div>
                    <div className="date-value">{formatDate(reservation.startDate)}</div>
                    <div className="time-value">{reservation.pickupTime}</div>
                  </div>
                  
                  <div className="date-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                  
                  <div className="date-section">
                    <div className="date-label">Return</div>
                    <div className="date-value">{formatDate(reservation.endDate)}</div>
                    <div className="time-value">{reservation.returnTime}</div>
                  </div>
                  
                  <div className="duration">
                    <div className="days-count">{reservation.totalDays} days</div>
                    <div className="days-label">Duration</div>
                  </div>
                </div>

                <div className="reservation-meta">
                  <div className="meta-item">
                    <span className="meta-label">Amount:</span>
                    <span className="meta-value amount">${reservation.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    <div className={`status-badge ${getStatusBadgeClass(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </div>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Payment:</span>
                    <div className={`payment-badge ${getPaymentStatusBadgeClass(reservation.paymentStatus)}`}>
                      {getPaymentStatusText(reservation.paymentStatus)}
                    </div>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="reservation-notes">
                    <span className="notes-label">Notes:</span>
                    <p className="notes-content">{reservation.notes}</p>
                  </div>
                )}

                {daysRemaining > 0 && reservation.status === 'confirmed' && (
                  <div className="days-remaining">
                    <i className="fas fa-clock"></i>
                    <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} until pickup</span>
                  </div>
                )}

                {reservation.status === 'active' && (
                  <div className="active-indicator">
                    <i className="fas fa-car"></i>
                    <span>Vehicle currently rented</span>
                  </div>
                )}
              </div>

              <div className="reservation-footer">
                <div className="status-selector">
                  <label>Update Status:</label>
                  <select
                    value={reservation.status}
                    onChange={(e) => onStatusChange(reservation.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="footer-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => onEdit(reservation)}
                  >
                    View Details
                  </button>
                  {reservation.paymentStatus === 'pending' && (
                    <button className="btn btn-primary">
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationList;