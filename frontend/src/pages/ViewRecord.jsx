import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ViewRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete record.');
      }

      // Redirect to Energy Records
      navigate('/records');
    } catch (err) {
      alert(err.message || 'Failed to delete record.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {record && (
            <Link to={`/records/edit/${id}`} className="btn-secondary">
              ✏️ Edit Record
            </Link>
          )}
          <Link to="/records" className="btn-secondary">
            ← Back to Records
          </Link>
        </div>
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
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={`/records/edit/${id}`} className="btn-primary-inline">
                Edit Record
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && record && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the energy record for{' '}
              <strong>{record.month}</strong>?
            </p>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRecord;

