import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "freshKart",
  description:"10 min delivery application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
    >
      <body className="fixed inset-0 bg-black/70 z-50" >
      
      {children}</body>
    </html>
  );
}
