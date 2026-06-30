import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

// @route GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      color,
      icon,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const usageCount = await Transaction.countDocuments({ category: category._id });
    if (usageCount > 0) {
      return res.status(409).json({
        message: `Can't delete: ${usageCount} transaction(s) use this category`,
      });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};
