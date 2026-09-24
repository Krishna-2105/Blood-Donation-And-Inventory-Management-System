import { useAuth } from "../context/AuthContext";
import Button from "../ui/Button";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { logout } = useAuth();

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 800 }}>BDMS</div>
        <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>Central Blood Management</div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <NotificationBell />
        <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>Home</Button>
        <Button variant="danger" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}

export default Navbar;
