import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await connectDB();

    // ============================================
    // 1. GET PARAMETERS & AUTHENTICATE
    // ============================================

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment or Order ID is required",
        },
        { status: 400 },
      );
    }

    const session = await auth();

    const deliveryBoyId = session?.user?.id;

    if (!deliveryBoyId || !mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized or invalid delivery boy session",
        },
        { status: 401 },
      );
    }

    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);

    // ============================================
    // 2. VERIFY ROLE IS DELIVERY BOY & MOBILE CONNECTED
    // ============================================

    const user = await User.findById(deliveryBoyObjectId).select("role mobile").lean();

    const isDeliveryBoy =
      user &&
      ["deliveryBoy", "deliveryboy", "delivery_boy"].includes(user.role);

    if (!isDeliveryBoy) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only delivery boys can reject delivery assignments",
        },
        { status: 403 },
      );
    }

    if (!user.mobile || !user.mobile.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must connect your mobile number in the Delivery Boy Dashboard before managing assignments.",
        },
        { status: 400 },
      );
    }

    console.log("========================================");
    console.log("REJECT DELIVERY ASSIGNMENT");
    console.log("Passed ID:", id);
    console.log("Delivery Boy:", deliveryBoyId);
    console.log("========================================");

    // ============================================
    // 3. FIND ASSIGNMENT (BY ASSIGNMENT ID OR ORDER ID)
    // ============================================

    let assignmentQuery: any = { _id: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      assignmentQuery = {
        $or: [
          { _id: new mongoose.Types.ObjectId(id) },
          { order: new mongoose.Types.ObjectId(id) },
        ],
      };
    }

    const assignment = await DeliveryAssignment.findOne(assignmentQuery);

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery assignment not found",
        },
        { status: 404 },
      );
    }

    // ============================================
    // 4. VERIFY DELIVERY BOY WAS BROADCASTED TO & NOT ALREADY REJECTED
    // ============================================

    const wasAlreadyRejected = assignment.rejectedBy?.some(
      (boyId: any) => boyId.toString() === deliveryBoyId.toString(),
    );

    if (wasAlreadyRejected) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already rejected this delivery assignment",
        },
        { status: 409 },
      );
    }

    const wasBroadcastedToThisBoy = assignment.broadcastedTo?.some(
      (boyId: any) => boyId.toString() === deliveryBoyId.toString(),
    );

    if (!wasBroadcastedToThisBoy) {
      return NextResponse.json(
        {
          success: false,
          message: "This delivery was not offered to you",
        },
        { status: 403 },
      );
    }

    // ============================================
    // 5. CHECK ASSIGNMENT STATUS
    // ============================================

    if (assignment.status !== "broadcasted" || assignment.assignedTo !== null) {
      return NextResponse.json(
        {
          success: false,
          message: "This delivery request is no longer available",
        },
        { status: 409 },
      );
    }

    // ============================================
    // 6. ATOMIC REJECTION UPDATE
    // ============================================

    const updatedAssignment = await DeliveryAssignment.findOneAndUpdate(
      {
        _id: assignment._id,
        status: "broadcasted",
        assignedTo: null,
        broadcastedTo: deliveryBoyObjectId,
      },
      {
        $pull: {
          broadcastedTo: deliveryBoyObjectId,
        },
        $addToSet: {
          rejectedBy: deliveryBoyObjectId,
        },
        $set: {
          rejectedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!updatedAssignment) {
      return NextResponse.json(
        {
          success: false,
          message: "This delivery request is no longer available or already processed",
        },
        { status: 409 },
      );
    }

    console.log("❌ Assignment rejected by delivery boy:", deliveryBoyId);

    if (updatedAssignment.broadcastedTo.length === 0) {
      updatedAssignment.status = "rejected";
      await updatedAssignment.save();
    }

    void Order;

    const notificationPayload = {
      assignmentId: String(updatedAssignment._id),
      orderId: String(updatedAssignment.order),
      rejectedBy: deliveryBoyId,
      status: updatedAssignment.status,
      remainingBroadcastCount: updatedAssignment.broadcastedTo.length,
    };

    emitEventHandler("order-rejected", notificationPayload, {
      room: "delivery-boys",
    }).catch(() => {});

    emitEventHandler("order-rejected", notificationPayload, {
      userId: deliveryBoyId,
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "Delivery assignment rejected successfully",
        assignment: {
          id: updatedAssignment._id,
          orderId: updatedAssignment.order,
          status: updatedAssignment.status,
          rejectedAt: updatedAssignment.rejectedAt,
          remainingBroadcastCount: updatedAssignment.broadcastedTo.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Reject delivery assignment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to reject delivery assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
