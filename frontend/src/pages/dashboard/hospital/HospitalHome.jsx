import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { useNavigate } from "react-router-dom";

function HospitalHome() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get("/hospital/dashboard");
      setData(res.data);
    };
    fetch();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Hospital Dashboard</h2>

      {/* 📊 STATS */}
      <div style={statsContainer}>
        <Stat title="Total Requests" value={data.total} />
        <Stat title="Pending" value={data.pending} />
        <Stat title="Fulfilled" value={data.fulfilled} />
        <Stat title="Rejected" value={data.rejected} />
      </div>

      {/* ⚡ QUICK ACTION */}
      <button
        style={button}
        onClick={() => navigate("/dashboard/request")}
      >
        Request Blood
      </button>

      {/* 📜 RECENT REQUESTS */}
      <div style={card}>
        <h3>Recent Requests</h3>

        {data.recent_requests.map((req) => (
          <div key={req.request_id} style={item}>
            <p>{req.blood_grp} ({req.units} units)</p>
            <p>Status: {req.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const statsContainer = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px"
};

const Stat = ({ title, value }) => (
  <div style={card}>
    <h3>{value}</h3>
    <p>{title}</p>
  </div>
);

const card = {
  background: "white",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px"
};

const item = {
  borderBottom: "1px solid #eee",
  padding: "10px 0"
};

const button = {
  padding: "10px 15px",
  marginBottom: "20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default HospitalHome;