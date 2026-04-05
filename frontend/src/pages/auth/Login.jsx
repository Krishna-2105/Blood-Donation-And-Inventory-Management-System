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
            // 1. login
            const res = await API.post("/auth/login", form);
            const token = res.data.token;

            // 2. store token (important for next API call)
            localStorage.setItem("token", token);

            // 3. call YOUR profile status API
            const profileRes = await API.get("/profile/status");

            const { user_type, profile_complete } = profileRes.data;

            // 4. store in context
            login(token, user_type);

            // 🔥 5. DECIDE FLOW

            if (!profile_complete) {
                // first login → setup
                if (user_type === "donor") {
                    navigate("/setup/donor");
                } else if (user_type === "hospital") {
                    navigate("/setup/hospital");
                } else if (user_type === "blood_bank") {
                    navigate("/setup/bloodbank");
                }
            } else {
                // existing user → dashboard
                if (user_type === "donor") {
                    navigate("/dashboard");
                } else if (user_type === "hospital") {
                    navigate("/dashboard");
                } else if (user_type === "blood_bank") {
                    navigate("/dashboard");
                } else if (user_type === "admin") {
                    navigate("/dashboard");
                }
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