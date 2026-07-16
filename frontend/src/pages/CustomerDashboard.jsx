// pages/CustomerDashboard.jsx — logged-in customer's hub: book a service,
// track quotations/invoices, upload payment receipts, shop for products.
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardIcon, ClockIcon, BuildingIcon, DocumentIcon, ReceiptIcon, CheckCircleIcon } from '../components/Icons';
import { ONLINE_PAYMENTS_ENABLED } from '../config';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('book');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  const [bookingForm, setBookingForm] = useState({
    serviceId: '', faultDescription: '', additionalNotes: '', preferredDate: '',
    preferredTime: '', urgencyLevel: 'normal', contactPhone: '', address: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const [cart, setCart] = useState({}); // { productId: quantity }
  const [orderDetails, setOrderDetails] = useState({ deliveryAddress: '', contactPhone: '', preferredDeliveryDate: '', notes: '' });

  const [receiptFiles, setReceiptFiles] = useState({}); // { invoiceId: File }
  const [orderReceiptFiles, setOrderReceiptFiles] = useState({}); // { orderId: File }

  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data));
    api.get('/products').then((res) => setProducts(res.data));
    refreshData();
  }, []);

  function refreshData() {
    api.get('/bookings/my').then((res) => setBookings(res.data));
    api.get('/quotations/my').then((res) => setQuotations(res.data));
    api.get('/invoices/my').then((res) => setInvoices(res.data));
    api.get('/orders/my').then((res) => setOrders(res.data));
  }

  async function submitBooking(e) {
    e.preventDefault();
    setMessage('');
    const data = new FormData();
    Object.entries(bookingForm).forEach(([k, v]) => data.append(k, v));
    if (imageFile) data.append('image', imageFile);
    try {
      const res = await api.post('/bookings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(res.data.message || 'Booking submitted. You will receive a quotation soon.');
      setBookingForm({
        serviceId: '', faultDescription: '', additionalNotes: '', preferredDate: '',
        preferredTime: '', urgencyLevel: 'normal', contactPhone: '', address: '',
      });
      setImageFile(null);
      refreshData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit booking.');
    }
  }

  function updateCartQty(productId, qty) {
    setCart((prev) => ({ ...prev, [productId]: Math.max(0, Number(qty)) }));
  }

  const cartTotal = Object.entries(cart).reduce((sum, [pid, qty]) => {
    const product = products.find((p) => p.id === Number(pid));
    return product ? sum + Number(product.price) * qty : sum;
  }, 0);

  async function placeOrder() {
    setMessage('');
    const items = Object.entries(cart).filter(([, qty]) => qty > 0).map(([productId, quantity]) => ({ productId: Number(productId), quantity }));
    if (items.length === 0) { setMessage('Add at least one product to your cart first.'); return; }
    if (!orderDetails.deliveryAddress || !orderDetails.contactPhone) {
      setMessage('Delivery address and contact phone are required.');
      return;
    }
    try {
      const res = await api.post('/orders', { ...orderDetails, items });
      setMessage(res.data.message || 'Order placed successfully!');
      setCart({});
      setOrderDetails({ deliveryAddress: '', contactPhone: '', preferredDeliveryDate: '', notes: '' });
      api.get('/products').then((res) => setProducts(res.data));
      refreshData();
      setTab('orders');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not place order.');
    }
  }

  async function uploadReceipt(invoiceId) {
    setMessage('');
    const file = receiptFiles[invoiceId];
    if (!file) { setMessage('Please choose your payment receipt file first.'); return; }
    const data = new FormData();
    data.append('receipt', file);
    try {
      await api.patch(`/invoices/${invoiceId}/submit-payment`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Receipt uploaded. We will confirm your payment shortly.');
      refreshData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not upload receipt.');
    }
  }

  function payForOrderOnline(order) {
    setMessage('');
    if (!ONLINE_PAYMENTS_ENABLED) {
      setMessage('Online payment is currently not available — it will be turned on soon. Please upload your payment receipt for now.');
      return;
    }
    if (!window.PaystackPop) {
      setMessage('Online payment isn\'t available right now — please upload a payment receipt instead.');
      return;
    }
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(Number(order.totalAmount) * 100), // Paystack expects kobo
      currency: 'NGN',
      ref: `order-${order.id}-${Date.now()}`,
      callback: function (response) {
        api.post(`/orders/${order.id}/verify-payment`, { reference: response.reference })
          .then((res) => {
            setMessage(res.data.message);
            refreshData();
          })
          .catch((err) => setMessage(err.response?.data?.message || 'Payment could not be verified. Please contact us if you were charged.'));
      },
      onClose: function () {},
    });
    handler.openIframe();
  }

  function payInvoiceOnline(invoice) {
    setMessage('');
    if (!ONLINE_PAYMENTS_ENABLED) {
      setMessage('Online payment is currently not available — it will be turned on soon. Please upload your payment receipt for now.');
      return;
    }
    // Online payment for service invoices reuses the same verified-payment
    // pattern as Shop orders once enabled — see backend/utils/paystack.js.
  }

  async function uploadOrderReceipt(orderId) {
    setMessage('');
    const file = orderReceiptFiles[orderId];
    if (!file) { setMessage('Please choose your payment receipt file first.'); return; }
    const data = new FormData();
    data.append('receipt', file);
    try {
      const res = await api.patch(`/orders/${orderId}/submit-receipt`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(res.data.message);
      refreshData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not upload receipt.');
    }
  }

  return (
    <div className="section">
      <h1>My Dashboard</h1>
      <div className="tabs">
        <button className={tab === 'book' ? 'tab active' : 'tab'} onClick={() => setTab('book')}>Book a Service</button>
        <button className={tab === 'bookings' ? 'tab active' : 'tab'} onClick={() => setTab('bookings')}>My Bookings</button>
        <button className={tab === 'quotations' ? 'tab active' : 'tab'} onClick={() => setTab('quotations')}>My Quotations</button>
        <button className={tab === 'invoices' ? 'tab active' : 'tab'} onClick={() => setTab('invoices')}>My Invoices &amp; Payments</button>
        <button className={tab === 'shop' ? 'tab active' : 'tab'} onClick={() => setTab('shop')}>Shop Products</button>
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>My Orders</button>
      </div>

      {tab === 'book' && (
        <div className="panel-card">
          <h3>Tell Us What You Need</h3>
          <p className="form-hint">
            Fill this in with as much detail as possible. Once submitted, our team will review it
            and send you a quotation directly to your dashboard — no need to request one separately.
          </p>
          <form onSubmit={submitBooking} className="form">
            <p className="form-section-title"><ClipboardIcon />Job Details</p>
            <div className="form-row two-col">
              <div>
                <label>Service<span> </span></label>
                <select required value={bookingForm.serviceId} onChange={(e) => setBookingForm({ ...bookingForm, serviceId: e.target.value })}>
                  <option value="">Select a service</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label>How urgent is this?<span> </span></label>
                <select value={bookingForm.urgencyLevel} onChange={(e) => setBookingForm({ ...bookingForm, urgencyLevel: e.target.value })}>
                  <option value="normal">Normal — can wait a few days</option>
                  <option value="urgent">Urgent — needs attention soon</option>
                </select>
              </div>
            </div>

            <label>Describe the fault or job in detail</label>
            <textarea required placeholder="e.g. The socket in the living room sparks when I plug in an appliance. It started two days ago and now the breaker trips."
              value={bookingForm.faultDescription} onChange={(e) => setBookingForm({ ...bookingForm, faultDescription: e.target.value })} />

            <label>Additional notes (optional)</label>
            <textarea placeholder="Anything else the technician should know — access instructions, past repairs, etc."
              value={bookingForm.additionalNotes} onChange={(e) => setBookingForm({ ...bookingForm, additionalNotes: e.target.value })} />

            <label>Photo of the fault (optional, but helps us prepare)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />

            <p className="form-section-title"><ClockIcon />Schedule</p>
            <div className="form-row two-col">
              <div>
                <label>Preferred Date<span> </span></label>
                <input required type="date" value={bookingForm.preferredDate} onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })} />
              </div>
              <div>
                <label>Preferred Time Slot<span> </span></label>
                <select value={bookingForm.preferredTime} onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}>
                  <option value="">No preference</option>
                  <option>Morning (8am - 12pm)</option>
                  <option>Afternoon (12pm - 4pm)</option>
                  <option>Evening (4pm - 7pm)</option>
                </select>
              </div>
            </div>

            <p className="form-section-title"><BuildingIcon />Contact &amp; Location</p>
            <div className="form-row two-col">
              <div>
                <label>Contact Phone<span> </span></label>
                <input required type="tel" placeholder="e.g. 0803 000 0000" value={bookingForm.contactPhone} onChange={(e) => setBookingForm({ ...bookingForm, contactPhone: e.target.value })} />
              </div>
              <div>
                <label>Service Address<span> </span></label>
                <input required value={bookingForm.address} onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 24 }}>Submit Booking</button>
          </form>
        </div>
      )}

      {tab === 'bookings' && (
        <table className="data-table">
          <thead><tr><th>Service</th><th>Date</th><th>Urgency</th><th>Address</th><th>Status</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.Service?.name}</td>
                <td>{b.preferredDate}</td>
                <td><span className={`badge ${b.urgencyLevel === 'urgent' ? 'cancelled' : ''}`}>{b.urgencyLevel}</span></td>
                <td>{b.address}</td>
                <td><span className={`badge ${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={5}>No bookings yet.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'quotations' && (
        <table className="data-table">
          <thead><tr><th>Service</th><th>Amount</th><th>Status</th><th>Document</th></tr></thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id}>
                <td>{q.Service?.name}</td>
                <td>{q.status === 'draft' ? <em>Pending review</em> : `₦${Number(q.amount).toLocaleString()}`}</td>
                <td><span className={`badge ${q.status}`}>{q.status === 'draft' ? 'awaiting quote' : q.status}</span></td>
                <td>
                  {q.documentUrl
                    ? <a href={q.documentUrl} target="_blank" rel="noreferrer" className="file-link"><DocumentIcon />View Document</a>
                    : <span className="no-file">No document attached</span>}
                </td>
              </tr>
            ))}
            {quotations.length === 0 && <tr><td colSpan={4}>No quotations yet — these appear automatically once you book a service.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'invoices' && (
        <div>
          {invoices.map((inv) => (
            <div key={inv.id} className="panel-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{inv.Quotation?.Service?.name || 'Service Invoice'}</h3>
                  <p style={{ margin: '4px 0' }}>Total: <strong>₦{Number(inv.totalAmount).toLocaleString()}</strong></p>
                </div>
                <span className={`badge ${inv.status}`}>{inv.status.replace('_', ' ')}</span>
              </div>

              {inv.status === 'unpaid' && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                    <button className="btn-primary" onClick={() => payInvoiceOnline(inv)}>Pay Online</button>
                    <span style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>or upload a receipt below</span>
                  </div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upload Payment Receipt</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setReceiptFiles({ ...receiptFiles, [inv.id]: e.target.files[0] })} />
                  <button className="btn-small primary" style={{ marginTop: 10 }} onClick={() => uploadReceipt(inv.id)}>Submit Receipt &amp; Mark as Paid</button>
                </div>
              )}
              {inv.status === 'pending_confirmation' && (
                <p style={{ marginTop: 10, color: 'var(--grey)' }}>Your receipt has been submitted and is awaiting admin confirmation.</p>
              )}
              {inv.status === 'paid' && (
                <p style={{ marginTop: 10, color: 'var(--grey)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleIcon style={{ width: 16, height: 16, stroke: '#2c6b3f' }} /> Payment confirmed. Amount paid: ₦{Number(inv.amountPaid).toLocaleString()}
                </p>
              )}
              {inv.receiptUrl && (
                <a href={inv.receiptUrl} target="_blank" rel="noreferrer" className="file-link receipt"><ReceiptIcon />View Uploaded Receipt</a>
              )}
            </div>
          ))}
          {invoices.length === 0 && <p>No invoices yet — these appear once a quotation is approved.</p>}
        </div>
      )}

      {tab === 'shop' && (
        <div>
          <div className="card-grid">
            {products.map((p) => (
              <div key={p.id} className="card product-card">
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price">₦{Number(p.price).toLocaleString()}</p>
                <p className="stock-tag">{p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}</p>
                <input type="number" min="0" max={p.stockQuantity} className="qty-input"
                  value={cart[p.id] || 0} onChange={(e) => updateCartQty(p.id, e.target.value)} disabled={p.stockQuantity === 0} />
              </div>
            ))}
            {products.length === 0 && <p>No products available yet.</p>}
          </div>

          {products.length > 0 && (
            <div className="panel-card checkout-panel" style={{ marginTop: 20 }}>
              <h3><ClipboardIcon />Checkout Details</h3>
              <div className="form-row two-col">
                <div>
                  <label>Delivery Address<span> </span></label>
                  <input required value={orderDetails.deliveryAddress} onChange={(e) => setOrderDetails({ ...orderDetails, deliveryAddress: e.target.value })} />
                </div>
                <div>
                  <label>Contact Phone<span> </span></label>
                  <input required type="tel" value={orderDetails.contactPhone} onChange={(e) => setOrderDetails({ ...orderDetails, contactPhone: e.target.value })} />
                </div>
              </div>
              <div className="form-row two-col">
                <div>
                  <label>Preferred Delivery Date (optional)<span> </span></label>
                  <input type="date" value={orderDetails.preferredDeliveryDate} onChange={(e) => setOrderDetails({ ...orderDetails, preferredDeliveryDate: e.target.value })} />
                </div>
                <div>
                  <label>Delivery Notes (optional)<span> </span></label>
                  <input placeholder="Landmark, gate code, best time to deliver..." value={orderDetails.notes} onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })} />
                </div>
              </div>
              <div className="checkout-total-row">
                <span>Cart total</span>
                <strong>₦{cartTotal.toLocaleString()}</strong>
              </div>
              <button className="btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={placeOrder}>Place Order</button>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.map((o) => (
            <div key={o.id} className="panel-card order-card">
              <div className="order-header">
                <div>
                  <p className="order-customer">Order #{o.id}</p>
                  <p className="order-meta">{o.OrderItems?.map((i) => `${i.Product?.name} × ${i.quantity}`).join('  ·  ')}</p>
                </div>
                <span className={`badge ${o.status}`}>{o.status}</span>
              </div>

              <div className="order-details-grid">
                <div><span className="label">Total</span>₦{Number(o.totalAmount).toLocaleString()}</div>
                <div><span className="label">Delivery Address</span>{o.deliveryAddress}</div>
                <div><span className="label">Payment</span><span className={`badge ${o.paymentStatus}`}>{o.paymentStatus.replace('_', ' ')}</span></div>
              </div>

              {o.status === 'cancelled' ? (
                <p style={{ marginTop: 14, color: 'var(--danger)' }}>
                  This order was cancelled by the admin. If you were charged, please contact us — otherwise no payment is needed.
                </p>
              ) : (
                <>
                  {o.paymentStatus === 'unpaid' && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <p className="form-hint" style={{ marginTop: 0 }}>Complete payment so we can process your order.</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button className="btn-primary" onClick={() => payForOrderOnline(o)}>Pay Online Now</button>
                        <span style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>or</span>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setOrderReceiptFiles({ ...orderReceiptFiles, [o.id]: e.target.files[0] })} />
                        <button className="btn-small primary" onClick={() => uploadOrderReceipt(o.id)}>Upload Receipt</button>
                      </div>
                    </div>
                  )}
                  {o.paymentStatus === 'pending_confirmation' && (
                    <p style={{ marginTop: 14, color: 'var(--grey)' }}>Your receipt has been submitted and is awaiting admin confirmation.</p>
                  )}
                  {o.paymentStatus === 'paid' && (
                    <p style={{ marginTop: 14, color: 'var(--grey)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircleIcon style={{ width: 16, height: 16, stroke: '#2c6b3f' }} /> Payment confirmed — delivery within 3–5 business days.
                    </p>
                  )}
                </>
              )}
              {o.receiptUrl && (
                <a href={o.receiptUrl} target="_blank" rel="noreferrer" className="file-link receipt"><ReceiptIcon />View Uploaded Receipt</a>
              )}
            </div>
          ))}
          {orders.length === 0 && <p>No orders yet.</p>}
        </div>
      )}

      {message && <p className="notice">{message}</p>}
    </div>
  );
}
