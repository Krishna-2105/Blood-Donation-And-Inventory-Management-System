import { useEffect, useState } from "react";
import API from "../../api/axios";

import DonorDashboard from "./donor/DonorDashboard";
import HospitalDashboard from "./hospital/HospitalDashboard";
import HospitalWithBank from "./hospital/HospitalWithBank";
import BloodBankDashboard from "./bloodbank/BloodBankDashboard";

function DashboardRouter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/profile/status");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  
  if (data.user_type === "donor") {
    return <DonorDashboard />;
  }

  if (data.user_type === "hospital") {
    if (data.owns_bank) {
      return <HospitalWithBank />;
    }
    return <HospitalDashboard />;
  }

  if (data.user_type === "blood_bank") {
    return <BloodBankDashboard />;
  }

  return <h1>Admin Dashboard</h1>;
}

export default DashboardRouter;