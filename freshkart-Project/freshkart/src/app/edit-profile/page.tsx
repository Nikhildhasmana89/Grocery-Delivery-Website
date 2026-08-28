import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";
import EditRoleMobile from "@/components/EditRoleMobile";
import { UserThemeProvider } from "@/context/ThemeContext";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  return (
    <UserThemeProvider>
      <EditRoleMobile
        initialRole={user.role || "user"}
        initialMobile={user.mobile || ""}
        userId={user._id.toString()}
      />
    </UserThemeProvider>
  );
}