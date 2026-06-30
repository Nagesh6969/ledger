import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatMoney } from "../utils/format.js";

export default function Reports() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="eyebrow">Building your report…</p>;
  if (!data) return null;

  const { trend, categoryBreakdown, totals } = data;
  const totalExpense = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const savingsRate = totals.income > 0 ? Math.round((totals.balance / totals.income) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Trends &amp; breakdowns</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="receipt-card px-5 py-5">
          <p className="eyebrow">Savings rate</p>
          <p className={`num mt-2 text-2xl font-semibold ${savingsRate >= 0 ? "text-forest" : "text-rust"}`}>
            {savingsRate}%
          </p>
          <p className="mt-1 text-xs text-inkSoft">of income kept this month</p>
        </div>
        <div className="receipt-card px-5 py-5">
          <p className="eyebrow">Avg. monthly income (6mo)</p>
          <p className="num mt-2 text-2xl font-semibold text-ink">
            {formatMoney(trend.reduce((s, t) => s + t.income, 0) / trend.length, currency)}
          </p>
        </div>
        <div className="receipt-card px-5 py-5">
          <p className="eyebrow">Avg. monthly expense (6mo)</p>
          <p className="num mt-2 text-2xl font-semibold text-ink">
            {formatMoney(trend.reduce((s, t) => s + t.expense, 0) / trend.length, currency)}
          </p>
        </div>
      </div>

      <div className="receipt-card px-5 py-5">
        <p className="eyebrow mb-4">Monthly comparison</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={trend} barGap={6}>
            <CartesianGrid stroke="rgba(31,36,33,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#4A4F4A" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#4A4F4A" }} axisLine={false} tickLine={false} width={50} />
            <Tooltip
              formatter={(value) => formatMoney(value, currency)}
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(31,36,33,0.1)", fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" fill="#2D6A4F" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#B23A48" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="receipt-card px-5 py-5">
        <p className="eyebrow mb-4">Expense breakdown this month</p>
        {categoryBreakdown.length === 0 ? (
          <p className="py-6 text-center text-sm text-inkSoft">No expenses logged yet this month.</p>
        ) : (
          <ul className="space-y-3">
            {categoryBreakdown.map((c) => {
              const pct = totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0;
              return (
                <li key={c.categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="num text-inkSoft">{formatMoney(c.total, currency)} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-paperDark">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
