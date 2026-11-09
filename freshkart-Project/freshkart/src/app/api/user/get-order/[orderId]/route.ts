import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    // Get orderId from dynamic route
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    console.log("🔎 Fetching order:", orderId);
    const { auth } = await import("@/auth");
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Please log in to view this order.",
        },
        { status: 401 }
      );
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email mobile image")
      .populate(
        "assignedDeliveryBoy",
        "name email mobile image location socketId isOnline"
      )
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Authorization check: User must be the owner, assigned delivery partner, or admin
    const sessionUserId = String(session.user.id);
    const sessionRole = String((session.user as any).role || "").toLowerCase();
    const orderOwnerId = order.user && typeof order.user === "object" ? String((order.user as any)._id) : String(order.user);
    const assignedPartnerId = order.assignedDeliveryBoy && typeof order.assignedDeliveryBoy === "object" ? String((order.assignedDeliveryBoy as any)._id) : String(order.assignedDeliveryBoy);

    const isAuthorized =
      sessionUserId === orderOwnerId ||
      sessionUserId === assignedPartnerId ||
      sessionRole === "admin";

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You do not have permission to view this order.",
        },
        { status: 403 }
      );
    }

    console.log("✅ Order found:", order._id);

    let deliveryBoy = null;
    let deliveryBoyLocation = null;

    if (order.assignedDeliveryBoy && typeof order.assignedDeliveryBoy === "object") {
      const dbObj = order.assignedDeliveryBoy as any;
      deliveryBoy = {
        _id: String(dbObj._id),
        name: dbObj.name,
        email: dbObj.email,
        mobile: dbObj.mobile,
        image: dbObj.image,
        isOnline: Boolean(dbObj.isOnline),
      };

      if (dbObj.location?.coordinates && Array.isArray(dbObj.location.coordinates)) {
        const [lon, lat] = dbObj.location.coordinates;
        if (typeof lat === "number" && typeof lon === "number" && (lat !== 0 || lon !== 0)) {
          deliveryBoyLocation = {
            latitude: lat,
            longitude: lon,
          };
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        order,
        deliveryBoy,
        deliveryBoyLocation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Get order by ID error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}