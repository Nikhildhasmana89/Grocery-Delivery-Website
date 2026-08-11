import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      orderRequestId,
      userId,
      items,
      totalAmount,
      paymentMethod,
      address,
      status,
    } = await req.json();

    console.log("========== Incoming Request ==========");
    console.log({
      orderRequestId,
      userId,
      items,
      totalAmount,
      paymentMethod,
      address,
      status,
    });

    const user = await User.findById(userId);

    console.log("User Found:", !!user);

    if (
      !orderRequestId ||
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

    const existingOrder = await Order.findOne({ orderRequestId });

    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          message: "Order already created",
          order: existingOrder,
        },
        { status: 200 },
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Order Payment",
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: newOrder._id.toString(),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe session creation failed",
        },
        { status: 500 },
      );
    }
    console.log("Stripe Checkout URL:", session.url);

    return NextResponse.json(
      {
        success: true,
        url: session.url,
        order: newOrder,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Order Creation API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process order on server",
      },
      { status: 500 },
    );
  }
}
