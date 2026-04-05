import { useState, useEffect } from "react";
import API from "../../../api/axios";

function DonorProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    blood_grp: "",
    dob: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/donor/profile");
        setForm(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetch();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put("/profile/update", form);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Profile</h2>

      <form onSubmit={handleSubmit} style={card}>

        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <label>Email (cannot change)</label>
        <input
          type="email"
          value={form.email}
          disabled
        />

        <label>Phone</label>
        <input
          type="text"
          name="phone_no"
          value={form.phone_no}
          onChange={handleChange}
        />

        <label>Blood Group</label>
        <select
          name="blood_grp"
          value={form.blood_grp}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={form.dob || ""}
          onChange={handleChange}
        />

        <button style={button}>Save Changes</button>
      </form>
    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxWidth: "400px"
};

const button = {
  marginTop: "10px",
  padding: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default DonorProfile;