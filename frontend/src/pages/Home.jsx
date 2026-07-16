// pages/Home.jsx — the landing page, with fuller marketing copy.
import { Link } from 'react-router-dom';
import { BoltIcon, SolarIcon, ToolIcon, ShieldIcon, ClockIcon, BuildingIcon } from '../components/Icons';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <p className="eyebrow">Electrical Engineering &amp; Technology</p>
        <h1>Power You Can Rely On. Service You Can Trust.</h1>
        <p>
          Blaisetech Global Resources delivers safe, standard-compliant electrical
          installation, solar energy systems, maintenance, and rapid-response
          troubleshooting for homes, offices, and industries across Enugu State
          and beyond. From a single faulty socket to a full solar power backup,
          our licensed technicians get it done right the first time.
        </p>
        <div className="hero-actions">
          <Link to="/services" className="btn-primary">Explore Our Services</Link>
          <Link to="/emergency" className="btn-secondary">Request Emergency Service</Link>
        </div>
        <div className="hero-stats">
          <div><strong>10+</strong><span>Years Combined Experience</span></div>
          <div><strong>500+</strong><span>Jobs Completed</span></div>
          <div><strong>24/7</strong><span>Emergency Response</span></div>
          <div><strong>100%</strong><span>Licensed Technicians</span></div>
        </div>
      </section>

      <section className="section">
        <p className="section-label">What We Offer</p>
        <h2>Complete Electrical Solutions, Under One Roof</h2>
        <p className="section-intro">
          Whether you're building from the ground up, switching to solar, or
          dealing with a fault that won't wait, our team brings the same
          standard of professionalism and safety to every job — big or small.
        </p>
        <div className="card-grid">
          <div className="card">
            <div className="icon-circle"><BoltIcon /></div>
            <h3>Electrical Installation</h3>
            <p>Safe, standard-compliant wiring and electrical fittings for new builds, renovations, and expansions — residential, commercial, and industrial.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><SolarIcon /></div>
            <h3>Solar Energy Systems</h3>
            <p>Solar panels, inverters, and battery backup systems designed to cut your power bills and keep the lights on, rain or shine.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ToolIcon /></div>
            <h3>Maintenance &amp; Repairs</h3>
            <p>Routine inspections and fast, accurate fault diagnosis — because small electrical issues don't stay small for long.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ShieldIcon /></div>
            <h3>Safety Consultation</h3>
            <p>Professional advice on load capacity, code compliance, and system design before you spend a single naira on materials.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><ClockIcon /></div>
            <h3>Emergency Response</h3>
            <p>Sparking outlets, sudden power loss, or exposed wiring can't wait. Our rapid-response team is a call away.</p>
          </div>
          <div className="card">
            <div className="icon-circle"><BuildingIcon /></div>
            <h3>Commercial &amp; Industrial</h3>
            <p>From office fit-outs to factory floors, we scale our solutions to match the demands of your business.</p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <p className="section-label">Why Choose Blaisetech</p>
        <h2>Built On Safety, Precision, and Accountability</h2>
        <div className="card-grid">
          <div>
            <h3>Certified &amp; Experienced</h3>
            <p>Every technician we send to your site is trained, vetted, and held to a strict safety standard — no shortcuts, no guesswork.</p>
          </div>
          <div>
            <h3>Transparent Pricing</h3>
            <p>You get a clear quotation before any work begins, so there are no surprise costs when the job is done.</p>
          </div>
          <div>
            <h3>Real Accountability</h3>
            <p>Every booking, quotation, and invoice is tracked on our platform — you can see exactly where your request stands, at any time.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="section-label">Recent Work</p>
        <h2>A Glimpse Into Our Projects</h2>
        <div className="card-grid">
          <PhotoPlaceholder label="Add a photo from a recent installation" /> 
          {/* <img src="/images/about-team.jpg" alt="Our team on site" style={{ width: '100%', borderRadius: 10 }} /> */}
          <PhotoPlaceholder label="Add a photo from a solar project" />
          <PhotoPlaceholder label="Add a photo of your team on-site" />
        </div>
        <p style={{ marginTop: 20 }}>
          <Link to="/portfolio" className="btn-secondary">View Full Portfolio</Link>
        </p>
      </section>

      <Testimonials />
    </div>
  );
}
