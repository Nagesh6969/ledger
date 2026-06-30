import { useEffect, useState } from "react";
import { X } from "lucide-react";

const TODAY = new Date().toISOString().slice(0, 10);

export default function TransactionForm({ categories, initial, onSubmit, onClose }) {
  const [form, setForm] = useState(
    initial
      ? {
          type: initial.type,
          category: initial.category?._id || initial.category,
          amount: initial.amount,
          description: initial.description || "",
          date: new Date(initial.date).toISOString().slice(0, 10),
          paymentMethod: initial.paymentMethod || "card",
        }
      : { type: "expense", category: "", amount: "", description: "", date: TODAY, paymentMethod: "card" }
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  // If switching transaction type, reset category if it no longer matches
  useEffect(() => {
    if (form.category && !filteredCategories.some((c) => c._id === form.category)) {
      setForm((f) => ({ ...f, category: "" }));
    }
  }, [form.type]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.category) {
      setError("Pick a category");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: parseFloat(form.amount) });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save this transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 px-4">
      <div className="receipt-card w-full max-w-md px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            {initial ? "Edit transaction" : "Add transaction"}
          </h2>
          <button onClick={onClose} className="text-inkSoft hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}

          <div className="grid grid-cols-2 gap-2">
            {["expense", "income"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  form.type === t
                    ? t === "income"
                      ? "border-forest bg-forest/10 text-forest"
                      : "border-rust bg-rust/10 text-rust"
                    : "border-ink/15 text-inkSoft hover:bg-paperDark"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="field-label">Category</label>
            <select
              className="field-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select a category</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="field-input num"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Date</label>
              <input
                type="date"
                required
                className="field-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Description (optional)</label>
            <input
              className="field-input"
              placeholder="e.g. Weekly groceries"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Payment method</label>
            <select
              className="field-input"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? "Saving…" : initial ? "Save changes" : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
