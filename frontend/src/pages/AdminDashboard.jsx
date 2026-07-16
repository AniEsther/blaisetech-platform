// pages/AdminDashboard.jsx — admin's control center for every module of the platform.
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { DocumentIcon, ReceiptIcon, ClipboardIcon, TruckIcon } from '../components/Icons';

export default function AdminDashboard() {
  const [tab, setTab] = useState('summary');
  const [message, setMessage] = useState('');

  // --- data ---
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);

  // --- forms ---
  const [newService, setNewService] = useState({ name: '', description: '', basePrice: '', category: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceForm, setEditServiceForm] = useState({});

  const [newJob, setNewJob] = useState({ title: '', description: '', requirements: '', location: '', employmentType: 'Full-time' });
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editJobForm, setEditJobForm] = useState({});

  const [newTechnician, setNewTechnician] = useState({ fullName: '', email: '', phone: '' });
  const [inviteLink, setInviteLink] = useState('');
  const [editingTechnicianId, setEditingTechnicianId] = useState(null);
  const [editTechnicianForm, setEditTechnicianForm] = useState({});
  const [newTask, setNewTask] = useState({ technicianId: '', title: '', instructions: '', dueDate: '', bookingId: '' });

  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stockQuantity: '', category: '' });
  const [productImage, setProductImage] = useState(null);

  const [newProject, setNewProject] = useState({ title: '', description: '', clientName: '', completedDate: '' });
  const [projectImage, setProjectImage] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState({});
  const [editProjectImage, setEditProjectImage] = useState(null);

  const [quoteDocs, setQuoteDocs] = useState({}); // { quotationId: File }

  useEffect(() => { loadAll(); }, []);

  function loadAll() {
    api.get('/admin/summary').then((res) => setSummary(res.data));
    api.get('/bookings').then((res) => setBookings(res.data));
    api.get('/quotations').then((res) => setQuotations(res.data));
    api.get('/invoices').then((res) => setInvoices(res.data));
    api.get('/emergency').then((res) => setEmergencies(res.data));
    api.get('/services').then((res) => setServices(res.data));
    api.get('/jobs/all').then((res) => setJobs(res.data));
    api.get('/admin/technicians').then((res) => setTechnicians(res.data));
    api.get('/tasks').then((res) => setTasks(res.data));
    api.get('/products').then((res) => setProducts(res.data));
    api.get('/orders').then((res) => setOrders(res.data));
    api.get('/projects').then((res) => setProjects(res.data));
    api.get('/messages').then((res) => setMessages(res.data));
  }

  // ---------- Bookings ----------
  async function setBookingStatus(id, status) {
    await api.patch(`/bookings/${id}/status`, { status });
    loadAll();
  }

  // ---------- Quotations ----------
  // A single action: set the amount (and optionally attach a document), and
  // it's immediately sent to the customer as an approved quotation — which
  // automatically creates their invoice. No separate approve/reject step.
  async function sendQuotation(q) {
    setMessage('');
    const amountValue = document.getElementById(`amount-${q.id}`).value;
    if (!amountValue || Number(amountValue) <= 0) {
      setMessage('Please enter a valid amount before sending.');
      return;
    }
    const data = new FormData();
    data.append('amount', amountValue);
    data.append('status', 'approved');
    const file = quoteDocs[q.id];
    if (file) data.append('document', file);
    try {
      await api.patch(`/quotations/${q.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Quotation sent — it now appears in the customer\'s dashboard as an invoice awaiting payment.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not send quotation.');
    }
  }
  async function rejectQuotation(q) {
    if (!window.confirm('Reject this request? The customer will be notified this job cannot be quoted.')) return;
    setMessage('');
    try {
      await api.patch(`/quotations/${q.id}`, { status: 'rejected' });
      setMessage('Quotation rejected.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update quotation.');
    }
  }

  // ---------- Payments / Invoices ----------
  async function confirmPayment(inv) {
    await api.patch(`/invoices/${inv.id}`, { status: 'paid', amountPaid: inv.totalAmount });
    setMessage('Payment confirmed for this invoice.');
    loadAll();
  }

  // ---------- Emergency ----------
  async function setEmergencyStatus(id, status) {
    await api.patch(`/emergency/${id}/status`, { status });
    loadAll();
  }

  // ---------- Services ----------
  async function addService(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/services', newService);
      setNewService({ name: '', description: '', basePrice: '', category: '' });
      setMessage('Service added.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add service.');
    }
  }
  function startEditService(service) {
    setEditingServiceId(service.id);
    setEditServiceForm({ name: service.name, description: service.description || '', basePrice: service.basePrice || '', category: service.category || '' });
  }
  async function saveServiceEdit(id) {
    setMessage('');
    try {
      await api.put(`/services/${id}`, editServiceForm);
      setEditingServiceId(null);
      setMessage('Service updated — the new price is now live on the site.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update service.');
    }
  }
  async function deleteService(id) {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    await api.delete(`/services/${id}`);
    loadAll();
  }

  // ---------- Careers ----------
  async function addJob(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/jobs', newJob);
      setNewJob({ title: '', description: '', requirements: '', location: '', employmentType: 'Full-time' });
      setMessage('Job listing posted.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not post job.');
    }
  }
  async function toggleJobOpen(job) {
    await api.patch(`/jobs/${job.id}`, { isOpen: !job.isOpen });
    loadAll();
  }
  function startEditJob(job) {
    setEditingJobId(job.id);
    setEditJobForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      location: job.location || '',
      employmentType: job.employmentType || 'Full-time',
    });
  }
  async function saveJobEdit(id) {
    setMessage('');
    try {
      await api.patch(`/jobs/${id}`, editJobForm);
      setEditingJobId(null);
      setMessage('Job listing updated.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update job.');
    }
  }
  async function viewApplications(jobId) {
    if (expandedJobId === jobId) { setExpandedJobId(null); return; }
    const res = await api.get(`/jobs/${jobId}/applications`);
    setApplications((prev) => ({ ...prev, [jobId]: res.data }));
    setExpandedJobId(jobId);
  }
  async function updateApplicationStatus(jobId, appId, status) {
    await api.patch(`/jobs/${jobId}/applications/${appId}`, { status });
    const res = await api.get(`/jobs/${jobId}/applications`);
    setApplications((prev) => ({ ...prev, [jobId]: res.data }));
  }
  async function deleteApplication(jobId, appId) {
    if (!window.confirm('Delete this application?')) return;
    await api.delete(`/jobs/${jobId}/applications/${appId}`);
    const res = await api.get(`/jobs/${jobId}/applications`);
    setApplications((prev) => ({ ...prev, [jobId]: res.data }));
  }

  // ---------- Technicians & Tasks ----------
  async function inviteTechnician(e) {
    e.preventDefault();
    setMessage('');
    setInviteLink('');
    try {
      const res = await api.post('/admin/technicians', newTechnician);
      setNewTechnician({ fullName: '', email: '', phone: '' });
      setMessage('Technician invited. Share the setup link below with them.');
      if (res.data.devInviteToken) setInviteLink(`${window.location.origin}/set-password/${res.data.devInviteToken}`);
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not invite technician.');
    }
  }
  async function assignTask(e) {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { ...newTask, bookingId: newTask.bookingId || null };
      await api.post('/tasks', payload);
      setNewTask({ technicianId: '', title: '', instructions: '', dueDate: '', bookingId: '' });
      setMessage('Task assigned to technician.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not assign task.');
    }
  }
  async function deactivateTechnician(id) {
    if (!window.confirm('Revoke this technician\'s access? They will no longer be able to log in, but their task history stays intact.')) return;
    setMessage('');
    try {
      const res = await api.patch(`/admin/technicians/${id}/deactivate`);
      setMessage(res.data.message);
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not revoke access.');
    }
  }
  async function reactivateTechnician(id) {
    setMessage('');
    try {
      const res = await api.patch(`/admin/technicians/${id}/reactivate`);
      setMessage(res.data.message);
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not restore access.');
    }
  }
  async function resendTechnicianInvite(id) {
    setMessage('');
    setInviteLink('');
    try {
      const res = await api.patch(`/admin/technicians/${id}/resend-invite`);
      setMessage(res.data.message);
      if (res.data.devInviteToken) setInviteLink(`${window.location.origin}/set-password/${res.data.devInviteToken}`);
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not resend invite.');
    }
  }
  function startEditTechnician(t) {
    setEditingTechnicianId(t.id);
    setEditTechnicianForm({ fullName: t.fullName, email: t.email, phone: t.phone || '' });
  }
  async function saveTechnicianEdit(id) {
    setMessage('');
    try {
      await api.patch(`/admin/technicians/${id}`, editTechnicianForm);
      setEditingTechnicianId(null);
      setMessage('Technician details updated.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update technician.');
    }
  }

  // ---------- Inventory ----------
  async function addProduct(e) {
    e.preventDefault();
    setMessage('');
    const data = new FormData();
    Object.entries(newProduct).forEach(([k, v]) => data.append(k, v));
    if (productImage) data.append('image', productImage);
    try {
      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewProduct({ name: '', description: '', price: '', stockQuantity: '', category: '' });
      setProductImage(null);
      setMessage('Product added to inventory.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add product.');
    }
  }
  async function updateProductField(id, field, value) {
    await api.put(`/products/${id}`, { [field]: value });
    loadAll();
  }
  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    loadAll();
  }

  // ---------- Orders ----------
  async function setOrderStatus(id, status) {
    await api.patch(`/orders/${id}/status`, { status });
    loadAll();
  }
  async function confirmOrderPayment(id) {
    await api.patch(`/orders/${id}/confirm-payment`);
    setMessage('Payment confirmed for this order.');
    loadAll();
  }

  // ---------- Portfolio ----------
  async function addProject(e) {
    e.preventDefault();
    setMessage('');
    const data = new FormData();
    Object.entries(newProject).forEach(([k, v]) => data.append(k, v));
    if (projectImage) data.append('image', projectImage);
    try {
      await api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewProject({ title: '', description: '', clientName: '', completedDate: '' });
      setProjectImage(null);
      setMessage('Project added to the public Portfolio page.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add project.');
    }
  }
  async function deleteProject(id) {
    if (!window.confirm('Remove this project from the portfolio?')) return;
    await api.delete(`/projects/${id}`);
    loadAll();
  }
  function startEditProject(project) {
    setEditingProjectId(project.id);
    setEditProjectForm({
      title: project.title,
      description: project.description || '',
      clientName: project.clientName || '',
      completedDate: project.completedDate || '',
    });
    setEditProjectImage(null);
  }
  async function saveProjectEdit(id) {
    setMessage('');
    const data = new FormData();
    Object.entries(editProjectForm).forEach(([k, v]) => data.append(k, v));
    if (editProjectImage) data.append('image', editProjectImage);
    try {
      await api.put(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditingProjectId(null);
      setMessage('Project updated.');
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update project.');
    }
  }

  return (
    <div className="section">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button className={tab === 'summary' ? 'tab active' : 'tab'} onClick={() => setTab('summary')}>Overview</button>
        <button className={tab === 'bookings' ? 'tab active' : 'tab'} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={tab === 'quotations' ? 'tab active' : 'tab'} onClick={() => setTab('quotations')}>Quotations</button>
        <button className={tab === 'payments' ? 'tab active' : 'tab'} onClick={() => setTab('payments')}>Payments</button>
        <button className={tab === 'emergency' ? 'tab active' : 'tab'} onClick={() => setTab('emergency')}>Emergency Requests</button>
        <button className={tab === 'services' ? 'tab active' : 'tab'} onClick={() => setTab('services')}>Services</button>
        <button className={tab === 'careers' ? 'tab active' : 'tab'} onClick={() => setTab('careers')}>Careers</button>
        <button className={tab === 'technicians' ? 'tab active' : 'tab'} onClick={() => setTab('technicians')}>Technicians</button>
        <button className={tab === 'inventory' ? 'tab active' : 'tab'} onClick={() => setTab('inventory')}>Inventory</button>
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>Orders</button>
        <button className={tab === 'portfolio' ? 'tab active' : 'tab'} onClick={() => setTab('portfolio')}>Portfolio</button>
        <button className={tab === 'messages' ? 'tab active' : 'tab'} onClick={() => setTab('messages')}>Messages</button>
      </div>

      {tab === 'summary' && summary && (
        <div className="card-grid">
          <div className="card stat"><h3>{summary.totalCustomers}</h3><p>Total Customers</p></div>
          <div className="card stat"><h3>{summary.pendingBookings}</h3><p>Pending Bookings</p></div>
          <div className="card stat"><h3>{summary.pendingQuotations}</h3><p>Quotations Awaiting Pricing</p></div>
          <div className="card stat"><h3>{summary.pendingPayments}</h3><p>Payments Awaiting Confirmation</p></div>
          <div className="card stat"><h3>{summary.pendingEmergencies}</h3><p>Pending Emergencies</p></div>
          <div className="card stat"><h3>{summary.pendingOrders}</h3><p>Pending Product Orders</p></div>
          <div className="card stat"><h3>₦{Number(summary.totalRevenue).toLocaleString()}</h3><p>Total Revenue Collected</p></div>
        </div>
      )}

      {tab === 'bookings' && (
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Urgency</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.User?.fullName}<br /><small>{b.User?.phone}</small></td>
                <td>{b.Service?.name}</td>
                <td>{b.preferredDate}</td>
                <td><span className={`badge ${b.urgencyLevel === 'urgent' ? 'cancelled' : ''}`}>{b.urgencyLevel}</span></td>
                <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                <td>
                  <select value={b.status} onChange={(e) => setBookingStatus(b.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'quotations' && (
        <div>
          <p className="notice">
            A quotation opens automatically every time a customer books a service. Enter the amount,
            optionally attach a formal quote document, then click <strong>Send Quotation</strong> — it's
            immediately delivered to the customer as an invoice waiting for payment. No separate
            approval step needed.
          </p>
          {quotations.map((q) => (
            <div key={q.id} className="panel-card quote-card">
              <div className="quote-header">
                <div>
                  <h3 style={{ margin: 0 }}>{q.Service?.name}</h3>
                  <p className="quote-customer">{q.User?.fullName} — {q.User?.email}</p>
                </div>
                <span className={`badge ${q.status}`}>{q.status === 'draft' ? 'awaiting quote' : q.status}</span>
              </div>

              <div className="form-row two-col" style={{ marginTop: 16 }}>
                <div>
                  <label>Amount (₦)</label>
                  <input type="number" defaultValue={q.amount > 0 ? q.amount : ''} placeholder="Enter quote amount" id={`amount-${q.id}`} />
                </div>
                <div>
                  <label>Attach Document (optional)</label>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => setQuoteDocs({ ...quoteDocs, [q.id]: e.target.files[0] })} />
                </div>
              </div>

              {q.documentUrl && (
                <a href={q.documentUrl} target="_blank" rel="noreferrer" className="file-link"><DocumentIcon />View Currently Attached Document</a>
              )}

              <div className="quote-actions">
                {q.status !== 'approved' ? (
                  <>
                    <button className="btn-small primary" onClick={() => sendQuotation(q)}>Send Quotation</button>
                    <button className="btn-small danger" onClick={() => rejectQuotation(q)}>Reject Request</button>
                  </>
                ) : (
                  <span style={{ color: 'var(--grey)', fontSize: '0.88rem' }}>✓ Sent to customer — invoice created. You can still update the amount and click Send Quotation again to revise it.</span>
                )}
                {q.status === 'approved' && (
                  <button className="btn-small" onClick={() => sendQuotation(q)}>Update &amp; Resend</button>
                )}
              </div>
            </div>
          ))}
          {quotations.length === 0 && <p>No quotation requests yet.</p>}
        </div>
      )}

      {tab === 'payments' && (
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Service</th><th>Total</th><th>Status</th><th>Receipt</th><th>Action</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.User?.fullName}<br /><small>{inv.User?.phone}</small></td>
                <td>{inv.Quotation?.Service?.name}</td>
                <td>₦{Number(inv.totalAmount).toLocaleString()}</td>
                <td><span className={`badge ${inv.status}`}>{inv.status.replace('_', ' ')}</span></td>
                <td>{inv.receiptUrl ? <a href={inv.receiptUrl} target="_blank" rel="noreferrer" className="file-link receipt"><ReceiptIcon />View Receipt</a> : <span className="no-file">Not uploaded</span>}</td>
                <td>
                  {inv.status === 'pending_confirmation' && (
                    <button className="btn-small primary" onClick={() => confirmPayment(inv)}>Confirm Payment</button>
                  )}
                  {inv.status === 'paid' && <span>✓ Confirmed</span>}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={6}>No invoices yet.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'emergency' && (
        <table className="data-table">
          <thead><tr><th>Customer Phone</th><th>Location</th><th>Description</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {emergencies.map((e) => (
              <tr key={e.id}>
                <td>{e.contactPhone}</td>
                <td>{e.location}</td>
                <td>{e.description}</td>
                <td><span className={`badge ${e.status}`}>{e.status}</span></td>
                <td>
                  <select value={e.status} onChange={(ev) => setEmergencyStatus(e.id, ev.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'services' && (
        <div>
          <div className="panel-card">
            <h3>Add a New Service</h3>
            <form onSubmit={addService} className="form">
              <div className="form-row">
                <input placeholder="Service name" required value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                <input placeholder="Category" value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} />
                <input placeholder="Base price (₦)" type="number" value={newService.basePrice} onChange={(e) => setNewService({ ...newService, basePrice: e.target.value })} />
              </div>
              <textarea placeholder="Description" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
              <button type="submit" className="btn-primary">Add Service</button>
            </form>
          </div>

          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Base Price (₦)</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {services.map((s) => (
                editingServiceId === s.id ? (
                  <tr key={s.id}>
                    <td><input value={editServiceForm.name} onChange={(e) => setEditServiceForm({ ...editServiceForm, name: e.target.value })} /></td>
                    <td><input value={editServiceForm.category} onChange={(e) => setEditServiceForm({ ...editServiceForm, category: e.target.value })} /></td>
                    <td><input type="number" value={editServiceForm.basePrice} onChange={(e) => setEditServiceForm({ ...editServiceForm, basePrice: e.target.value })} /></td>
                    <td><input value={editServiceForm.description} onChange={(e) => setEditServiceForm({ ...editServiceForm, description: e.target.value })} /></td>
                    <td className="table-actions">
                      <button className="btn-small primary" onClick={() => saveServiceEdit(s.id)}>Save</button>
                      <button className="btn-small" onClick={() => setEditingServiceId(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.category}</td>
                    <td>₦{Number(s.basePrice || 0).toLocaleString()}</td>
                    <td>{s.description}</td>
                    <td className="table-actions">
                      <button className="btn-small" onClick={() => startEditService(s)}>Edit</button>
                      <button className="btn-small danger" onClick={() => deleteService(s.id)}>Delete</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'careers' && (
        <div>
          <div className="panel-card">
            <h3>Post a New Job Listing</h3>
            <form onSubmit={addJob} className="form">
              <div className="form-row">
                <input placeholder="Job title" required value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} />
                <input placeholder="Location" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} />
                <select value={newJob.employmentType} onChange={(e) => setNewJob({ ...newJob, employmentType: e.target.value })}>
                  <option>Full-time</option><option>Part-time</option><option>Contract</option>
                </select>
              </div>
              <textarea placeholder="Job description" required value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} />
              <label>Requirements (optional)</label>
              <textarea placeholder="Qualifications, skills, or experience needed" value={newJob.requirements} onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })} />
              <button type="submit" className="btn-primary">Post Job</button>
            </form>
          </div>

          <table className="data-table">
            <thead><tr><th>Title</th><th>Location</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map((job) => (
                <React.Fragment key={job.id}>
                  {editingJobId === job.id ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="panel-card" style={{ margin: 0 }}>
                          <div className="form">
                            <div className="form-row">
                              <input placeholder="Job title" value={editJobForm.title} onChange={(e) => setEditJobForm({ ...editJobForm, title: e.target.value })} />
                              <input placeholder="Location" value={editJobForm.location} onChange={(e) => setEditJobForm({ ...editJobForm, location: e.target.value })} />
                              <select value={editJobForm.employmentType} onChange={(e) => setEditJobForm({ ...editJobForm, employmentType: e.target.value })}>
                                <option>Full-time</option><option>Part-time</option><option>Contract</option>
                              </select>
                            </div>
                            <label>Description</label>
                            <textarea value={editJobForm.description} onChange={(e) => setEditJobForm({ ...editJobForm, description: e.target.value })} />
                            <label>Requirements</label>
                            <textarea value={editJobForm.requirements} onChange={(e) => setEditJobForm({ ...editJobForm, requirements: e.target.value })} />
                            <div className="table-actions" style={{ marginTop: 10 }}>
                              <button className="btn-small primary" onClick={() => saveJobEdit(job.id)}>Save Changes</button>
                              <button className="btn-small" onClick={() => setEditingJobId(null)}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td>{job.title}</td>
                      <td>{job.location}</td>
                      <td>{job.employmentType}</td>
                      <td><span className={`badge ${job.isOpen ? 'confirmed' : 'cancelled'}`}>{job.isOpen ? 'Open' : 'Closed'}</span></td>
                      <td className="table-actions">
                        <button className="btn-small" onClick={() => startEditJob(job)}>Edit</button>
                        <button className="btn-small" onClick={() => toggleJobOpen(job)}>{job.isOpen ? 'Close' : 'Reopen'}</button>
                        <button className="btn-small primary" onClick={() => viewApplications(job.id)}>
                          {expandedJobId === job.id ? 'Hide Applications' : 'View Applications'}
                        </button>
                      </td>
                    </tr>
                  )}
                  {expandedJobId === job.id && (
                    <tr>
                      <td colSpan={5}>
                        {(applications[job.id] || []).length === 0 && <p>No applications yet for this role.</p>}
                        {(applications[job.id] || []).map((app) => (
                          <div key={app.id} className="panel-card" style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <strong>{app.fullName}</strong> — {app.email} {app.phone && `— ${app.phone}`}
                              </div>
                              <span className={`badge ${app.status}`}>{app.status}</span>
                            </div>
                            <p>{app.coverLetter}</p>
                            <div className="table-actions">
                              <a href={app.cvUrl} target="_blank" rel="noreferrer" className="file-link"><DocumentIcon />Download CV</a>
                              <select value={app.status} onChange={(e) => updateApplicationStatus(job.id, app.id, e.target.value)}>
                                <option value="submitted">Submitted</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              <button className="btn-small danger" onClick={() => deleteApplication(job.id, app.id)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'technicians' && (
        <div>
          <div className="panel-card">
            <h3>Invite a Technician</h3>
            <p style={{ color: 'var(--grey)', marginTop: -4 }}>
              The technician creates their own password and fills in their own details (home address,
              specialization, etc.) using a setup link — you don't set a password for them.
            </p>
            <form onSubmit={inviteTechnician} className="form">
              <div className="form-row">
                <input placeholder="Full name" required value={newTechnician.fullName} onChange={(e) => setNewTechnician({ ...newTechnician, fullName: e.target.value })} />
                <input placeholder="Email" type="email" required value={newTechnician.email} onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })} />
                <input placeholder="Phone" value={newTechnician.phone} onChange={(e) => setNewTechnician({ ...newTechnician, phone: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Send Invite</button>
            </form>
            {inviteLink && (
              <p className="notice" style={{ background: '#f4e3c1', borderLeftColor: '#8c1a33', wordBreak: 'break-all' }}>
                <strong>Developer note:</strong> no email service is connected yet, so here's the setup
                link to share with the technician manually — <a href={inviteLink}>{inviteLink}</a>
              </p>
            )}
          </div>

          <div className="panel-card">
            <h3>Assign a Task</h3>
            <form onSubmit={assignTask} className="form">
              <div className="form-row">
                <select required value={newTask.technicianId} onChange={(e) => setNewTask({ ...newTask, technicianId: e.target.value })}>
                  <option value="">Select technician</option>
                  {technicians.filter((t) => t.accountSetupComplete && t.isActive).map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
                <select value={newTask.bookingId} onChange={(e) => setNewTask({ ...newTask, bookingId: e.target.value })}>
                  <option value="">(Optional) Link to a booking</option>
                  {bookings.map((b) => <option key={b.id} value={b.id}>#{b.id} — {b.Service?.name} ({b.User?.fullName})</option>)}
                </select>
                <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
              </div>
              <input placeholder="Task title" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              <textarea placeholder="Instructions for the technician" value={newTask.instructions} onChange={(e) => setNewTask({ ...newTask, instructions: e.target.value })} />
              <button type="submit" className="btn-primary">Assign Task</button>
            </form>
          </div>

          <div className="panel-card">
            <h3>Technician Roster</h3>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Account</th><th>Access</th><th>Action</th></tr></thead>
              <tbody>
                {technicians.map((t) => (
                  <React.Fragment key={t.id}>
                  <tr>
                    <td>{t.fullName}</td>
                    <td>{t.email}</td>
                    <td>
                      {t.accountSetupComplete
                        ? <span className="badge confirmed">Set up</span>
                        : <span className="badge pending">Invite pending</span>}
                    </td>
                    <td>
                      {t.isActive
                        ? <span className="badge confirmed">Active</span>
                        : <span className="badge cancelled">Revoked</span>}
                    </td>
                    <td className="table-actions">
                      {!t.accountSetupComplete && (
                        <button className="btn-small primary" onClick={() => resendTechnicianInvite(t.id)}>Resend Invite</button>
                      )}
                      <button className="btn-small" onClick={() => startEditTechnician(t)}>Edit</button>
                      {t.isActive
                        ? <button className="btn-small danger" onClick={() => deactivateTechnician(t.id)}>Revoke Access</button>
                        : <button className="btn-small primary" onClick={() => reactivateTechnician(t.id)}>Restore Access</button>}
                    </td>
                  </tr>
                  {editingTechnicianId === t.id && (
                    <tr>
                      <td colSpan={5}>
                        <div className="panel-card" style={{ margin: 0 }}>
                          <div className="form-row">
                            <input placeholder="Full name" value={editTechnicianForm.fullName} onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, fullName: e.target.value })} />
                            <input placeholder="Email" type="email" value={editTechnicianForm.email} onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, email: e.target.value })} />
                            <input placeholder="Phone" value={editTechnicianForm.phone} onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, phone: e.target.value })} />
                          </div>
                          <div className="table-actions" style={{ marginTop: 10 }}>
                            <button className="btn-small primary" onClick={() => saveTechnicianEdit(t.id)}>Save</button>
                            <button className="btn-small" onClick={() => setEditingTechnicianId(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
                {technicians.length === 0 && <tr><td colSpan={5}>No technicians yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <table className="data-table">
            <thead><tr><th>Technician</th><th>Task</th><th>Booking</th><th>Task Status</th><th>Report</th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.technician?.fullName}</td>
                  <td>{t.title}</td>
                  <td>{t.Booking ? `#${t.Booking.id} — ${t.Booking.Service?.name}` : '—'}</td>
                  <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                  <td>{t.report || <em>No report submitted yet</em>}</td>
                </tr>
              ))}
              {tasks.length === 0 && <tr><td colSpan={5}>No tasks assigned yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'inventory' && (
        <div>
          <div className="panel-card">
            <h3>Add a Product</h3>
            <form onSubmit={addProduct} className="form">
              <div className="form-row">
                <input placeholder="Product name" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                <input placeholder="Price (₦)" type="number" min="0" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                <input placeholder="Stock quantity" type="number" min="0" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} />
              </div>
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
              <label>Product Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setProductImage(e.target.files[0])} />
              <button type="submit" className="btn-primary">Add Product</button>
            </form>
          </div>

          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Price (₦)</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>
                    <input type="number" min="0" defaultValue={p.price} onBlur={(e) => updateProductField(p.id, 'price', e.target.value)} />
                  </td>
                  <td className={p.stockQuantity <= 3 ? 'stock-low' : ''}>
                    <input type="number" min="0" defaultValue={p.stockQuantity} onBlur={(e) => updateProductField(p.id, 'stockQuantity', e.target.value)} />
                  </td>
                  <td className="table-actions">
                    <button className="btn-small danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={5}>No products in inventory yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.map((o) => (
            <div key={o.id} className="panel-card order-card">
              <div className="order-header">
                <div>
                  <p className="order-customer">{o.User?.fullName}</p>
                  <p className="order-meta">Order #{o.id} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${o.status}`}>{o.status}</span>
              </div>

              <div className="order-items">
                {o.OrderItems?.map((i) => `${i.Product?.name} × ${i.quantity}`).join('  ·  ')}
              </div>

              <div className="order-details-grid">
                <div><span className="label">Total</span>₦{Number(o.totalAmount).toLocaleString()}</div>
                <div><span className="label">Delivery Address</span>{o.deliveryAddress}</div>
                <div><span className="label">Contact Phone</span>{o.contactPhone}</div>
                <div><span className="label">Preferred Date</span>{o.preferredDeliveryDate || 'No preference'}</div>
                {o.notes && <div><span className="label">Notes</span>{o.notes}</div>}
                <div>
                  <span className="label">Payment</span>
                  <span className={`badge ${o.paymentStatus}`}>{o.paymentStatus.replace('_', ' ')}</span>
                  {o.paymentMethod === 'online' && <span style={{ marginLeft: 6, fontSize: '0.8rem', color: 'var(--grey)' }}>(Paystack)</span>}
                </div>
              </div>

              {o.receiptUrl && (
                <a href={o.receiptUrl} target="_blank" rel="noreferrer" className="file-link receipt"><ReceiptIcon />View Uploaded Receipt</a>
              )}
              {o.paymentStatus === 'pending_confirmation' && (
                <button className="btn-small primary" style={{ marginTop: 10 }} onClick={() => confirmOrderPayment(o.id)}>Confirm Payment</button>
              )}

              <div className="order-footer">
                <TruckIcon style={{ width: 18, height: 18, stroke: 'var(--primary)' }} />
                <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p>No product orders yet.</p>}
        </div>
      )}

      {tab === 'portfolio' && (
        <div>
          <div className="panel-card">
            <h3>Add a Completed Project</h3>
            <form onSubmit={addProject} className="form">
              <div className="form-row">
                <input placeholder="Project title" required value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                <input placeholder="Client name" value={newProject.clientName} onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })} />
                <input type="date" value={newProject.completedDate} onChange={(e) => setNewProject({ ...newProject, completedDate: e.target.value })} />
              </div>
              <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              <label>Project Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setProjectImage(e.target.files[0])} />
              <button type="submit" className="btn-primary">Add to Portfolio</button>
            </form>
          </div>

          <div className="card-grid">
            {projects.map((p) => (
              <div key={p.id} className="card product-card">
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} />}
                {editingProjectId === p.id ? (
                  <div className="form">
                    <label>Title</label>
                    <input value={editProjectForm.title} onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })} />
                    <label>Client Name</label>
                    <input value={editProjectForm.clientName} onChange={(e) => setEditProjectForm({ ...editProjectForm, clientName: e.target.value })} />
                    <label>Completed Date</label>
                    <input type="date" value={editProjectForm.completedDate} onChange={(e) => setEditProjectForm({ ...editProjectForm, completedDate: e.target.value })} />
                    <label>Description</label>
                    <textarea value={editProjectForm.description} onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })} />
                    <label>Replace Photo (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setEditProjectImage(e.target.files[0])} />
                    <div className="table-actions" style={{ marginTop: 10 }}>
                      <button className="btn-small primary" onClick={() => saveProjectEdit(p.id)}>Save</button>
                      <button className="btn-small" onClick={() => setEditingProjectId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="table-actions">
                      <button className="btn-small" onClick={() => startEditProject(p)}>Edit</button>
                      <button className="btn-small danger" onClick={() => deleteProject(p.id)}>Remove</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div>
          {messages.map((m) => (
            <div key={m.id} className="panel-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{m.name}</strong>
                {m.rating && <span style={{ color: 'var(--primary)' }}>{'★'.repeat(m.rating)}{'☆'.repeat(5 - m.rating)}</span>}
              </div>
              {m.email && <p style={{ margin: '2px 0', color: 'var(--grey)', fontSize: '0.85rem' }}>{m.email}</p>}
              <p>{m.message}</p>
            </div>
          ))}
          {messages.length === 0 && <p>No messages yet.</p>}
        </div>
      )}

      {message && <p className="notice">{message}</p>}
    </div>
  );
}
