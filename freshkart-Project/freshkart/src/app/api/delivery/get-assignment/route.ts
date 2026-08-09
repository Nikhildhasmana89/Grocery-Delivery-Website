import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@/auth";


export async function GET(){
    try{
        await connectDB()
        const session = await auth()
        const assignment = await DeliveryAssignment.find({
            brodcastedTo: session?.user?.id,
            status: "brodcasted"




        })

        return NextResponse.json({
           assignment
        },{status:200})
    }catch(error){
        return NextResponse.json({
            error: "Failed to fetch delivery assignment"
        },{status:500})
    }
}