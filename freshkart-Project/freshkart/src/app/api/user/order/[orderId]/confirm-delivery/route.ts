import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    const { orderId } = await params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing Order ID",
        },
        { status: 400 }
      );
    }

    // Authenticate Customer
    const session = await auth();
    const customerId = session?.user?.id;

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Security check: Customer must own this order
    if (order.user.toString() !== customerId.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You cannot confirm another customer's order",
        },
        { status: 403 }
      );
    }

    if (order.status === "delivered" && order.customerConfirmed) {
      return NextResponse.json(
        {
          success: true,
          message: "Order has already been confirmed as delivered",
          order,
        },
        { status: 200 }
      );
    }

    if (!order.deliveryBoyCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery partner has not marked this order completed yet.",
        },
        { status: 400 }
      );
    }

    // Update order status to final 'delivered'
    order.status = "delivered";
    order.customerConfirmed = true;
    order.customerConfirmedAt = new Date();
    await order.save();

    // Update delivery assignment status to 'delivered' (freeing active slot for delivery boy)
    if (order.assignment) {
      await DeliveryAssignment.findByIdAndUpdate(order.assignment, {
        $set: {
          status: "delivered",
          deliveredAt: new Date(),
        },
      });
    }

    console.log(`🎉 Customer ${customerId} confirmed delivery for Order ${order._id}`);

    const deliveryBoyId = order.assignedDeliveryBoy
      ? String(order.assignedDeliveryBoy)
      : null;

    // Socket Notifications
    // 1. Notify Delivery Boy that customer confirmed receipt
    if (deliveryBoyId) {
      emitEventHandler(
        "delivery-confirmed",
        {
          orderId: String(order._id),
          orderRequestId: order.orderRequestId,
          message: "Customer has confirmed receipt of the order! Delivery complete.",
        },
        { userId: deliveryBoyId }
      ).catch(() => {});
    }

    // 2. Notify Customer
    emitEventHandler(
      "order-status-update",
      {
        orderId: String(order._id),
        orderRequestId: order.orderRequestId,
        status: "delivered",
        message: "Order successfully delivered and confirmed!",
      },
      { userId: String(customerId) }
    ).catch(() => {});

    // 3. Notify Admin / All connected listeners
    emitEventHandler(
      "order-delivered",
      {
        orderId: String(order._id),
        orderRequestId: order.orderRequestId,
        status: "delivered",
      },
      {}
    ).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: "Delivery confirmed! Order is now marked as delivered.",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Customer confirm delivery API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm delivery",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
