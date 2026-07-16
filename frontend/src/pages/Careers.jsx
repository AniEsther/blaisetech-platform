// pages/Careers.jsx — recruitment portal: job listing + application form.
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', coverLetter: '' });
  const [cvFile, setCvFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/jobs').then((res) => setJobs(res.data));
  }, []);

  async function handleApply(e) {
    e.preventDefault();
    setMessage('');
    if (!cvFile) { setMessage('Please attach your CV.'); return; }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('cv', cvFile);

    try {
      await api.post(`/jobs/${activeJob.id}/apply`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Application submitted successfully!');
      setForm({ fullName: '', email: '', phone: '', coverLetter: '' });
      setCvFile(null);
      setActiveJob(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit application.');
    }
  }

  return (
    <div className="section">
      <h1>Careers at Blaisetech</h1>
      <div className="card-grid">
        {jobs.map((job) => (
          <div key={job.id} className="card">
            <h3>{job.title}</h3>
            <p>{job.location} • {job.employmentType}</p>
            <p>{job.description}</p>
            {job.requirements && (
              <p style={{ fontSize: '0.88rem', color: 'var(--grey)' }}><strong>Requirements:</strong> {job.requirements}</p>
            )}
            <button className="btn-secondary" onClick={() => setActiveJob(job)}>Apply Now</button>
          </div>
        ))}
        {jobs.length === 0 && <p>No open positions at the moment. Please check back later.</p>}
      </div>

      {activeJob && (
        <div className="modal-overlay" onClick={() => setActiveJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Apply: {activeJob.title}</h2>
            <form onSubmit={handleApply} className="form">
              <label>Full Name</label>
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <label>Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <label>Cover Letter (optional)</label>
              <textarea value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
              <label>Upload CV</label>
              <input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files[0])} />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveJob(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {message && <p className="notice">{message}</p>}
    </div>
  );
}
