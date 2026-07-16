// pages/Portfolio.jsx — showcases completed projects, with fuller framing copy.
import { useEffect, useState } from 'react';
import api from '../api/axios';
import PhotoPlaceholder from '../components/PhotoPlaceholder';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data));
  }, []);

  return (
    <div>
      <section className="hero" style={{ padding: '60px 20px' }}>
        <p className="eyebrow">Our Work</p>
        <h1>Projects We're Proud Of</h1>
        <p>A look at the installations, upgrades, and solar systems our team has delivered for clients across the region.</p>
      </section>

      <div className="section">
        <div className="card-grid">
          {projects.map((p) => (
            <div key={p.id} className="card product-card">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.title} />
              ) : (
                <PhotoPlaceholder label={`Add a photo for "${p.title}"`} height={140} />
              )}
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--grey)', marginTop: 10 }}>
                {p.clientName && <span><strong>Client:</strong> {p.clientName}</span>}
                {p.completedDate && <span>{p.completedDate}</span>}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p>No projects to show yet — our portfolio is growing. Check back soon.</p>}
        </div>
      </div>
    </div>
  );
}
