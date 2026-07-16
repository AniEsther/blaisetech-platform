// components/PhotoPlaceholder.jsx — marks a spot where the business owner
// should drop in a real photo of their team/projects. Keeps the layout
// looking finished before real photos are added, without using stock images
// that Blaisetech doesn't have rights to.
export default function PhotoPlaceholder({ label = 'Add project photo here', height = 180 }) {
  return (
    <div className="photo-placeholder" style={{ minHeight: height }}>
      📷 {label}
    </div>
  );
}
