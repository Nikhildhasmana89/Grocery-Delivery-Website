import mongoose from "mongoose";

export interface UserInterface {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
  roleSelected?: boolean;
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
    roleSelected: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
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

// Pre-save hook: Ensure empty strings or whitespace in mobile are set to undefined
// so MongoDB sparse unique index doesn't throw E11000 duplicate key error
userSchema.pre("save", function () {
  if (
    this.mobile !== undefined &&
    (this.mobile === null || typeof this.mobile !== "string" || !this.mobile.trim())
  ) {
    this.mobile = undefined;
  }
});

// Pre-findOneAndUpdate & updateOne hook to handle empty mobile strings
userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const update = this.getUpdate() as any;
  if (update) {
    if (
      update.mobile !== undefined &&
      (update.mobile === null || typeof update.mobile !== "string" || !update.mobile.trim())
    ) {
      delete update.mobile;
      if (!update.$unset) update.$unset = {};
      update.$unset.mobile = 1;
    }
    if (
      update.$set &&
      update.$set.mobile !== undefined &&
      (update.$set.mobile === null || typeof update.$set.mobile !== "string" || !update.$set.mobile.trim())
    ) {
      delete update.$set.mobile;
      if (!update.$unset) update.$unset = {};
      update.$unset.mobile = 1;
    }
  }
});

userSchema.index({ location: "2dsphere" });

const User =
  mongoose.models.User || mongoose.model<UserInterface>("User", userSchema);

export default User;
