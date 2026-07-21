import mongoose from "mongoose";

interface UserInterface {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
}

const userSchema = new mongoose.Schema<UserInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model<UserInterface>("User", userSchema);

export default User;