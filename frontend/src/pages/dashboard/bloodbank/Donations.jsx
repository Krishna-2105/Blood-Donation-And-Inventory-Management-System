import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import EmptyState from "../../../ui/EmptyState";
import { formatDate } from "../../../utils/formatDate";

function Donations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get("/bloodbank/donations");
      setData(res.data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Donation Records</h2>

      <div style={{ marginTop: 16 }}>
        <Card title="Donations">
          {data.length === 0 ? (
            <EmptyState text="No donation records yet" />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Units</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.donation_id}>
                    <td>{d.donor_name}</td>
                    <td>{d.units}</td>
                    <td>{formatDate(d.date)}</td>
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

export default Donations;
