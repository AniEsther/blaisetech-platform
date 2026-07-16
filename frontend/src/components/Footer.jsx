// components/Footer.jsx — redesigned multi-column footer with an accent bar
// and a social row.
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-accent" />
      <div className="footer-inner">
        <div>
          <span className="footer-brand">Blaisetech Global Resources</span>
          <p>
            Electrical installation, solar energy systems, maintenance, and
            emergency electrical services for homes, offices, and industries
            across Enugu State and beyond.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="X / Twitter">X</a>
            <a href="#" aria-label="WhatsApp">W</a>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul className="footer-links">
            <li><Link to="/emergency">Emergency Service</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">My Account</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4>Get In Touch</h4>
          <div className="footer-contact-item"><span className="dot">●</span><span>100 Amechi road, Topland, Amechi, Enugu State, Nigeria</span></div>
          <div className="footer-contact-item"><span className="dot">●</span><span>www.blaisetechglobalresources.com</span></div>
          <div className="footer-contact-item"><span className="dot">●</span><span>0902-192-4553</span></div>
          <div className="footer-contact-item"><span className="dot">●</span><span>Mon – Sat: 8am – 6pm · Emergency: 24/7</span></div>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Blaisetech Global Resources. All rights reserved.
      </div>
    </footer>
  );
}
