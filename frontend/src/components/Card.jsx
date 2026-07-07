export default function Card({ title, description, children }) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {children}
    </section>
  );
}
