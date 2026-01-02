import React from 'react';
import './VehicleList.css';

const VehicleList = ({ vehicles, onEdit, onDelete, onStatusChange }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'rented':
        return 'status-rented';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'rented':
        return 'Rented';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatus = ['available', 'rented', 'maintenance'];
    return allStatus.filter(status => status !== currentStatus);
  };

  if (vehicles.length === 0) {
    return (
      <div className="no-vehicles">
        <i className="fas fa-car"></i>
        <h3>No vehicles found</h3>
        <p>Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-item">
            <div className="vehicle-item-header">
              <div className="vehicle-image">
  {vehicle.image ? (
    <img src={vehicle.image} alt={vehicle.name} />
  ) : (
    <div className="vehicle-image-placeholder">
      <i className="fas fa-car"></i>
    </div>
  )}
</div>
              <div className="vehicle-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => onEdit(vehicle)}
                  title="Edit vehicle"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => onDelete(vehicle.id)}
                  title="Delete vehicle"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="vehicle-item-content">
              <h3 className="vehicle-name">{vehicle.name}</h3>
              <p className="vehicle-model">{vehicle.brand} {vehicle.model} • {vehicle.year}</p>
              
              <div className="vehicle-details">
                <div className="detail-row">
                  <span className="detail-label">Plate:</span>
                  <span className="detail-value plate">{vehicle.plateNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{vehicle.type}</span>
                </div>
                <div className="detail-row">
  <span className="detail-label">Color:</span>
  <span className="detail-value color-indicator">
    <span
      className="color-dot"
      style={{ backgroundColor: (vehicle.color || "gray").toLowerCase() }}
    ></span>
    {vehicle.color || "Gray"}
  </span>
</div>

              </div>

              <div className="vehicle-rates">
                <div className="rate">
                  <span className="rate-label">Daily:</span>
                  <span className="rate-value">${vehicle.dailyRate.toFixed(2)}</span>
                </div>
                <div className="rate">
                  <span className="rate-label">Hourly:</span>
                  <span className="rate-value">${vehicle.hourlyRate.toFixed(2)}</span>
                </div>
              </div>

              <div className="vehicle-features">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
                {vehicle.features.length > 3 && (
                  <span className="feature-tag">+{vehicle.features.length - 3}</span>
                )}
              </div>

              <div className="vehicle-item-footer">
                <div className="status-selector">
                  <label>Change Status:</label>
                  <select
                    value={vehicle.status}
                    onChange={(e) => onStatusChange(vehicle.id, e.target.value)}
                    className="status-select"
                  >
                    <option value={vehicle.status}>
                      {getStatusText(vehicle.status)}
                    </option>
                    {getStatusOptions(vehicle.status).map(status => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  className="btn btn-outline view-details"
                  onClick={() => onEdit(vehicle)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleList;