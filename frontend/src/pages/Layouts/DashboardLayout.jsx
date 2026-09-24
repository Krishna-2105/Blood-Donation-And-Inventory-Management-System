import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          <div className="container">
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ marginBottom: 4 }}>Welcome to BDMS</h2>
              <div className="muted">Manage donations, stock, requests and users centrally</div>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
