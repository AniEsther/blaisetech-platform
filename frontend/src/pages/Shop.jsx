// pages/Shop.jsx — public product catalog with persuasive marketing copy.
// Browsing is open to everyone; ordering happens from the logged-in customer
// dashboard's "Shop Products" tab, which uses this same product data.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldIcon, ClockIcon, ToolIcon, BoltIcon } from '../components/Icons';

export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <section className="hero" style={{ padding: '70px 20px' }}>
        <p className="eyebrow">Shop Genuine Parts</p>
        <h1>Skip the Guesswork. Buy What Your Electrician Would Buy.</h1>
        <p>
          Every cable, switch, panel, and inverter in this shop is the same
          quality our own technicians install on paid jobs — sourced,
          tested, and stocked by people who actually work with this equipment
          every day. No knockoffs, no expired stock, no guessing whether a
          part is rated for what you need it for.
        </p>
        {!user && (
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Create an Account to Order</Link>
            <Link to="/login" className="btn-secondary">Already have an account? Log In</Link>
          </div>
        )}
      </section>

      <section className="section">
        <div className="card-grid">
          <div className="card">
            <div className="icon-circle"><ShieldIcon /></div>
            <h3>Genuine, Tested Stock</h3>
            <p>Every item is checked before it goes on the shelf — no counterfeit switches or underrated cable.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ClockIcon /></div>
            <h3>Fast Local Delivery</h3>
            <p>Order today, and we'll get it to your address with a delivery window that works for you.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ToolIcon /></div>
            <h3>Backed by Real Technicians</h3>
            <p>Not sure what you need? Book a consultation and our team will help you pick the right parts before you order.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><BoltIcon /></div>
            <h3>Straight From the Trade</h3>
            <p>The same inventory we install on customer jobs — priced fairly, no retail markup games.</p>
          </div>
        </div>
      </section>

      <div className="section" style={{ paddingTop: 0 }}>
        {!user && (
          <div className="auth-prompt">
            <p>Log in or create an account to order products online — browsing is open to everyone.</p>
            <div className="auth-actions">
              <Link to="/login" className="btn-primary">Log In</Link>
              <Link to="/register" className="btn-secondary">Create an Account</Link>
            </div>
          </div>
        )}
        <p className="section-label" style={{ marginTop: 30 }}>Available Now</p>
        <h2>Our Current Stock</h2>
        <div className="card-grid" style={{ marginTop: 10 }}>
          {products.map((p) => (
            <div key={p.id} className="card product-card">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="price">₦{Number(p.price).toLocaleString()}</p>
              <p className="stock-tag">{p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}</p>
              {user ? (
                <Link to="/dashboard" className="btn-secondary">Order from Dashboard</Link>
              ) : (
                <Link to="/register" className="btn-secondary">Sign Up to Order</Link>
              )}
            </div>
          ))}
          {products.length === 0 && <p>No products listed yet — check back soon.</p>}
        </div>
      </div>
    </div>
  );
}
