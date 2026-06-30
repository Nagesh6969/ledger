import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import { formatMoney, formatDate } from "../utils/format.js";

export default function Transactions() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", category: "", search: "" });
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;

    const res = await api.get("/transactions", { params });
    setTransactions(res.data.transactions);
    setPagination(res.data.pagination);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCreate = async (values) => {
    await api.post("/transactions", values);
    setShowForm(false);
    loadTransactions();
  };

  const handleUpdate = async (values) => {
    await api.put(`/transactions/${editing._id}`, values);
    setEditing(null);
    loadTransactions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction? This can't be undone.")) return;
    await api.delete(`/transactions/${id}`);
    loadTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">All entries</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Transactions</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Add transaction
        </button>
      </div>

      {/* Filters */}
      <div className="receipt-card flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft/60" />
          <input
            className="field-input pl-9"
            placeholder="Search description…"
            value={filters.search}
            onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }}
          />
        </div>
        <select
          className="field-input w-auto"
          value={filters.type}
          onChange={(e) => { setPage(1); setFilters({ ...filters, type: e.target.value }); }}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          className="field-input w-auto"
          value={filters.category}
          onChange={(e) => { setPage(1); setFilters({ ...filters, category: e.target.value }); }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="receipt-card overflow-hidden">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-inkSoft">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-inkSoft">
            No transactions match these filters yet.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {transactions.map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryBadge category={t.category} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {t.description || t.category?.name}
                    </p>
                    <p className="text-xs text-inkSoft">{formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`num text-sm font-semibold ${t.type === "income" ? "text-forest" : "text-rust"}`}>
                    {t.type === "income" ? "+" : "-"}{formatMoney(t.amount, currency)}
                  </span>
                  <button onClick={() => setEditing(t)} className="text-inkSoft hover:text-forest" aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="text-inkSoft hover:text-rust" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-inkSoft">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <TransactionForm categories={categories} onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <TransactionForm
          categories={categories}
          initial={editing}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
