import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import crypto from "crypto";
import emitEventHandler from "@/lib/emitEventHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      address,
      status,
    } = await req.json();

    console.log("========== CREATE ORDER ==========");
    console.log({
      userId,
      itemsCount: items?.length,
      totalAmount,
      paymentMethod,
      address,
      status,
    });

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty",
        },
        { status: 400 }
      );
    }

    if (
      totalAmount === undefined ||
      totalAmount === null ||
      Number(totalAmount) <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid total amount is required",
        },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method is required",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address is required",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user = await User.findById(userId).select(
      "_id name email mobile image"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // ADDRESS VALIDATION
    // ==========================================

    const {
      fullName,
      mobile,
      city,
      state,
      pincode,
      fullAddress,
      latitude,
      longitude,
    } = address;

    if (
      !fullName ||
      !mobile ||
      !city ||
      !state ||
      !pincode ||
      !fullAddress ||
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Incomplete delivery address details",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // GENERATE UNIQUE ORDER REQUEST ID
    // ==========================================

    const orderRequestId =
      `ORD-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")}`;

    // ==========================================
    // CREATE ORDER
    // ==========================================

    const newOrder = await Order.create({
      user: user._id,

      orderRequestId,

      items,

      totalAmount: String(totalAmount),

      paymentMethod,

      isPaid:
        paymentMethod === "cod"
          ? false
          : false,

      address: {
        fullName,
        mobile,
        city,
        state,
        pincode,
        fullAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },

      status: status || "pending",

      // No delivery assignment yet
      assignment: null,

      // No delivery boy yet
      assignedDeliveryBoy: null,
    });

    console.log(
      "✅ Order created:",
      newOrder._id.toString()
    );

    console.log(
      "🆔 Order Request ID:",
      newOrder.orderRequestId
    );

    // ==========================================
    // DO NOT ASSIGN DELIVERY BOY HERE
    // ==========================================
    //
    // The admin should change the order to:
    //
    // "out of delivery"
    //
    // Then your admin status API creates
    // the DeliveryAssignment and broadcasts
    // "new-assignment".
    //
    // ==========================================

    // Optional notification for other parts
    // of your application.
    //
    // This broadcasts to every connected socket.
    //
    try {
      await emitEventHandler(
        "new-order",
        {
          orderId: newOrder._id.toString(),

          orderRequestId:
            newOrder.orderRequestId,

          status: newOrder.status,

          totalAmount:
            newOrder.totalAmount,
        }
      );
    } catch (socketError) {
      console.error(
        "⚠️ New order socket notification failed:",
        socketError
      );

      // Do NOT fail order creation because
      // Socket.IO notification failed.
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order placed successfully",

        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "❌ CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to create order",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}