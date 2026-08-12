import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";
import emitEventHandler from "@/lib/emitEventHandler";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ orderId: string }>;
  },
) {
  try {
    await connectDB();

    // ============================================
    // PARAMS
    // ============================================

    const { orderId } = await params;
    const { status } = await req.json();

    console.log("========================================");
    console.log("========== UPDATE ORDER STATUS ==========");
    console.log("Order ID:", orderId);
    console.log("New Status:", status);
    console.log("========================================");

    // ============================================
    // VALIDATION
    // ============================================

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId and status are required",
        },
        { status: 400 },
      );
    }

    const allowedStatuses = [
      "pending",
      "out of delivery",
      "delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status",
          allowedStatuses,
        },
        { status: 400 },
      );
    }

    // ============================================
    // FIND ORDER
    // ============================================

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 },
      );
    }

    console.log("Order found:", order._id);
    console.log("Current status:", order.status);
    console.log("Requested status:", status);

    // ============================================
    // OLD ORDER FIX
    // ============================================

    if (!order.orderRequestId) {
      order.orderRequestId =
        `ORD-${Date.now()}-${crypto
          .randomBytes(4)
          .toString("hex")}`;

      await order.save();

      console.log(
        "Generated orderRequestId:",
        order.orderRequestId,
      );
    }

    // ============================================
    // DELIVERED ORDER PROTECTION
    // ============================================

    if (
      order.status === "delivered" &&
      status !== "delivered"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A delivered order cannot be moved backwards.",
        },
        { status: 400 },
      );
    }

    // ============================================
    // OUT OF DELIVERY
    // ============================================

    if (status === "out of delivery") {
      console.log(
        "🚚 Making order available to delivery boys...",
      );

      // ------------------------------------------
      // CHECK EXISTING ACTIVE ASSIGNMENT
      // ------------------------------------------

      const existingAssignment =
        await DeliveryAssignment.findOne({
          order: order._id,
          status: {
            $in: ["broadcasted", "assigned"],
          },
        });

      if (existingAssignment) {
        console.log(
          "Active assignment already exists:",
          existingAssignment._id,
        );

        order.status = "out of delivery";
        order.assignment =
          existingAssignment._id;

        order.assignedDeliveryBoy =
          existingAssignment.assignedTo || null;

        await order.save();

        return NextResponse.json(
          {
            success: true,
            message:
              existingAssignment.status ===
              "assigned"
                ? "Order is already assigned"
                : "Order is already available",
            order,
            assignment: existingAssignment,
          },
          { status: 200 },
        );
      }

      // ------------------------------------------
      // FIND ALL DELIVERY BOYS
      // ------------------------------------------
      //
      // NO:
      // $near
      // isOnline
      // socketId
      // busy filtering
      //
      // Every delivery boy can see the order.
      //

      const deliveryBoys =
        await User.find({
          role: "deliveryBoy",
        }).select(
          "_id name email mobile socketId isOnline",
        );

      console.log(
        "Total delivery boys:",
        deliveryBoys.length,
      );

      // ------------------------------------------
      // NO DELIVERY BOYS
      // ------------------------------------------

      if (deliveryBoys.length === 0) {
        order.status = "out of delivery";
        order.assignment = null;
        order.assignedDeliveryBoy = null;

        await order.save();

        return NextResponse.json(
          {
            success: true,
            message:
              "Order marked out for delivery, but no delivery boys are registered.",
            order,
          },
          { status: 200 },
        );
      }

      // ------------------------------------------
      // ALL DELIVERY BOY IDS
      // ------------------------------------------

      const deliveryBoyIds =
        deliveryBoys.map(
          (boy) => boy._id,
        );

      // ------------------------------------------
      // CREATE BROADCAST ASSIGNMENT
      // ------------------------------------------

      const deliveryAssignment =
        await DeliveryAssignment.create({
          order: order._id,

          broadcastedTo:
            deliveryBoyIds,

          assignedTo: null,

          status: "broadcasted",

          acceptedAt: null,
        });

      console.log(
        "Broadcast assignment created:",
        deliveryAssignment._id,
      );

      // ------------------------------------------
      // UPDATE ORDER
      // ------------------------------------------

      order.status = "out of delivery";

      order.assignment =
        deliveryAssignment._id;

      order.assignedDeliveryBoy = null;

      await order.save();

      console.log(
        "Order saved successfully",
      );

      // ------------------------------------------
      // SOCKET NOTIFICATION
      // ------------------------------------------

      const notificationData = {
        assignmentId:
          deliveryAssignment._id.toString(),

        orderId:
          order._id.toString(),

        orderRequestId:
          order.orderRequestId,

        status: "broadcasted",

        message:
          "New delivery order available",
      };

      /*
       * Socket notification only goes to
       * currently connected users.
       *
       * But broadcastedTo contains EVERY
       * delivery boy, so offline users can
       * still see the order when they open
       * the dashboard.
       */

      for (const deliveryBoy of deliveryBoys) {
        if (!deliveryBoy.socketId) {
          continue;
        }

        try {
          await emitEventHandler(
            "new-assignment",
            notificationData,
            deliveryBoy.socketId,
          );
        } catch (socketError) {
          console.error(
            "Socket notification failed:",
            deliveryBoy._id,
            socketError,
          );
        }
      }

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      return NextResponse.json(
        {
          success: true,

          message:
            "Order is now available to all delivery boys",

          orderId: order._id,

          orderRequestId:
            order.orderRequestId,

          status: order.status,

          assignment:
            deliveryAssignment,

          broadcastedTo:
            deliveryBoys.map((boy) => ({
              id: boy._id,
              name: boy.name,
              email: boy.email,
              mobile: boy.mobile,
              isOnline: boy.isOnline,
            })),
        },
        { status: 200 },
      );
    }

    // ============================================
    // DELIVERED
    // ============================================

    if (status === "delivered") {
      order.status = "delivered";

      /*
       * If an assignment exists, mark it delivered.
       */
      if (order.assignment) {
        await DeliveryAssignment.findByIdAndUpdate(
          order.assignment,
          {
            $set: {
              status: "delivered",
              deliveredAt: new Date(),
            },
          },
          {
            returnDocument: "after",
          },
        );
      }

      await order.save();

      return NextResponse.json(
        {
          success: true,
          message: "Order delivered successfully",
          order,
        },
        { status: 200 },
      );
    }

    // ============================================
    // NORMAL STATUS
    // ============================================

    order.status = status;

    await order.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Order status updated successfully",
        order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "❌ Update order status error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update order status",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 },
    );
  }
}