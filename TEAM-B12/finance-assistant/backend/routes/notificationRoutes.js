import express from "express";
import {
  getNotifications,
  createNotification,
  markAllRead,
  markOneRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// Exact paths must be defined before parameterised ones
router.put("/read-all",   markAllRead);
router.delete("/",        clearAllNotifications);

router.get("/",           getNotifications);
router.post("/",          createNotification);
router.put("/:id/read",   markOneRead);
router.delete("/:id",     deleteNotification);

export default router;
