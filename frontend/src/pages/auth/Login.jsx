import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

function Login() {
    const [form, setForm] = useState({
        identifier: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const { showToast } = useToast();
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
            setLoading(true);
            setError("");
            // 1. login
            const res = await API.post("/auth/login", form);

            const {
                token,
                user_type,
                profile_complete,
                has_blood_bank,
                bank_id
            } = res.data;
            console.log(res.data)
            // store token
            localStorage.setItem("token", token);

            // store in context
            login(token, user_type, has_blood_bank, bank_id);

            // 🔥 DECISION LOGIC

            if (!profile_complete) {
                if (user_type === "donor") {
                    navigate("/setup/donor");
                }
                else if (user_type === "hospital") {
                    navigate("/setup/hospital");
                }
                else if (user_type === "blood_bank") {
                    navigate("/setup/bloodbank");
                }
            }
            else {
                if (user_type === "admin") {
                    navigate("/dashboard/admin");
                } else {
                    // ALL go to same dashboard (router decides role)
                    navigate("/dashboard");
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Login failed");
            showToast("error", "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <h2 style={{ marginBottom: 12 }}>Login</h2>
                {error ? <p style={{ color: "var(--color-error)", marginBottom: 12 }}>{error}</p> : null}

                <form onSubmit={handleSubmit} className="form">
                    <Input
                        label="Email or User ID"
                        type="text"
                        name="identifier"
                        placeholder="Enter email or user id"
                        value={form.identifier}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                {/* Forgot Password flow removed. If you want to restore it later re-enable the component and route. */}

                <p className="muted" style={{ marginTop: 10 }}>
                    Don't have an account? <Link to="/signup" style={{ color: "var(--color-primary)", fontWeight: 700 }}>Signup</Link>
                </p>
            </Card>
        </div>
    );
}

export default Login;
