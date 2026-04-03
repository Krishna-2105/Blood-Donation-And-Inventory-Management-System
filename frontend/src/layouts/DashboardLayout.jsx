import Sidebar from "../components/Navbar"
import Navbar from "../components/Sidebar"

function DashboardLayout({ children }) {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />

            <div style={{ flex: 1 }}>
                <Navbar />
                <div style={{ padding: "20px" }}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout