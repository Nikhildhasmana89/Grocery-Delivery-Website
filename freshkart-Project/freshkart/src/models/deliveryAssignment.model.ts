import mongoose, { Schema } from "mongoose";

export interface IDeliveryAssignment {
  order: mongoose.Types.ObjectId;

  broadcastedTo: mongoose.Types.ObjectId[];

  assignedTo: mongoose.Types.ObjectId | null;

  status:
    | "broadcasted"
    | "assigned"
    | "delivered"
    | "cancelled";

  acceptedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

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
    },
    {
      timestamps: true,
    },
  );

const DeliveryAssignment =
  mongoose.models.DeliveryAssignment ??
  mongoose.model<IDeliveryAssignment>(
    "DeliveryAssignment",
    deliveryAssignmentSchema,
  );

export default DeliveryAssignment;