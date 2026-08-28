import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import Grocery from "@/models/grocery.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate & Authorize Admin
    const session = await auth();
    const userRole = String((session?.user as any)?.role || "").trim().toLowerCase();

    if (!session?.user?.id || userRole !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure models are registered for populates
    if (!mongoose.models.User) mongoose.model("User", User.schema);
    if (!mongoose.models.Grocery) mongoose.model("Grocery", Grocery.schema);
    if (!mongoose.models.Order) mongoose.model("Order", Order.schema);
    if (!mongoose.models.DeliveryAssignment) mongoose.model("DeliveryAssignment", DeliveryAssignment.schema);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "Today";

    const now = new Date();
    let currentStart = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    if (period === "Today") {
      currentStart.setHours(0, 0, 0, 0);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
    } else if (period === "Week") {
      currentStart.setDate(currentStart.getDate() - 7);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 7);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
    } else {
      // Month (30 days)
      currentStart.setDate(currentStart.getDate() - 30);

      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 30);

      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
    }

    // 2. Fetch Aggregated Metrics concurrently
    const [
      deliveredCurrentOrders,
      deliveredPrevOrders,
      activeOrdersCount,
      activePrevOrdersCount,
      totalGroceriesCount,
      lowStockCount,
      totalCustomersCount,
      newCustomersCount,
      lowStockItems,
      recentOrdersRaw,
    ] = await Promise.all([
      // Delivered orders in current period
      Order.find({
        status: "delivered",
        createdAt: { $gte: currentStart, $lte: now },
      }).select("totalAmount createdAt").lean(),

      // Delivered orders in previous period
      Order.find({
        status: "delivered",
        createdAt: { $gte: prevStart, $lte: prevEnd },
      }).select("totalAmount createdAt").lean(),

      // Active orders in progress right now (pending or out for delivery)
      Order.countDocuments({
        status: { $in: ["pending", "out of delivery"] },
      }),

      // Active orders in previous period
      Order.countDocuments({
        status: { $in: ["pending", "out of delivery"] },
        createdAt: { $gte: prevStart, $lte: prevEnd },
      }),

      // Total grocery inventory count
      Grocery.countDocuments({}),

      // Count of low stock items (stock <= 10)
      Grocery.countDocuments({ stock: { $lte: 10 } }),

      // Total registered customers (role === 'user')
      User.countDocuments({ role: "user" }),

      // New registered customers in current period
      User.countDocuments({
        role: "user",
        createdAt: { $gte: currentStart, $lte: now },
      }),

      // Low stock items list
      Grocery.find({ stock: { $lte: 10 } })
        .select("_id name category stock minStock unit price image")
        .sort({ stock: 1 })
        .limit(5)
        .lean(),

      // Recent Customer Orders
      Order.find({})
        .populate("user", "name email mobile image")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // 3. Calculate Revenue
    const currentRevenue = deliveredCurrentOrders.reduce(
      (acc, o) => acc + (parseFloat(o.totalAmount) || 0),
      0
    );

    const prevRevenue = deliveredPrevOrders.reduce(
      (acc, o) => acc + (parseFloat(o.totalAmount) || 0),
      0
    );

    let revenueChange = 0;
    let revenueHasPrev = false;
    if (prevRevenue > 0) {
      revenueChange = parseFloat(
        (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      );
      revenueHasPrev = true;
    } else if (currentRevenue > 0) {
      revenueChange = 100;
      revenueHasPrev = true;
    }

    // 4. Calculate Active Orders Change
    let activeOrdersChange = 0;
    let activeOrdersHasPrev = false;
    if (activePrevOrdersCount > 0) {
      activeOrdersChange = parseFloat(
        (
          ((activeOrdersCount - activePrevOrdersCount) /
            activePrevOrdersCount) *
          100
        ).toFixed(1)
      );
      activeOrdersHasPrev = true;
    }

    // 5. Format Recent Orders
    const recentOrders = recentOrdersRaw.map((o: any) => {
      const customerName =
        o.user && typeof o.user === "object" && o.user.name
          ? o.user.name
          : o.address?.fullName || "Guest Customer";

      const itemsSummary = Array.isArray(o.items)
        ? o.items.map((i: any) => `${i.name || "Item"} (${i.quantity || 1})`).join(", ")
        : "Order items";

      const relativeTime = o.createdAt
        ? new Date(o.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Just now";

      return {
        id: o.orderRequestId || String(o._id),
        _id: String(o._id),
        customer: customerName,
        items: itemsSummary,
        amount: `₹${o.totalAmount || "0"}`,
        status: o.status || "pending",
        time: relativeTime,
        createdAt: o.createdAt,
      };
    });

    // 6. Check Real System Health
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;

    return NextResponse.json(
      {
        success: true,
        period,
        stats: {
          revenue: {
            value: `₹${currentRevenue.toLocaleString("en-IN")}`,
            numeric: currentRevenue,
            change: revenueHasPrev
              ? `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`
              : "No previous data",
            isPositive: revenueChange >= 0,
            hasPrev: revenueHasPrev,
          },
          activeOrders: {
            value: activeOrdersCount,
            change: activeOrdersHasPrev
              ? `${activeOrdersChange >= 0 ? "+" : ""}${activeOrdersChange}%`
              : "Current progress",
            isPositive: activeOrdersChange >= 0,
            hasPrev: activeOrdersHasPrev,
          },
          groceryItems: {
            value: totalGroceriesCount,
            lowStockCount,
            change:
              lowStockCount > 0
                ? `${lowStockCount} item${lowStockCount === 1 ? "" : "s"} low stock`
                : "Sufficiently stocked",
            isPositive: lowStockCount === 0,
          },
          totalCustomers: {
            value: totalCustomersCount.toLocaleString("en-IN"),
            newCount: newCustomersCount,
            change:
              newCustomersCount > 0
                ? `+${newCustomersCount} new this ${period.toLowerCase()}`
                : "Total registered",
            isPositive: true,
          },
        },
        recentOrders,
        lowStockItems: lowStockItems.map((item: any) => ({
          _id: String(item._id),
          name: item.name,
          category: item.category || "General",
          stock: typeof item.stock === "number" ? item.stock : 20,
          min: typeof item.minStock === "number" ? item.minStock : 10,
        })),
        storeStatus: {
          isDbConnected,
          dbStatusText: isDbConnected ? "Connected" : "Disconnected",
          apiStatusText: "Healthy",
          systemHealthText: isDbConnected ? "100% Operational" : "Degraded",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Admin Dashboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin dashboard analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
