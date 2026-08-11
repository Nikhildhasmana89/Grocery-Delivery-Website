import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDB();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const assignment = await DeliveryAssignment.find({
      assignedTo: session.user.id,
      status: "assigned",
    }).populate("order");

    return NextResponse.json(
      {
        assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get delivery assignment error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch delivery assignment",
      },
      { status: 500 }
    );
  }
}