import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
        await connectDB()
        const {userId,location} = await req.json()
        if(!userId || !location){
            return new NextResponse(JSON.stringify({error:"Missing userId or location"}),{status:400})
        }

        const user = await User.findByIdAndUpdate(userId, { location }, { new: true })
        if(!user){
            return new NextResponse(JSON.stringify({error:"User not found"}),{status:404})
        }
        return new NextResponse(JSON.stringify({message:"Location updated successfully", user}),{status:200})

    } catch (error) {
    console.error("Update location error:", error);

    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
    );
}
}