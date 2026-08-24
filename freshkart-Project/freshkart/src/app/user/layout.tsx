import Footer from "@/components/Footer";
import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
