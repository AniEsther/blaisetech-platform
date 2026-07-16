// pages/Contact.jsx — contact info plus a message/review drop-box.
import { useState } from 'react';
import api from '../api/axios';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: 0 });
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    try {
      await api.post('/messages', { ...form, rating: form.rating || undefined });
      setStatus('Thank you — your message has been received.');
      setForm({ name: '', email: '', message: '', rating: 0 });
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not send your message. Please try again.');
    }
  }

  return (
    <div>
      <section className="hero" style={{ padding: '60px 20px' }}>
        <p className="eyebrow">Get In Touch</p>
        <h1>Contact Blaisetech Global Resources</h1>
        <p>Have a question, a job to quote, or an electrical fault that needs attention? Reach out — we respond quickly.</p>
      </section>

      <div className="section">
        <div className="card-grid">
          <div className="card">
            <h3>Visit Us</h3>
            <p>100 Amechi road,<br />Topland, Amechi,<br />Enugu State, Nigeria.</p>
          </div>
          <div className="card">
            <h3>Call or Email</h3>
            <p>Phone: 0902-192-4553<br />Email: blaisetechglobalresources@gmail.com</p>
          </div>
          <div className="card">
            <h3>Business Hours</h3>
            <p>Monday – Saturday: 8:00 AM – 6:00 PM<br />Emergency service: 24/7</p>
          </div>
        </div>
      </div>

      <section className="section alt">
        <p className="section-label">We'd Love to Hear From You</p>
        <h2>Leave a Message or a Review</h2>
        <p className="section-intro">
          Got a question, feedback on a job we did, or just want to say hello?
          Drop us a note below — you don't need an account.
        </p>
        <div className="panel-card" style={{ maxWidth: 560 }}>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row two-col">
              <div>
                <label>Your Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label>Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <label>Rate Us (optional)</label>
            <div style={{ display: 'flex', gap: 6, fontSize: '1.6rem', cursor: 'pointer', color: 'var(--primary)' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} onClick={() => setForm({ ...form, rating: form.rating === n ? 0 : n })}>
                  {n <= form.rating ? '★' : '☆'}
                </span>
              ))}
            </div>

            <label>Your Message</label>
            <textarea required placeholder="Tell us what's on your mind..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

            <button type="submit" className="btn-primary">Send Message</button>
          </form>
          {status && <p className="notice">{status}</p>}
        </div>
      </section>
    </div>
  );
}
