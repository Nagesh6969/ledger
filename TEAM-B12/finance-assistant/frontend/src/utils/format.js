const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

export function formatMoney(amount, currency = "USD") {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + " ";
  const value = Number(amount || 0);
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "-" : ""}${symbol}${formatted}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthName(month) {
  return new Date(2000, month - 1, 1).toLocaleString("en-US", { month: "long" });
}
