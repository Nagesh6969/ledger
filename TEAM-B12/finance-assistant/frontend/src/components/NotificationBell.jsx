import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "../context/NotificationContext.jsx";

const TYPE_COLORS = {
  alert:   "bg-gold/20 text-gold-dark",
  budget:  "bg-rust/15 text-rust",
  warning: "bg-rust/15 text-rust",
  info:    "bg-forest/10 text-forest-light",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markOneRead, markAllRead, deleteOne } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkOne = async (id) => {
    try { await markOneRead(id); } catch {}
  };

  const handleMarkAll = async () => {
    try { await markAllRead(); } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try { await deleteOne(id); } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-inkSoft transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-ink/10 bg-white shadow-receipt">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-forest-light hover:underline"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-ink/6">
            {notifications.length === 0 ? (
              <li className="py-8 text-center text-sm text-inkSoft">
                No notifications yet
              </li>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <li
                  key={n._id}
                  onClick={() => !n.read && handleMarkOne(n._id)}
                  className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-paperDark/60 ${
                    !n.read ? "bg-forest/4" : ""
                  }`}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-forest" />
                  )}
                  {n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0" />}

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        TYPE_COLORS[n.type] ?? TYPE_COLORS.info
                      } inline-block rounded px-1.5 py-0.5 mb-0.5`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-inkSoft leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-inkSoft/60">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    className="invisible mt-0.5 flex-shrink-0 text-inkSoft/40 hover:text-rust group-hover:visible"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))
            )}
          </ul>

          {notifications.length > 0 && (
            <div className="border-t border-ink/8 px-4 py-2 text-center">
              <a href="/alerts" className="text-xs font-medium text-forest-light hover:underline">
                View all in Alerts page →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
