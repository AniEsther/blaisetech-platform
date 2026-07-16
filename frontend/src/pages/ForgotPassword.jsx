// pages/ForgotPassword.jsx — customer requests a password reset link.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setDevLink('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.devResetToken) {
        setDevLink(`/reset-password/${res.data.devResetToken}`);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p style={{ color: 'var(--grey)', marginTop: -8 }}>Enter your account email and we'll generate a reset link.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn-primary">Send Reset Link</button>
        </form>
        {message && <p className="notice">{message}</p>}
        {devLink && (
          <p className="notice" style={{ background: '#f4e3c1', borderLeftColor: '#8c1a33' }}>
            <strong>Developer note:</strong> no email service is connected yet, so here's your
            test reset link — <Link to={devLink}>{devLink}</Link>
          </p>
        )}
        <div className="form-footer"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );
}
