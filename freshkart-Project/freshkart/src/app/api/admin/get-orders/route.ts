import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Make sure Mongoose has registered all referenced models
    // before executing populate().
    void User;
    void DeliveryAssignment;

    const orders = await Order.find({})
      // Customer
      .populate(
        "user",
        "name email mobile image"
      )

      // Assigned delivery boy
      .populate(
        "assignedDeliveryBoy",
        "name email mobile image"
      )

      // Delivery assignment
      .populate({
        path: "assignment",
        select:
          "status assignedTo acceptedAt deliveredAt cancelledAt createdAt",
        populate: {
          path: "assignedTo",
          select:
            "name email mobile image",
        },
      })

      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "❌ GET ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}