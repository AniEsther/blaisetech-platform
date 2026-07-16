// pages/ResetPassword.jsx — customer sets a new password using the emailed token.
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.');
    }
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <h1>Reset Your Password</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>New Password</label>
          <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <label>Confirm New Password</label>
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit" className="btn-primary">Reset Password</button>
        </form>
        {message && <p className="notice">{message}</p>}
        {error && <p className="notice error">{error}</p>}
        <div className="form-footer"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );
}
