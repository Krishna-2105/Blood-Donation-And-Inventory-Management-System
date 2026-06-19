import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import EmptyState from "../../../ui/EmptyState";
import { formatDate } from "../../../utils/formatDate";

function AdminIssued() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/issued");
        setData(res.data.data || []);
      } catch (err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data || data.length === 0) return <EmptyState text="No data found" />;

  return (
    <div>
      <h2>Issued Blood</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="All issued blood records">
          <table className="table">
            <thead>
              <tr>
                <th>Issued ID</th>
                <th>Request</th>
                <th>Hospital</th>
                <th>Bank</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Issued Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((i, idx) => (
                <tr key={`${i.issued_id}-${idx}`}>
                  <td style={{ fontFamily: "monospace" }}>{String(i.issued_id).slice(0, 8)}</td>
                  <td style={{ fontFamily: "monospace" }}>{i.request_id ? String(i.request_id).slice(0, 8) : "—"}</td>
                  <td>{i.hospital_name}</td>
                  <td>{i.bank_name}</td>
                  <td>
                    <b>{i.blood_grp}</b>
                  </td>
                  <td>{i.units}</td>
                  <td>{formatDate(i.issued_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default AdminIssued;
