// components/Testimonials.jsx — pulls real customer reviews from the API
// and displays them; used on the Home page.
import { useEffect, useState } from 'react';
import api from '../api/axios';
import StarRating from './StarRating';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/reviews').then((res) => setReviews(res.data.slice(0, 3)));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="section alt">
      <p className="section-label">Customer Feedback</p>
      <h2>What Our Clients Say</h2>
      <div className="card-grid">
        {reviews.map((r) => (
          <div key={r.id} className="testimonial">
            <p className="stars"><StarRating rating={r.rating} /></p>
            <p>{r.comment}</p>
            <p style={{ fontWeight: 600, marginTop: 8 }}>— {r.User?.fullName || 'Verified Customer'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
