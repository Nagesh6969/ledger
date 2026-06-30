/**
 * One-off script to seed default categories for a given user.
 * Run with: npm run seed -- <userId>
 * (the controller also auto-creates these defaults on first login,
 * so running this script manually is optional)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";

dotenv.config();

export const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "income", color: "#1B4332", icon: "wallet" },
  { name: "Freelance", type: "income", color: "#2D6A4F", icon: "briefcase" },
  { name: "Investments", type: "income", color: "#40916C", icon: "trending-up" },
  { name: "Other Income", type: "income", color: "#74C69D", icon: "plus-circle" },
  { name: "Groceries", type: "expense", color: "#C99A2E", icon: "shopping-cart" },
  { name: "Rent", type: "expense", color: "#9C6B1F", icon: "home" },
  { name: "Utilities", type: "expense", color: "#B23A48", icon: "zap" },
  { name: "Transport", type: "expense", color: "#6E4C9E", icon: "car" },
  { name: "Dining Out", type: "expense", color: "#D17A22", icon: "coffee" },
  { name: "Entertainment", type: "expense", color: "#3A6EA5", icon: "film" },
  { name: "Health", type: "expense", color: "#4F772D", icon: "heart" },
  { name: "Other Expense", type: "expense", color: "#6B7280", icon: "more-horizontal" },
];

export async function ensureDefaultCategories(userId) {
  const existing = await Category.find({ user: userId, isDefault: true });
  if (existing.length > 0) return existing;

  const docs = DEFAULT_CATEGORIES.map((c) => ({ ...c, user: userId, isDefault: true }));
  return Category.insertMany(docs, { ordered: false }).catch(() => Category.find({ user: userId }));
}

// Allow running directly: node utils/seedCategories.js <userId>
if (process.argv[1]?.includes("seedCategories.js")) {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: node utils/seedCategories.js <userId>");
    process.exit(1);
  }
  connectDB().then(async () => {
    await ensureDefaultCategories(userId);
    console.log("Default categories seeded.");
    await mongoose.disconnect();
    process.exit(0);
  });
}
