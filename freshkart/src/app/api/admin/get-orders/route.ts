import connectDB from "@/app/lib/db";
import Order from "@/app/models/order.model";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET(request: Request) {
    try{
        await connectDB()
        const orders = await Order.find().populate("user")
        if(!orders) {
            return NextResponse.json({ message: "No orders found" }, { status: 404 })
        }
        return NextResponse.json({ orders }, { status: 200 })


    }catch (error) {
        return NextResponse.json({ message: "get-orders server error" }, { status: 500 })
    }
}