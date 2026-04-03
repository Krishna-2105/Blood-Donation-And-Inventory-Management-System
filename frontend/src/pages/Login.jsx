import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from "../services/authServices"
import "../styles/auth.css"

function Login() {   
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleLogin = async () => {
        if (!identifier || !password) {
            alert("Fill all fields")
            return
        }

        const data = await login({ identifier, password })

        if (data.success) {
            localStorage.setItem("token", data.token)
            navigate("/dashboard")
        } else {
            alert(data.message)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">


                <h2>Sign In</h2>

                <input
                    type="text"
                    placeholder="Username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="auth-btn" onClick={handleLogin}>
                    Login
                </button>

                <p className="switch-text">
                    Don't have an account? <Link to="/signup">Signup</Link>
                </p>

            </div>
        </div>
    )
}

export default Login