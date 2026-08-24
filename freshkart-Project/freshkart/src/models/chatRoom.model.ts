import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChatRoom {
  _id?: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  deliveryBoyId?: mongoose.Types.ObjectId | null;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deliveryBoyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom: Model<IChatRoom> =
  mongoose.models.ChatRoom ||
  mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);

export default ChatRoom;
