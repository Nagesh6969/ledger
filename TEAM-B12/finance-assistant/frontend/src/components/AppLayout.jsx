import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  UserCircle,
  LogOut,
  BookOpen,
  TrendingUp,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

const NAV_ITEMS = [
  { to: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/budgets",      label: "Budgets",      icon: PiggyBank },
  { to: "/portfolio",    label: "Portfolio",    icon: TrendingUp },
  { to: "/alerts",       label: "Alerts",       icon: Bell },
  { to: "/reports",      label: "Reports",      icon: BarChart3 },
  { to: "/profile",      label: "Profile",      icon: UserCircle },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-ink/10 bg-paperDark/60 px-5 py-6 sm:flex">
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-forest text-paper">
              <BookOpen size={16} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">Ledger</span>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-forest text-paper"
                    : "text-inkSoft hover:bg-ink/5 hover:text-ink"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-ink/10 pt-4">
          <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
          <p className="truncate text-xs text-inkSoft">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-rust hover:underline"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-forest text-paper">
            <BookOpen size={14} />
          </span>
          <span className="font-display text-base font-semibold">Ledger</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={handleLogout} className="text-rust">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 pb-20 pt-16 sm:pb-0 sm:pt-0">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center overflow-x-auto border-t border-ink/10 bg-paper px-1 py-2 sm:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex min-w-[48px] flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium ${
                isActive ? "text-forest" : "text-inkSoft"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
