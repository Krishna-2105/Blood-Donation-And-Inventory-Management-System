import { useEffect, useState } from "react";
import API from "../../../api/axios";

function DonorHome() {
  const [profile, setProfile] = useState(null);
  const [lastDonation, setLastDonation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const prof = await API.get("/donor/profile");
      const last = await API.get("/donor/lastdt");

      setProfile(prof.data);
      setLastDonation(last.data);
    };

    fetchData();
  }, []);

  const canDonate = (date) => {
    if (!date) return true;
    const last = new Date(date);
    last.setDate(last.getDate() + 90);
    return new Date() >= last;
  };

  return (
    <div>
      <h2>Home</h2>

      <div style={card}>
        <h3>{profile?.name}</h3>
        <p>Blood Group: {profile?.blood_grp}</p>
      </div>

      <div style={card}>
        <h3>Last Donation</h3>
        <p>{lastDonation?.date || "No donations yet"}</p>

        <p>
          Status:{" "}
          {canDonate(lastDonation?.date) ? "Eligible" : "Not Eligible"}
        </p>
      </div>
    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px"
};

export default DonorHome;