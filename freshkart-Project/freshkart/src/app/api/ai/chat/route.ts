import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const trimmedMessage = (message || "").trim();
    if (!trimmedMessage) {
      return NextResponse.json(
        { success: false, message: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    await connectDB();

    // 1. Fetch available groceries from catalog (real + demo)
    const { getCombinedGroceries } = await import("@/lib/getCombinedGroceries");
    const groceries = await getCombinedGroceries();

    const catalogSummary = groceries.map((g: any) => ({
      id: String(g._id),
      name: g.name,
      category: g.category || "General",
      price: `₹${g.price}`,
      unit: g.unit || "item",
      stock: g.stock ?? 20,
      image: g.image || "",
    }));

    // 2. Fetch authenticated user session and recent orders (if logged in)
    const session = await auth();
    let userOrdersContext = "User is not logged in.";
    
    if (session?.user?.id) {
      const orders = await Order.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("orderRequestId totalAmount status isPaid items createdAt")
        .lean();

      if (orders.length > 0) {
        userOrdersContext = `Customer's Recent Orders:\n` +
          orders
            .map(
              (o: any) =>
                `- Order #${o.orderRequestId || o._id}: Status: ${o.status}, Paid: ${o.isPaid}, Total: ₹${o.totalAmount}, Placed: ${new Date(o.createdAt).toLocaleDateString()}, Items: ${o.items?.map((i: any) => i.name).join(", ")}`
            )
            .join("\n");
      } else {
        userOrdersContext = "Customer has placed 0 orders so far.";
      }
    }

    // 3. Construct System Prompt for Gemini
    const systemPrompt = `You are FreshBot, the official intelligent AI Grocery & Customer Support Assistant for FreshKart grocery delivery.

Your core duties:
1. GROCERY ASSISTANT:
   - Suggest recipes, meal ideas, and ingredients.
   - Create shopping lists tailored to budget, diet, or preferences.
   - Recommend products from the catalog provided below.
2. CUSTOMER SUPPORT ASSISTANT:
   - Provide help with order tracking, delivery status, refunds, missing items, and cancellations using the Customer's Recent Orders context below.
   - If an issue requires manual intervention (such as processed refund disputes or damaged item compensation), clearly advise the customer to contact FreshKart Customer Support.

FRESHKART PRODUCT CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

CUSTOMER CONTEXT:
${userOrdersContext}

RESPONSE RULES:
- Be polite, concise, enthusiastic, and helpful.
- When recommending products from the catalog, match the product exact names and IDs.
- Format your main response in markdown.
- At the very end of your response, if you recommend any products from the catalog, include a JSON block surrounded by \`\`\`json_recommendations ... \`\`\` containing an array of product objects with fields: {"id", "name", "price", "unit", "image", "category"}.
- If no products are being recommended, do not output the json_recommendations block.

User Question: "${trimmedMessage}"`;

    // 4. Call Gemini API
    const targetModels = [
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-1.5-flash",
    ];

    let geminiRes: Response | null = null;
    let lastErrorText = "";

    for (const model of targetModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (res.ok) {
          geminiRes = res;
          break;
        } else {
          lastErrorText = await res.text();
          console.warn(`⚠️ Gemini model ${model} failed (${res.status}): ${lastErrorText.substring(0, 150)}`);
        }
      } catch (err: any) {
        console.warn(`⚠️ Gemini model ${model} fetch exception:`, err.message);
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      console.error("❌ All Gemini API attempts failed:", lastErrorText);
      return NextResponse.json(
        { success: false, message: "AI assistant service is currently unavailable." },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawReply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response right now. Please try again.";

    // 5. Extract Recommended Products from reply
    let replyText = rawReply;
    let recommendedProducts: any[] = [];

    const jsonMatch = rawReply.match(/```json_recommendations\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        recommendedProducts = JSON.parse(jsonMatch[1]);
        replyText = rawReply.replace(/```json_recommendations\s*[\s\S]*?```/, "").trim();
      } catch (pErr) {
        console.error("Failed to parse JSON recommendations from Gemini:", pErr);
      }
    }

    // Match recommended product IDs back with actual database catalog to ensure valid data & imagery
    const validatedProducts = recommendedProducts
      .map((p) => {
        const dbMatch = groceries.find((g: any) => String(g._id) === String(p.id) || g.name.toLowerCase() === p.name?.toLowerCase());
        if (dbMatch) {
          return {
            _id: String(dbMatch._id),
            name: dbMatch.name,
            category: dbMatch.category || "General",
            price: dbMatch.price,
            unit: dbMatch.unit || "item",
            image: dbMatch.image || "",
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        reply: replyText,
        recommendedProducts: validatedProducts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ AI Assistant Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred in AI assistant",
      },
      { status: 500 }
    );
  }
}
