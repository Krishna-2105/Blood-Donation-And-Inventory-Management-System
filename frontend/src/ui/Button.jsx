export default function Button({ variant, className = "", children, ...props }) {
  const v = variant === "danger" ? "danger" : variant === "secondary" ? "secondary" : "";
  return (
    <button className={`btn ${v} ${className}`} {...props}>
      {children}
    </button>
  );
}
