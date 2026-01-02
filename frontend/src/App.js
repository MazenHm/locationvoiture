import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthContext';

import PrivateRoute from './admin/components/PrivateRoute';
import ClientPrivateRoute from './client/components/ClientPrivateRoute';

// ===== ADMIN =====
import Dashboard from './admin/pages/Dashboard';
import Vehicles from './admin/pages/Vehicles';
import Reservations from './admin/pages/Reservations';
import Settings from './admin/pages/Settings';
import Login from './admin/pages/Login';
import Sidebar from './admin/components/Sidebar/Sidebar';

// ===== CLIENT =====
import ClientDashboard from './client/pages/ClientDashboard';
import AvailableCars from './client/pages/AvailableCars';
import MyReservations from './client/pages/MyReservations';
import ClientProfile from './client/pages/ClientProfile';
import BookCar from './client/pages/BookCar';
import ClientSidebar from './client/components/ClientSidebar/ClientSidebar';

// ===== SHARED (ONLY VARIABLES / RESET) =====
import './styles/App.css';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const handleToggle = () => setCollapsed(prev => !prev);

  // ===== ADMIN LAYOUT =====
  const AdminLayout = ({ children }) => (
    <div className="app-container admin-layout">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div className={`main-content-wrapper ${collapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );

  // ===== CLIENT LAYOUT =====
  const ClientLayout = ({ children }) => (
    <div className="app-container client-layout">
      <ClientSidebar collapsed={collapsed} onToggle={handleToggle} />
      <div className={`main-content-wrapper ${collapsed ? 'collapsed' : ''}`}>
        <div className="client-page-container">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ===== PUBLIC ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/client/dashboard" />} />

          {/* ===== CLIENT ===== */}
          <Route path="/client/dashboard" element={
            <ClientPrivateRoute>
              <ClientLayout>
                <ClientDashboard />
              </ClientLayout>
            </ClientPrivateRoute>
          } />

          <Route path="/client/cars" element={
            <ClientPrivateRoute>
              <ClientLayout>
                <AvailableCars />
              </ClientLayout>
            </ClientPrivateRoute>
          } />

          <Route path="/client/book/:carId" element={
            <ClientPrivateRoute>
              <ClientLayout>
                <BookCar />
              </ClientLayout>
            </ClientPrivateRoute>
          } />

          <Route path="/client/reservations" element={
            <ClientPrivateRoute>
              <ClientLayout>
                <MyReservations />
              </ClientLayout>
            </ClientPrivateRoute>
          } />

          <Route path="/client/profile" element={
            <ClientPrivateRoute>
              <ClientLayout>
                <ClientProfile />
              </ClientLayout>
            </ClientPrivateRoute>
          } />

          {/* ===== ADMIN ===== */}
          <Route path="/admin" element={
            <PrivateRoute requireAdmin>
              <Navigate to="/admin/dashboard" />
            </PrivateRoute>
          } />

          <Route path="/admin/dashboard" element={
            <PrivateRoute requireAdmin>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </PrivateRoute>
          } />

          <Route path="/admin/vehicles" element={
            <PrivateRoute requireAdmin>
              <AdminLayout>
                <Vehicles />
              </AdminLayout>
            </PrivateRoute>
          } />

          <Route path="/admin/reservations" element={
            <PrivateRoute requireAdmin>
              <AdminLayout>
                <Reservations />
              </AdminLayout>
            </PrivateRoute>
          } />

          <Route path="/admin/settings" element={
            <PrivateRoute requireAdmin>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </PrivateRoute>
          } />

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
