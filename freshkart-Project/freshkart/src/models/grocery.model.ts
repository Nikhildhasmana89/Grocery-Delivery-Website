import mongoose, { Schema, Document } from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  stock?: number;
  minStock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const grocerySchema = new Schema<IGrocery>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "fruits & vegetables",
        "dairy & eggs",
        "bakery & bread",
        "meat & seafood",
        "snacks & beverages",
        "pantry & staples",
        "frozen foods",
        "health & wellness",
        "baby care",
        "household essentials",
      ],
    },
    price: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 20,
    },
    minStock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

grocerySchema.index({ category: 1 });
grocerySchema.index({ name: 1 });
grocerySchema.index({ createdAt: -1 });
grocerySchema.index({ stock: 1 });

// Prevent overwrite model error in Next.js hot-reloading
const Grocery =
  mongoose.models.Grocery || mongoose.model("Grocery", grocerySchema);

export default Grocery;
