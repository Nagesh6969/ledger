/**
 * marketService.js
 * Fetches live asset prices from free public APIs.
 *   - Crypto : CoinGecko  (no API key required)
 *   - Stocks : Yahoo Finance v7 (no API key required)
 *
 * Both functions return empty objects on failure so the caller can
 * still render the portfolio with just cost-basis data.
 */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

/** Maps common ticker symbols to their CoinGecko IDs. */
export const CRYPTO_ID_MAP = {
  BTC:   "bitcoin",
  ETH:   "ethereum",
  SOL:   "solana",
  BNB:   "binancecoin",
  ADA:   "cardano",
  XRP:   "ripple",
  DOGE:  "dogecoin",
  DOT:   "polkadot",
  AVAX:  "avalanche-2",
  MATIC: "matic-network",
  LINK:  "chainlink",
  LTC:   "litecoin",
  SHIB:  "shiba-inu",
  ATOM:  "cosmos",
  NEAR:  "near",
  UNI:   "uniswap",
  USDT:  "tether",
  USDC:  "usd-coin",
};

/** Returns the CoinGecko ID for a symbol, falling back to lowercase symbol. */
export function getCoinGeckoId(symbol) {
  return CRYPTO_ID_MAP[symbol?.toUpperCase()] ?? symbol?.toLowerCase();
}

/**
 * Fetches live USD prices for a list of CoinGecko IDs.
 * @returns {Record<string, {usd: number, usd_24h_change: number}>}
 */
export async function fetchCryptoPrices(coinIds) {
  if (!coinIds?.length) return {};

  try {
    const ids = [...new Set(coinIds.filter(Boolean))].join(",");
    const url =
      `${COINGECKO_BASE}/simple/price?ids=${ids}` +
      `&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.warn(`[CoinGecko] HTTP ${res.status}`);
      return {};
    }
    return await res.json();
  } catch (err) {
    console.error("[CoinGecko] fetch error:", err.message);
    return {};
  }
}

/**
 * Fetches live prices for stock symbols via Yahoo Finance.
 * @returns {Record<string, {price: number, change: number, changePercent: number, name: string}>}
 */
export async function fetchStockPrices(symbols) {
  if (!symbols?.length) return {};

  try {
    const unique = [...new Set(symbols.filter(Boolean))].join(",");
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${unique}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.warn(`[Yahoo Finance] HTTP ${res.status}`);
      return {};
    }

    const data = await res.json();
    const quotes = data?.quoteResponse?.result ?? [];

    return Object.fromEntries(
      quotes.map((q) => [
        q.symbol,
        {
          price:         q.regularMarketPrice        ?? null,
          change:        q.regularMarketChange        ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
          name:          q.shortName ?? q.longName   ?? q.symbol,
          currency:      q.currency                  ?? "USD",
        },
      ])
    );
  } catch (err) {
    console.error("[Yahoo Finance] fetch error:", err.message);
    return {};
  }
}
