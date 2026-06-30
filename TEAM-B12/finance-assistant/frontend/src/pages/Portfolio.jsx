import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Plus, RefreshCw,
  Edit3, Trash2, X, DollarSign, Bitcoin, BarChart2,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { formatMoney } from "../utils/format.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(n) {
  if (n == null) return "–";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmt(n, decimals = 2) {
  if (n == null) return "–";
  return `$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

// ── Popular asset suggestions ─────────────────────────────────────────────────

const POPULAR_CRYPTO = [
  { symbol: "BTC",  name: "Bitcoin",   coinGeckoId: "bitcoin" },
  { symbol: "ETH",  name: "Ethereum",  coinGeckoId: "ethereum" },
  { symbol: "SOL",  name: "Solana",    coinGeckoId: "solana" },
  { symbol: "BNB",  name: "BNB",       coinGeckoId: "binancecoin" },
  { symbol: "ADA",  name: "Cardano",   coinGeckoId: "cardano" },
  { symbol: "DOGE", name: "Dogecoin",  coinGeckoId: "dogecoin" },
];

const POPULAR_STOCKS = [
  { symbol: "AAPL",  name: "Apple Inc." },
  { symbol: "MSFT",  name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN",  name: "Amazon.com Inc." },
  { symbol: "TSLA",  name: "Tesla Inc." },
  { symbol: "NVDA",  name: "NVIDIA Corp." },
];

const BLANK_FORM = { symbol: "", name: "", type: "crypto", quantity: "", avgBuyPrice: "", coinGeckoId: "" };

// ── Summary stat card ─────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, positive, neutral }) {
  const color = neutral ? "text-ink" : positive ? "text-forest-light" : "text-rust";
  return (
    <div className="receipt-card px-5 py-4">
      <p className="eyebrow mb-1">{label}</p>
      <p className={`num text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className={`num mt-0.5 text-sm ${color}`}>{sub}</p>}
    </div>
  );
}

// ── Add / Edit form ───────────────────────────────────────────────────────────

function HoldingForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial || BLANK_FORM);
  const [tab,  setTab]  = useState(initial?.type || "crypto");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const prefill = (asset) => {
    setForm((f) => ({
      ...f,
      symbol:      asset.symbol,
      name:        asset.name,
      coinGeckoId: asset.coinGeckoId || "",
    }));
  };

  const handleTypeTab = (t) => {
    setTab(t);
    set("type", t);
    set("symbol", "");
    set("name", "");
    set("coinGeckoId", "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, type: tab });
  };

  const popular = tab === "crypto" ? POPULAR_CRYPTO : POPULAR_STOCKS;

  return (
    <form onSubmit={handleSubmit} className="receipt-card px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink">{initial ? "Edit Holding" : "Add Holding"}</p>
        <button type="button" onClick={onCancel} className="text-inkSoft hover:text-ink"><X size={18} /></button>
      </div>

      {/* Asset type tabs */}
      {!initial && (
        <div className="flex gap-2">
          {["crypto", "stock"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeTab(t)}
              className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-forest bg-forest text-paper"
                  : "border-ink/15 text-inkSoft hover:border-ink/30"
              }`}
            >
              {t === "crypto" ? "Crypto" : "Stock / ETF"}
            </button>
          ))}
        </div>
      )}

      {/* Quick-pick chips */}
      {!initial && (
        <div>
          <p className="eyebrow mb-2">Quick pick</p>
          <div className="flex flex-wrap gap-2">
            {popular.map((a) => (
              <button
                key={a.symbol}
                type="button"
                onClick={() => prefill(a)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  form.symbol === a.symbol
                    ? "border-forest bg-forest text-paper"
                    : "border-ink/15 text-inkSoft hover:border-ink/30 hover:text-ink"
                }`}
              >
                {a.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">Symbol</label>
          <input
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm uppercase focus:border-forest focus:outline-none"
            placeholder="BTC"
            value={form.symbol}
            onChange={(e) => set("symbol", e.target.value.toUpperCase())}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">Asset Name</label>
          <input
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
            placeholder="Bitcoin"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">Quantity</label>
          <input
            type="number"
            step="any"
            min="0"
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
            placeholder="0.5"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">Avg Buy Price ($)</label>
          <input
            type="number"
            step="any"
            min="0"
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
            placeholder="45000"
            value={form.avgBuyPrice}
            onChange={(e) => set("avgBuyPrice", e.target.value)}
            required
          />
        </div>
      </div>

      {tab === "crypto" && !initial && (
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">
            CoinGecko ID <span className="text-inkSoft/60">(optional, for unlisted coins)</span>
          </label>
          <input
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
            placeholder="e.g. solana"
            value={form.coinGeckoId}
            onChange={(e) => set("coinGeckoId", e.target.value.toLowerCase())}
          />
        </div>
      )}

      {error && (
        <p className="rounded-md bg-rust/10 px-3 py-2 text-xs text-rust">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? "Saving…" : initial ? "Update" : "Add to Portfolio"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4">Cancel</button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Portfolio() {
  const { user }               = useAuth();
  const { addNotifications }   = useNotifications();
  const currency               = user?.currency || "USD";

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState("");

  // ── Fetch portfolio (includes live prices from backend) ───────────────────

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else        setRefreshing(true);
    setError("");
    try {
      const res = await api.get("/portfolio");
      setData(res.data);

      // After loading prices, check active alerts
      if (res.data.holdings?.length) {
        const prices = res.data.holdings
          .filter((h) => h.livePrice != null)
          .map((h) => ({ symbol: h.symbol, price: h.livePrice }));

        if (prices.length) {
          const trigRes = await api.post("/alerts/trigger", { prices });
          if (trigRes.data.triggered?.length) {
            addNotifications(trigRes.data.triggered.map((t) => t.notification));
          }
        }
      }
    } catch {
      setError("Couldn't load your portfolio. Try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addNotifications]);

  useEffect(() => { load(); }, [load]);

  // ── Add holding ───────────────────────────────────────────────────────────

  const handleAdd = async (form) => {
    setSaving(true);
    setFormError("");
    try {
      await api.post("/portfolio", form);
      setShowForm(false);
      load(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't add holding.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit holding ──────────────────────────────────────────────────────────

  const handleEdit = async (form) => {
    setSaving(true);
    setFormError("");
    try {
      await api.put(`/portfolio/${editItem._id}`, form);
      setEditItem(null);
      load(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't update holding.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete holding ────────────────────────────────────────────────────────

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your portfolio?`)) return;
    await api.delete(`/portfolio/${id}`);
    load(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <p className="eyebrow">Fetching live prices…</p>;

  if (error) return (
    <p className="rounded-md bg-rust/10 px-4 py-3 text-sm text-rust">{error}</p>
  );

  const { holdings, totalValue, totalCost, totalPnL, totalPnLPercent } = data;
  const hasPrices = holdings.some((h) => h.livePrice != null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Live market data</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Portfolio</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 py-2"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh Prices"}
          </button>
          <button onClick={() => { setShowForm(true); setEditItem(null); setFormError(""); }} className="btn-primary">
            <Plus size={15} /> Add Holding
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      {(showForm || editItem) && (
        <HoldingForm
          initial={editItem}
          onSave={editItem ? handleEdit : handleAdd}
          onCancel={() => { setShowForm(false); setEditItem(null); setFormError(""); }}
          saving={saving}
          error={formError}
        />
      )}

      {/* Summary cards */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard label="Portfolio Value" value={fmt(totalValue)} neutral />
          <SummaryCard label="Total Invested" value={fmt(totalCost)} neutral />
          <SummaryCard
            label="Total P&L"
            value={fmt(totalPnL)}
            sub={pct(totalPnLPercent)}
            positive={totalPnL >= 0}
          />
          <SummaryCard label="Holdings" value={holdings.length} neutral />
        </div>
      )}

      {!hasPrices && holdings.length > 0 && (
        <p className="rounded-md bg-gold/10 px-4 py-3 text-sm text-gold-dark">
          Live prices couldn't be fetched right now. Showing cost-basis values. Try refreshing.
        </p>
      )}

      {/* Holdings list */}
      {holdings.length === 0 ? (
        <div className="receipt-card px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
            <TrendingUp size={26} className="text-forest-light" />
          </div>
          <p className="font-semibold text-ink">No holdings yet</p>
          <p className="mt-1 text-sm text-inkSoft">
            Add your first crypto or stock to start tracking live performance.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-5 mx-auto"
          >
            <Plus size={15} /> Add First Holding
          </button>
        </div>
      ) : (
        <div className="receipt-card overflow-hidden">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-ink/8 px-5 py-3 sm:grid">
            {["Asset", "Price / 24h", "Holdings", "Value", "P&L", ""].map((h) => (
              <p key={h} className="eyebrow">{h}</p>
            ))}
          </div>

          {/* Rows */}
          <ul className="divide-y divide-ink/6">
            {holdings.map((h) => {
              const gain = (h.pnl ?? 0) >= 0;
              return (
                <li
                  key={h._id}
                  className="grid grid-cols-1 gap-y-1 px-5 py-4 transition-colors hover:bg-paperDark/30 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-3"
                >
                  {/* Asset */}
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      h.type === "crypto" ? "bg-gold/20 text-gold-dark" : "bg-forest/10 text-forest-light"
                    }`}>
                      {h.symbol.slice(0, 2)}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-ink">{h.symbol}</p>
                      <p className="text-xs text-inkSoft truncate max-w-[120px]">{h.liveName || h.name}</p>
                    </div>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold sm:ml-0 ${
                      h.type === "crypto" ? "bg-gold/15 text-gold-dark" : "bg-forest/10 text-forest-light"
                    }`}>
                      {h.type === "crypto" ? "CRYPTO" : "STOCK"}
                    </span>
                  </div>

                  {/* Price + 24h */}
                  <div>
                    <p className="num text-sm font-medium text-ink">{fmt(h.livePrice, h.livePrice >= 1 ? 2 : 6)}</p>
                    <p className={`num text-xs ${h.change24h >= 0 ? "text-forest-light" : "text-rust"}`}>
                      {pct(h.change24h)}
                    </p>
                  </div>

                  {/* Holdings */}
                  <div>
                    <p className="num text-sm text-ink">{h.quantity}</p>
                    <p className="num text-xs text-inkSoft">@ {fmt(h.avgBuyPrice, 2)}</p>
                  </div>

                  {/* Current Value */}
                  <p className="num text-sm font-medium text-ink">{fmt(h.currentValue ?? h.costBasis)}</p>

                  {/* P&L */}
                  <div>
                    <p className={`num text-sm font-semibold ${gain ? "text-forest-light" : "text-rust"}`}>
                      {h.pnl != null ? (gain ? "+" : "") + fmt(h.pnl) : "–"}
                    </p>
                    <p className={`num text-xs ${gain ? "text-forest-light" : "text-rust"}`}>
                      {pct(h.pnlPercent)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 sm:justify-end">
                    <button
                      onClick={() => { setEditItem(h); setShowForm(false); setFormError(""); }}
                      className="rounded-md p-1.5 text-inkSoft hover:bg-ink/8 hover:text-ink"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(h._id, h.name)}
                      className="rounded-md p-1.5 text-inkSoft hover:bg-rust/10 hover:text-rust"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-center text-xs text-inkSoft/60">
        Crypto prices via CoinGecko · Stock prices via Yahoo Finance · Refreshed on page load
      </p>
    </div>
  );
}
