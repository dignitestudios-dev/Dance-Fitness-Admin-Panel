"use client";

import { Logo } from "@/components/logo";
import GridShape from "@/components/grid-shape";
import { PublicRoute } from "@/components/PublicRoute";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
 {

//    const router = useRouter();


// useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     console.log("Auth Token:", token);

//     if (token) {
//       router.replace("/dashboard");
//     } else {
//       router.replace("/auth/login");
//     }
//   }, [router]);



  return (
    <PublicRoute>
      <div className="flex h-screen">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          {children}
        </div>
        {/* Right side - Brand */}
        <div className="lg:w-1/2 w-full h-full bg-[#d32c86]  lg:grid items-center hidden">
          <div className="relative items-center justify-center  flex z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Logo size={100} color="#ffffff" />
              {/* <h1 className="text-white text-4xl font-semibold">Admin Panel</h1> */}
              <p className="text-center text-white mt-2">
                Welcome to the Admin Panel. Please Sign in to Continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
