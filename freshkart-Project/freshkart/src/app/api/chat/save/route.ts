import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import ChatRoom from "@/models/chatRoom.model";
import Message from "@/models/message.model";
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

    const { chatRoomId, content, sender: requestedSender, orderId } = await req.json();

    const trimmedContent = (content || "").trim();
    if (!trimmedContent) {
      return NextResponse.json(
        { success: false, message: "Message content cannot be empty" },
        { status: 400 }
      );
    }

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

    // Determine authorized sender role based on session identity
    let actualSender: "user" | "deliveryBoy" | "assistant";

    if (userIdStr === customerIdStr) {
      actualSender = "user";
    } else if (userIdStr === deliveryBoyIdStr) {
      actualSender = "deliveryBoy";
    } else if (isAdmin) {
      actualSender = requestedSender === "deliveryBoy" ? "deliveryBoy" : "user";
    } else {
      return NextResponse.json(
        { success: false, message: "Forbidden: You are not a participant in this chat" },
        { status: 403 }
      );
    }

    // Save message to MongoDB
    const newMessage = await Message.create({
      chatRoomId: chatRoom._id,
      userId: chatRoom.userId,
      deliveryBoyId: chatRoom.deliveryBoyId ? chatRoom.deliveryBoyId : undefined,
      orderId: chatRoom.orderId ? chatRoom.orderId : undefined,
      sender: actualSender,
      content: trimmedContent,
    });

    const populatedMessage = {
      _id: String(newMessage._id),
      chatRoomId: String(newMessage.chatRoomId),
      userId: String(newMessage.userId),
      deliveryBoyId: newMessage.deliveryBoyId ? String(newMessage.deliveryBoyId) : null,
      orderId: newMessage.orderId ? String(newMessage.orderId) : null,
      sender: newMessage.sender,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
    };

    // Broadcast new message via Socket.IO room
    try {
      await emitEventHandler("new-message", populatedMessage, {
        room: String(chatRoom._id),
      });
    } catch (socketError) {
      console.error("⚠️ Socket broadcast notification failed:", socketError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message saved successfully",
        data: populatedMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Save Message Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to save message",
      },
      { status: 500 }
    );
  }
}
