import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

function HospitalSetup() {
  const [form, setForm] = useState({
    latitude: "",
    longitude: "",
    owns_bank: false,

    bank_name: "",
    bank_email: "",
    bank_phone: "",
    bank_password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/setup/hospital", form);

      alert("Setup complete");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to setup");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>Hospital Setup</h2>

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

        <label>
          <input
            type="checkbox"
            name="owns_bank"
            checked={form.owns_bank}
            onChange={handleChange}
          />
          Owns a Blood Bank?
        </label>

        {form.owns_bank && (
          <>
            <input
              type="text"
              name="bank_name"
              placeholder="Blood Bank Name"
              value={form.bank_name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="bank_email"
              placeholder="Blood Bank Email"
              value={form.bank_email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="bank_phone"
              placeholder="Blood Bank Phone"
              value={form.bank_phone}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="bank_password"
              placeholder="Blood Bank Password"
              value={form.bank_password}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default HospitalSetup;