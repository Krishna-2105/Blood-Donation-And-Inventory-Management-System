import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

function NotificationBell() {
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  return (
    <div
      style={{ position: "relative", cursor: "pointer" }}
      onClick={() => navigate("/dashboard/notifications")}
      title="Notifications"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -8,
            background: "var(--color-danger, #e53e3e)",
            color: "#fff",
            borderRadius: "50%",
            width: 18,
            height: 18,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}

export default NotificationBell;
