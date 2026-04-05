import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <Navbar />

        <div style={{
          padding: "24px",
          overflowY: "auto"
        }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;