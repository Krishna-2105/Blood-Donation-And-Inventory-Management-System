import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import EmptyState from "../../../ui/EmptyState";
import { formatDate } from "../../../utils/formatDate";

function BloodBankHome() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/bloodbank");
        setData(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <Card title="Total Units">
          <h2>{data.total_units}</h2>
          <p className="muted">Units available</p>
        </Card>
        <Card title="Pending Requests">
          <h2>{data.pending_requests}</h2>
          <p className="muted">Need action</p>
        </Card>
        <Card title="Donations This Month">
          <h2>{data.donations_this_month}</h2>
          <p className="muted">Recorded donations</p>
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted">Member Since</div>
        <div style={{ fontFamily: 'monospace', fontWeight: 800 }}>{formatDate(data.created_dt || data.created_at)}</div>
      </div>

      {data.low_stock?.length > 0 && (
        <Card title="Low Stock" style={{ marginTop: 16 }}>
          {data.low_stock.map((b, i) => (
            <p key={i} className="muted" style={{ marginTop: 6 }}>
              <b style={{ color: "var(--color-text)" }}>{b.blood_grp}</b> — {b.units} units
            </p>
          ))}
        </Card>
      )}
      {!data.low_stock?.length && (
        <div style={{ marginTop: 16 }}>
          <EmptyState text="No low stock alerts" />
        </div>
      )}
    </div>
  );
}

export default BloodBankHome;
