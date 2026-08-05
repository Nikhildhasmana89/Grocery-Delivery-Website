import mongoose from "mongoose";

interface IDeliveryAssignment {
    order: mongoose.Types.ObjectId;
    brodcastedTo: mongoose.Types.ObjectId[];
    assignedTo: mongoose.Types.ObjectId | null;
    status: "pending" | "assigned" | "delivered" | "cancelled";
    acceptedAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const deliveryAssignmentSchema = new mongoose.Schema<IDeliveryAssignment>({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    brodcastedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "delivered", "cancelled"],
        default: "pending",
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
}, {
    timestamps: true,
});

const DeliveryAssignment = mongoose.model<IDeliveryAssignment>("DeliveryAssignment", deliveryAssignmentSchema);

export default DeliveryAssignment;
