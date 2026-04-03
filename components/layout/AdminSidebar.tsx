"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Shapes, ClipboardList, Users, LogOut, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import { logout as endSession } from "@/services/auth.service";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Shapes },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await endSession();
    } finally {
      clearSession();
      router.push("/auth");
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "h-full border-r border-black/20 bg-white px-4 py-5 flex flex-col transition-transform duration-300 ease-in-out md:w-72 md:h-screen md:overflow-auto md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "fixed left-0 top-0 z-50 w-full sm:w-72 md:relative md:z-auto"
      )}>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-black/10 p-1 hover:bg-black/5 md:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-black bg-black text-sm font-bold text-white">K</span>
          <div>
            <p className="text-xs uppercase tracking-wide text-black/60">KHIDMA SHOP</p>
            <h1 className="text-lg font-semibold text-black">Admin</h1>
          </div>
        </div>

        <div className="mb-5 rounded-lg border border-black/20 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-black/60">Connecté comme</p>
          <p className="text-base font-medium text-black">{user?.name ?? "Administrateur"}</p>
          <p className="text-xs text-black/50">Gestion de produit & commandes</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black hover:bg-black hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <LogOut className="inline h-4 w-4 mr-2" /> Déconnexion
          </button>
          <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Confirmer déconnexion">
            <p className="text-sm text-black/70 mb-4">Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
                onClick={handleLogout}
              >
                Confirmer
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-black/20 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/5"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Annuler
              </button>
            </div>
          </Modal>
        </div>
      </aside>
    </>
  );
}
