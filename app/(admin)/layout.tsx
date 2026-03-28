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
    return <div className="min-h-screen bg-[linear-gradient(180deg,#f8f7f4_0%,#ffffff_60%,#fafafa_100%)] text-black">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f7f4_0%,#ffffff_28%,#fafafa_100%)] text-black md:flex">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white/85 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        <p className="text-sm font-semibold tracking-tight">Khidma Admin</p>
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm transform transition duration-300 md:static md:z-auto md:w-auto md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-full shadow-2xl md:shadow-none">
          <div className="flex h-14 items-center justify-end border-b border-black/10 bg-white px-4 md:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-full border border-black/10 p-2 text-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <AdminSidebar />
        </div>
      </div>

      <main className="flex-1 px-4 py-4 pb-8 md:px-6 md:py-6 lg:px-8">{children}</main>
    </div>
  );
}
