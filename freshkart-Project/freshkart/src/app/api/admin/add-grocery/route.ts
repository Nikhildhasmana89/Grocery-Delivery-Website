import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import uploadOnCloudinary from "@/lib/cloudinary";
import Grocery from "@/models/grocery.model";
import { auth } from "@/auth"; 
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Authenticate session & admin role
    const session = await auth();

    if (!session?.user || session?.user?.role !== "admin") {
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
    
    // 2. Fixed key lookup: check both 'image' and 'file' for safety
    const file = (formData.get("image") || formData.get("file")) as File | null;

    // 3. Basic field validation
    if (!name || !price || !category || !unit || !file) {
      return NextResponse.json(
        { message: "All fields (name, price, category, unit, image) are required." },
        { status: 400 }
      );
    }

    // 4. Upload image to Cloudinary
    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      imageUrl = await uploadOnCloudinary(file, "freshkart");
    }

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }

    // 5. Save to database matching the schema types
    const grocery = await Grocery.create({
      name,
      price: price.toString(), // Kept as string to match your Mongoose Schema
      category,
      unit,
      image: imageUrl,
    });

    return NextResponse.json(
      {
        message: "Image successfully uploaded to Cloudinary & Grocery item created!",
        imageUrl,
        grocery,
      },
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