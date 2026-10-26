import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function EditRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    month: '',
    previous_reading: '',
    current_reading: '',
    rate_per_unit: '',
    due_date: '',
    payment_status: 'Unpaid',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch existing record to pre-fill the form
  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch(`/api/records/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Record not found.');
        }

        const rec = data.data;
        // Format due_date to YYYY-MM-DD for HTML date input
        const formattedDate = rec.due_date
          ? new Date(rec.due_date).toISOString().split('T')[0]
          : '';

        setFormData({
          month: rec.month || '',
          previous_reading: rec.previous_reading !== undefined ? rec.previous_reading : '',
          current_reading: rec.current_reading !== undefined ? rec.current_reading : '',
          rate_per_unit: rec.rate_per_unit !== undefined ? rec.rate_per_unit : '',
          due_date: formattedDate,
          payment_status: rec.payment_status || 'Unpaid',
        });
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load record for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  // Live automatic recalculation
  const prevNum = parseFloat(formData.previous_reading);
  const currNum = parseFloat(formData.current_reading);
  const rateNum = parseFloat(formData.rate_per_unit);

  const hasValidReadings =
    !isNaN(prevNum) && !isNaN(currNum) && prevNum >= 0 && currNum >= prevNum;
  const unitsConsumed = hasValidReadings ? currNum - prevNum : null;

  const hasValidRate = !isNaN(rateNum) && rateNum > 0;
  const totalBill =
    unitsConsumed !== null && hasValidRate ? unitsConsumed * rateNum : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation check
    if (currNum < prevNum) {
      setErrorMessage(
        'Current Meter Reading must be greater than or equal to Previous Meter Reading.'
      );
      return;
    }

    if (rateNum <= 0) {
      setErrorMessage('Rate Per Unit must be greater than 0.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: formData.month,
          previous_reading: prevNum,
          current_reading: currNum,
          rate_per_unit: rateNum,
          due_date: formData.due_date,
          payment_status: formData.payment_status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update record.');
      }

      setSuccessMessage('✅ Energy record updated successfully! Redirecting...');

      // Redirect back to Energy Records list after 1.2s
      setTimeout(() => {
        navigate('/records');
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong while updating.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-record-page">
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Loading record for editing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-record-page">
      <div className="page-header flex-header">
        <div>
          <h1>Edit Energy Record</h1>
          <p>Update electricity readings, tariff, or payment status</p>
        </div>
        <Link to="/records" className="btn-secondary">
          ← Cancel & Back
        </Link>
      </div>

      <div className="form-card">
        {errorMessage && (
          <div className="alert alert-error" role="alert">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="month">Month</label>
            <input
              type="text"
              id="month"
              name="month"
              placeholder="e.g. October 2026"
              value={formData.month}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="previous_reading">Previous Meter Reading</label>
              <input
                type="number"
                id="previous_reading"
                name="previous_reading"
                min="0"
                step="any"
                placeholder="e.g. 1000"
                value={formData.previous_reading}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="current_reading">Current Meter Reading</label>
              <input
                type="number"
                id="current_reading"
                name="current_reading"
                min="0"
                step="any"
                placeholder="e.g. 1150"
                value={formData.current_reading}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rate_per_unit">Rate Per Unit</label>
              <input
                type="number"
                id="rate_per_unit"
                name="rate_per_unit"
                min="0.01"
                step="any"
                placeholder="e.g. 25"
                value={formData.rate_per_unit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="payment_status">Payment Status</label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              required
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Automatic Recalculation Preview Box */}
          <div className="calculation-preview">
            <div className="calc-header">
              ⚡ Recalculated Values (Updated automatically)
            </div>
            <div className="calc-details">
              <div className="calc-item">
                <span className="calc-label">Units Consumed:</span>
                <span className="calc-value">
                  {unitsConsumed !== null ? `${unitsConsumed} kWh` : '—'}
                </span>
              </div>
              <div className="calc-item">
                <span className="calc-label">Total Bill:</span>
                <span className="calc-value highlight">
                  {totalBill !== null
                    ? `Rs. ${totalBill.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions-row">
            <button
              type="submit"
              className="btn-submit"
              disabled={saving}
            >
              {saving ? 'Updating Record...' : 'Save Changes'}
            </button>
            <Link to="/records" className="btn-secondary" style={{ textAlign: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecord;
