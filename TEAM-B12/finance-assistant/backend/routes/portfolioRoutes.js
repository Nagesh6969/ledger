import express from "express";
import {
  getPortfolio,
  addHolding,
  updateHolding,
  deleteHolding,
} from "../controllers/portfolioController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/",    getPortfolio);
router.post("/",   addHolding);
router.put("/:id", updateHolding);
router.delete("/:id", deleteHolding);

export default router;
