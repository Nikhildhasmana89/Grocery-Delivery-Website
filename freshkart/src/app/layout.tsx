import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";



export const metadata: Metadata = {
  title: "freshKart",
  description: "10 min delivery application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07090E] text-white antialiased">
       <Provider>
        <StoreProvider>
          
    
        <InitUser/>
       {children} 
          
    


        </StoreProvider>
       </Provider>
      </body>
    </html>
  );
}