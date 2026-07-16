// pages/TechnicianDashboard.jsx — a technician sees jobs assigned to them,
// updates status as they work, and submits a report when finished.
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TechnicianDashboard() {
  const [tasks, setTasks] = useState([]);
  const [reportDrafts, setReportDrafts] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => { loadTasks(); }, []);

  function loadTasks() {
    api.get('/tasks/my').then((res) => setTasks(res.data));
  }

  async function setStatus(id, status) {
    await api.patch(`/tasks/${id}`, { status });
    loadTasks();
  }

  async function submitReport(id) {
    setMessage('');
    const report = reportDrafts[id];
    if (!report) { setMessage('Please write a short report before submitting.'); return; }
    try {
      await api.patch(`/tasks/${id}`, { report, status: 'completed' });
      setMessage('Report submitted and task marked as completed.');
      loadTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit report.');
    }
  }

  return (
    <div className="section">
      <h1>My Assigned Tasks</h1>
      <p style={{ color: 'var(--grey)' }}>Jobs assigned to you by the admin. Update the status as you work, and submit a short report once the job is done.</p>

      <div className="card-grid">
        {tasks.map((t) => (
          <div key={t.id} className="card">
            <h3>{t.title}</h3>
            {t.Booking && <p><strong>Related booking:</strong> #{t.Booking.id} — {t.Booking.Service?.name}</p>}
            {t.instructions && <p>{t.instructions}</p>}
            {t.dueDate && <p><strong>Due:</strong> {t.dueDate}</p>}
            <p><span className={`badge ${t.status}`}>{t.status}</span></p>

            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginTop: 10 }}>Update Status</label>
            <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)}>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {t.status !== 'completed' ? (
              <>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginTop: 14 }}>Submit Report</label>
                <textarea placeholder="Describe what was done, parts used, and the outcome..."
                  value={reportDrafts[t.id] || ''}
                  onChange={(e) => setReportDrafts({ ...reportDrafts, [t.id]: e.target.value })}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 6, minHeight: 80, marginTop: 6 }} />
                <button className="btn-primary" style={{ marginTop: 10 }} onClick={() => submitReport(t.id)}>Submit Report &amp; Complete</button>
              </>
            ) : (
              <div style={{ marginTop: 14 }}>
                <strong>Submitted Report:</strong>
                <p>{t.report}</p>
              </div>
            )}
          </div>
        ))}
        {tasks.length === 0 && <p>No tasks assigned to you yet.</p>}
      </div>

      {message && <p className="notice">{message}</p>}
    </div>
  );
}
