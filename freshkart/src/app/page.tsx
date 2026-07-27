import type { ComponentType } from "react";
import { auth } from "@/auth";
import connectDB from "@/app/lib/db";
import User from "@/app/models/user.model";
import { redirect } from "next/navigation";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";

import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoyDashboard from "@/components/DeliveryBoyDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable static caching for Home page

const UserDashboardComponent = UserDashboard as ComponentType<any>;
const AdminDashboardComponent = AdminDashboard as ComponentType<any>;
const DeliveryBoyDashboardComponent = DeliveryBoyDashboard as ComponentType<any>;

export default async function Home() {
  await connectDB();

  const session = await auth();

  // 1. Not logged in -> Go to Login page
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await User.findById(session.user.id).lean();

  // 2. User missing from DB -> Go to Login page
  if (!user) {
    redirect("/login");
  }

  // Convert Mongoose _id & dates to string
  const plainUser = JSON.parse(JSON.stringify(user));

  // 3. Check if mandatory onboarding fields are missing
  // (Trim mobile check to make sure empty strings aren't passing through)
  const isMobileMissing = !plainUser.mobile || plainUser.mobile.trim() === "";

  if (isMobileMissing) {
    return (
      <EditRoleMobile
        initialRole={plainUser.role || "user"}
        initialMobile={plainUser.mobile || ""}
        userId={plainUser._id.toString()}
      />
    );
  }

  // Normalize role string
  const role = plainUser.role ? plainUser.role.trim().toLowerCase() : "user";

  // 4. Render Role-based View
  return (
    <div className="min-h-screen bg-[#07090E] text-white">
      <Nav user={plainUser} />
      <HeroSection />
      
      {role === "admin" ? (
        <AdminDashboardComponent user={plainUser} />
      ) : role === "deliveryboy" ? (
        <DeliveryBoyDashboardComponent user={plainUser} />
      ) : (
        <UserDashboardComponent user={plainUser} />
      )}
    </div>
  );
}