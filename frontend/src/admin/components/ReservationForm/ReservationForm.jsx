import React, { useState, useEffect } from 'react';
import './ReservationForm.css';

const ReservationForm = ({ reservation, vehicles, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    pickupTime: '09:00',
    returnTime: '17:00',
    status: 'pending',
    paymentStatus: 'pending',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [calculatedDays, setCalculatedDays] = useState(0);

  const availableVehicles = vehicles.filter(v => v.status === 'available');
  
  const statuses = [
    { value: 'pending', label: 'Pending', color: '#ff9800' },
    { value: 'confirmed', label: 'Confirmed', color: '#2196f3' },
    { value: 'active', label: 'Active', color: '#4caf50' },
    { value: 'completed', label: 'Completed', color: '#673ab7' },
    { value: 'cancelled', label: 'Cancelled', color: '#f44336' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: '#ff9800' },
    { value: 'paid', label: 'Paid', color: '#4caf50' },
    { value: 'refunded', label: 'Refunded', color: '#9e9e9e' }
  ];

  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    if (reservation) {
      setFormData({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        vehicleId: reservation.vehicle.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        pickupTime: reservation.pickupTime,
        returnTime: reservation.returnTime,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        notes: reservation.notes || ''
      });
      calculateAmountAndDays(reservation.vehicle.id, reservation.startDate, reservation.endDate);
    }
  }, [reservation]);

  useEffect(() => {
    if (formData.vehicleId && formData.startDate && formData.endDate) {
      calculateAmountAndDays(formData.vehicleId, formData.startDate, formData.endDate);
    }
  }, [formData.vehicleId, formData.startDate, formData.endDate]);

  const calculateAmountAndDays = (vehicleId, startDate, endDate) => {
    const vehicle = vehicles.find(v => v.id.toString() === vehicleId.toString());
    if (!vehicle || !startDate || !endDate) {
      setCalculatedAmount(0);
      setCalculatedDays(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      setCalculatedAmount(0);
      setCalculatedDays(0);
      return;
    }

    const totalAmount = diffDays * vehicle.dailyRate;
    setCalculatedDays(diffDays);
    setCalculatedAmount(totalAmount);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    setFormData(prev => ({
      ...prev,
      vehicleId
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = 'Email is invalid';
    
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!formData.vehicleId) newErrors.vehicleId = 'Please select a vehicle';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicleId.toString());
    
    const reservationData = {
      ...formData,
      vehicle: {
        id: selectedVehicle.id,
        name: selectedVehicle.name,
        plateNumber: selectedVehicle.plateNumber || 'N/A',
        type: selectedVehicle.type
      },
      totalDays: calculatedDays,
      totalAmount: calculatedAmount
    };

    onSave(reservationData);
  };

  const getVehicleDetails = () => {
    if (!formData.vehicleId) return null;
    return vehicles.find(v => v.id.toString() === formData.vehicleId.toString());
  };

  const vehicleDetails = getVehicleDetails();

  return (
    <div className="reservation-form-container">
      <div className="form-header">
        <h2>{reservation ? 'Edit Reservation' : 'Create New Reservation'}</h2>
        <p>Fill in the reservation details below</p>
      </div>

      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-grid">
          {/* Customer Information */}
          <div className="form-section">
            <h3 className="section-title">Customer Information</h3>
            
            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer's full name"
                className={errors.customerName ? 'error' : ''}
              />
              {errors.customerName && <span className="error-message">{errors.customerName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerEmail">Email Address *</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  className={errors.customerEmail ? 'error' : ''}
                />
                {errors.customerEmail && <span className="error-message">{errors.customerEmail}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className={errors.customerPhone ? 'error' : ''}
                />
                {errors.customerPhone && <span className="error-message">{errors.customerPhone}</span>}
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="form-section">
            <h3 className="section-title">Vehicle Selection</h3>
            
            <div className="form-group">
              <label htmlFor="vehicleId">Select Vehicle *</label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleVehicleChange}
                className={errors.vehicleId ? 'error' : ''}
              >
                <option value="">Select a vehicle</option>
                {availableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.brand} {vehicle.model} (${vehicle.dailyRate}/day)
                  </option>
                ))}
              </select>
              {errors.vehicleId && <span className="error-message">{errors.vehicleId}</span>}
              
              {vehicleDetails && (
                <div className="vehicle-preview">
                  <div className="vehicle-info">
                    <h4>{vehicleDetails.name}</h4>
                    <div className="vehicle-details">
                      <span>{vehicleDetails.brand} {vehicleDetails.model}</span>
                      <span className="vehicle-type">{vehicleDetails.type}</span>
                    </div>
                    <div className="vehicle-rate">
                      Daily Rate: <strong>${vehicleDetails.dailyRate.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Dates */}
          <div className="form-section">
            <h3 className="section-title">Reservation Dates</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.startDate ? 'error' : ''}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupTime">Pickup Time</label>
                <select
                  id="pickupTime"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="returnTime">Return Time</label>
                <select
                  id="returnTime"
                  name="returnTime"
                  value={formData.returnTime}
                  onChange={handleChange}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status & Payment */}
          <div className="form-section">
            <h3 className="section-title">Status & Payment</h3>
            
            <div className="form-group">
              <label>Reservation Status</label>
              <div className="status-options">
                {statuses.map(status => (
                  <label key={status.value} className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={formData.status === status.value}
                      onChange={handleChange}
                    />
                    <span 
                      className="status-label"
                      style={{ 
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                        borderColor: status.color
                      }}
                    >
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Payment Status</label>
              <div className="status-options">
                {paymentStatuses.map(status => (
                  <label key={status.value} className="status-option">
                    <input
                      type="radio"
                      name="paymentStatus"
                      value={status.value}
                      checked={formData.paymentStatus === status.value}
                      onChange={handleChange}
                    />
                    <span 
                      className="status-label"
                      style={{ 
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                        borderColor: status.color
                      }}
                    >
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requests or notes..."
                rows="3"
              />
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="form-section summary-section">
            <h3 className="section-title">Reservation Summary</h3>
            
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">Duration:</span>
                <span className="summary-value">
                  {calculatedDays} day{calculatedDays !== 1 ? 's' : ''}
                </span>
              </div>
              
              {vehicleDetails && (
                <div className="summary-row">
                  <span className="summary-label">Daily Rate:</span>
                  <span className="summary-value">
                    ${vehicleDetails.dailyRate.toFixed(2)}/day
                  </span>
                </div>
              )}
              
              <div className="summary-row total">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value amount">${calculatedAmount.toFixed(2)}</span>
              </div>
              
              <div className="summary-help">
                <i className="fas fa-info-circle"></i>
                Amount calculated based on selected vehicle and duration
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {reservation ? 'Update Reservation' : 'Create Reservation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;