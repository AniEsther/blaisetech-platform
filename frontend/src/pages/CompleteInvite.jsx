// pages/CompleteInvite.jsx — a technician invited by the admin lands here
// (via the link the admin shares) to create their own password and fill in
// their profile details, rather than the admin setting a password for them.
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import PasswordInput from '../components/PasswordInput';

export default function CompleteInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [invitee, setInvitee] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/auth/invite/${token}`)
      .then((res) => setInvitee(res.data))
      .catch((err) => setTokenError(err.response?.data?.message || 'This invite link is invalid or has expired.'))
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      const res = await api.post('/auth/complete-invite', { token, password, phone, homeAddress, specialization });
      localStorage.setItem('token', res.data.token);
      navigate('/technician');
      window.location.reload(); // ensures AuthContext picks up the new session cleanly
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete account setup.');
    }
  }

  if (checking) return <div className="section narrow"><p>Checking your invite link...</p></div>;

  if (tokenError) {
    return (
      <div className="section narrow">
        <h1>Invite Link Issue</h1>
        <p className="notice error">{tokenError}</p>
        <p>Please contact the admin for a new invite link.</p>
      </div>
    );
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h1>Welcome, {invitee.fullName}</h1>
        <p style={{ color: 'var(--grey)', marginTop: -8 }}>
          You've been added as a technician at Blaisetech Global Resources. Set up your password and a few details to get started.
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label>Create Password</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          <label>Confirm Password</label>
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <label>Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0803 000 0000" />
          <label>Home Address</label>
          <input value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} placeholder="Street, city, state" />
          <label>Area of Specialization (optional)</label>
          <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Solar Installation, Industrial Wiring" />
          <button type="submit" className="btn-primary">Complete Setup &amp; Log In</button>
        </form>
        {error && <p className="notice error">{error}</p>}
        <div className="form-footer">Already set up your account? <Link to="/login">Log in</Link></div>
      </div>
    </div>
  );
}
