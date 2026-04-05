import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout } = useAuth();

  return (
    <div style={{
      height: "60px",
      background: "white",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px"
    }}>
      <h3>Dashboard</h3>

      <button
        onClick={logout}
        style={{
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          background: "#ef4444",
          color: "white",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;