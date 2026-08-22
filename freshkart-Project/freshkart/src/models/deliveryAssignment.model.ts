import mongoose, { Schema } from "mongoose";

export interface IDeliveryAssignment {
  order: mongoose.Types.ObjectId;

  broadcastedTo: mongoose.Types.ObjectId[];

  rejectedBy?: mongoose.Types.ObjectId[];

  assignedTo: mongoose.Types.ObjectId | null;

  status:
    | "broadcasted"
    | "assigned"
    | "delivered"
    | "cancelled"
    | "rejected";

  acceptedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  rejectedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

const deliveryAssignmentSchema =
  new Schema<IDeliveryAssignment>(
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },

      broadcastedTo: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      rejectedBy: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      status: {
        type: String,
        enum: [
          "broadcasted",
          "assigned",
          "delivered",
          "cancelled",
          "rejected",
        ],
        default: "broadcasted",
      },

      acceptedAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      rejectedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

deliveryAssignmentSchema.index({ assignedTo: 1, status: 1 });
deliveryAssignmentSchema.index({ status: 1, broadcastedTo: 1 });
deliveryAssignmentSchema.index({ order: 1 });

const DeliveryAssignment =
  mongoose.models.DeliveryAssignment ??
  mongoose.model<IDeliveryAssignment>(
    "DeliveryAssignment",
    deliveryAssignmentSchema,
  );

export default DeliveryAssignment;