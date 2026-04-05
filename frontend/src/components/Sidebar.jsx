import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { role, hasBloodBank } = useAuth();

    return (
        <div style={sidebar}>
            <h2>BDMS</h2>

            {/* DONOR */}
            {role === "donor" && (
                <>
                    <Link to="/dashboard">Home</Link>
                    <Link to="/dashboard/profile">Profile</Link>
                    <Link to="/dashboard/history">History</Link>
                </>
            )}

            {/* BLOOD BANK */}
            {role === "blood_bank" && (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/dashboard/inventory">Inventory</Link>
                    <Link to="/dashboard/requests">Requests</Link>
                    <Link to="/dashboard/donations">Donations</Link>
                </>

            )}
            {role === "hospital" && !hasBloodBank && (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/dashboard/request">Request Blood</Link>
                    <Link to="/dashboard/my-requests">My Requests</Link>
                </>
            )}

            {role === "hospital" && hasBloodBank && (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/dashboard/inventory">Inventory</Link>
                    <Link to="/dashboard/requests">Incoming Requests</Link>
                    <Link to="/dashboard/donations">Donations</Link>
                </>
            )}
        </div>
    );
}

const sidebar = {
    width: "220px",
    background: "#111",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
};

export default Sidebar;