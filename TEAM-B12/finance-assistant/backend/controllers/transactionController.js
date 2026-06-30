import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

// @route GET /api/transactions?type=&category=&from=&to=&page=&limit=&search=
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, from, to, search, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("category", "name color icon type")
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/transactions
export const createTransaction = async (req, res, next) => {
  try {
    const { category, type, amount, description, date, paymentMethod } = req.body;

    if (!category || !type || amount === undefined) {
      return res.status(400).json({ message: "category, type, and amount are required" });
    }

    const categoryDoc = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      category,
      type,
      amount,
      description,
      date: date || Date.now(),
      paymentMethod,
    });

    const populated = await transaction.populate("category", "name color icon type");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { category, type, amount, description, date, paymentMethod } = req.body;

    if (category !== undefined) transaction.category = category;
    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = date;
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;

    await transaction.save();
    const populated = await transaction.populate("category", "name color icon type");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    next(error);
  }
};
