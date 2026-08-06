import mongoose from "mongoose";

export interface UserInterface {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt?: Date;
  updatedAt?: Date;
  socketId: string | null;
  isOnline: boolean;
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
    image: {
      type: String,
      default: "",
    },
    location:{
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    socketId: {
      type: String,
      default: null, 
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

 

userSchema.index({ location: '2dsphere' });

const User =
  mongoose.models.User || mongoose.model<UserInterface>("User", userSchema);

export default User;
