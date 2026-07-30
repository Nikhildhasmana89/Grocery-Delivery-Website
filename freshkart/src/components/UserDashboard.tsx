import connectDB from "@/app/lib/db";
import Grocery from "@/app/models/grocery.model";
import HeroSection from "./HeroSection";
import CategorySlide from "./CategorySlider";
import GroceryItemCard from "./GroceryItemCard";
import Nav from "./Nav";

async function UserDashboard() {
  await connectDB();

  const groceries = await Grocery.find().lean();
  const plainGroceries = JSON.parse(JSON.stringify(groceries));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <Nav />

      {/* Main Container matching max-w-7xl and padding from HeroSection */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Hero Section */}
        <section>
          <HeroSection />
        </section>

        {/* Category Slider Section */}
        <section className="py-2">
          <CategorySlide />
        </section>

        {/* Grocery Items Section */}
        <section className="space-y-6 pt-4">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Fresh Products
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {plainGroceries.length} Items
              </span>
            </div>
          </div>

          {/* Grocery Grid with Dark Theme Card Stagger & Hover FX */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {plainGroceries.map((item: any) => (
              <div
                key={item._id}
                className="transform transition-all duration-300 hover:-translate-y-1"
              >
                <GroceryItemCard item={item} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;