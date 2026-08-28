import Footer from "@/components/Footer";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import { UserThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserThemeProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <AIAssistantWidget />
        <Footer />
      </div>
    </UserThemeProvider>
  );
}
