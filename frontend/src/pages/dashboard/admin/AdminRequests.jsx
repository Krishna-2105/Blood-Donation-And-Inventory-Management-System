import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import Badge from "../../../ui/Badge";
import { formatDate } from "../../../utils/formatDate";
import EmptyState from "../../../ui/EmptyState";

function AdminRequests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/requests', { params: { page, limit } });
      setData(res.data.data || []);
    } catch (err) {
      setData([]);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetch(); }, [page]);

  if (loading) return <p>Loading...</p>;
  if (!data || data.length === 0) return <EmptyState text="No data found" />;

  return (
    <div>
      <h2>All Requests</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Hospital Requests with Bank Status">
          <table className="table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Final</th>
                <th>Bank</th>
                <th>Bank Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, idx) => (
                <tr key={`${r.request_id}-${r.bank_id || "none"}-${idx}`}>
                  <td style={{ fontFamily: "monospace" }}>{String(r.request_id).slice(0, 8)}</td>
                  <td>{r.hospital_name}</td>
                  <td>
                    <b>{r.blood_grp}</b>
                  </td>
                  <td>{r.units_required}</td>
                  <td>{r.final_status ? <Badge status={r.final_status} /> : "—"}</td>
                  <td>{r.bank_name || "—"}</td>
                  <td>{r.request_status ? <Badge status={r.request_status} /> : "—"}</td>
                  <td>{formatDate(r.requested_date)}</td>
                  <td>
                    <button onClick={async ()=>{ const res = await API.get(`/admin/requests/${r.request_id}`); setSelected(res.data.data); }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={()=>setPage(Math.max(1, page-1))}>Prev</button>
            <span>Page {page}</span>
            <button onClick={()=>setPage(page+1)}>Next</button>
          </div>
        </Card>
        {selected && (
            <Card title={`Request ${selected.request_id}`} style={{ marginTop: 12 }}>
            <p>Hospital: {selected.hospital_id} ({selected.hospital_name})</p>
            <p>Blood Group: {selected.blood_grp}</p>
            <p>Units: {selected.units_required}</p>
            <p>Final Status: {selected.final_status}</p>
            <p>Requested: {formatDate(selected.requested_date)}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={async ()=>{ const bank = window.prompt('Bank ID to approve with'); if(bank) { await API.patch(`/admin/requests/${selected.request_id}/approve`, { bank_id: bank }); setSelected(null); fetch(); }}}>Approve</button>
              <button onClick={async ()=>{ const bank = window.prompt('Bank ID to reject with'); if(bank) { await API.patch(`/admin/requests/${selected.request_id}/reject`, { bank_id: bank }); setSelected(null); fetch(); }}}>Reject</button>
              <button onClick={async ()=>{ const to = window.prompt('To Bank ID'); const from = window.prompt('From Bank ID (optional)'); if(to) { await API.patch(`/admin/requests/${selected.request_id}/reassign`, { to_bank_id: to, from_bank_id: from }); setSelected(null); fetch(); }}}>Reassign</button>
              <button onClick={()=>setSelected(null)}>Close</button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminRequests;
