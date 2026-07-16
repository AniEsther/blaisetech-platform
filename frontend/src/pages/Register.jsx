// pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form.fullName, form.email, form.phone, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <h1>Create an Account</h1>
        <p style={{ color: 'var(--grey)', marginTop: -8 }}>Book services, request quotations, and shop products.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>Full Name</label>
          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <label>Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label>Password</label>
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        {error && <p className="notice error">{error}</p>}
        <div className="form-footer">Already have an account? <Link to="/login">Login here</Link></div>
      </div>
    </div>
  );
}
