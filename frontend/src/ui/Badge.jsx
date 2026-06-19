export default function Badge({ status }) {
  const s = String(status || "").toLowerCase();
  const type =
    s === "approved" || s === "fulfilled"
      ? "success"
      : s === "rejected" || s === "cancelled"
        ? "error"
        : "pending";
  return <span className={`badge ${type}`} style={{ textTransform: 'capitalize' }}>{status}</span>;
}
