"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Shapes, ClipboardList, Users, LogOut, ShieldCheck, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/useAuthStore";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Shapes },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="h-full border-b border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] md:h-screen md:w-80 md:border-b-0 md:border-r">
      <div className="space-y-4 border-b border-black/10 px-4 py-4 md:px-5 md:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-black text-sm font-semibold text-white shadow-sm">
              K
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">KHIDMA SHOP</p>
              <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/auth");
            }}
            className="rounded-full border border-black/10 p-2 text-black/70 transition hover:bg-black/5 md:hidden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-black/10 bg-[linear-gradient(135deg,#111111,#2b2f37)] px-4 py-4 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Accès sécurisé</p>
          </div>
          <p className="mt-2 text-sm font-medium">{user?.name ?? "Administrateur"}</p>
          <p className="mt-1 text-xs text-white/65">Gestion boutique, commandes, catalogue et clients.</p>
        </div>
      </div>

      <nav className="grid gap-2 p-3 md:flex md:flex-col md:p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                active
                  ? "border-black bg-black text-white shadow-sm"
                  : "border-black/10 bg-white text-black/70 hover:border-black/20 hover:bg-black/5 hover:text-black",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-3 h-6 w-1 rounded-r-full transition",
                  active ? "bg-[#d4a24f]" : "bg-transparent group-hover:bg-black/20",
                )}
              />
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden p-4 md:block">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/auth");
          }}
          className="btn-base w-full justify-start border border-black/10 bg-white px-4 py-3 text-left"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
