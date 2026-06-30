import { formatMoney } from "../utils/format.js";

export default function BudgetCard({ budget, currency, onDelete }) {
  const pct = Math.min(budget.percentUsed, 100);
  const over = budget.spent > budget.limit;

  return (
    <div className="receipt-card px-5 py-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="tag-pill" style={{ backgroundColor: `${budget.category.color}1A`, color: budget.category.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: budget.category.color }} />
          {budget.category.name}
        </span>
        <button onClick={() => onDelete(budget._id)} className="text-xs font-medium text-inkSoft hover:text-rust">
          Remove
        </button>
      </div>

      <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-paperDark">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-rust" : "bg-forest"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between">
        <p className="num text-sm">
          <span className={`font-semibold ${over ? "text-rust" : "text-ink"}`}>
            {formatMoney(budget.spent, currency)}
          </span>
          <span className="text-inkSoft"> / {formatMoney(budget.limit, currency)}</span>
        </p>
        <p className={`num text-xs font-medium ${over ? "text-rust" : "text-inkSoft"}`}>
          {over ? `${formatMoney(Math.abs(budget.remaining), currency)} over` : `${formatMoney(budget.remaining, currency)} left`}
        </p>
      </div>
    </div>
  );
}
