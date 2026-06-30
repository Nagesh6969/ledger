import { formatMoney } from "../utils/format.js";

export default function StatCard({ label, amount, currency, tone = "ink", icon: Icon }) {
  const toneClasses = {
    ink: "text-ink",
    forest: "text-forest",
    rust: "text-rust",
  };

  return (
    <div className="receipt-card px-5 py-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        {Icon && <Icon size={16} className="text-inkSoft/50" />}
      </div>
      <p className={`num mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>
        {formatMoney(amount, currency)}
      </p>
    </div>
  );
}
