import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";
import emitEventHandler from "@/lib/emitEventHandler";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    // =========================
    // GET PARAMS
    // =========================

    const { orderId } = await params;
    const { status } = await req.json();

    console.log("========== UPDATE ORDER STATUS ==========");
    console.log("Order ID:", orderId);
    console.log("New Status:", status);

    // =========================
    // VALIDATION
    // =========================

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: "orderId and status are required",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "pending",
      "out of delivery",
      "delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid order status",
          allowedStatuses,
        },
        { status: 400 }
      );
    }

    // =========================
    // FIND ORDER
    // =========================

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ Order found:", order._id);
    console.log("Current status:", order.status);

    // =========================
    // FIX OLD ORDERS
    // =========================

    if (!order.orderRequestId) {
      order.orderRequestId = `ORD-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")}`;

      console.log(
        "🆕 Generated missing orderRequestId:",
        order.orderRequestId
      );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    order.status = status;

    // =====================================================
    // OUT OF DELIVERY
    // =====================================================

    if (status === "out of delivery" && !order.assignment) {
      console.log("🚚 Starting delivery assignment...");

      const { latitude, longitude } = order.address;

      // =========================
      // CHECK LOCATION
      // =========================

      if (
        latitude === undefined ||
        longitude === undefined ||
        latitude === null ||
        longitude === null
      ) {
        return NextResponse.json(
          {
            error: "Order location is missing",
          },
          { status: 400 }
        );
      }

      console.log("📍 Order location:", {
        latitude,
        longitude,
      });

      // =========================
      // FIND NEARBY DELIVERY BOYS
      // =========================

      const nearbyDeliveryBoys = await User.find({
        role: "deliveryBoy",
        isOnline: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 15000,
          },
        },
      });

      console.log(
        "🚴 Nearby delivery boys:",
        nearbyDeliveryBoys.length
      );

      // =========================
      // NO DELIVERY BOY
      // =========================

      if (nearbyDeliveryBoys.length === 0) {
        await order.save();

        console.log(
          "⚠️ No available delivery boy nearby"
        );

        return NextResponse.json(
          {
            message:
              "Order status updated, but no available delivery boy nearby",
            orderId: order._id,
            status: order.status,
          },
          { status: 200 }
        );
      }

      // =========================
      // GET DELIVERY BOY IDS
      // =========================

      const nearbyIds = nearbyDeliveryBoys.map(
        (boy) => boy._id
      );

      // =========================
      // FIND BUSY DELIVERY BOYS
      // =========================

      const busyIds = await DeliveryAssignment.find({
        assignedTo: {
          $in: nearbyIds,
        },
        status: {
          $in: ["assigned", "pending"],
        },
      }).distinct("assignedTo");

      const busyIdSet = new Set(
        busyIds.map((id) => id.toString())
      );

      // =========================
      // AVAILABLE DELIVERY BOYS
      // =========================

      const availableDeliveryBoys =
        nearbyDeliveryBoys.filter(
          (boy) =>
            !busyIdSet.has(boy._id.toString())
        );

      console.log(
        "✅ Available delivery boys:",
        availableDeliveryBoys.length
      );

      // =========================
      // NO AVAILABLE BOY
      // =========================

      if (availableDeliveryBoys.length === 0) {
        await order.save();

        return NextResponse.json(
          {
            message:
              "Order status updated, but no available delivery boy nearby",
            orderId: order._id,
            status: order.status,
          },
          { status: 200 }
        );
      }

      // =========================
      // SELECT DELIVERY BOY
      // =========================

      const selectedDeliveryBoy =
        availableDeliveryBoys[0];

      console.log(
        "👤 Selected delivery boy:",
        selectedDeliveryBoy._id
      );

      console.log(
        "🔌 Socket ID:",
        selectedDeliveryBoy.socketId
      );

      // =========================
      // CREATE ASSIGNMENT
      // =========================

      const deliveryAssignment =
        await DeliveryAssignment.create({
          order: order._id,
          assignedTo: selectedDeliveryBoy._id,
          status: "assigned",
        });

      console.log(
        "✅ Assignment created:",
        deliveryAssignment._id
      );

      // =========================
      // ATTACH ASSIGNMENT TO ORDER
      // =========================

      order.assignment =
        deliveryAssignment._id;

      order.assignedDeliveryBoy =
        selectedDeliveryBoy._id;

      // =========================
      // SAVE ORDER
      // =========================

      await order.save();

      console.log("✅ Order saved successfully");

      // =========================
      // NOTIFY DELIVERY BOY
      // =========================

      if (selectedDeliveryBoy.socketId) {
        console.log(
          "📢 Sending new-assignment notification..."
        );

        await emitEventHandler(
          "new-assignment",
          {
            assignmentId:
              deliveryAssignment._id.toString(),

            orderId:
              order._id.toString(),

            status: "assigned",
          },
          selectedDeliveryBoy.socketId
        );

        console.log(
          "✅ Notification request sent"
        );
      } else {
        console.log(
          "⚠️ Delivery boy has no socketId"
        );
      }

      // =========================
      // POPULATE
      // =========================

      await deliveryAssignment.populate("order");

      await order.populate("user");

      // =========================
      // RESPONSE
      // =========================

      return NextResponse.json(
        {
          message:
            "Order status updated and delivery boy assigned",

          orderId: order._id,

          status: order.status,

          assignment: deliveryAssignment,

          assignedDeliveryBoy: {
            id: selectedDeliveryBoy._id,
            name: selectedDeliveryBoy.name,
            email: selectedDeliveryBoy.email,
            mobile: selectedDeliveryBoy.phone,
            socketId:
              selectedDeliveryBoy.socketId,
          },
        },
        { status: 200 }
      );
    }

    // =====================================================
    // NORMAL STATUS UPDATE
    // =====================================================

    await order.save();

    console.log(
      "✅ Order status updated successfully"
    );

    return NextResponse.json(
      {
        message:
          "Order status updated successfully",

        orderId: order._id,

        status: order.status,

        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ Update order status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update order status",

        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}