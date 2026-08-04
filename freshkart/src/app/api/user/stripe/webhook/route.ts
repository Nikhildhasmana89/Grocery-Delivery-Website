import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Order from "@/app/models/order.model";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature")!;
    const rawBody = await req.text();
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
        console.error("Error occurred while constructing webhook event:", error);
        return NextResponse.json({ message: "Webhook Error: Invalid signature" }, { status: 400 });
    }

    if (event?.type === "checkout.session.completed") {
        const session = event.data.object
        await connectDB()
        await Order.findByIdAndUpdate(session?.metadata?.orderId, { isPaid: true })
        console.log("Checkout Session Completed:", session);
       
    }

    return NextResponse.json({ received: true });
}
