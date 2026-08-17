import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";
import emitEventHandler from "@/lib/emitEventHandler";
import crypto from "crypto";

type OrderStatus =
  | "pending"
  | "out of delivery"
  | "delivered";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ orderId: string }>;
  },
) {
  try {
    await connectDB();

    // ============================================
    // PARAMS
    // ============================================

    const { orderId } = await params;

    const body = await req.json();

    const status = String(
      body?.status ?? "",
    ).trim() as OrderStatus;

    console.log(
      "========================================",
    );
    console.log(
      "========== UPDATE ORDER STATUS ==========",
    );
    console.log("Order ID:", orderId);
    console.log("New Status:", status);
    console.log(
      "========================================",
    );

    // ============================================
    // VALIDATION
    // ============================================

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          error:
            "orderId and status are required",
        },
        {
          status: 400,
        },
      );
    }

    const allowedStatuses: OrderStatus[] = [
      "pending",
      "out of delivery",
      "delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status",
          allowedStatuses,
        },
        {
          status: 400,
        },
      );
    }

    // ============================================
    // FIND ORDER
    // ============================================

    const order =
      await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    console.log(
      "Order found:",
      order._id,
    );

    console.log(
      "Current status:",
      order.status,
    );

    console.log(
      "Requested status:",
      status,
    );

    // ============================================
    // OLD ORDER FIX
    // ============================================

    if (!order.orderRequestId) {
      order.orderRequestId =
        `ORD-${Date.now()}-${crypto
          .randomBytes(4)
          .toString("hex")}`;

      await order.save();

      console.log(
        "Generated orderRequestId:",
        order.orderRequestId,
      );
    }

    // ============================================
    // DELIVERED ORDER PROTECTION
    // ============================================

    if (
      order.status === "delivered" &&
      status !== "delivered"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A delivered order cannot be moved backwards.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================
    // OUT FOR DELIVERY
    // ============================================

    if (
      status === "out of delivery"
    ) {
      console.log(
        "🚚 Making order available to delivery boys...",
      );

      // ==========================================
      // CHECK EXISTING ACTIVE ASSIGNMENT
      // ==========================================

      const existingAssignment =
        await DeliveryAssignment.findOne({
          order: order._id,
          status: {
            $in: [
              "broadcasted",
              "assigned",
            ],
          },
        }).lean();

      // ==========================================
      // EXISTING ASSIGNMENT
      // ==========================================

      if (existingAssignment) {
        console.log(
          "Active assignment already exists:",
          existingAssignment._id,
        );

        // ----------------------------------------
        // ASSIGNMENT ALREADY ACCEPTED
        // ----------------------------------------

        if (
          existingAssignment.status ===
          "assigned"
        ) {
          order.status =
            "out of delivery";

          order.assignment =
            existingAssignment._id;

          order.assignedDeliveryBoy =
            existingAssignment.assignedTo ??
            null;

          await order.save();

          console.log(
            "✅ Order is already assigned to delivery boy:",
            existingAssignment.assignedTo,
          );

          // Notify customer about the
          // current order status.
          await notifyCustomerStatus(
            order,
            "out of delivery",
          );

          return NextResponse.json(
            {
              success: true,
              message:
                "Order is already assigned",
              order,
              assignment:
                existingAssignment,
            },
            {
              status: 200,
            },
          );
        }

        // ----------------------------------------
        // EXISTING BROADCASTED ASSIGNMENT
        // ----------------------------------------

        order.status =
          "out of delivery";

        order.assignment =
          existingAssignment._id;

        order.assignedDeliveryBoy =
          null;

        await order.save();

        console.log(
          "📢 Existing broadcasted assignment found.",
        );

        // Re-fetch the delivery boys that
        // this assignment was broadcast to.
        const broadcastedDeliveryBoyIds =
          (
            existingAssignment.broadcastedTo ??
            []
          ).map((id: any) => String(id));

        const deliveryBoys =
          await User.find({
            _id: {
              $in:
                broadcastedDeliveryBoyIds,
            },
            role: {
              $in: [
                "deliveryBoy",
                "deliveryboy",
                "delivery_boy",
              ],
            },
          }).select(
            "_id name email mobile socketId isOnline",
          );

        console.log(
          "Delivery boys for existing assignment:",
          deliveryBoys.length,
        );

        // ----------------------------------------
        // RE-SEND SOCKET NOTIFICATION (ROOM BROADCAST)
        // ----------------------------------------

        const notificationData = {
          assignmentId: String(existingAssignment._id),
          orderId: String(order._id),
          orderRequestId: order.orderRequestId,
          status: "broadcasted",
          message: "New delivery order available",
        };

        // Broadcast to delivery-boys room in background (non-blocking)
        emitEventHandler("new-assignment", notificationData, { room: "delivery-boys" }).catch((err) =>
          console.error("❌ Socket broadcast error:", err)
        );

        // Also notify each broadcasted delivery boy directly in background
        for (const deliveryBoy of deliveryBoys) {
          emitEventHandler("new-assignment", notificationData, { userId: String(deliveryBoy._id) }).catch(() => {});
          if (deliveryBoy.socketId) {
            emitEventHandler("new-assignment", notificationData, deliveryBoy.socketId).catch(() => {});
          }
        }

        // Notify customer in background
        notifyCustomerStatus(order, "out of delivery").catch(() => {});

        return NextResponse.json(
          {
            success: true,
            message:
              "Order is already available to delivery boys",
            order,
            assignment:
              existingAssignment,
          },
          {
            status: 200,
          },
        );
      }

      // ==========================================
      // FIND DELIVERY BOYS (EXCLUDING REJECTED)
      // ==========================================

      const pastAssignments = await DeliveryAssignment.find({ order: order._id });
      const previouslyRejectedBoyIds: string[] = [];
      pastAssignments.forEach((assign) => {
        if (assign.rejectedBy && Array.isArray(assign.rejectedBy)) {
          assign.rejectedBy.forEach((id: any) =>
            previouslyRejectedBoyIds.push(String(id)),
          );
        }
      });

      const deliveryBoys =
        await User.find({
          role: {
            $in: [
              "deliveryBoy",
              "deliveryboy",
              "delivery_boy",
            ],
          },
          _id: { $nin: previouslyRejectedBoyIds },
        }).select(
          "_id name email mobile socketId isOnline",
        );

      console.log(
        "Total delivery boys:",
        deliveryBoys.length,
      );

      // ==========================================
      // NO DELIVERY BOYS
      // ==========================================

      if (deliveryBoys.length === 0) {
        order.status =
          "out of delivery";

        order.assignment = null;

        order.assignedDeliveryBoy =
          null;

        await order.save();

        notifyCustomerStatus(
          order,
          "out of delivery",
        ).catch(() => {});

        return NextResponse.json(
          {
            success: true,
            message:
              "Order marked out for delivery, but no delivery boys are registered.",
            order,
          },
          {
            status: 200,
          },
        );
      }

      // ==========================================
      // DELIVERY BOY IDS
      // ==========================================

      const deliveryBoyIds =
        deliveryBoys.map(
          (boy) => boy._id,
        );

      console.log(
        "Broadcasting to delivery boys:",
        deliveryBoyIds.map((id) =>
          String(id),
        ),
      );

      // ==========================================
      // CREATE BROADCAST ASSIGNMENT
      // ==========================================

      const deliveryAssignment =
        await DeliveryAssignment.create({
          order: order._id,

          broadcastedTo:
            deliveryBoyIds,

          assignedTo: null,

          status: "broadcasted",

          acceptedAt: null,
        });

      console.log(
        "Broadcast assignment created:",
        deliveryAssignment._id,
      );

      console.log(
        "Broadcasted To:",
        deliveryBoyIds.map((id) =>
          String(id),
        ),
      );

      // ==========================================
      // UPDATE ORDER
      // ==========================================

      order.status =
        "out of delivery";

      order.assignment =
        deliveryAssignment._id;

      order.assignedDeliveryBoy =
        null;

      await order.save();

      console.log(
        "✅ Order saved successfully",
      );

      // ==========================================
      // SOCKET NOTIFICATION (ROOM & NON-BLOCKING)
      // ==========================================

      const notificationData = {
        assignmentId:
          String(
            deliveryAssignment._id,
          ),

        orderId:
          String(order._id),

        orderRequestId:
          order.orderRequestId,

        status: "broadcasted",

        message:
          "New delivery order available",
      };

      console.log(
        "📡 Sending new-assignment notifications in background...",
      );

      // Broadcast to delivery-boys room immediately
      emitEventHandler("new-assignment", notificationData, { room: "delivery-boys" }).catch((err) =>
        console.error("❌ Socket broadcast error:", err)
      );

      // Also send to individual delivery boy rooms/socketIds in background
      for (const deliveryBoy of deliveryBoys) {
        emitEventHandler("new-assignment", notificationData, { userId: String(deliveryBoy._id) }).catch(() => {});
        if (deliveryBoy.socketId) {
          emitEventHandler("new-assignment", notificationData, deliveryBoy.socketId).catch(() => {});
        }
      }

      // Customer status notification in background
      notifyCustomerStatus(
        order,
        "out of delivery",
      ).catch(() => {});

      // ==========================================
      // RESPONSE (FAST RETURN)
      // ==========================================

      return NextResponse.json(
        {
          success: true,

          message:
            "Order is now available to all delivery boys",

          orderId:
            order._id,

          orderRequestId:
            order.orderRequestId,

          status:
            order.status,

          assignment:
            deliveryAssignment,

          broadcastedTo:
            deliveryBoys.map(
              (boy) => ({
                id: String(
                  boy._id,
                ),

                name:
                  boy.name,

                email:
                  boy.email,

                mobile:
                  boy.mobile,

                isOnline:
                  Boolean(
                    boy.isOnline,
                  ),

                hasSocket:
                  Boolean(
                    boy.socketId,
                  ),
              }),
            ),
        },
        {
          status: 200,
        },
      );
    }

    // ============================================
    // DELIVERED
    // ============================================

    if (
      status === "delivered"
    ) {
      order.status =
        "delivered";

      // ------------------------------------------
      // UPDATE ASSIGNMENT
      // ------------------------------------------

      if (order.assignment) {
        const updatedAssignment =
          await DeliveryAssignment.findByIdAndUpdate(
            order.assignment,
            {
              $set: {
                status: "delivered",
                deliveredAt:
                  new Date(),
              },
            },
            {
              returnDocument:
                "after",
            },
          ).lean();

        console.log(
          "✅ Assignment marked delivered:",
          updatedAssignment?._id,
        );
      }

      await order.save();

      // Notify customer in background
      notifyCustomerStatus(
        order,
        "delivered",
      ).catch(() => {});

      return NextResponse.json(
        {
          success: true,
          message:
            "Order delivered successfully",
          order,
        },
        {
          status: 200,
        },
      );
    }

    // ============================================
    // NORMAL STATUS
    // ============================================

    order.status =
      status;

    await order.save();

    // Notify customer about status in background.
    notifyCustomerStatus(
      order,
      status,
    ).catch(() => {});

    return NextResponse.json(
      {
        success: true,

        message:
          "Order status updated successfully",

        order,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "❌ UPDATE ORDER STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Failed to update order status",

        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

// ==================================================
// CUSTOMER STATUS NOTIFICATION
// ==================================================

async function notifyCustomerStatus(
  order: any,
  status: string,
) {
  try {
    const customerId =
      order.user
        ? String(
            order.user._id ??
              order.user,
          )
        : null;

    if (!customerId) {
      return;
    }

    await emitEventHandler(
      "order-status-update",
      {
        orderId:
          String(order._id),

        orderRequestId:
          order.orderRequestId,

        status,

        message:
          "Order status updated",
      },
      { userId: customerId },
    );

    console.log(
      "✅ Customer status notification triggered for:",
      customerId,
    );
  } catch (error) {
    console.error(
      "❌ Customer status notification failed:",
      error,
    );
  }
}