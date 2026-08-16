import mongoose from "mongoose";

export interface IOrder {
  _id?: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId;

  orderRequestId: string;

  items: {
    grocery: mongoose.Types.ObjectId;
    quantity: number;
    name: string;
    price: string;
    image: string;
    unit: string;
  }[];

  isPaid: boolean;

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
    longitude: number;
  };

  // Delivery assignment
  assignment: mongoose.Types.ObjectId | null;

  // Delivery boy who accepted the order
  assignedDeliveryBoy: mongoose.Types.ObjectId | null;

  status:
    | "pending"
    | "out of delivery"
    | "delivered";

  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    // ==========================================
    // CUSTOMER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // ORDER REQUEST ID
    // ==========================================

    orderRequestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================
    // ORDER ITEMS
    // ==========================================

    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        unit: {
          type: String,
          required: true,
        },
      },
    ],

    // ==========================================
    // PAYMENT
    // ==========================================

    totalAmount: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // DELIVERY ADDRESS
    // ==========================================

    address: {
      fullName: {
        type: String,
        required: true,
      },

      mobile: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      fullAddress: {
        type: String,
        required: true,
      },

      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    // ==========================================
    // ORDER STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "pending",
        "out of delivery",
        "delivered",
      ],
      default: "pending",
      index: true,
    },

    // ==========================================
    // DELIVERY ASSIGNMENT
    // ==========================================

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },

    // ==========================================
    // ACCEPTED DELIVERY BOY
    // ==========================================

    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

// ==========================================
// PREVENT MODEL OVERWRITE
// ==========================================

const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;