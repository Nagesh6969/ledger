import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-forest text-paper">
            <BookOpen size={20} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">Open your ledger</h1>
          <p className="text-sm text-inkSoft">Create a free account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="receipt-card space-y-4 px-6 py-7">
          {error && (
            <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
          )}
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input
              id="name"
              required
              className="field-input"
              placeholder="Jordan Lee"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="field-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="field-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-inkSoft">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-forest hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
