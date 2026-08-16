import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ============================================
    // 1. AUTHENTICATE FIRST
    // ============================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const deliveryBoyId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Delivery Boy ID format",
        },
        { status: 400 },
      );
    }

    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);

    // ============================================
    // 2. DATABASE & MODEL REGISTRATION
    // ============================================

    await connectDB();

    // Ensure referenced models are registered in Mongoose schema cache
    void User;
    void Order;

    // ============================================
    // 3. GET ASSIGNMENTS
    // ============================================

    const assignments = await DeliveryAssignment.aggregate([
      {
        $match: {
          $or: [
            {
              status: "broadcasted",
              broadcastedTo: deliveryBoyObjectId,
              assignedTo: null,
            },
            {
              status: "assigned",
              assignedTo: deliveryBoyObjectId,
            },
          ],
        },
      },

      // Newest first
      {
        $sort: {
          createdAt: -1,
        },
      },

      // Get Order
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "order",
        },
      },

      // Convert order array -> object
      {
        $unwind: {
          path: "$order",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Get User from Order
      {
        $lookup: {
          from: "users",
          localField: "order.user",
          foreignField: "_id",
          as: "orderUser",
        },
      },

      // Convert user array -> object
      {
        $unwind: {
          path: "$orderUser",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Put user inside order
      {
        $set: {
          "order.user": {
            _id: "$orderUser._id",
            name: "$orderUser.name",
            email: "$orderUser.email",
            mobile: "$orderUser.mobile",
          },
        },
      },

      // Remove unnecessary fields
      {
        $project: {
          orderUser: 0,
        },
      },
    ]);

    // ============================================
    // 4. RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,
        assignment: assignments,
        count: assignments.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ GET DELIVERY ASSIGNMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch delivery assignments",
      },
      { status: 500 },
    );
  }
}