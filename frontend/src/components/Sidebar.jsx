import { NavLink } from "react-router-dom"

const menuConfig = {
    DNR: [
        { name: "Dashboard", path: "/dashboard/donor" },
        { name: "My Profile", path: "/dashboard/donor/profile" },
        { name: "Donation History", path: "/dashboard/donor/history" },
        { name: "Eligibility", path: "/dashboard/donor/eligibility" }
    ],
    HSP: [
        { name: "Dashboard", path: "/dashboard/hospital" },
        { name: "Request Blood", path: "/dashboard/hospital/request" },
        { name: "My Requests", path: "/dashboard/hospital/requests" },
        { name: "Find Blood Banks", path: "/dashboard/hospital/banks" }
    ],
    BB: [
        { name: "Dashboard", path: "/dashboard/bloodbank" },
        { name: "Inventory", path: "/dashboard/bloodbank/inventory" },
        { name: "Requests", path: "/dashboard/bloodbank/requests" }
    ],
    ADM: [
        { name: "Dashboard", path: "/dashboard/admin" },
        { name: "Manage Users", path: "/dashboard/admin/users" },
        { name: "Reports", path: "/dashboard/admin/reports" }
    ]
}

function Sidebar() {
    const role = localStorage.getItem("role")
    const menuItems = menuConfig[role] || []

    return (
        <div className="sidebar">
            <h2 className="logo">🩸 BloodBridge</h2>

            <div className="menu">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? "menu-item active" : "menu-item"
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>
        </div>
    )
}

export default Sidebar