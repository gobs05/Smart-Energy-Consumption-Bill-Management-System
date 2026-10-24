import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ViewRecord() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/records/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Record not found.');
        }

        setRecord(data.data);
      } catch (err) {
        setError(err.message || 'Unable to load record details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  // Helper formatters
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'Rs. 0.00';
    return `Rs. ${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="view-record-page">
      <div className="page-header flex-header">
        <div>
          <h1>Energy Record Details</h1>
          <p>Detailed breakdown for {record ? record.month : 'selected record'}</p>
        </div>
        <Link to="/records" className="btn-secondary">
          ← Back to Records
        </Link>
      </div>

      {loading && (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Loading record details...</p>
        </div>
      )}

      {error && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Record Not Found</h2>
          <p>{error}</p>
          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/records" className="btn-primary-inline">
              Back to Records
            </Link>
          </div>
        </div>
      )}

      {record && !loading && !error && (
        <div className="details-card">
          <div className="details-header">
            <div>
              <span className="details-subtitle">Billing Month</span>
              <h2 className="details-title">{record.month}</h2>
            </div>
            <div>
              <span
                className={
                  record.payment_status === 'Paid'
                    ? 'status-badge badge-paid large'
                    : 'status-badge badge-unpaid large'
                }
              >
                {record.payment_status}
              </span>
            </div>
          </div>

          <div className="details-grid">
            <div className="details-item">
              <span className="details-label">Previous Reading</span>
              <span className="details-value">{record.previous_reading}</span>
            </div>

            <div className="details-item">
              <span className="details-label">Current Reading</span>
              <span className="details-value">{record.current_reading}</span>
            </div>

            <div className="details-item highlight-box">
              <span className="details-label">Units Consumed</span>
              <span className="details-value highlight">
                {record.units_consumed} kWh
              </span>
            </div>

            <div className="details-item">
              <span className="details-label">Rate Per Unit</span>
              <span className="details-value">
                {formatCurrency(record.rate_per_unit)}
              </span>
            </div>

            <div className="details-item highlight-box bill-box">
              <span className="details-label">Total Bill Amount</span>
              <span className="details-value total-highlight">
                {formatCurrency(record.total_bill)}
              </span>
            </div>

            <div className="details-item">
              <span className="details-label">Due Date</span>
              <span className="details-value">{formatDate(record.due_date)}</span>
            </div>
          </div>

          <div className="details-actions">
            <Link to="/records" className="btn-secondary">
              ← Back to Records
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRecord;
