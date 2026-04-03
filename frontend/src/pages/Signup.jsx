import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../services/authServices'
import "../styles/auth.css"

function Signup() {
    const [name, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phone_no, setPhno] = useState("")
    const [user_type, setUserType] = useState("donor")

    const navigate = useNavigate()

    const handleSignup = async () => {
        if (!name || !email || !password || !user_type) {
            alert("Fill all fields")
            return
        }

        const data = await signup({ name, email, phone_no, password, user_type })

        if (!data.success) {
            alert(data.message)
        } else {
            navigate("/login")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">

                

                <h2>Create Account</h2>

                <select value={user_type} onChange={(e) => setUserType(e.target.value)}>
                    <option value="donor">Donor</option>
                    <option value="hospital">Hospital</option>
                    <option value="blood_bank">Blood Bank</option>
                </select>

                <input placeholder="Full Name" onChange={(e) => setUsername(e.target.value)} />
                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Phone Number" onChange={(e) => setPhno(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

                <button className="auth-btn" onClick={handleSignup}>
                    Create Account
                </button>

                <p className="switch-text">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    )
}

export default Signup