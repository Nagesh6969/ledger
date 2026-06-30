import express from "express";
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  triggerAlerts,
} from "../controllers/alertController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// Note: /trigger must be defined before /:id to avoid param conflict
router.post("/trigger", triggerAlerts);

router.get("/",      getAlerts);
router.post("/",     createAlert);
router.put("/:id",   updateAlert);
router.delete("/:id", deleteAlert);

export default router;
