import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    user_type: "donor"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      const res = await API.post("/auth/signup", form);

      showToast("success", "Signup successful");
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed");
      showToast("error", err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2 style={{ marginBottom: 12 }}>Signup</h2>
        {error ? <p style={{ color: "var(--color-error)", marginBottom: 12 }}>{error}</p> : null}

        <form onSubmit={handleSubmit} className="form">
          <Input label="Name" type="text" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone Number" type="text" name="phone_no" value={form.phone_no} onChange={handleChange} required />
          <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />

          <div className="field">
            <div className="label">User Type</div>
            <select className="input" name="user_type" value={form.user_type} onChange={handleChange}>
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="blood_bank">Blood Bank</option>
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Signup"}
          </Button>
        </form>

        <p className="muted" style={{ marginTop: 12 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 700 }}>Login</Link>
        </p>
      </Card>
    </div>
  );
}

export default Signup;
