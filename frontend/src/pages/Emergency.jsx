// pages/Emergency.jsx — priority fault reporting module (login required).
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Emergency() {
  const { user } = useAuth();
  const [form, setForm] = useState({ description: '', location: '', contactPhone: '' });
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <div className="section narrow">
        <h1>Emergency Service Request</h1>
        <div className="auth-prompt">
          <p>Please log in or create an account to submit an emergency request. This lets us verify who to contact and track your request from your dashboard.</p>
          <div className="auth-actions">
            <Link to="/login" className="btn-primary">Log In</Link>
            <Link to="/register" className="btn-secondary">Create an Account</Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/emergency', form);
      setMessage('Your emergency request has been submitted. Our team has been notified and will contact you shortly.');
      setForm({ description: '', location: '', contactPhone: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="section narrow">
      <h1>Emergency Service Request</h1>
      <p>Use this form for urgent electrical faults that need a rapid response.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>Describe the fault</label>
        <textarea required value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label>Your location</label>
        <input required value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })} />

        <label>Phone number to reach you</label>
        <input required value={form.contactPhone}
          onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />

        <button type="submit" className="btn-primary">Submit Emergency Request</button>
      </form>
      {message && <p className="notice">{message}</p>}
    </div>
  );
}
