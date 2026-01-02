import React from 'react';
import './ScheduleTable.css';

const ScheduleTable = ({ data }) => {
  const getWeekStatusClass = (status) => {
    return status === 'rented' ? 'week-rented' : 'week-available';
  };
  
  const renderWeekCells = (weeks) => {
    return weeks.map((status, index) => (
      <td key={index}>
        <div className={`week-cell ${getWeekStatusClass(status)}`}></div>
      </td>
    ));
  };
  
  return (
    <div className="schedule-table-container">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Vehicle List</th>
            <th>W1</th>
            <th>W2</th>
            <th>W3</th>
            <th>W4</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td className="vehicle-info-cell">
                <div className="vehicle-id">{item.vehicleId}</div>
                <div className="vehicle-model">{item.model}</div>
              </td>
              {renderWeekCells(item.weeks)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;