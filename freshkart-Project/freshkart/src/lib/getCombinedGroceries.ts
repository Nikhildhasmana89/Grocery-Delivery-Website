import { unstable_cache } from "next/cache";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import DataProduct from "@/models/data.model";

export interface ICombinedGrocery {
  _id: string;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
  stock: number;
  minStock: number;
  description: string;
  rating: number;
  isTemporary: boolean;
  createdAt: string;
}

/**
 * Raw DB Fetcher for combined products (real groceries + temporary data products)
 */
async function fetchCombinedGroceriesFromDB(): Promise<ICombinedGrocery[]> {
  console.log("⚡ [CACHE MISS] Querying MongoDB for combined product catalog...");
  await connectDB();

  // 1. Fetch real products from 'groceries' collection
  const realGroceries = await Grocery.find()
    .sort({ createdAt: -1 })
    .lean();

  // 2. Fetch temporary/demo products from 'data' collection
  let demoGroceries: any[] = [];
  try {
    demoGroceries = await DataProduct.find()
      .sort({ createdAt: -1 })
      .lean();
  } catch (err) {
    console.warn("⚠️ Data collection fetch warning:", err);
  }

  // 3. Normalize real products
  const formattedReal: ICombinedGrocery[] = realGroceries.map((g: any) => ({
    _id: g._id ? g._id.toString() : "",
    name: g.name || "Product",
    category: g.category || "General",
    price: g.price,
    unit: g.unit || "item",
    image: g.image || "",
    stock: typeof g.stock === "number" ? g.stock : 20,
    minStock: typeof g.minStock === "number" ? g.minStock : 10,
    description: g.description || "",
    rating: typeof g.rating === "number" ? g.rating : 4.5,
    isTemporary: false,
    createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : new Date().toISOString(),
  }));

  // 4. Normalize demo products
  const formattedDemo: ICombinedGrocery[] = demoGroceries.map((d: any) => ({
    _id: d._id ? d._id.toString() : "",
    name: d.name || "Demo Product",
    category: d.category || "General",
    price: d.price,
    unit: d.unit || "item",
    image: d.image || "",
    stock: typeof d.stock === "number" ? d.stock : 50,
    minStock: typeof d.minStock === "number" ? d.minStock : 10,
    description: d.description || "",
    rating: typeof d.rating === "number" ? d.rating : 4.5,
    isTemporary: true,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
  }));

  // 5. Combine and sort by newest first
  const combined = [...formattedDemo, ...formattedReal].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return combined;
}

/**
 * High-performance cached product retriever.
 * Serves products from Next.js Server Data Cache.
 * Automatically revalidates every 60s (for Compass inserts) or on-demand via revalidateTag('products-cache').
 */
export const getCombinedGroceries = unstable_cache(
  async () => {
    return await fetchCombinedGroceriesFromDB();
  },
  ["combined-groceries-catalog"],
  {
    revalidate: 60, // 60 seconds auto-revalidation for MongoDB Compass temporary inserts
    tags: ["products-cache", "groceries-list"], // Tag for instant Admin on-demand cache invalidation
  }
);
