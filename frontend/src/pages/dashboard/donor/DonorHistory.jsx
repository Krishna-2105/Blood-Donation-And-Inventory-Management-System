import { useEffect, useState } from "react";
import API from "../../../api/axios";

function DonorHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/donor/history");
        setHistory(res.data.history);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetch();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Donation History</h2>

      <div style={card}>

        {history.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            No donations yet
          </p>
        ) : (
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
                  <td style={td}>{formatDate(item.donation_date)}</td>
                  <td style={td}>{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e2e8f0"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9"
};

export default DonorHistory;