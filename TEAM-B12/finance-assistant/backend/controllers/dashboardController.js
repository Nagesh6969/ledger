import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// @route GET /api/dashboard/summary?month=&year=
// Returns: total income/expense/balance for the month, category breakdown,
// a 6-month trend, and the 5 most recent transactions.
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // --- Totals for the selected month ---
    const totalsAgg = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const totals = { income: 0, expense: 0 };
    totalsAgg.forEach((t) => {
      totals[t._id] = t.total;
    });
    const balance = totals.income - totals.expense;

    // --- Category breakdown (expenses only, for a pie/donut chart) ---
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          name: "$category.name",
          color: "$category.color",
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // --- 6-month income vs expense trend ---
    const trendStart = new Date(year, month - 6, 1);
    const trendRaw = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: trendStart, $lte: endOfMonth } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const trendMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap[key] = {
        label: d.toLocaleString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
      };
    }
    trendRaw.forEach((row) => {
      const key = `${row._id.year}-${row._id.month}`;
      if (trendMap[key]) {
        trendMap[key][row._id.type] = row.total;
      }
    });
    const trend = Object.values(trendMap);

    // --- Recent transactions ---
    const recentTransactions = await Transaction.find({ user: userId })
      .populate("category", "name color icon type")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      month,
      year,
      totals: { ...totals, balance },
      categoryBreakdown,
      trend,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};
