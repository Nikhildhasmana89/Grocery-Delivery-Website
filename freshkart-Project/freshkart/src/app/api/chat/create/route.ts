import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ChatRoom from "@/models/chatRoom.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch order to verify existence and check authorization
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const userIdStr = String(session.user.id);
    const customerIdStr = String(order.user);
    const assignedBoyIdStr = order.assignedDeliveryBoy
      ? String(order.assignedDeliveryBoy)
      : null;
    const isAdmin = (session.user as any).role === "admin";

    // Security check: Must be Customer, Assigned Delivery Partner, or Admin
    if (
      userIdStr !== customerIdStr &&
      userIdStr !== assignedBoyIdStr &&
      !isAdmin
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You are not authorized for this order chat" },
        { status: 403 }
      );
    }

    // Find or create ChatRoom for this order
    let chatRoom = await ChatRoom.findOne({ orderId: order._id });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        orderId: order._id,
        userId: order.user,
        deliveryBoyId: order.assignedDeliveryBoy || null,
        title: `Order #${order.orderRequestId || order._id}`,
      });
    } else if (
      !chatRoom.deliveryBoyId &&
      order.assignedDeliveryBoy &&
      String(chatRoom.deliveryBoyId) !== String(order.assignedDeliveryBoy)
    ) {
      // Update deliveryBoyId if partner was assigned after room creation
      chatRoom.deliveryBoyId = order.assignedDeliveryBoy;
      await chatRoom.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chat room resolved successfully",
        chatRoom,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Create Chat Room Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create or find chat room",
      },
      { status: 500 }
    );
  }
}
