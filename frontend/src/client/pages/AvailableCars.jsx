import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../admin/context/AuthContext';
import { vehicleAPI } from '../../services/api';
import { mapVehicleFromBackend } from '../../utils/vehicleMapper';
import styles from './AvailableCars.module.css';

const AvailableCars = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter options extracted from data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [years, setYears] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  // Initial filters
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    color: 'all',
    year: 'all',
    transmission: 'all',
    fuelType: 'all',
    priceRange: [0, 1000],
    minSeats: 0,
    searchQuery: '',
    sortBy: 'price-low'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(9);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleAPI.getAll();

      if (response.data) {
        const mappedCars = response.data.map(mapVehicleFromBackend);
        setCars(mappedCars);
        extractFilterOptions(mappedCars);
        applyFilters(mappedCars, filters);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load vehicles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (carsData) => {
    // Extract unique values for each filter
    setCategories([...new Set(carsData.map(c => c.type).filter(Boolean))]);
    setBrands([...new Set(carsData.map(c => c.brand).filter(Boolean))]);
    setColors([...new Set(carsData.map(c => c.color).filter(Boolean))]);
    
    const yearsList = [...new Set(carsData.map(c => c.year).filter(Boolean))];
    yearsList.sort((a, b) => b - a); // Newest first
    setYears(yearsList);
    
    // You might need to add these fields to your backend
    // For now, using mock data
    setTransmissions(['Automatic', 'Manual', 'CVT']);
    setFuelTypes(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']);
  };

  const applyFilters = (carsData, filterSettings) => {
    let filtered = carsData.filter(car => car.status === 'available');
    
    // Apply each filter if not 'all'
    if (filterSettings.category !== 'all') {
      filtered = filtered.filter(car => car.type === filterSettings.category);
    }
    
    if (filterSettings.brand !== 'all') {
      filtered = filtered.filter(car => car.brand === filterSettings.brand);
    }
    
    if (filterSettings.color !== 'all') {
      filtered = filtered.filter(car => car.color === filterSettings.color);
    }
    
    if (filterSettings.year !== 'all') {
      filtered = filtered.filter(car => car.year === parseInt(filterSettings.year));
    }
    
    if (filterSettings.transmission !== 'all') {
      filtered = filtered.filter(car => car.transmission === filterSettings.transmission);
    }
    
    if (filterSettings.fuelType !== 'all') {
      filtered = filtered.filter(car => car.fuelType === filterSettings.fuelType);
    }
    
    // Price range filter
    filtered = filtered.filter(car => 
      car.dailyRate >= filterSettings.priceRange[0] && 
      car.dailyRate <= filterSettings.priceRange[1]
    );
    
    // Search query filter
    if (filterSettings.searchQuery) {
      const query = filterSettings.searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        car.name.toLowerCase().includes(query) ||
        car.brand.toLowerCase().includes(query) ||
        car.type.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered = sortCars(filtered, filterSettings.sortBy);
    
    setFilteredCars(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const sortCars = (carsList, sortType) => {
    const sorted = [...carsList];
    
    switch (sortType) {
      case 'price-low':
        return sorted.sort((a, b) => a.dailyRate - b.dailyRate);
      case 'price-high':
        return sorted.sort((a, b) => b.dailyRate - a.dailyRate);
      case 'year-new':
        return sorted.sort((a, b) => b.year - a.year);
      case 'year-old':
        return sorted.sort((a, b) => a.year - b.year);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    applyFilters(cars, updatedFilters);
  };

  const handleSearchChange = (e) => {
    handleFilterChange('searchQuery', e.target.value);
  };

  const handlePriceRangeChange = (min, max) => {
    handleFilterChange('priceRange', [min, max]);
  };

  const resetFilters = () => {
    const resetFilters = {
      category: 'all',
      brand: 'all',
      color: 'all',
      year: 'all',
      transmission: 'all',
      fuelType: 'all',
      priceRange: [0, 1000],
      minSeats: 0,
      searchQuery: '',
      sortBy: 'price-low'
    };
    setFilters(resetFilters);
    applyFilters(cars, resetFilters);
  };

  // Pagination
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatPrice = (price) => {
    return `$${price}/day`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'rented': return 'Rented';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981'; // Green
      case 'rented': return '#F59E0B'; // Amber
      case 'maintenance': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  if (loading) {
    return (
      <div className={styles.availableCars}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <h3>Loading Vehicles</h3>
          <p>Please wait while we fetch the latest inventory</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.availableCars}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Unable to Load Vehicles</h3>
          <p>{error}</p>
          <button onClick={fetchCars} className={styles.primaryButton}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.availableCars}>
      {/* HERO HEADER */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Find Your Perfect Ride</h1>
          <p>Browse our premium collection of vehicles available for rent</p>
          
          {/* SEARCH BAR */}
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by brand, model, or type..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.searchButton}>
              <i className="fas fa-search"></i> Search
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        {/* FILTERS SIDEBAR */}
        <div className={styles.filterSidebar}>
          <div className={styles.filterHeader}>
            <h3><i className="fas fa-filter"></i> Filters</h3>
            <button onClick={resetFilters} className={styles.resetButton}>
              <i className="fas fa-redo"></i> Reset All
            </button>
          </div>

          {/* CATEGORY FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-car"></i> Vehicle Type</h4>
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Types</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* BRAND FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-tag"></i> Brand</h4>
            <select 
              value={filters.brand} 
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* COLOR FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-palette"></i> Color</h4>
            <select 
              value={filters.color} 
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* YEAR FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-calendar"></i> Year</h4>
            <select 
              value={filters.year} 
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* PRICE RANGE FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-tag"></i> Price Range</h4>
            <div className={styles.priceRange}>
              <span className={styles.priceLabel}>${filters.priceRange[0]}</span>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value))}
                className={styles.rangeSlider}
              />
              <span className={styles.priceLabel}>${filters.priceRange[1]}</span>
            </div>
            <div className={styles.priceDisplay}>
              Daily Rate: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </div>
          </div>

          {/* TRANSMISSION FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-cog"></i> Transmission</h4>
            <select 
              value={filters.transmission} 
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Transmissions</option>
              {transmissions.map(trans => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </div>

          {/* FUEL TYPE FILTER */}
          <div className={styles.filterGroup}>
            <h4><i className="fas fa-gas-pump"></i> Fuel Type</h4>
            <select 
              value={filters.fuelType} 
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Fuel Types</option>
              {fuelTypes.map(fuel => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </div>

          {/* RESULTS COUNT */}
          <div className={styles.resultsCount}>
            <i className="fas fa-car"></i>
            <span>{filteredCars.length} vehicles found</span>
          </div>
        </div>

        {/* VEHICLES GRID */}
        <div className={styles.vehiclesSection}>
          {/* HEADER WITH SORTING */}
          <div className={styles.resultsHeader}>
            <h2>Available Vehicles</h2>
            <div className={styles.sortContainer}>
              <span>Sort by:</span>
              <select 
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={styles.sortSelect}
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="year-new">Year: Newest First</option>
                <option value="year-old">Year: Oldest First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* VEHICLES GRID */}
          {currentCars.length > 0 ? (
            <>
              <div className={styles.vehiclesGrid}>
                {currentCars.map(car => (
                  <div key={car.id} className={styles.vehicleCard}>
                    {/* STATUS BADGE */}
                    <div 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(car.status) }}
                    >
                      {getStatusText(car.status)}
                    </div>

                    {/* VEHICLE IMAGE */}
                    <div className={styles.vehicleImage}>
                      {car.image ? (
                        <img src={car.image} alt={car.name} />
                      ) : (
                        <div className={styles.noImage}>
                          <i className="fas fa-car"></i>
                        </div>
                      )}
                      <div className={styles.imageOverlay}>
                        <button className={styles.quickViewBtn}>
                          <i className="fas fa-eye"></i> Quick View
                        </button>
                      </div>
                    </div>

                    {/* VEHICLE INFO */}
                    <div className={styles.vehicleInfo}>
                      <div className={styles.vehicleHeader}>
                        <h3>{car.name}</h3>
                        <span className={styles.vehicleYear}>{car.year}</span>
                      </div>
                      
                      <div className={styles.vehicleSpecs}>
                        <div className={styles.specItem}>
                          <i className="fas fa-tag"></i>
                          <span>{car.type}</span>
                        </div>
                        <div className={styles.specItem}>
                          <i className="fas fa-palette"></i>
                          <span>{car.color}</span>
                        </div>
                        <div className={styles.specItem}>
                          <i className="fas fa-gas-pump"></i>
                          <span>{car.fuelType || 'Petrol'}</span>
                        </div>
                        <div className={styles.specItem}>
                          <i className="fas fa-cog"></i>
                          <span>{car.transmission || 'Automatic'}</span>
                        </div>
                      </div>

                      {/* FEATURES TAGS */}
                      <div className={styles.featuresTags}>
                        {car.features && car.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className={styles.featureTag}>{feature}</span>
                        ))}
                        {car.features && car.features.length > 2 && (
                          <span className={styles.moreFeaturesTag}>
                            +{car.features.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* PRICE & BOOKING */}
                      <div className={styles.vehicleFooter}>
                        <div className={styles.priceSection}>
                          <div className={styles.dailyRate}>{formatPrice(car.dailyRate)}</div>
                          <div className={styles.hourlyRate}>${(car.dailyRate / 8).toFixed(2)}/hour</div>
                        </div>
                        
                        <Link 
                          to={`/client/book/${car.id}`} 
                          className={styles.bookButton}
                          style={{ 
                            opacity: car.status !== 'available' ? 0.6 : 1,
                            cursor: car.status !== 'available' ? 'not-allowed' : 'pointer'
                          }}
                          onClick={(e) => {
                            if (car.status !== 'available') {
                              e.preventDefault();
                              alert('This vehicle is currently not available for booking');
                            }
                          }}
                        >
                          {car.status === 'available' ? (
                            <>
                              <i className="fas fa-calendar-check"></i> Book Now
                            </>
                          ) : (
                            <>
                              <i className="fas fa-clock"></i> Unavailable
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className={styles.pageDots}>...</span>
                        <button
                          onClick={() => paginate(totalPages)}
                          className={styles.pageNumber}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <i className="fas fa-search"></i>
              </div>
              <h3>No Vehicles Found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <button onClick={resetFilters} className={styles.primaryButton}>
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableCars;