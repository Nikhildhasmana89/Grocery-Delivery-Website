import connectDB from "@/app/lib/db";
import Order from "@/app/models/order.model";
import { auth } from "@/auth";
import { NextResponse } from "next/server";




export async function GET(request: Request) {
    try{
        await connectDB()
        const session = await auth()
        const orders = await Order.find({ user: session?.user?.id }).populate("user")
        if(!orders) {
            return NextResponse.json({ message: "No orders found" }, { status: 404 })
        }
        return NextResponse.json({ orders }, { status: 200 })
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}