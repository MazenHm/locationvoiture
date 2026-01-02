import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../admin/context/AuthContext';
import { vehicleAPI, reservationAPI } from '../../services/api';
import { mapVehicleFromBackend } from '../../utils/vehicleMapper';
import styles from './BookCar.module.css';

const BookCar = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: 'Main Office',
    returnLocation: 'Main Office',
    driverAge: '',
    licenseNumber: '',
    licenseCountry: '',
    specialRequests: ''
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        setNotification({ type: '', message: '' });

        const response = await vehicleAPI.getAll();
        const found = response.data.find(v => v._id === carId);

        if (!found) {
          throw new Error("Vehicle not found");
        }

        const mappedVehicle = mapVehicleFromBackend(found);
        setVehicle(mappedVehicle);
        
        // Auto-populate return location with pickup location
        setFormData(prev => ({
          ...prev,
          returnLocation: prev.pickupLocation
        }));

      } catch (err) {
        console.error("BookCar fetch error:", err.message);
        setNotification({ 
          type: 'error', 
          message: 'Failed to load vehicle details. Please try again.' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [carId]);

  // Calculate price and rental days
  useEffect(() => {
    if (formData.pickupDate && formData.returnDate && vehicle) {
      const pickup = new Date(formData.pickupDate);
      const ret = new Date(formData.returnDate);

      if (!isNaN(pickup) && !isNaN(ret) && ret > pickup) {
        const days = Math.ceil((ret - pickup) / 86400000);
        setRentalDays(days);
        setCalculatedPrice(days * (Number(vehicle.dailyRate) || 0));
      } else {
        setRentalDays(0);
        setCalculatedPrice(0);
      }
    } else {
      setRentalDays(0);
      setCalculatedPrice(0);
    }
  }, [formData.pickupDate, formData.returnDate, vehicle]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      // Auto-update return location if pickup location changes
      ...(name === 'pickupLocation' && { returnLocation: value })
    }));
    setNotification({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    // User ID extraction
    const userId = 
      user?._id || 
      user?.id || 
      user?.user?._id || 
      user?.user?.id || 
      user?.data?._id || 
      user?.data?.id;

    if (!userId) {
      setNotification({ 
        type: 'error', 
        message: 'You must be logged in to make a reservation.' 
      });
      return;
    }

    if (!vehicle?.id) {
      setNotification({ 
        type: 'error', 
        message: 'Vehicle information is not available. Please refresh the page.' 
      });
      return;
    }

    // Validation
    if (!formData.pickupDate || !formData.returnDate) {
      setNotification({ 
        type: 'error', 
        message: 'Please select both pickup and return dates.' 
      });
      return;
    }

    if (calculatedPrice <= 0 || rentalDays <= 0) {
      setNotification({ 
        type: 'error', 
        message: 'Please select valid rental dates.' 
      });
      return;
    }

    if (new Date(formData.pickupDate) < new Date(today)) {
      setNotification({ 
        type: 'error', 
        message: 'Pickup date cannot be in the past.' 
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        client: userId,
        vehicle: vehicle.id,
        dateDebut: formData.pickupDate,
        dateFin: formData.returnDate,
        prixTotal: Number((calculatedPrice * 1.1).toFixed(2)),
        pickupLocation: formData.pickupLocation,
        returnLocation: formData.returnLocation,
        driverAge: formData.driverAge ? Number(formData.driverAge) : undefined,
        licenseNumber: formData.licenseNumber || undefined,
        licenseCountry: formData.licenseCountry || undefined,
        specialRequests: formData.specialRequests || undefined
      };

      await reservationAPI.create(payload);

      setNotification({ 
        type: 'success', 
        message: 'Reservation created successfully! Redirecting to your bookings...' 
      });

      setTimeout(() => {
        navigate('/client/reservations');
      }, 1500);

    } catch (err) {
      console.error("Reservation create error:", err.response?.data || err.message);
      setNotification({
        type: 'error',
        message: err.response?.data?.msg || 'Failed to create reservation. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.bookCar}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <h3>Loading Vehicle Details</h3>
          <p>Please wait while we prepare your booking...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!vehicle) {
    return (
      <div className={styles.bookCar}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Vehicle Not Found</h3>
          <p>The vehicle you're looking for is no longer available or doesn't exist.</p>
          <Link to="/client/cars" className={styles.btnPrimary}>
            <i className="fas fa-car"></i> Browse Available Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookCar}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb}>
        <Link to="/client/cars" className={styles.breadcrumbLink}>
          <i className="fas fa-chevron-left"></i>
          <span>Back to Cars</span>
        </Link>
        <div className={styles.breadcrumbSeparator}>/</div>
        <span className={styles.breadcrumbCurrent}>Book {vehicle.name}</span>
      </nav>

      {/* Notification Alert */}
      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      <div className={styles.container}>
        {/* Vehicle Information Section */}
        <div className={styles.vehicleSection}>
          <div className={styles.vehicleImageContainer}>
            {vehicle.image ? (
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className={styles.vehicleImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2394a3b8" text-anchor="middle" dy=".3em">No Image Available</text></svg>';
                }}
              />
            ) : (
              <div className={styles.noImage}>
                <i className="fas fa-car"></i>
                <span>Image Not Available</span>
              </div>
            )}
          </div>

          <div className={styles.vehicleDetails}>
            <div className={styles.vehicleHeader}>
              <div>
                <h1 className={styles.vehicleName}>{vehicle.name}</h1>
                <p className={styles.vehicleSubtitle}>
                  {vehicle.year} • {vehicle.type} • {vehicle.transmission}
                </p>
              </div>
              <div className={styles.dailyRate}>
                <span className={styles.rateAmount}>${vehicle.dailyRate}</span>
                <span className={styles.ratePeriod}>/ day</span>
              </div>
            </div>

            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <i className="fas fa-users"></i>
                <div>
                  <span className={styles.specLabel}>Seats</span>
                  <span className={styles.specValue}>{vehicle.seats || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <i className="fas fa-gas-pump"></i>
                <div>
                  <span className={styles.specLabel}>Fuel Type</span>
                  <span className={styles.specValue}>{vehicle.fuelType || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <i className="fas fa-cogs"></i>
                <div>
                  <span className={styles.specLabel}>Transmission</span>
                  <span className={styles.specValue}>{vehicle.transmission || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <i className="fas fa-tachometer-alt"></i>
                <div>
                  <span className={styles.specLabel}>Mileage</span>
                  <span className={styles.specValue}>{vehicle.mileage || 'Unlimited'}</span>
                </div>
              </div>
            </div>

            <div className={styles.vehicleFeatures}>
              <h3>Features</h3>
              <div className={styles.featuresGrid}>
                {vehicle.features?.slice(0, 6).map((feature, index) => (
                  <span key={index} className={styles.featureTag}>
                    <i className="fas fa-check"></i> {feature}
                  </span>
                ))}
                {vehicle.features?.length > 6 && (
                  <span className={styles.moreFeatures}>
                    +{vehicle.features.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div className={styles.bookingSection}>
          <div className={styles.bookingCard}>
            <div className={styles.cardHeader}>
              <h2><i className="fas fa-calendar-alt"></i> Booking Details</h2>
              <p>Complete the form below to reserve this vehicle</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.bookingForm}>
              {/* Date Selection */}
              <div className={styles.formSection}>
                <h3><i className="fas fa-calendar-day"></i> Select Dates</h3>
                <div className={styles.dateGrid}>
                  <div className={styles.dateGroup}>
                    <label htmlFor="pickupDate">
                      <i className="fas fa-car"></i> Pickup Date *
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                      className={styles.dateInput}
                    />
                  </div>
                  <div className={styles.dateGroup}>
                    <label htmlFor="returnDate">
                      <i className="fas fa-undo"></i> Return Date *
                    </label>
                    <input
                      type="date"
                      id="returnDate"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleInputChange}
                      min={formData.pickupDate || today}
                      required
                      className={styles.dateInput}
                    />
                  </div>
                </div>
                
                {rentalDays > 0 && (
                  <div className={styles.rentalDuration}>
                    <i className="fas fa-clock"></i>
                    <span>{rentalDays} day{rentalDays !== 1 ? 's' : ''} rental</span>
                  </div>
                )}
              </div>

              {/* Location Selection */}
              <div className={styles.formSection}>
                <h3><i className="fas fa-map-marker-alt"></i> Locations</h3>
                <div className={styles.locationGrid}>
                  <div className={styles.locationGroup}>
                    <label htmlFor="pickupLocation">
                      <i className="fas fa-map-pin"></i> Pickup Location
                    </label>
                    <select
                      id="pickupLocation"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      className={styles.selectInput}
                    >
                      <option value="Main Office">Main Office</option>
                      <option value="Downtown Branch">Downtown Branch</option>
                      <option value="Airport Terminal">Airport Terminal</option>
                      <option value="Train Station">Train Station</option>
                    </select>
                  </div>
                  <div className={styles.locationGroup}>
                    <label htmlFor="returnLocation">
                      <i className="fas fa-flag-checkered"></i> Return Location
                    </label>
                    <select
                      id="returnLocation"
                      name="returnLocation"
                      value={formData.returnLocation}
                      onChange={handleInputChange}
                      className={styles.selectInput}
                    >
                      <option value="Main Office">Main Office</option>
                      <option value="Downtown Branch">Downtown Branch</option>
                      <option value="Airport Terminal">Airport Terminal</option>
                      <option value="Train Station">Train Station</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation */}
              <div className={styles.priceSection}>
                <h3><i className="fas fa-calculator"></i> Price Breakdown</h3>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Daily Rate ({rentalDays} days)</span>
                    <span>${vehicle.dailyRate} × {rentalDays}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Subtotal</span>
                    <span>${calculatedPrice.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Tax (10%)</span>
                    <span>${(calculatedPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className={styles.priceTotal}>
                    <span>Total Amount</span>
                    <span className={styles.totalAmount}>
                      ${(calculatedPrice * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className={styles.formActions}>
                <Link to="/client/cars" className={styles.btnSecondary}>
                  <i className="fas fa-times"></i> Cancel
                </Link>
                <button 
                  type="submit" 
                  className={styles.btnPrimary}
                  disabled={submitting || calculatedPrice === 0}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock"></i>
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>

              {/* Terms Note */}
              <div className={styles.termsNote}>
                <i className="fas fa-info-circle"></i>
                <p>
                  By confirming this booking, you agree to our Terms of Service. 
                  A security deposit may be required upon pickup.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCar;