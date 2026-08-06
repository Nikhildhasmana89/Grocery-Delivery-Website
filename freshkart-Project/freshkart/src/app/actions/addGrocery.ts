"use server";

import uploadOnCloudinary from "../../lib/cloudinary";
import Grocery from "../../models/grocery.model";       
import connectDB from "../../lib/db";            

export async function addGroceryAction(formData: FormData) {
  try {
    await connectDB();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const unit = formData.get("unit") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !category || !price || !unit || !imageFile) {
      return { success: false, error: "All fields are required." };
    }

    // Upload image to Cloudinary using your helper
    const imageUrl = await uploadOnCloudinary(imageFile, "freshkart");

    if (!imageUrl) {
      return { success: false, error: "Failed to upload image to Cloudinary." };
    }

    // Save to Mongoose database
    const newGrocery = await Grocery.create({
      name,
      category,
      price,
      unit,
      image: imageUrl,
    });

    return {
      success: true,
      message: "Image successfully uploaded to Cloudinary & item saved to database!",
      imageUrl, // Included so you can log or inspect the uploaded Cloudinary URL
      data: JSON.parse(JSON.stringify(newGrocery)),
    };
  } catch (error: any) {
    console.error("Error adding grocery:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}