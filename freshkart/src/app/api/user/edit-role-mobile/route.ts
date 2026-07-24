import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "../../../../lib/connectDB"
import User from "../../../../models/User"

export async function POST(req: NextRequest) {
    try {
        await connectDB()

        // 1. Get authenticated session
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        // 2. Parse request body
        const { role, mobile } = await req.json()

        // 3. Update user and return updated document ({ new: true })
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { role, mobile },
            { new: true }
        )

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(user, { status: 200 })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { message: "Failed to update role and mobile number" },
            { status: 500 }
        )
    }
}