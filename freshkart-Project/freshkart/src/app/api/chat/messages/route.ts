import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ChatRoom from "@/models/chatRoom.model";
import Message from "@/models/message.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const chatRoomId = searchParams.get("chatRoomId");
    const orderId = searchParams.get("orderId");

    if (!chatRoomId && !orderId) {
      return NextResponse.json(
        { success: false, message: "chatRoomId or orderId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let chatRoom = null;
    if (chatRoomId) {
      chatRoom = await ChatRoom.findById(chatRoomId);
    } else if (orderId) {
      chatRoom = await ChatRoom.findOne({ orderId });
    }

    if (!chatRoom) {
      return NextResponse.json(
        { success: false, message: "Chat room not found" },
        { status: 404 }
      );
    }

    const userIdStr = String(session.user.id);
    const customerIdStr = String(chatRoom.userId);
    const deliveryBoyIdStr = chatRoom.deliveryBoyId
      ? String(chatRoom.deliveryBoyId)
      : null;
    const isAdmin = (session.user as any).role === "admin";

    // Verify access
    if (
      userIdStr !== customerIdStr &&
      userIdStr !== deliveryBoyIdStr &&
      !isAdmin
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You are not authorized to view this chat" },
        { status: 403 }
      );
    }

    // Fetch messages in chronological order
    const messages = await Message.find({ chatRoomId: chatRoom._id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Messages fetched successfully",
        chatRoom,
        data: messages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Get Chat Messages Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}