import { useNavigate } from "react-router-dom"

function Navbar() {
    const navigate = useNavigate()

    const username = localStorage.getItem("username") || "User"
    const role = localStorage.getItem("role")

    const handleLogout = () => {
        localStorage.clear()
        navigate("/login")
    }

    return (
        <div className="navbar">
            <div className="nav-left">
                <h3>Dashboard</h3>
            </div>

            <div className="nav-right">
                <span className="user">
                    {username} ({role})
                </span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    )
}

export default Navbar