import { useEffect, useState } from "react";
import API from "../../../api/axios";

function DonorDashboard() {
  const [lastDonation, setLastDonation] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const last = await API.get("/donor/last");
      const hist = await API.get("/donor/history");

      setLastDonation(last.data);
      setHistory(hist.data);
    };

    fetchData();
  }, []);

  return (
    <div>

      <h2 style={{ marginBottom: "20px" }}>Donor Dashboard</h2>

      {/* Card */}
      <div style={card}>
        <h3>Last Donation</h3>
        {lastDonation ? (
          <p>{lastDonation.date}</p>
        ) : (
          <p>No donations yet</p>
        )}
      </div>

      {/* Table Card */}
      <div style={card}>
        <h3>Donation History</h3>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Hospital</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item, i) => (
              <tr key={i}>
                <td style={td}>{item.donation_date}</td>
                <td style={td}>{item.hospital_id}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  marginBottom: "20px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const th = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "10px"
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};

export default DonorDashboard;