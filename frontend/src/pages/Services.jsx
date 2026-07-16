// pages/Services.jsx — public list of services pulled from the database, with richer copy.
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BoltIcon, SolarIcon, ToolIcon, ShieldIcon, ClockIcon, BuildingIcon } from '../components/Icons';

const ICONS_BY_CATEGORY = {
  Installation: BoltIcon,
  Solar: SolarIcon,
  Maintenance: ToolIcon,
  Repair: ClockIcon,
  Consultation: ShieldIcon,
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero" style={{ padding: '60px 20px' }}>
        <p className="eyebrow">What We Do</p>
        <h1>Our Services</h1>
        <p>
          From first-fix wiring to full solar power backup, every service we
          offer is carried out by trained technicians, backed by a clear
          quotation and a workmanship guarantee.
        </p>
      </section>

      <div className="section">
        {loading && <p>Loading services...</p>}
        <div className="card-grid">
          {services.map((s) => {
            const Icon = ICONS_BY_CATEGORY[s.category] || BuildingIcon;
            return (
              <div key={s.id} className="card">
                <div className="icon-circle"><Icon /></div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                {s.basePrice && <p className="price">From ₦{Number(s.basePrice).toLocaleString()}</p>}
              </div>
            );
          })}
          {!loading && services.length === 0 && <p>No services listed yet — check back soon.</p>}
        </div>
      </div>

      <section className="section alt">
        <p className="section-label">How It Works</p>
        <h2>Booking a Service Is Simple</h2>
        <div className="card-grid">
          <div><h3>1. Book Online</h3><p>Choose a service, describe the fault or job, and pick a preferred date and time.</p></div>
          <div><h3>2. Get a Quotation</h3><p>We review your request and send a clear cost estimate before any work begins.</p></div>
          <div><h3>3. We Get to Work</h3><p>Our technician arrives on schedule and completes the job to code.</p></div>
          <div><h3>4. Track &amp; Pay</h3><p>Follow progress and download your invoice from your dashboard, anytime.</p></div>
        </div>
      </section>
    </div>
  );
}
