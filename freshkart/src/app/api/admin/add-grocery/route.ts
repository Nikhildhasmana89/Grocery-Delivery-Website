import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import uploadOnCloudinary from "@/app/lib/cloudinary";
import Grocery from "@/app/models/grocery.model";
import { getServerSession } from "next-auth";          
import { authOptions } from "@/auth"; 

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Fetch the actual user session
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: You are not an admin" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("file") as Blob | null;

    // Basic field validation
    if (!name || !price || !category) {
      return NextResponse.json(
        { message: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      imageUrl = await uploadOnCloudinary(file);
    }

    const grocery = await Grocery.create({
      name,
      price: Number(price), 
      category,
      unit,
      image: imageUrl,      
    });

    return NextResponse.json(
      { message: "Grocery item created successfully", grocery },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating grocery item:", error);
    return NextResponse.json(
      { message: "Failed to add grocery item", error: error.message },
      { status: 500 }
    );
  }
}