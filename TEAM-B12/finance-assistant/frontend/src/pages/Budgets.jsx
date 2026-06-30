import { useEffect, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import BudgetCard from "../components/BudgetCard.jsx";
import { monthName } from "../utils/format.js";

const now = new Date();

export default function Budgets() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "", limit: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get("/budgets", { params: { month, year } });
    setBudgets(res.data.budgets);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    api.get("/categories", { params: { type: "expense" } }).then((res) => setCategories(res.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const usedCategoryIds = new Set(budgets.map((b) => b.category._id));
  const availableCategories = categories.filter((c) => !usedCategoryIds.has(c._id));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/budgets", { category: form.category, limit: parseFloat(form.limit), month, year });
      setForm({ category: "", limit: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create this budget.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this budget?")) return;
    await api.delete(`/budgets/${id}`);
    load();
  };

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Monthly limits</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Budgets</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="btn-secondary px-3 py-1.5">&larr;</button>
          <span className="num min-w-[140px] text-center text-sm font-medium text-ink">
            {monthName(month)} {year}
          </span>
          <button onClick={() => changeMonth(1)} className="btn-secondary px-3 py-1.5">&rarr;</button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary" disabled={availableCategories.length === 0}>
          <Plus size={16} /> Set a budget
        </button>
      </div>

      {loading ? (
        <p className="eyebrow">Loading budgets…</p>
      ) : budgets.length === 0 ? (
        <div className="receipt-card px-5 py-12 text-center">
          <p className="text-sm text-inkSoft">No budgets set for {monthName(month)} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard key={b._id} budget={b} currency={currency} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 px-4">
          <div className="receipt-card w-full max-w-sm px-6 py-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Set a budget</h2>
              <button onClick={() => setShowForm(false)} className="text-inkSoft hover:text-ink"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {error && <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}
              <div>
                <label className="field-label">Category</label>
                <select
                  required
                  className="field-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Monthly limit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="field-input num"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
