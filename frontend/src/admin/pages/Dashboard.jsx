// src/admin/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import VehicleCard from "../components/VehicleCard";
import ScheduleTable from "../components/ScheduleTable";
import FilterSection from "../components/FilterSection";
import InquiryList from "../components/InquiryList";
import { vehicleAPI, reservationAPI } from "../../services/api";
import { mapVehicleFromBackend } from "../../utils/vehicleMapper";
import { mapReservationFromBackend } from "../../utils/reservationMapper";
import "./Dashboard.css";

const Dashboard = () => {
  /* ================= STATE ================= */
  const [statsData, setStatsData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [inquiriesData, setInquiriesData] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      /* ===== VEHICLES ===== */
      const vehiclesRes = await vehicleAPI.getAll();
      const vehiclesMapped = vehiclesRes.data.map(mapVehicleFromBackend);

      console.log("ADMIN DASHBOARD VEHICLES:", vehiclesMapped);

      /* ===== RESERVATIONS ===== */
      const reservationsRes = await reservationAPI.getAll();
      const reservationsMapped = reservationsRes.data.map(
        mapReservationFromBackend
      );

      console.log("ADMIN DASHBOARD RESERVATIONS:", reservationsMapped);

      /* ================= STATS ================= */
      const activeRentals = reservationsMapped.filter(
        (r) => r.status === "active"
      ).length;

      const pendingReturns = reservationsMapped.filter(
        (r) => r.status === "confirmed"
      ).length;

      setStatsData([
        {
          id: 1,
          title: "Active Rentals",
          value: activeRentals,
          icon: "fa-road",
          color: "primary",
        },
        {
          id: 2,
          title: "Available Vehicles",
          value: vehiclesMapped.filter(
            (v) => v.status === "available"
          ).length,
          icon: "fa-car",
          color: "secondary",
        },
        {
          id: 3,
          title: "Pending Returns",
          value: pendingReturns,
          icon: "fa-history",
          color: "dark",
        },
      ]);

      /* ================= VEHICLE CARDS ================= */
     setVehiclesData(
  vehiclesMapped.slice(0, 4).map((v) => ({
    id: v.id,
    name: v.name,
    description: `${v.brand} ${v.model}`,
    price: `$${v.hourlyRate.toFixed(2)} / hour`,
    features: [
      v.type,
      v.transmission || "Auto",
      v.fuelType || "Petrol",
      "5 Seats",
    ],
    image: v.image || "",      // ✅ THIS LINE
    imageColor: "#E2E2E2",
  }))
);


      /* ================= SCHEDULE TABLE ================= */
      setScheduleData(
        vehiclesMapped.slice(0, 4).map((v, index) => ({
          id: index + 1,
          vehicleId: v.plateNumber || "N/A",
          model: v.name,
          weeks: [
            v.status === "rented" ? "rented" : "available",
            "available",
            "available",
            "available",
          ],
        }))
      );

      /* ================= RECENT INQUIRIES ================= */
      setInquiriesData(
        reservationsMapped.slice(0, 5).map((r, index) => ({
          id: index + 1,
          client: r.clientName,
          vehicle: r.vehicleName,
          status: r.status,
          initials:
            r.clientName
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "CL",
        }))
      );
    } catch (err) {
      console.error("DASHBOARD FETCH ERROR:", err);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      <Header />

      {/* IMPORTANT: NO `container` CLASS */}
      <div className="dashboard-content">
        <div className="stats-container">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="dashboard-main-grid">
          <div className="dashboard-left-column">
            {/* AVAILABLE VEHICLES */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Available Vehicles</h2>
                <button className="btn btn-outline">View All</button>
              </div>

              <div className="vehicles-grid">
                {vehiclesData.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </section>

            {/* VEHICLE SCHEDULE */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Vehicle Schedule</h2>
                <button className="btn btn-outline">Full Schedule</button>
              </div>
              <ScheduleTable data={scheduleData} />
            </section>
          </div>

          <div className="dashboard-right-column">
            <FilterSection />

            {/* RECENT INQUIRIES */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Recent Inquiries</h2>
                <button className="btn btn-outline">View All</button>
              </div>
              <InquiryList inquiries={inquiriesData} />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
