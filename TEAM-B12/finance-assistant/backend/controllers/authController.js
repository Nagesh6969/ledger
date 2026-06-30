import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { ensureDefaultCategories } from "../utils/seedCategories.js";

// @route POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are all required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }

    const user = await User.create({ name, email, password });
    await ensureDefaultCategories(user._id);

    const token = generateToken(user._id);
    res.status(201).json({ user: user.toSafeObject(), token });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await ensureDefaultCategories(user._id);

    const token = generateToken(user._id);
    res.json({ user: user.toSafeObject(), token });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// @route PUT /api/auth/me
export const updateMe = async (req, res, next) => {
  try {
    const { name, currency, monthlyIncomeGoal } = req.body;

    if (name !== undefined) req.user.name = name;
    if (currency !== undefined) req.user.currency = currency;
    if (monthlyIncomeGoal !== undefined) req.user.monthlyIncomeGoal = monthlyIncomeGoal;

    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};
