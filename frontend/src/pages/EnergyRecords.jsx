import React from 'react';

function EnergyRecords() {
  return (
    <div className="records-page">
      <div className="page-header">
        <h1>Energy Records</h1>
        <p>Monthly energy consumption history and bill records</p>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p>No energy records available.</p>
      </div>
    </div>
  );
}

export default EnergyRecords;
