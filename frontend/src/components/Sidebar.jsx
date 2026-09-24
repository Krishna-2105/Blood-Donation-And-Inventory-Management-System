import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { role, hasBloodBank } = useAuth();

    return (
        <div className="sidebar">
            <div className="sidebar__brand">BDMS</div>

            <NavLink to="/dashboard/notifications" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Notifications
            </NavLink>

            {role !== "admin" && (
                <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    Profile
                </NavLink>
            )}

            {/* 🛡️ ADMIN */}
            {role === "admin" && (
                <>
                    <NavLink to="/dashboard/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>
                    <NavLink to="/dashboard/admin/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Profile</NavLink>
                    <NavLink to="/dashboard/admin/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Users</NavLink>
                    <NavLink to="/dashboard/admin/donations" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Donations</NavLink>
                    <NavLink to="/dashboard/admin/requests" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Requests</NavLink>
                    <NavLink to="/dashboard/admin/stock" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Stock</NavLink>
                    <NavLink to="/dashboard/admin/issued" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Issued</NavLink>
                    <NavLink to="/dashboard/admin/audit-logs" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Audit Logs</NavLink>
                    <NavLink to="/dashboard/admin/appointments" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Appointments</NavLink>
                </>
            )}

            {/* 🧑 DONOR */}
            {role === "donor" && (
                <>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Home</NavLink>
                    <NavLink to="/dashboard/history" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>History</NavLink>
                    <NavLink to="/dashboard/book-appointment" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Book Appointment</NavLink>
                    <NavLink to="/dashboard/my-appointments" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>My Appointments</NavLink>
                </>
            )}

            {/* 🩸 BLOOD BANK */}
            {role === "blood_bank" && (
                <>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>
                    <NavLink to="/dashboard/inventory" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Inventory</NavLink>
                    <NavLink to="/dashboard/requests" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Requests</NavLink>
                    <NavLink to="/dashboard/donations" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Donations</NavLink>
                    <NavLink to="/dashboard/add-donation" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                        Add Donation
                    </NavLink>
                    <NavLink to="/dashboard/appointments" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Appointments</NavLink>
                </>
            )}

            {/* 🏥 HOSPITAL (NO BANK) */}
            {role === "hospital" && !hasBloodBank && (
                <>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>
                    <NavLink to="/dashboard/request" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Request Blood</NavLink>
                    <NavLink to="/dashboard/my-requests" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>My Requests</NavLink>
                </>
            )}

            {/* 🏥 HOSPITAL (WITH OWNED BANK) */}
            {role === "hospital" && hasBloodBank && (
                <>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>
                    <NavLink to="/dashboard/bank/inventory" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Bank Inventory</NavLink>
                    <NavLink to="/dashboard/bank/use" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Take from Own Bank</NavLink>
                    <NavLink to="/dashboard/request" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Request Blood</NavLink>
                    <NavLink to="/dashboard/my-requests" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>My Requests</NavLink>
                </>
            )}
        </div>
    );
}

export default Sidebar;
