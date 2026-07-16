// pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'technician') navigate('/technician');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p style={{ color: 'var(--grey)', marginTop: -8 }}>Log in to manage your bookings, orders, and invoices.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p style={{ marginTop: 12, fontSize: '0.88rem' }}><Link to="/forgot-password">Forgot your password?</Link></p>
        {error && <p className="notice error">{error}</p>}
        <div className="form-footer">Don't have an account? <Link to="/register">Sign up here</Link></div>
      </div>
    </div>
  );
}
