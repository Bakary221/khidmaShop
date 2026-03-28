"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <div className="min-h-screen bg-white text-black">
      {!isAuthPage ? <Navbar /> : null}
      <main className={isAuthPage ? "" : "pb-20 md:pb-0"}>{children}</main>
      {!isAuthPage ? (
        <>
          <div className="hidden md:block">
            <Footer />
          </div>
          <CartDrawer />
          <MobileNavbar />
        </>
      ) : null}
    </div>
  );
}
