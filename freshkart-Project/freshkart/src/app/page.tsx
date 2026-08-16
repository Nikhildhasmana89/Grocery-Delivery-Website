import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";

import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import GeoUpdater from "@/components/GeoUpdater";
import DeliveryBoyDashboard from "@/components/DeliveryBoyDashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  // ============================================
  // 1. Check authentication first
  // ============================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ============================================
  // 2. Connect to MongoDB
  // ============================================

  await connectDB();

  // ============================================
  // 3. Fetch current user
  // ============================================

  const user = await User.findById(session.user.id).lean();

  if (!user) {
    redirect("/login");
  }

  // ============================================
  // 4. Convert MongoDB document to serializable data
  // ============================================

  const plainUser = {
    ...user,
    _id: user._id.toString(),
  };

  // ============================================
  // 5. Normalize role and mobile
  // ============================================

  const role =
    typeof plainUser.role === "string"
      ? plainUser.role.trim().toLowerCase()
      : "user";

  const mobile =
    typeof plainUser.mobile === "string"
      ? plainUser.mobile.trim()
      : "";

  // ============================================
  // 6. Mandatory mobile onboarding
  // ============================================

  if (!mobile) {
    return (
      <EditRoleMobile
        initialRole={role}
        initialMobile=""
        userId={plainUser._id}
      />
    );
  }

  // ============================================
  // 7. Render dashboard according to role
  // ============================================

  return (
    <div className="min-h-screen bg-[#07090E] text-white">
      <GeoUpdater userId={plainUser._id} />

      {role === "admin" ? (
        <AdminDashboard user={plainUser} />
      ) : role === "deliveryboy" ||
        role === "delivery_boy" ? (
        <DeliveryBoyDashboard user={plainUser} />
      ) : (
        <UserDashboard user={plainUser} />
      )}
    </div>
  );
}