import React from 'react';
import './InquiryList.css';

const InquiryList = ({ inquiries }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
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
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  return (
    <div className="inquiry-list">
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className="inquiry-item">
          <div className="inquiry-avatar">
            {inquiry.initials}
          </div>
          <div className="inquiry-info">
            <h4 className="inquiry-client">{inquiry.client}</h4>
            <p className="inquiry-vehicle">{inquiry.vehicle}</p>
          </div>
          <div className={`inquiry-status ${getStatusClass(inquiry.status)}`}>
            {getStatusText(inquiry.status)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InquiryList;