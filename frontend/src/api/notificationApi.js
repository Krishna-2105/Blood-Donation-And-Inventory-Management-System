import API from "./axios";

export const getNotifications = async (limit = 50, offset = 0) => {
  const res = await API.get(`/notifications?limit=${limit}&offset=${offset}`);
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await API.get("/notifications/unread-count");
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await API.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await API.patch("/notifications/read-all");
  return res.data;
};
