import Holding from "../models/Holding.js";
import {
  fetchCryptoPrices,
  fetchStockPrices,
  getCoinGeckoId,
} from "../utils/marketService.js";

// @route  GET /api/portfolio
// Returns all holdings enriched with live market prices.
export const getPortfolio = async (req, res, next) => {
  try {
    const holdings = await Holding.find({ user: req.user._id }).lean();

    if (holdings.length === 0) {
      return res.json({
        holdings: [],
        totalValue: 0,
        totalCost: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
      });
    }

    const cryptos = holdings.filter((h) => h.type === "crypto");
    const stocks  = holdings.filter((h) => h.type === "stock");

    const coinGeckoIds  = cryptos.map((h) => h.coinGeckoId || getCoinGeckoId(h.symbol));
    const stockSymbols  = stocks.map((h) => h.symbol);

    const [cryptoPrices, stockPrices] = await Promise.all([
      fetchCryptoPrices(coinGeckoIds),
      fetchStockPrices(stockSymbols),
    ]);

    const enriched = holdings.map((h) => {
      let livePrice  = null;
      let change24h  = null;
      let liveName   = h.name;

      if (h.type === "crypto") {
        const id = h.coinGeckoId || getCoinGeckoId(h.symbol);
        const p  = cryptoPrices[id];
        if (p) { livePrice = p.usd; change24h = p.usd_24h_change; }
      } else {
        const p = stockPrices[h.symbol];
        if (p) {
          livePrice = p.price;
          change24h = p.changePercent;
          if (p.name) liveName = p.name;
        }
      }

      const costBasis    = h.quantity * h.avgBuyPrice;
      const currentValue = livePrice != null ? h.quantity * livePrice : null;
      const pnl          = currentValue != null ? currentValue - costBasis : null;
      const pnlPercent   =
        pnl != null && costBasis > 0 ? (pnl / costBasis) * 100 : null;

      return {
        ...h,
        liveName,
        livePrice,
        change24h,
        currentValue,
        costBasis,
        pnl,
        pnlPercent,
      };
    });

    const totalValue      = enriched.reduce((s, h) => s + (h.currentValue ?? h.costBasis), 0);
    const totalCost       = enriched.reduce((s, h) => s + h.costBasis, 0);
    const totalPnL        = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    res.json({ holdings: enriched, totalValue, totalCost, totalPnL, totalPnLPercent });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/portfolio
// Adds a new holding.
export const addHolding = async (req, res, next) => {
  try {
    const { symbol, name, type, quantity, avgBuyPrice, coinGeckoId } = req.body;

    if (!symbol || !name || !type || quantity == null || avgBuyPrice == null) {
      return res.status(400).json({
        message: "symbol, name, type, quantity, and avgBuyPrice are all required",
      });
    }
    if (!["stock", "crypto"].includes(type)) {
      return res.status(400).json({ message: "type must be 'stock' or 'crypto'" });
    }

    const holding = await Holding.create({
      user:        req.user._id,
      symbol:      symbol.trim().toUpperCase(),
      name:        name.trim(),
      type,
      quantity:    parseFloat(quantity),
      avgBuyPrice: parseFloat(avgBuyPrice),
      coinGeckoId: coinGeckoId?.trim().toLowerCase() || undefined,
    });

    res.status(201).json(holding);
  } catch (err) {
    if (err.code === 11000) {
      const sym = req.body.symbol?.toUpperCase();
      return res.status(409).json({
        message: `You already track ${sym}. Edit the existing holding instead.`,
      });
    }
    next(err);
  }
};

// @route  PUT /api/portfolio/:id
// Updates quantity and / or average buy price.
export const updateHolding = async (req, res, next) => {
  try {
    const holding = await Holding.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });
    if (!holding) return res.status(404).json({ message: "Holding not found" });

    const { quantity, avgBuyPrice, name } = req.body;
    if (quantity    != null) holding.quantity    = parseFloat(quantity);
    if (avgBuyPrice != null) holding.avgBuyPrice = parseFloat(avgBuyPrice);
    if (name)                holding.name        = name.trim();

    await holding.save();
    res.json(holding);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/portfolio/:id
// Removes a holding.
export const deleteHolding = async (req, res, next) => {
  try {
    const holding = await Holding.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,
    });
    if (!holding) return res.status(404).json({ message: "Holding not found" });
    res.json({ message: "Holding removed" });
  } catch (err) {
    next(err);
  }
};
