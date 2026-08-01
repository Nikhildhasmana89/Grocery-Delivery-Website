import mongoose from "mongoose";

interface IOrder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: [
    {
      grocery: mongoose.Types.ObjectId;
      quantity: number;
      name: string;
      price: string;
      image: string;
      unit: string;
    },
  ];
  totalAmount: string;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    logitute: number;
  };
  status: "pending" | "out of delivery" | "delivered";
  createdAt?: Date;
  updateAT?: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: String, required: true },
        image: { type: String, required: true },
        unit: { type: String, required: true },
      },
    ],
    totalAmount: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    address: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      fullAddress: { type: String, required: true },
      latitude: { type: Number, required: true },
      logitute: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "out of delivery", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
