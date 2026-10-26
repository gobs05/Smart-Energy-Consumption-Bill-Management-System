import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function EnergyRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');

  // Delete modal state
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch records from backend
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/records');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load records.');
      }

      setRecords(data.data || []);
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Format helpers
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
    return date.toISOString().split('T')[0];
  };

  // Delete confirmation handler
  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleteLoading(true);

    try {
      const id = recordToDelete._id || recordToDelete.id;
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete record.');
      }

      // Remove from local state
      setRecords((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setDeleteSuccessMessage('Energy record deleted successfully.');
      setRecordToDelete(null);

      // Auto-clear success message after 3.5 seconds
      setTimeout(() => {
        setDeleteSuccessMessage('');
      }, 3500);
    } catch (err) {
      alert(err.message || 'Error deleting record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Combine Search, Filter, and Sort on records
  const filteredAndSortedRecords = records
    .filter((record) => {
      // 1. Search by Month (case-insensitive)
      const matchesSearch =
        searchTerm.trim() === '' ||
        (record.month &&
          record.month.toLowerCase().includes(searchTerm.trim().toLowerCase()));

      // 2. Filter by Payment Status
      const matchesStatus =
        statusFilter === 'All' || record.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 3. Sorting logic
      let comparison = 0;

      if (sortBy === 'month') {
        comparison = (a.month || '').localeCompare(b.month || '');
      } else if (sortBy === 'total_bill') {
        comparison = (a.total_bill || 0) - (b.total_bill || 0);
      } else if (sortBy === 'due_date') {
        const dateA = new Date(a.due_date || 0).getTime();
        const dateB = new Date(b.due_date || 0).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSortBy('due_date');
    setSortOrder('desc');
  };

  return (
    <div className="records-page">
      <div className="page-header flex-header">
        <div>
          <h1>Energy Records</h1>
          <p>Monthly electricity consumption history and bills</p>
        </div>
        <Link to="/add-record" className="btn-primary-inline">
          + Add Record
        </Link>
      </div>

      {/* Success Banner after Deletion */}
      {deleteSuccessMessage && (
        <div className="alert alert-success" role="alert">
          ✅ {deleteSuccessMessage}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Loading energy records...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-error">
          ⚠️ {error} — Make sure the backend server is running.
        </div>
      )}

      {/* Empty Database State */}
      {!loading && !error && records.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No energy records available.</h2>
          <p>Get started by recording your first electricity bill and meter readings.</p>
          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/add-record" className="btn-primary-inline">
              Add Record
            </Link>
          </div>
        </div>
      )}

      {/* Table & Controls when records exist */}
      {!loading && !error && records.length > 0 && (
        <div className="records-container">
          {/* Controls: Search, Filter, Sort Toolbar */}
          <div className="toolbar-card">
            <div className="toolbar-grid">
              {/* Search by Month */}
              <div className="toolbar-item search-item">
                <label htmlFor="search-input">Search Month:</label>
                <input
                  id="search-input"
                  type="text"
                  placeholder="e.g. October 2026..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="toolbar-input"
                />
              </div>

              {/* Filter by Payment Status */}
              <div className="toolbar-item">
                <label htmlFor="status-filter">Status:</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="toolbar-select"
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              {/* Sort By Field */}
              <div className="toolbar-item">
                <label htmlFor="sort-by">Sort By:</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="toolbar-select"
                >
                  <option value="due_date">Due Date</option>
                  <option value="month">Month</option>
                  <option value="total_bill">Total Bill</option>
                </select>
              </div>

              {/* Sort Direction */}
              <div className="toolbar-item">
                <label htmlFor="sort-order">Order:</label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="toolbar-select"
                >
                  <option value="desc">Descending (High to Low / Newest)</option>
                  <option value="asc">Ascending (Low to High / Oldest)</option>
                </select>
              </div>
            </div>

            {/* Active filter summary & reset */}
            {(searchTerm || statusFilter !== 'All' || sortBy !== 'due_date' || sortOrder !== 'desc') && (
              <div className="toolbar-active">
                <span>
                  Showing {filteredAndSortedRecords.length} of {records.length} records
                </span>
                <button type="button" onClick={resetFilters} className="btn-link">
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Table or Filter Empty State */}
          {filteredAndSortedRecords.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No matching records found.</h3>
              <p>Try adjusting your search month or payment status filter.</p>
              <div style={{ marginTop: '1rem' }}>
                <button type="button" onClick={resetFilters} className="btn-secondary">
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Previous Reading</th>
                    <th>Current Reading</th>
                    <th>Units Consumed</th>
                    <th>Rate Per Unit</th>
                    <th>Total Bill</th>
                    <th>Payment Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRecords.map((record) => (
                    <tr key={record._id || record.id}>
                      <td className="font-semibold">{record.month}</td>
                      <td>{record.previous_reading}</td>
                      <td>{record.current_reading}</td>
                      <td>
                        <span className="badge-units">{record.units_consumed} kWh</span>
                      </td>
                      <td>{formatCurrency(record.rate_per_unit)}</td>
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
                      <td>{formatDate(record.due_date)}</td>
                      <td>
                        <div className="action-buttons-cell">
                          <Link
                            to={`/records/${record._id || record.id}`}
                            className="btn-action btn-view"
                            title="View Record"
                          >
                            View
                          </Link>
                          <Link
                            to={`/records/edit/${record._id || record.id}`}
                            className="btn-action btn-edit"
                            title="Edit Record"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(record)}
                            className="btn-action btn-delete"
                            title="Delete Record"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the energy record for{' '}
              <strong>{recordToDelete.month}</strong>?
            </p>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setRecordToDelete(null)}
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

export default EnergyRecords;

