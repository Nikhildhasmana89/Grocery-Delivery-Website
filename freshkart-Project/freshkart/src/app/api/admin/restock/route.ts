import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import emitEventHandler from "@/lib/emitEventHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    const { groceryId, amount = 20 } = await req.json();

    if (!groceryId) {
      return NextResponse.json(
        { success: false, message: "Grocery ID is required" },
        { status: 400 }
      );
    }

    const updatedItem = await Grocery.findByIdAndUpdate(
      groceryId,
      { $inc: { stock: Number(amount) } },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: "Grocery item not found" },
        { status: 404 }
      );
    }

    try {
      await emitEventHandler("inventory-updated", {
        groceryId: updatedItem._id.toString(),
        stock: updatedItem.stock,
      });

      const { revalidateTag, revalidatePath } = await import("next/cache");
      (revalidateTag as any)("products-cache", "default");
      revalidatePath("/", "layout");
    } catch {
      // Non-blocking notification & revalidation
    }

    return NextResponse.json(
      {
        success: true,
        message: `Restocked ${updatedItem.name} successfully`,
        item: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Restock API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to restock item",
      },
      { status: 500 }
    );
  }
}
