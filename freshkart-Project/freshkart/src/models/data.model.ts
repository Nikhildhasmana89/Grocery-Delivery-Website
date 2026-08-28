import mongoose, { Schema } from "mongoose";

export interface IDataProduct {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  price: string | number;
  unit: string;
  image: string;
  stock?: number;
  minStock?: number;
  description?: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const dataSchema = new Schema<IDataProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    price: {
      type: Schema.Types.Mixed,
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
      default: 50,
    },
    minStock: {
      type: Number,
      default: 10,
    },
    description: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 4.5,
    },
  },
  {
    timestamps: true,
    collection: "data", // Maps directly to 'data' collection in MongoDB Compass
  }
);

dataSchema.index({ category: 1 });
dataSchema.index({ name: 1 });
dataSchema.index({ createdAt: -1 });

const DataProduct =
  mongoose.models.DataProduct ||
  mongoose.model<IDataProduct>("DataProduct", dataSchema, "data");

export default DataProduct;
