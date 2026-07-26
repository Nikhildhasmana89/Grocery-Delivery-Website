import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/app/lib/db";
import User from "@/app/models/user.model";

export async function POST(req: NextRequest) {
    try {
        await connectDB()

        // 1. Get authenticated session 
        const session = await auth(req)

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized. Please log in." },
                { status: 401 }
            )
        }

        // 2. Parse request body
        const { role, mobile } = await req.json()

        if (!role || !mobile) {
             return NextResponse.json(
                { message: "Role and mobile number are required." },
                { status: 400 }
            )
        }

        // 3. Update user
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { role, mobile },
            { new: true }
        )

        if (!user) {
            return NextResponse.json(
                { message: "User not found in database." },
                { status: 404 }
            )
        }

        return NextResponse.json(user, { status: 200 })
    } catch (error: any) {
        // Detailed server console logging to catch exact DB or Auth errors
        console.error("Error in update-role-mobile API:", error.message || error)
        
        return NextResponse.json(
            { message: error.message || "Failed to update role and mobile number" },
            { status: 500 }
        )
    }
}