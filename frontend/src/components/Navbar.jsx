import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../ui/Button";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("bdms-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("bdms-theme", theme);
  }, [theme]);

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 800 }}>BDMS</div>
        <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>Central Blood Management</div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          className="theme-toggle"
          aria-label="Toggle color mode"
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <NotificationBell />
        <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>Home</Button>
        <Button variant="danger" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}

export default Navbar;
