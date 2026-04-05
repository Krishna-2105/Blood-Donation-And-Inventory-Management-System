import { useEffect, useState } from "react";
import API from "../../../api/axios";

function BloodInventory() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get("/bloodbank/inventory");
      setData(res.data);
    };
    fetch();
  }, []);

  const getStatus = (units) => {
    if (units <= 2) return "CRITICAL";
    if (units <= 5) return "LOW";
    return "GOOD";
  };

  return (
    <div>
      <h2>Blood Inventory</h2>

      {data.map((item, i) => (
        <div key={i} style={card}>
          <h3>{item.blood_grp}</h3>
          <p>{item.units} units</p>
          <p>Status: {getStatus(item.units)}</p>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "white",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "8px"
};

export default BloodInventory;