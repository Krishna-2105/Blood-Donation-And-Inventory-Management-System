import { useEffect, useState } from "react";
import API from "../../../api/axios";

function HospitalRequests() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get("/hospital/requests");
      setData(res.data);
    };
    fetch();
  }, []);
useEffect(() => {
  fetchData(); // first load

  const interval = setInterval(fetchData, 8000); // every 5 sec

  return () => clearInterval(interval); // cleanup
}, []);
  return (
    <div>
      <h2>My Requests</h2>

      {data.map((req) => (
        <div key={req.request_id} style={card}>
          <p>{req.blood_grp}</p>
          <p>{req.units}</p>

          {/* 🔥 STATUS COLORS */}
          <p style={getStatusStyle(req.status)}>
            {req.status.toUpperCase()}
          </p>
        </div>
      ))}
    </div>
  );
}

const getStatusStyle = (status) => {
  if (status === "pending") return { color: "orange" };
  if (status === "fulfilled") return { color: "green" };
  if (status === "rejected") return { color: "red" };
  return {};
};

const card = {
  background: "white",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "8px"
};

export default HospitalRequests;