import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar"
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div style={{ padding: "20px" }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;