import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

function BloodBankSetup() {
  const [form, setForm] = useState({
    latitude: "",
    longitude: ""
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
      await API.post("/api/setup/bloodbank", form);

      alert("Setup complete");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to setup");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>Blood Bank Setup</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="latitude"
          placeholder="Latitude"
          value={form.latitude}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="longitude"
          placeholder="Longitude"
          value={form.longitude}
          onChange={handleChange}
          required
        />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default BloodBankSetup;