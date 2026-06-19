import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import { formatDate } from "../../../utils/formatDate";
import EmptyState from "../../../ui/EmptyState";

function BloodInventory() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const res = await API.get("/bloodbank/inventory");
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  if (!data || loading) return <p>Loading...</p>;

  const summaryItems = (data.summary || []).filter((item) => Number(item.units) > 0);

  return (
    <div>
      <h2>Blood Inventory</h2>
      {error && <p style={{ color: "var(--color-error)", marginTop: 12 }}>{error}</p>}

      <Card title="Summary by Blood Group" className="" style={{ marginTop: 16 }}>
        {summaryItems.length === 0 ? (
          <EmptyState text="No inventory summary yet" />
        ) : (
          <div className="grid grid-3">
            {summaryItems.map((item, i) => (
              <Card key={i} title={item.blood_grp} className="">
                <h2>{item.units || 0}</h2>
                <p className="muted">units</p>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card title="Stock Entries">
          {(data.entries || []).length === 0 ? (
            <EmptyState text="No stock entries found" />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Stock #</th>
                  <th>Blood Group</th>
                  <th>Donor ID</th>
                  <th>Units</th>
                  <th>Collection Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.entries || []).map((item) => (
                  <tr key={`${item.bank_id}-${item.stock_id}`}>
                    <td>{item.stock_id}</td>
                    <td><b>{item.blood_grp}</b></td>
                    <td>{item.donor_id || "—"}</td>
                    <td>{item.units_available}</td>
                    <td>{formatDate(item.collection_dt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

export default BloodInventory;
