import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
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
    // GET ASSIGNMENT OR ORDER ID
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

    // ============================================
    // AUTHENTICATION
    // ============================================

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

    console.log("========================================");
    console.log("ACCEPT DELIVERY");
    console.log("Passed ID:", id);
    console.log("Delivery Boy:", deliveryBoyId);
    console.log("========================================");

    // ============================================
    // CHECK ASSIGNMENT (BY ASSIGNMENT ID OR ORDER ID)
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
    // VERIFY DELIVERY BOY WAS BROADCASTED TO
    // ============================================

    const wasBroadcastedToThisBoy = assignment.broadcastedTo.some(
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
    // CHECK IF THIS DELIVERY IS ALREADY ACCEPTED
    // ============================================

    if (assignment.status !== "broadcasted") {
      return NextResponse.json(
        {
          success: false,
          message: "This delivery request is no longer available",
        },
        { status: 409 },
      );
    }

    if (assignment.assignedTo) {
      return NextResponse.json(
        {
          success: false,
          message: "This delivery has already been accepted",
        },
        { status: 409 },
      );
    }

    // ============================================
    // CHECK IF DELIVERY BOY ALREADY HAS A DELIVERY
    // ============================================

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyObjectId,
      status: "assigned",
    });

    if (alreadyAssigned) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have an active delivery assignment",
        },
        { status: 409 },
      );
    }

    // ============================================
    // ATOMIC ACCEPT
    // ============================================

    const acceptedAssignment = await DeliveryAssignment.findOneAndUpdate(
      {
        _id: assignment._id,
        status: "broadcasted",
        assignedTo: null,
        broadcastedTo: deliveryBoyObjectId,
      },
      {
        $set: {
          assignedTo: deliveryBoyObjectId,
          status: "assigned",
          acceptedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      },
    );

    // ============================================
    // SOMEONE ELSE ACCEPTED FIRST
    // ============================================

    if (!acceptedAssignment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This delivery request is no longer available. Another delivery boy may have accepted it.",
        },
        { status: 409 },
      );
    }

    console.log(
      "✅ Assignment accepted:",
      acceptedAssignment._id,
    );

    // ============================================
    // FIND ORDER
    // ============================================

    const order = await Order.findById(acceptedAssignment.order);

    if (!order) {
      // ROLLBACK
      await DeliveryAssignment.findOneAndUpdate(
        {
          _id: acceptedAssignment._id,
          status: "assigned",
          assignedTo: deliveryBoyObjectId,
        },
        {
          $set: {
            assignedTo: null,
            status: "broadcasted",
            acceptedAt: null,
          },
        },
      );

      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    // ============================================
    // UPDATE ORDER
    // ============================================

    order.assignment = acceptedAssignment._id;
    order.assignedDeliveryBoy = deliveryBoyObjectId;
    order.status = "out of delivery";

    await order.save();

    console.log(
      "✅ Order assigned successfully:",
      order._id,
    );

    // ============================================
    // REMOVE DELIVERY BOY FROM OTHER BROADCASTED ASSIGNMENTS
    // ============================================

    await DeliveryAssignment.updateMany(
      {
        _id: { $ne: acceptedAssignment._id },
        broadcastedTo: deliveryBoyObjectId,
        status: "broadcasted",
        assignedTo: null,
      },
      {
        $pull: {
          broadcastedTo: deliveryBoyObjectId,
        },
      },
    );

    // Broadcast order-accepted event to all delivery boys room so their dashboards clear this item
    emitEventHandler(
      "order-accepted",
      {
        assignmentId: String(acceptedAssignment._id),
        orderId: String(order._id),
        acceptedBy: deliveryBoyId,
      },
      { room: "delivery-boys" },
    ).catch(() => {});

    // ============================================
    // SUCCESS
    // ============================================

    return NextResponse.json(
      {
        success: true,
        message: "Order accepted successfully",
        assignment: {
          id: acceptedAssignment._id,
          orderId: acceptedAssignment.order,
          assignedTo: acceptedAssignment.assignedTo,
          status: acceptedAssignment.status,
          acceptedAt: acceptedAssignment.acceptedAt,
        },
        order: {
          id: order._id,
          orderRequestId: order.orderRequestId,
          status: order.status,
          assignment: order.assignment,
          assignedDeliveryBoy: order.assignedDeliveryBoy,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Accept delivery assignment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to accept delivery assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}