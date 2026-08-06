// app/api/user/edit-role-mobile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // 1. Get authenticated session 
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // 2. Parse request body
        const { role, mobile } = await req.json();

        if (!role) {
             return NextResponse.json(
                { message: "Role is required." },
                { status: 400 }
            );
        }

        // Build update payload dynamically
        const updateData: { role: string; roleSelected: boolean; mobile?: string } = {
            role,
            roleSelected: true
        };
        if (mobile) {
            updateData.mobile = mobile;
        }

        // 3. Update user in MongoDB
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            updateData,
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { message: "User not found in database." },
                { status: 404 }
            );
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
        console.error("Error in update-role-mobile API:", error.message || error);
        
        return NextResponse.json(
            { message: error.message || "Failed to update role" },
            { status: 500 }
        );
    }
}