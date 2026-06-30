import { useEffect, useState, useCallback } from "react";
import {
  Bell, BellOff, Plus, Trash2, X, CheckCheck,
  TrendingUp, TrendingDown, RefreshCw,
} from "lucide-react";
import api from "../api/axios.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import { formatMoney } from "../utils/format.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const POPULAR_CRYPTO = [
  { symbol: "BTC",  name: "Bitcoin",   coinGeckoId: "bitcoin",    type: "crypto" },
  { symbol: "ETH",  name: "Ethereum",  coinGeckoId: "ethereum",   type: "crypto" },
  { symbol: "SOL",  name: "Solana",    coinGeckoId: "solana",     type: "crypto" },
  { symbol: "BNB",  name: "BNB",       coinGeckoId: "binancecoin",type: "crypto" },
  { symbol: "ADA",  name: "Cardano",   coinGeckoId: "cardano",    type: "crypto" },
  { symbol: "DOGE", name: "Dogecoin",  coinGeckoId: "dogecoin",   type: "crypto" },
];

const POPULAR_STOCKS = [
  { symbol: "AAPL",  name: "Apple Inc.",       type: "stock" },
  { symbol: "MSFT",  name: "Microsoft Corp.",  type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.",    type: "stock" },
  { symbol: "TSLA",  name: "Tesla Inc.",       type: "stock" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",     type: "stock" },
  { symbol: "AMZN",  name: "Amazon.com Inc.",  type: "stock" },
];

const BLANK = { assetType: "crypto", symbol: "", assetName: "", targetPrice: "", alertType: "price_above", coinGeckoId: "" };

const NOTIF_COLORS = {
  alert:   { bg: "bg-gold/15",    text: "text-gold-dark",    dot: "bg-gold" },
  budget:  { bg: "bg-rust/10",    text: "text-rust",         dot: "bg-rust" },
  warning: { bg: "bg-rust/10",    text: "text-rust",         dot: "bg-rust" },
  info:    { bg: "bg-forest/10",  text: "text-forest-light", dot: "bg-forest-light" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function AlertRow({ alert, onToggle, onDelete }) {
  const isAbove = alert.type === "price_above";
  return (
    <li className="flex items-start gap-3 rounded-lg border border-ink/8 bg-white px-4 py-3">
      <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
        alert.triggered ? "bg-ink/8 text-inkSoft" : isAbove ? "bg-forest/10 text-forest-light" : "bg-rust/10 text-rust"
      }`}>
        {isAbove ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-ink">{alert.symbol}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            alert.assetType === "crypto" ? "bg-gold/15 text-gold-dark" : "bg-forest/10 text-forest-light"
          }`}>
            {alert.assetType.toUpperCase()}
          </span>
          {alert.triggered && (
            <span className="rounded-full bg-ink/8 px-2 py-0.5 text-[10px] font-semibold text-inkSoft">
              TRIGGERED
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-inkSoft">
          Alert when price {isAbove ? "rises above" : "falls below"}{" "}
          <span className="num font-semibold text-ink">${Number(alert.targetPrice).toLocaleString()}</span>
        </p>
        {alert.triggeredAt && (
          <p className="num mt-0.5 text-[11px] text-inkSoft/60">
            Triggered {new Date(alert.triggeredAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onToggle(alert._id, !alert.active)}
          title={alert.active ? "Pause alert" : "Activate alert"}
          className={`rounded-md p-1.5 transition-colors ${
            alert.active
              ? "text-forest-light hover:bg-forest/10"
              : "text-inkSoft hover:bg-ink/8"
          }`}
        >
          {alert.active ? <Bell size={14} /> : <BellOff size={14} />}
        </button>
        <button
          onClick={() => onDelete(alert._id)}
          className="rounded-md p-1.5 text-inkSoft hover:bg-rust/10 hover:text-rust"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}

function NotificationItem({ n, onRead, onDelete }) {
  const color = NOTIF_COLORS[n.type] || NOTIF_COLORS.info;
  return (
    <li
      onClick={() => !n.read && onRead(n._id)}
      className={`group flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
        n.read ? "border-ink/6 bg-white" : "border-forest/20 bg-forest/4"
      }`}
    >
      <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${n.read ? "bg-ink/15" : color.dot}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${color.text}`}>{n.title}</p>
        <p className="mt-0.5 text-xs text-inkSoft leading-relaxed">{n.message}</p>
        <p className="mt-1 text-[10px] text-inkSoft/50">
          {new Date(n.createdAt).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
        className="invisible mt-0.5 flex-shrink-0 text-inkSoft/40 hover:text-rust group-hover:visible"
      >
        <Trash2 size={13} />
      </button>
    </li>
  );
}

// ── Alert creation form ───────────────────────────────────────────────────────

function AlertForm({ onSave, onCancel, saving, error }) {
  const [form,   setForm]   = useState(BLANK);
  const [assetTab, setAssetTab] = useState("crypto");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const prefill = (asset) => {
    setForm((f) => ({
      ...f,
      symbol:      asset.symbol,
      assetName:   asset.name,
      assetType:   asset.type,
      coinGeckoId: asset.coinGeckoId || "",
    }));
  };

  const handleAssetTab = (t) => {
    setAssetTab(t);
    set("assetType", t);
    set("symbol", "");
    set("assetName", "");
    set("coinGeckoId", "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, type: form.alertType });
  };

  const popular = assetTab === "crypto" ? POPULAR_CRYPTO : POPULAR_STOCKS;

  return (
    <form onSubmit={handleSubmit} className="receipt-card px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink">New Price Alert</p>
        <button type="button" onClick={onCancel}><X size={18} className="text-inkSoft hover:text-ink" /></button>
      </div>

      {/* Asset type */}
      <div className="flex gap-2">
        {["crypto", "stock"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleAssetTab(t)}
            className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${
              assetTab === t ? "border-forest bg-forest text-paper" : "border-ink/15 text-inkSoft hover:border-ink/30"
            }`}
          >
            {t === "crypto" ? "Crypto" : "Stock / ETF"}
          </button>
        ))}
      </div>

      {/* Quick-pick chips */}
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
            value={form.assetName}
            onChange={(e) => set("assetName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">Alert Direction</label>
          <select
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
            value={form.alertType}
            onChange={(e) => set("alertType", e.target.value)}
          >
            <option value="price_above">Price rises above</option>
            <option value="price_below">Price falls below</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-inkSoft mb-1">Target Price ($)</label>
          <input
            type="number"
            step="any"
            min="0"
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
            placeholder="70000"
            value={form.targetPrice}
            onChange={(e) => set("targetPrice", e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-rust/10 px-3 py-2 text-xs text-rust">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? "Creating…" : "Create Alert"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4">Cancel</button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Alerts() {
  const { notifications, unreadCount, markOneRead, markAllRead, deleteOne, clearAll, refresh } =
    useNotifications();

  const [tab,       setTab]       = useState("alerts");
  const [alerts,    setAlerts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState("");

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/alerts");
      setAlerts(res.data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleCreate = async (form) => {
    setSaving(true);
    setFormError("");
    try {
      await api.post("/alerts", form);
      setShowForm(false);
      loadAlerts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't create alert.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, active) => {
    await api.put(`/alerts/${id}`, { active });
    setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, active } : a));
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    await api.delete(`/alerts/${id}`);
    setAlerts((prev) => prev.filter((a) => a._id !== id));
  };

  const activeAlerts    = alerts.filter((a) => a.active && !a.triggered);
  const inactiveAlerts  = alerts.filter((a) => !a.active || a.triggered);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Watchlist & history</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Alerts</h1>
        </div>
        {tab === "alerts" && (
          <button onClick={() => { setShowForm(true); setFormError(""); }} className="btn-primary">
            <Plus size={15} /> New Alert
          </button>
        )}
        {tab === "notifications" && notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 py-2 text-sm">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button onClick={clearAll} className="btn-secondary flex items-center gap-2 py-2 text-sm text-rust hover:border-rust/30">
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-ink/10 bg-paperDark/40 p-1 w-fit">
        {[
          { key: "alerts",        label: "Price Alerts" },
          { key: "notifications", label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-ink shadow-sm" : "text-inkSoft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Alerts tab ──────────────────────────────────────────── */}
      {tab === "alerts" && (
        <div className="space-y-6">
          {showForm && (
            <AlertForm
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              saving={saving}
              error={formError}
            />
          )}

          {loading ? (
            <p className="eyebrow">Loading alerts…</p>
          ) : alerts.length === 0 && !showForm ? (
            <div className="receipt-card px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                <Bell size={26} className="text-gold" />
              </div>
              <p className="font-semibold text-ink">No alerts set</p>
              <p className="mt-1 text-sm text-inkSoft">
                Create a price alert and we'll notify you when an asset hits your target.
              </p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-5 mx-auto">
                <Plus size={15} /> Create First Alert
              </button>
            </div>
          ) : (
            <>
              {activeAlerts.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">Active ({activeAlerts.length})</p>
                  <ul className="space-y-2">
                    {activeAlerts.map((a) => (
                      <AlertRow key={a._id} alert={a} onToggle={handleToggle} onDelete={handleDeleteAlert} />
                    ))}
                  </ul>
                </div>
              )}

              {inactiveAlerts.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">Paused / Triggered ({inactiveAlerts.length})</p>
                  <ul className="space-y-2 opacity-70">
                    {inactiveAlerts.map((a) => (
                      <AlertRow key={a._id} alert={a} onToggle={handleToggle} onDelete={handleDeleteAlert} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Notifications tab ────────────────────────────────────── */}
      {tab === "notifications" && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="receipt-card px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
                <Bell size={26} className="text-forest-light" />
              </div>
              <p className="font-semibold text-ink">No notifications yet</p>
              <p className="mt-1 text-sm text-inkSoft">
                Notifications appear here when price alerts fire.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  n={n}
                  onRead={markOneRead}
                  onDelete={deleteOne}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
