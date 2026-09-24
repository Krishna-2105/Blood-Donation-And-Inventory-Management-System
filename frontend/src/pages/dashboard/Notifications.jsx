import { useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "../../api/notificationApi";
import { useNotification } from "../../context/NotificationContext";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { formatDate } from "../../utils/formatDate";

const typeColors = {
  REQUEST: { bg: "#ebf8ff", color: "#2b6cb0" },
  DONATION: { bg: "#f0fff4", color: "#276749" },
  APPOINTMENT: { bg: "#faf5ff", color: "#6b46c1" },
  INVENTORY: { bg: "#fff5f5", color: "#c53030" },
  SYSTEM: { bg: "#f7fafc", color: "#4a5568" },
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshUnreadCount } = useNotification();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.data || []);
      refreshUnreadCount();
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
      );
      refreshUnreadCount();
    } catch {
      //
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      refreshUnreadCount();
    } catch {
      //
    }
  };

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState text="No notifications yet" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n) => {
            const colors = typeColors[n.type] || typeColors.SYSTEM;
            return (
              <Card
                key={n.notification_id}
                style={{
                  opacity: n.is_read ? 0.7 : 1,
                  cursor: "pointer",
                  borderLeft: `4px solid ${colors.color}`,
                }}
                onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          background: colors.bg,
                          color: colors.color,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {n.type}
                      </span>
                      {!n.is_read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--color-primary, #3182ce)",
                            display: "inline-block",
                          }}
                        />
                      )}
                      <strong style={{ fontSize: 14 }}>{n.title}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--color-muted)" }}>
                      {n.message}
                    </p>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {formatDate(n.created_at)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
