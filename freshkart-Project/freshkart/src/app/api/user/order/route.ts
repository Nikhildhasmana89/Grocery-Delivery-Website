import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, items, totalAmount, paymentMethod, address, status } =
      await req.json();

    console.log("Incoming Order:");
    console.log({
      userId,
      items,
      totalAmount,
      paymentMethod,
      address,
      status,
    });
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", userId },
        { status: 400 },
      );
    }

    if (!items) {
      return NextResponse.json(
        { success: false, message: "Items missing" },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 },
      );
    }

    if (!totalAmount) {
      return NextResponse.json(
        { success: false, message: "Total amount missing" },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method missing" },
        { status: 400 },
      );
    }

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address missing" },
        { status: 400 },
      );
    }

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
      longitude === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Incomplete delivery address details" },
        { status: 400 },
      );
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      totalAmount: String(totalAmount),
      paymentMethod,
      address: {
        fullName,
        mobile,
        city,
        state,
        pincode,
        fullAddress,
        latitude,
        longitude,
      },
      status: status || "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order: newOrder,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message || error,
      },
      { status: 500 },
    );
  }
}
