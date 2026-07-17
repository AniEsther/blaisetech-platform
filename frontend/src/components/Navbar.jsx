// components/Navbar.jsx — top navigation shown on every page.
// On small screens the link list collapses behind a hamburger button
// instead of wrapping into a messy multi-line row.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, CloseIcon } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/');
  }

  // Close the mobile menu automatically whenever a link is clicked.
  function handleLinkClick() {
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={handleLinkClick}>Blaisetech Global Resources</Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <Link to="/services" onClick={handleLinkClick}>Services</Link>
          <Link to="/shop" onClick={handleLinkClick}>Shop</Link>
          <Link to="/portfolio" onClick={handleLinkClick}>Portfolio</Link>
          <Link to="/about" onClick={handleLinkClick}>About</Link>
          <Link to="/careers" onClick={handleLinkClick}>Careers</Link>
          <Link to="/contact" onClick={handleLinkClick}>Contact</Link>
          <Link to="/emergency" className="emergency-link" onClick={handleLinkClick}>Emergency</Link>

          {!user && <Link to="/login" onClick={handleLinkClick}>Login</Link>}
          {!user && <Link to="/register" className="btn-link" onClick={handleLinkClick}>Sign Up</Link>}

          {user && user.role === 'customer' && <Link to="/dashboard" onClick={handleLinkClick}>My Dashboard</Link>}
          {user && user.role === 'admin' && <Link to="/admin" onClick={handleLinkClick}>Admin Dashboard</Link>}
          {user && user.role === 'technician' && <Link to="/technician" onClick={handleLinkClick}>My Tasks</Link>}
          {user && <button className="link-button" onClick={handleLogout}>Logout</button>}
        </nav>
      </div>
    </header>
  );
}