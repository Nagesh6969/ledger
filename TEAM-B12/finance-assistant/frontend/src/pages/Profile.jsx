import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    currency: user?.currency || "USD",
    monthlyIncomeGoal: user?.monthlyIncomeGoal || 0,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", type: "expense", color: "#1B4332" });
  const [catError, setCatError] = useState("");

  const loadCategories = () => api.get("/categories").then((res) => setCategories(res.data));

  useEffect(() => { loadCategories(); }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const res = await api.put("/auth/me", form);
      updateUser(res.data.user);
      setProfileMsg("Saved.");
    } catch {
      setProfileMsg("Couldn't save changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCatError("");
    try {
      await api.post("/categories", newCategory);
      setNewCategory({ name: "", type: "expense", color: "#1B4332" });
      loadCategories();
    } catch (err) {
      setCatError(err.response?.data?.message || "Couldn't add this category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't delete this category.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Profile</h1>
      </div>

      <form onSubmit={handleProfileSave} className="receipt-card max-w-lg space-y-4 px-6 py-6">
        <h2 className="font-display text-lg font-semibold text-ink">Your details</h2>

        <div>
          <label className="field-label">Name</label>
          <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Currency</label>
            <select
              className="field-input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Monthly income goal</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="field-input num"
              value={form.monthlyIncomeGoal}
              onChange={(e) => setForm({ ...form, monthlyIncomeGoal: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
          {profileMsg && <span className="text-sm text-inkSoft">{profileMsg}</span>}
        </div>
      </form>

      <div className="receipt-card max-w-lg space-y-5 px-6 py-6">
        <h2 className="font-display text-lg font-semibold text-ink">Categories</h2>

        <form onSubmit={handleAddCategory} className="space-y-3">
          {catError && <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{catError}</p>}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <input
              required
              className="field-input"
              placeholder="New category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <select
              className="field-input w-auto"
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="color"
              className="h-[42px] w-12 cursor-pointer rounded-md border border-ink/15"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-secondary">
            <Plus size={15} /> Add category
          </button>
        </form>

        <ul className="divide-y divide-ink/8">
          {categories.map((c) => (
            <li key={c._id} className="flex items-center justify-between py-2.5">
              <span className="tag-pill" style={{ backgroundColor: `${c.color}1A`, color: c.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
                <span className="text-inkSoft/60">· {c.type}</span>
              </span>
              <button onClick={() => handleDeleteCategory(c._id)} className="text-inkSoft hover:text-rust" aria-label="Delete category">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
