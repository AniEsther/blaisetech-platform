// components/StarRating.jsx — small reusable star display used in reviews.
export default function StarRating({ rating }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}
