import Notification from "../models/Notification.js";

// @route  GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/notifications  (internal / used by trigger endpoint)
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, relatedAlert } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }
    const notification = await Notification.create({
      user:         req.user._id,
      title,
      message,
      type:         type || "info",
      relatedAlert: relatedAlert || undefined,
    });
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/notifications/:id/read
export const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/notifications
export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    next(err);
  }
};
