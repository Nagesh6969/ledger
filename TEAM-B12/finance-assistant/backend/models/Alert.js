import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["price_above", "price_below"],
      required: [true, "Alert type is required"],
    },
    assetType: {
      type: String,
      enum: ["stock", "crypto"],
      required: true,
    },
    symbol: {
      type: String,
      required: [true, "Symbol is required"],
      uppercase: true,
      trim: true,
    },
    assetName: {
      type: String,
      trim: true,
      default: "",
    },
    targetPrice: {
      type: Number,
      required: [true, "Target price is required"],
      min: [0, "Price cannot be negative"],
    },
    coinGeckoId: {
      type: String,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    triggered: {
      type: Boolean,
      default: false,
    },
    triggeredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

alertSchema.index({ user: 1, active: 1 });

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
