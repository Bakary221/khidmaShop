"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-white text-black overflow-hidden">
      {/* Mobile sidebar */}
      <AdminSidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:top-0 md:left-0 md:z-50 md:h-screen md:w-72 md:block">
        <AdminSidebar />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 flex h-11 items-center justify-between border-b border-black/15 bg-white px-4 text-black md:pl-72">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-black/10 p-2 hover:bg-black/5 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold uppercase tracking-wide">Admin Panel</div>
        </div>
      </header>

      <main className="absolute top-11 left-0 right-0 bottom-0 md:left-72 md:top-11 overflow-y-auto">
        <div className="pt-2 px-6 md:px-6 mx-auto max-w-8xl xl:max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
