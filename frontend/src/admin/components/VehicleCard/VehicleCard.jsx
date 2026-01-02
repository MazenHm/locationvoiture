import React from "react";
import "./VehicleCard.css";

const VehicleCard = ({ vehicle }) => {
  const {
    name,
    description,
    price,
    features,
    imageColor,
    image,
    imageUrl,
  } = vehicle;

  const imageSrc = image || imageUrl;

  return (
    <div className="vehicle-card">
      {/* IMAGE */}
      <div
        className="vehicle-image"
        style={{ backgroundColor: imageColor || "#E2E2E2" }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <i
            className="fas fa-car"
            style={{ fontSize: "60px", color: "#999" }}
          ></i>
        )}
      </div>

      {/* CONTENT */}
      <div className="vehicle-content">
        <div className="vehicle-header">
          <h3 className="vehicle-name">{name}</h3>
          <p className="vehicle-description">{description}</p>
        </div>

        <div className="vehicle-features">
          {features.map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>

        <div className="vehicle-footer">
          <div className="vehicle-price">{price}</div>
          <button className="btn btn-primary rent-button">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
