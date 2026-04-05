import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

function DonorSetup() {
  const [form, setForm] = useState({
    blood_grp: "",
    dob: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/setup/donor", form);

      alert("Profile completed");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>Complete Donor Profile</h2>

      <form onSubmit={handleSubmit}>
        <select
          name="blood_grp"
          value={form.blood_grp}
          onChange={handleChange}
          required
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
        />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default DonorSetup;