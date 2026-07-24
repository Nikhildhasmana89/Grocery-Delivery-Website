import mongoose from "mongoose";

export interface UserInterface {
  name: string;
  email: string;
  password?: string; // Optional for OAuth (Google/GitHub) users
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
}

const userSchema = new mongoose.Schema<UserInterface>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, 
      trim: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true, 
      trim: true,
    },
    password: {
      type: String,
      required: false, 
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