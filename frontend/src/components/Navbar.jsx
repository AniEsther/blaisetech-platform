// components/Navbar.jsx — top navigation shown on every page.
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Blaisetech Global Resources</Link>
        <nav className="nav-links">
          <Link to="/services">Services</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/about">About</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/emergency" className="emergency-link">Emergency</Link>

          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register" className="btn-link">Sign Up</Link>}

          {user && user.role === 'customer' && <Link to="/dashboard">My Dashboard</Link>}
          {user && user.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
          {user && user.role === 'technician' && <Link to="/technician">My Tasks</Link>}
          {user && <button className="link-button" onClick={handleLogout}>Logout</button>}
        </nav>
      </div>
    </header>
  );
}
