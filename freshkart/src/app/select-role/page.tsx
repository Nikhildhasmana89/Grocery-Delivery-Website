"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EditRoleMobile from "@/components/EditRoleMobile"; // Ensure this matches your component path

export default function SelectRolePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <EditRoleMobile
        userId={session.user.id}
        initialRole={(session.user as any).role || "user"}
        initialMobile={(session.user as any).mobile || ""}
      />
    </main>
  );
}