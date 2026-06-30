import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import { formatMoney, formatDate, monthName } from "../utils/format.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load your dashboard. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="eyebrow">Tallying your ledger…</p>;
  }

  if (error) {
    return <p className="rounded-md bg-rust/10 px-4 py-3 text-sm text-rust">{error}</p>;
  }

  const currency = user?.currency || "USD";
  const { totals, categoryBreakdown, trend, recentTransactions, month, year } = data;
  const hasBreakdown = categoryBreakdown.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">{monthName(month)} {year}</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Income this month" amount={totals.income} currency={currency} tone="forest" icon={TrendingUp} />
        <StatCard label="Expenses this month" amount={totals.expense} currency={currency} tone="rust" icon={TrendingDown} />
        <StatCard label="Balance" amount={totals.balance} currency={currency} tone="ink" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="receipt-card col-span-2 px-5 py-5">
          <p className="eyebrow mb-4">Income vs. expenses, last 6 months</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B23A48" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#B23A48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(31,36,33,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#4A4F4A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#4A4F4A" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(value) => formatMoney(value, currency)}
                contentStyle={{ borderRadius: 8, border: "1px solid rgba(31,36,33,0.1)", fontSize: 13 }}
              />
              <Area type="monotone" dataKey="income" stroke="#2D6A4F" strokeWidth={2} fill="url(#incomeFill)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#B23A48" strokeWidth={2} fill="url(#expenseFill)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="receipt-card px-5 py-5">
          <p className="eyebrow mb-4">Where it went</p>
          {hasBreakdown ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value, currency)} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 space-y-2">
                {categoryBreakdown.slice(0, 5).map((c) => (
                  <li key={c.categoryId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="num text-inkSoft">{formatMoney(c.total, currency)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-inkSoft">
              No expenses logged this month yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="receipt-card px-5 py-5">
        <p className="eyebrow mb-4">Recent activity</p>
        {recentTransactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-inkSoft">
            Nothing logged yet — add your first transaction to see it here.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {recentTransactions.map((t) => (
              <li key={t._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CategoryBadge category={t.category} />
                  <div>
                    <p className="text-sm font-medium text-ink">{t.description || t.category?.name}</p>
                    <p className="text-xs text-inkSoft">{formatDate(t.date)}</p>
                  </div>
                </div>
                <span className={`num text-sm font-semibold ${t.type === "income" ? "text-forest" : "text-rust"}`}>
                  {t.type === "income" ? "+" : "-"}{formatMoney(t.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
