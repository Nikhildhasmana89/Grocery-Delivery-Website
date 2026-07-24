import { auth } from "@/auth";
import connectDB from "@/app/lib/db";
import User from "@/app/models/user.model";
import { redirect } from "next/navigation";
import EditRoleMobile from "@/components/EditRoleMobile"; // Import your component

export default async function Home() {
  await connectDB();

  const session = await auth();

  // 1. If not authenticated, send to login
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await User.findById(session.user.id);

  // 2. If session exists but user deleted from DB
  if (!user) {
    redirect("/login");
  }

  // 3. Check if mandatory profile details are missing
  const isIncomplete = !user.mobile || !user.role;

  if (isIncomplete) {
    // Render the component directly instead of redirecting
    return <EditRoleMobile/>;
  }

  return (
    <main className="p-6">
      <h1>Welcome back, {user.name}!</h1>
    </main>
  );
}