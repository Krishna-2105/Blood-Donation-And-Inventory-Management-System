import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import EmptyState from "../../../ui/EmptyState";
// Reuse existing Card/EmptyState components; no Modal present in project

function AdminStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGrp, setBloodGrp] = useState("");
  const [bankId, setBankId] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (bloodGrp) params.blood_grp = bloodGrp;
      if (bankId) params.bank_id = bankId;
      const res = await API.get("/admin/blood-stock", { params });
      setData(res.data.data || []);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openDetails = async (stock) => {
    try {
      const res = await API.get(`/admin/blood-stock/${stock.stock_id}`);
      setSelected(res.data.data);
    } catch (err) {
      alert("Could not load details");
    }
  };

  const saveEdit = async (updates) => {
    try {
      await API.put(`/admin/blood-stock/${selected.stock_id}`, updates);
      setSelected(null);
      fetch();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const doAdjust = async (adjustment, reason) => {
    try {
      await API.patch(`/admin/blood-stock/${selected.stock_id}/adjust`, { adjustment, reason });
      setSelected(null);
      fetch();
    } catch (err) {
      alert(err?.response?.data?.message || "Adjustment failed");
    }
  };

  const doExpire = async () => {
    try {
      await API.patch(`/admin/blood-stock/${selected.stock_id}/expire`);
      setSelected(null);
      fetch();
    } catch (err) {
      alert(err?.response?.data?.message || "Expire failed");
    }
  };

  const doDelete = async () => {
    if (!window.confirm("Delete this stock record?")) return;
    try {
      await API.delete(`/admin/blood-stock/${selected.stock_id}`);
      setSelected(null);
      fetch();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!data || data.length === 0) return <EmptyState text="No stock found" />;

  return (
    <div>
      <h2>Blood Stock Management</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Search & Filters">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input placeholder="Blood Group" value={bloodGrp} onChange={(e) => setBloodGrp(e.target.value)} />
            <input placeholder="Bank ID" value={bankId} onChange={(e) => setBankId(e.target.value)} />
            <button onClick={() => { setPage(1); fetch(); }}>Search</button>
            <button onClick={() => { setBloodGrp(""); setBankId(""); setPage(1); fetch(); }}>Reset</button>
          </div>
        </Card>

        <Card title="Stock Entries" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Stock ID</th>
                <th>Bank</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={`${s.bank_id}-${s.stock_id}`}>
                  <td style={{ fontFamily: "monospace" }}>{s.stock_id}</td>
                  <td>{s.bank_name} <small style={{fontFamily:'monospace'}}>{s.bank_id}</small></td>
                  <td><b>{s.blood_grp}</b></td>
                  <td>{s.units_available}</td>
                  <td>
                    <button onClick={() => openDetails(s)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setPage(Math.max(1, page - 1))}>Prev</button>
            <span>Page {page}</span>
            <button onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </Card>
      </div>

      {selected && (
        <Card title={`Stock ${selected.stock_id}`} style={{ marginTop: 12 }}>
          <div>
            <p>Bank: {selected.bank_name} ({selected.bank_id})</p>
            <p>Blood Group: <b>{selected.blood_grp}</b></p>
            <p>Units Available: {selected.units_available}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => {
                const next = window.prompt('New units available', String(selected.units_available));
                if (next !== null) saveEdit({ units_available: Number(next) });
              }}>Edit</button>
              <button onClick={() => {
                const adj = window.prompt('Adjustment (use negative to decrease)', '');
                const reason = window.prompt('Reason (optional)', '');
                if (adj !== null) doAdjust(Number(adj), reason);
              }}>Adjust</button>
              <button onClick={() => { if (window.confirm('Mark expired?')) doExpire(); }}>Mark Expired</button>
              <button onClick={() => { if (window.confirm('Delete stock record?')) doDelete(); }}>Delete</button>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminStock;
