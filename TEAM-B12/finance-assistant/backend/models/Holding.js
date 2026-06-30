import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: [true, "Symbol is required"],
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["stock", "crypto"],
      required: [true, "Asset type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    avgBuyPrice: {
      type: Number,
      required: [true, "Average buy price is required"],
      min: [0, "Price cannot be negative"],
    },
    // CoinGecko ID used for crypto price lookups (e.g. "bitcoin", "ethereum")
    coinGeckoId: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Blended-average model: one holding record per symbol per user
holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Holding = mongoose.model("Holding", holdingSchema);
export default Holding;
