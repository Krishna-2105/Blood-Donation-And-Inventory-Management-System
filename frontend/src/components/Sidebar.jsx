import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

function Sidebar() {
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get("/profile/status");
      setUserType(res.data.user_type);
    };
    fetch();
  }, []);

  return (
    <div style={{ width: "200px", background: "#111", color: "white", padding: "20px" }}>
      <h3>Dashboard</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>

        <li><Link to="/dashboard">Home</Link></li>

        {userType === "donor" && (
          <li><Link to="/dashboard/history">Donation History</Link></li>
        )}

        {userType === "hospital" && (
          <li><Link to="/dashboard/bloodbank">Manage Blood Bank</Link></li>
        )}

        {userType === "blood_bank" && (
          <li><Link to="/dashboard/inventory">Inventory</Link></li>
        )}

      </ul>
    </div>
  );
}

export default Sidebar;