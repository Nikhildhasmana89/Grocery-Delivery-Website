import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    const { orderId } = await params;

    const { status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: "orderId and status are required",
        },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    
    order.status = status;

   
    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address;

     
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

      
      const nearbyDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000,
          },
        },
      });

      
      const nearbyIds = nearbyDeliveryBoys.map((boy) => boy._id);

      
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearbyIds },
        status: {
          $in: ["assigned", "pending"],
        },
      }).distinct("assignedTo");

      
      const busyIdSet = new Set(
        busyIds.map((id) => id.toString())
      );

    
      const availableDeliveryBoys = nearbyDeliveryBoys.filter(
        (boy) => !busyIdSet.has(boy._id.toString())
      );

      
      if (availableDeliveryBoys.length === 0) {
        await order.save();

        return NextResponse.json(
          {
            message: "There is no available delivery boy nearby",
            orderId: order._id,
            status: order.status,
          },
          { status: 200 }
        );
      }

   
      const selectedDeliveryBoy = availableDeliveryBoys[0];

    
      const deliveryAssignment =
        await DeliveryAssignment.create({
          order: order._id,
          assignedTo: selectedDeliveryBoy._id,
          status: "assigned",
        });

      
      order.assignment = deliveryAssignment._id;

     
      await order.save();

     
      const deliveryBoysPayload = availableDeliveryBoys.map(
        (boy) => ({
          id: boy._id,
          name: boy.name,
          email: boy.email,
          mobile: boy.phone,
          latitude: boy.location?.coordinates?.[1],
          longitude: boy.location?.coordinates?.[0],
        })
      );

    
      await deliveryAssignment.populate("order");

      
      await order.populate("user");

      return NextResponse.json(
        {
          message: "Order status updated and delivery boy assigned",
          orderId: order._id,
          status: order.status,

          assignment: deliveryAssignment,

          assignedDeliveryBoy: {
            id: selectedDeliveryBoy._id,
            name: selectedDeliveryBoy.name,
            email: selectedDeliveryBoy.email,
            mobile: selectedDeliveryBoy.phone,
          },

          availableBoys: deliveryBoysPayload,
        },
        { status: 200 }
      );
    }

    
    await order.save();

    return NextResponse.json(
      {
        message: "Order status updated successfully",
        orderId: order._id,
        status: order.status,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        error: "Failed to update order status",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}