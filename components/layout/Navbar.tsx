"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, ShoppingBag, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUiStore } from "@/stores/useUiStore";
import { cn } from "@/utils/cn";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Catalogue" },
];

export function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const user = useAuthStore((state) => state.user);
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="container-safe flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black bg-black text-sm font-semibold text-white">
            K
          </span>
          <span className="text-sm font-semibold tracking-[0.24em]">KHIDMA SHOP</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-black",
                pathname === link.href && "bg-black text-white hover:bg-black",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={user ? "/orders" : "/auth"}
            className={cn(
              "rounded-full px-4 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-black",
              pathname === (user ? "/orders" : "/auth") && "bg-black text-white hover:bg-black",
            )}
          >
            {user ? "Commandes" : "Connexion"}
          </Link>
          {user ? (
            <Link
              href="/profile"
              className={cn(
                "rounded-full px-4 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-black",
                pathname === "/profile" && "bg-black text-white hover:bg-black",
              )}
            >
              Profil
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm transition hover:border-black/30 hover:bg-black/5 md:flex"
              >
                <UserCircle2 className="h-4 w-4" />
                <span className="max-w-[140px] truncate">{user.name}</span>
              </Link>
              <Link
                href="/orders"
                className="btn-base hidden border border-black/10 bg-white px-3 py-2 text-sm md:inline-flex"
              >
                <History className="mr-2 h-4 w-4" />
                Commandes
              </Link>
            </>
          ) : null}
          <button type="button" onClick={openCartDrawer} className="btn-base border border-black/10 bg-white px-3 py-2 text-sm">
            <span className="relative mr-2">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                  {itemCount}
                </span>
              ) : null}
            </span>
            <span>Panier</span>
          </button>
          {!user ? (
            <Link href="/auth" className="btn-base bg-black px-4 py-2 text-sm text-white">
              Connexion
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
