import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout } = useAuth();

  return (
    <div style={{
      height: "60px",
      background: "#eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px"
    }}>
      <h3>BDMS</h3>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;