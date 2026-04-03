"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle2, Phone, BadgeCheck, History } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatPhone } from "@/utils/format";
import { logout as apiLogout } from "@/services/auth.service";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/auth");
    }
  }, [isHydrated, router, user]);

  if (!isHydrated) {
    return (
      <div className="container-safe py-6">
        <div className="card-base p-6 text-sm text-black/55">Chargement du profil...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      clearSession();
      router.push("/");
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="container-safe space-y-6 py-6 pb-28 md:pb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Profil</p>
        <h1 className="section-title">Votre compte</h1>
      </div>

      <section className="card-base space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-black/10 bg-black text-white">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">Client connecté</p>
            <h2 className="truncate text-2xl font-semibold tracking-tight">{user.name}</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
              <Phone className="h-3.5 w-3.5" />
              Téléphone
            </p>
            <p className="mt-2 text-sm font-medium">{formatPhone(user.phone)}</p>
          </div>
          <div className="rounded-2xl border border-black/10 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
              <BadgeCheck className="h-3.5 w-3.5" />
              Statut
            </p>
            <p className="mt-2 text-sm font-medium">Compte {user.role === "ADMIN" ? "administrateur" : "client"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className="btn-base bg-black px-5 py-3 text-white">
            Découvrir le catalogue
          </Link>
          <Link href="/orders" className="btn-base border border-black/10 bg-white px-5 py-3">
            <History className="mr-2 h-4 w-4" />
            Mes commandes
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="btn-base border border-black/10 bg-white px-5 py-3"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
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
      </section>
    </div>
  );
}
