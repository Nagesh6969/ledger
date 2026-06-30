import Alert from "../models/Alert.js";
import Notification from "../models/Notification.js";

// @route  GET /api/alerts
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/alerts
export const createAlert = async (req, res, next) => {
  try {
    const { type, assetType, symbol, assetName, targetPrice, coinGeckoId } = req.body;

    if (!type || !assetType || !symbol || targetPrice == null) {
      return res.status(400).json({
        message: "type, assetType, symbol, and targetPrice are required",
      });
    }

    const alert = await Alert.create({
      user:        req.user._id,
      type,
      assetType,
      symbol:      symbol.trim().toUpperCase(),
      assetName:   assetName?.trim() || symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      coinGeckoId: coinGeckoId?.trim().toLowerCase() || undefined,
    });

    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/alerts/:id
export const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const { active, targetPrice } = req.body;
    if (active      != null) alert.active      = active;
    if (targetPrice != null) alert.targetPrice = parseFloat(targetPrice);

    await alert.save();
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/alerts/:id
export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Alert deleted" });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/alerts/trigger
// Called from the frontend after fetching live prices.
// Checks active alerts and creates notifications for those that fired.
export const triggerAlerts = async (req, res, next) => {
  try {
    // Body: { prices: [{ symbol, price }] }
    const { prices } = req.body;
    if (!prices?.length) return res.json({ triggered: [] });

    const activeAlerts = await Alert.find({
      user:      req.user._id,
      active:    true,
      triggered: false,
    });

    if (!activeAlerts.length) return res.json({ triggered: [] });

    const triggered = [];

    for (const alert of activeAlerts) {
      const match = prices.find((p) => p.symbol === alert.symbol);
      if (!match || match.price == null) continue;

      const fired =
        (alert.type === "price_above" && match.price >= alert.targetPrice) ||
        (alert.type === "price_below" && match.price <= alert.targetPrice);

      if (!fired) continue;

      // Mark alert as triggered
      alert.triggered   = true;
      alert.triggeredAt = new Date();
      await alert.save();

      // Create a notification
      const direction = alert.type === "price_above" ? "rose above" : "fell below";
      const notification = await Notification.create({
        user:         req.user._id,
        title:        `🔔 ${alert.symbol} Alert Triggered`,
        message: `${alert.assetName || alert.symbol} ${direction} your target of $${alert.targetPrice.toLocaleString()}. Current price: $${match.price.toLocaleString()}.`,
        type:         "alert",
        relatedAlert: alert._id,
      });

      triggered.push({ alert, notification });
    }

    res.json({ triggered });
  } catch (err) {
    next(err);
  }
};
