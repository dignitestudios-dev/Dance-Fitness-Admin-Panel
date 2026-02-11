import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { Providers } from "@/components/providers";
// import { useEffect } from "react";
// import { useRouter } from "next/router";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dancer Fitness",
  description: "Dancer Fitness Admin Panel",
  icons: { 
    icon: "/icon.png"
  } ,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

   

  return (
    <html lang="en" className={figtree.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SidebarConfigProvider>{children}</SidebarConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
