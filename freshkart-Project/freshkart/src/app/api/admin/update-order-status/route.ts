import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        await connectDB();
        const {orderId}  = await params
        const { status } = await req.json();

        const order = await Order.findById(orderId).populate("user");
        if(!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        order.status = status;

        let availableDeliveryBoy: any = []
        if(status === "out of delivery" && !order.assignedDeliveryBoy) {
            availableDeliveryBoy = await Order.find({ status: "out of delivery" }).populate("assignedDeliveryBoy");
        }

        return NextResponse.json({ message: "Order status updated", orderId, status }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }
}