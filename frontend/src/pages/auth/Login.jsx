import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const [form, setForm] = useState({
        identifier: "",
        password: ""
    });

    const { login } = useAuth();
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
            const res = await API.post("/auth/login", form);

            login(res.data.token);
            const profile = await API.get("/profile/status");

            if (!profile.data.profile_complete) {
                if (profile.data.user_type === "donor") {
                    navigate("/setup/donor");
                } else if (profile.data.user_type === "hospital") {
                    navigate("/setup/hospital");
                }
                else if (profile.data.user_type === "blood_bank") {
                    navigate("/setup/bloodbank");
                }
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "100px auto" }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="identifier"
                    placeholder="Email or User ID"
                    value={form.identifier}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Login</button>
            </form>

            <p>
                Don't have an account? <Link to="/signup">Signup</Link>
            </p>
        </div>
    );
}

export default Login;