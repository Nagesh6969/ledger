import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount,   setUnreadCount]     = useState(0);
  const [loaded,        setLoaded]          = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // fail silently — user might not be logged in yet
    } finally {
      setLoaded(true);
    }
  }, []);

  // Initial fetch + poll every 30 s
  useEffect(() => {
    const token = localStorage.getItem("financeAssistantToken");
    if (!token) return;
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markOneRead = useCallback(async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteOne = useCallback(async (id) => {
    const n = notifications.find((x) => x._id === id);
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((x) => x._id !== id));
    if (n && !n.read) setUnreadCount((c) => Math.max(0, c - 1));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await api.delete("/notifications");
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Called after alert-trigger endpoint fires, to append new notifications
  const addNotifications = useCallback((newOnes) => {
    setNotifications((prev) => [...newOnes, ...prev]);
    setUnreadCount((c) => c + newOnes.length);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loaded, refresh, markOneRead, markAllRead, deleteOne, clearAll, addNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
