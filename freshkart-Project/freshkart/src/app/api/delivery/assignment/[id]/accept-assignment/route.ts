import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
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
    // GET ASSIGNMENT ID
    // ============================================

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required",
        },
        { status: 400 },
      );
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    const session = await auth();

    const deliveryBoyId =
      session?.user?.id;

    if (!deliveryBoyId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    console.log("========================================");
    console.log("ACCEPT DELIVERY");
    console.log("Assignment ID:", id);
    console.log("Delivery Boy:", deliveryBoyId);
    console.log("========================================");

    // ============================================
    // CHECK ASSIGNMENT
    // ============================================

    const assignment =
      await DeliveryAssignment.findOne({
        _id: id,
      });

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

    const wasBroadcastedToThisBoy =
      assignment.broadcastedTo.some(
        (boyId) =>
          boyId.toString() ===
          deliveryBoyId.toString(),
      );

    if (!wasBroadcastedToThisBoy) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This delivery was not offered to you",
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
          message:
            "This delivery request is no longer available",
        },
        { status: 409 },
      );
    }

    if (assignment.assignedTo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This delivery has already been accepted",
        },
        { status: 409 },
      );
    }

    // ============================================
    // CHECK IF DELIVERY BOY ALREADY HAS A DELIVERY
    // ============================================

    const alreadyAssigned =
      await DeliveryAssignment.findOne({
        assignedTo: deliveryBoyId,
        status: "assigned",
      });

    if (alreadyAssigned) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You already have an active delivery assignment",
        },
        { status: 409 },
      );
    }

    // ============================================
    // ATOMIC ACCEPT
    // ============================================
    //
    // This is the important part.
    //
    // If another delivery boy accepts first,
    // this query will return null.
    //
    // ============================================

    const acceptedAssignment =
      await DeliveryAssignment.findOneAndUpdate(
        {
          _id: id,

          status: "broadcasted",

          assignedTo: null,

          broadcastedTo:
            deliveryBoyId,
        },
        {
          $set: {
            assignedTo: deliveryBoyId,

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

    const order =
      await Order.findById(
        acceptedAssignment.order,
      );

    if (!order) {
      // ------------------------------------------
      // ROLLBACK
      // ------------------------------------------

      await DeliveryAssignment.findOneAndUpdate(
        {
          _id: acceptedAssignment._id,

          status: "assigned",

          assignedTo: deliveryBoyId,
        },
        {
          $set: {
            assignedTo: null,

            status: "broadcasted",

            acceptedAt: null,
          },
        },
        {
          returnDocument: "after",
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

    order.assignment =
      acceptedAssignment._id;

    order.assignedDeliveryBoy =
      deliveryBoyId;

    order.status = "out of delivery";

    await order.save();

    console.log(
      "✅ Order assigned successfully:",
      order._id,
    );

    // ============================================
    // REMOVE DELIVERY BOY FROM OTHER
    // BROADCASTED ASSIGNMENTS
    // ============================================
    //
    // Because this system allows one active
    // delivery per delivery boy.
    //
    // ============================================

    await DeliveryAssignment.updateMany(
      {
        _id: {
          $ne: acceptedAssignment._id,
        },

        broadcastedTo:
          deliveryBoyId,

        status: "broadcasted",

        assignedTo: null,
      },
      {
        $pull: {
          broadcastedTo:
            deliveryBoyId,
        },
      },
    );

    console.log(
      "✅ Removed delivery boy from other broadcasted orders",
    );

    // ============================================
    // SUCCESS
    // ============================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order accepted successfully",

        assignment: {
          id:
            acceptedAssignment._id,

          orderId:
            acceptedAssignment.order,

          assignedTo:
            acceptedAssignment.assignedTo,

          status:
            acceptedAssignment.status,

          acceptedAt:
            acceptedAssignment.acceptedAt,
        },

        order: {
          id: order._id,

          orderRequestId:
            order.orderRequestId,

          status: order.status,

          assignment:
            order.assignment,

          assignedDeliveryBoy:
            order.assignedDeliveryBoy,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "❌ Accept delivery assignment error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to accept delivery assignment",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 },
    );
  }
}