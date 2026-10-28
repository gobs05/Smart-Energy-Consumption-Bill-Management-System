import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [summary, setSummary] = useState({
    totalUsage: 0,
    latestBill: 0,
    unpaidBills: 0,
    totalRecords: 0,
    recentRecords: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/records/summary');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load dashboard data.');
      }

      setSummary(
        result.data || {
          totalUsage: 0,
          latestBill: 0,
          unpaidBills: 0,
          totalRecords: 0,
          recentRecords: [],
        }
      );
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'Rs. 0.00';
    return `Rs. ${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="dashboard-page">
      <div className="page-header flex-header">
        <div>
          <h1>Smart Energy Consumption & Bill Management System</h1>
          <p>Real-time electricity consumption and billing dashboard</p>
        </div>
        <Link to="/add-record" className="btn-primary-inline">
          + Add New Record
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error} — Ensure the backend server is running.
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-title">Total Usage</div>
          <div className="card-value">
            {loading ? '...' : `${summary.totalUsage} kWh`}
          </div>
          <div className="card-description">Total energy consumed across all records</div>
        </div>

        <div className="card">
          <div className="card-title">Latest Bill</div>
          <div className="card-value">
            {loading ? '...' : formatCurrency(summary.latestBill)}
          </div>
          <div className="card-description">Most recent electricity bill amount</div>
        </div>

        <div className="card">
          <div className="card-title">Unpaid Bills</div>
          <div className="card-value highlight-unpaid">
            {loading ? '...' : summary.unpaidBills}
          </div>
          <div className="card-description">Pending electricity bills</div>
        </div>
      </div>

      {/* Recent Records Section */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Records</h2>
          {summary.recentRecords && summary.recentRecords.length > 0 && (
            <Link to="/records" className="btn-link">
              View All Records →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <p>Loading dashboard records...</p>
          </div>
        ) : summary.recentRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No energy records available yet.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/add-record" className="btn-primary-inline">
                Add Record
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Units Consumed</th>
                  <th>Total Bill</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentRecords.map((record) => (
                  <tr key={record._id || record.id}>
                    <td className="font-semibold">{record.month}</td>
                    <td>
                      <span className="badge-units">{record.units_consumed} kWh</span>
                    </td>
                    <td className="font-bold highlight-bill">
                      {formatCurrency(record.total_bill)}
                    </td>
                    <td>
                      <span
                        className={
                          record.payment_status === 'Paid'
                            ? 'status-badge badge-paid'
                            : 'status-badge badge-unpaid'
                        }
                      >
                        {record.payment_status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/records/${record._id || record.id}`}
                        className="btn-action btn-view"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
