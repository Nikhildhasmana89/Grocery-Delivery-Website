import type { ComponentType } from "react";
import { auth } from "@/auth";
import connectDB from "@/app/lib/db";
import User from "@/app/models/user.model";
import { redirect } from "next/navigation";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";

// Import Role Dashboards
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoyDashboard from "@/components/DeliveryBoyDashboard";

// Ensure Next.js does NOT serve a stale cached version of this page
export const dynamic = "force-dynamic";

// Type cast components to avoid TypeScript prop mismatch issues
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

  const user = await User.findById(session.user.id);

  // 2. User missing from DB -> Go to Login page
  if (!user) {
    redirect("/login");
  }

  // 3. Check if profile details are incomplete
  const isIncomplete = !user.mobile || !user.role;

  // 4. Incomplete -> Show EditRoleMobile onboarding form
  if (isIncomplete) {
    return (
      <EditRoleMobile
        initialRole={user.role || "user"}
        initialMobile={user.mobile || ""}
        userId={user._id.toString()}
      />
    );
  }

  // 5. Serialize Mongoose document to plain JSON object for Client Components
  const plainUser = JSON.parse(JSON.stringify(user));

  // Normalize role string (handles uppercase/lowercase or accidental spaces)
  const role = plainUser.role ? plainUser.role.trim().toLowerCase() : "user";

  // 6. Render Role-based View
  return (
    <div className="min-h-screen bg-[#07090E] text-white">
      {/* Pass plainUser to Nav */}
      <Nav user={plainUser} />
      <HeroSection/>
      {/* Role-based Dashboard Rendering using the typed components */}
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