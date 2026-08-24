import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  chatRoomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  deliveryBoyId?: mongoose.Types.ObjectId | null;
  orderId?: mongoose.Types.ObjectId | null;

  sender: "user" | "assistant" | "deliveryBoy";
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    // Chat room this message belongs to
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    // Customer/User
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Delivery boy involved in the conversation
    deliveryBoyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Related order
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    // Who sent the message
    sender: {
      type: String,
      enum: ["user", "assistant", "deliveryBoy"],
      required: true,
    },

    // Actual message
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default Message;