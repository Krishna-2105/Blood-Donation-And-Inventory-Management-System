export default function Input({ label, as = "input", className = "", ...props }) {
  const Comp = as;
  return (
    <div className="field">
      {label ? <div className="label">{label}</div> : null}
      <Comp className={`input ${className}`} {...props} />
    </div>
  );
}
