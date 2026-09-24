export default function Card({ title, children, className = "", style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {title ? <h3 style={{ marginBottom: 12, fontSize: 16 }}>{title}</h3> : null}
      {children}
    </div>
  );
}
