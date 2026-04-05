import { useEffect, useState } from "react";
import API from "../../../api/axios";

function BloodBankHome() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get("/bloodbank");
      setData(res.data);
    };
    fetch();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      {/* STATS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <Stat title="Total Units" value={data.total_units} />
        <Stat title="Pending Requests" value={data.pending_requests} />
        <Stat title="Donations This Month" value={data.donations_this_month} />
      </div>

      {/* LOW STOCK ALERT */}
      {data.low_stock.length > 0 && (
        <div style={alertBox}>
          ⚠ Low Stock:
          {data.low_stock.map((b, i) => (
            <span key={i}>
              {" "} {b.blood_grp} ({b.units})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const Stat = ({ title, value }) => (
  <div style={card}>
    <h3>{value}</h3>
    <p>{title}</p>
  </div>
);

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px"
};

const alertBox = {
  background: "#fee2e2",
  padding: "10px",
  borderRadius: "6px"
};

export default BloodBankHome;