import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddRecord() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    month: '',
    previous_reading: '',
    current_reading: '',
    rate_per_unit: '',
    due_date: '',
    payment_status: 'Unpaid',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-calculated values for live feedback
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
    // Clear alerts on change
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Basic frontend check for current >= previous
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

    setLoading(true);

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
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
        throw new Error(data.message || 'Failed to save record.');
      }

      setSuccessMessage(
        '✅ Energy record saved successfully! Redirecting to Energy Records...'
      );

      // Redirect user to records page after 1.5 seconds
      setTimeout(() => {
        navigate('/records');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-record-page">
      <div className="page-header">
        <h1>Add Record</h1>
        <p>Enter electricity meter readings and bill details below</p>
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

          {/* Automatic Calculation Preview Box */}
          <div className="calculation-preview">
            <div className="calc-header">
              ⚡ Automatic Calculations (Computed on submission)
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
                  {totalBill !== null ? `₹${totalBill.toFixed(2)}` : '—'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Saving Record...' : 'Add Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRecord;

