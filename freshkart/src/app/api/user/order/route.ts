import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Order from "@/app/models/order.model";
import User from "@/app/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, items, totalAmount, paymentMethod, address, status } =
      await req.json();

    const user = await User.findById(userId);

    if (
      !user ||
      !items ||
      !items.length ||
      !totalAmount ||
      !paymentMethod ||
      !address
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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
      logitute,
    } = address;
    if (
      !fullName ||
      !mobile ||
      !city ||
      !state ||
      !pincode ||
      !fullAddress ||
      latitude === undefined ||
      logitute === undefined
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
        logitute,
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
