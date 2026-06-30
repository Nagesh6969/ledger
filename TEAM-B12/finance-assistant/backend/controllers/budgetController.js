import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

// @route GET /api/budgets?month=&year=
// Returns each budget with the actual amount spent so far that month.
export const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year }).populate(
      "category",
      "name color icon type"
    );

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const withSpend = await Promise.all(
      budgets.map(async (budget) => {
        const spendAgg = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              category: budget.category._id,
              type: "expense",
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent = spendAgg[0]?.total || 0;
        return {
          ...budget.toObject(),
          spent,
          remaining: budget.limit - spent,
          percentUsed: budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0,
        };
      })
    );

    res.json({ month, year, budgets: withSpend });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/budgets
export const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || limit === undefined || !month || !year) {
      return res.status(400).json({ message: "category, limit, month, and year are required" });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      month,
      year,
    });

    const populated = await budget.populate("category", "name color icon type");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/budgets/:id
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const { limit } = req.body;
    if (limit !== undefined) budget.limit = limit;

    await budget.save();
    const populated = await budget.populate("category", "name color icon type");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/budgets/:id
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.json({ message: "Budget deleted" });
  } catch (error) {
    next(error);
  }
};
