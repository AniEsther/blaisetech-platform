// pages/About.jsx — richer company story and values.
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import { ShieldIcon, ClockIcon, ToolIcon } from '../components/Icons';

export default function About() {
  return (
    <div>
      <section className="hero" style={{ padding: '60px 20px' }}>
        <p className="eyebrow">About Us</p>
        <h1>About Blaisetech Global Resources</h1>
        <p>An electrical engineering and technology company built on precision, safety, and dependable service.</p>
      </section>

      <div className="section">
        <div className="card-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          <div>
            <h2>Who We Are</h2>
            <p>
              Blaisetech Global Resources is an electrical engineering and technology
              company involved in the supply, installation, maintenance, and servicing
              of electrical systems and electronic equipment. We provide professional
              electrical solutions for residential, commercial, and industrial clients,
              including electrical installations, solar energy systems, electrical
              maintenance, troubleshooting, and consultation services.
            </p>
            <p>
              Based in Amechi, Enugu State, we've grown by treating every job — from a
              single-room rewiring to a full commercial solar installation — with the
              same level of care and technical discipline. Our approach combines
              hands-on field expertise with a digital platform that keeps customers
              informed at every step, from first request to final invoice.
            </p>
          </div>        
          <img src="public\images\OIP.webp" alt="Our team on site" style={{ width: '100%', borderRadius: 10 }} />
        </div>
      </div>

      <section className="section alt">
        <p className="section-label">Our Values</p>
        <h2>What Guides Our Work</h2>
        <div className="card-grid">
          <div className="card">
            <div className="icon-circle"><ShieldIcon /></div>
            <h3>Safety First</h3>
            <p>Every installation follows established electrical safety codes — no exceptions, no shortcuts.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ClockIcon /></div>
            <h3>Reliability</h3>
            <p>We show up when we say we will, and we keep you updated if anything changes.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ToolIcon /></div>
            <h3>Craftsmanship</h3>
            <p>Clean wiring, tested connections, and work that holds up long after we've left the site.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
