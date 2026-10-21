import React from 'react';

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Smart Energy Consumption & Bill Management System</h1>
        <p>Overview of energy consumption and billing summary</p>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card-title">Total Usage</div>
          <div className="card-value">0 kWh</div>
          <div className="card-description">Overall energy consumed</div>
        </div>

        <div className="card">
          <div className="card-title">Latest Bill</div>
          <div className="card-value">₹0.00</div>
          <div className="card-description">Most recent monthly bill</div>
        </div>

        <div className="card">
          <div className="card-title">Unpaid Bills</div>
          <div className="card-value">0</div>
          <div className="card-description">Pending bill settlements</div>
        </div>
      </div>

      <div className="section-card">
        <h2>Recent Records</h2>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No recent energy records found.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
