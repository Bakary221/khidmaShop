"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";
import { adminLogin } from "@/services/auth.service";

export default function AdminRootPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next"));
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace(nextPath ?? "/admin/dashboard");
    }
  }, [nextPath, router, user]);

  const mutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: (session) => {
      setSession(session);
      toast.success("Connexion admin réussie", session.user.name);
      router.push(nextPath ?? "/admin/dashboard");
    },
    onError: (err: Error) => toast.error("Accès refusé", err.message),
  });

  return (
    <div className="container-safe min-h-screen py-6">
      <div className="grid min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2.25rem] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,15,20,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex items-end overflow-hidden bg-[linear-gradient(135deg,#0f1116,#202430)] p-6 text-white sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,216,133,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_26%)]" />
          <div className="relative max-w-xl space-y-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-base border border-white/15 bg-white/5 px-4 py-2 text-white backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour boutique
            </button>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.45em] text-white/55">Accès admin</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Dashboard Khidma Shop</h1>
              <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                Connectez-vous pour piloter les produits, les catégories, les commandes et les utilisateurs avec une vue
                simple et rapide.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/55">
                  <ShieldCheck className="h-4 w-4" />
                  Sécurisé
                </div>
                <p className="mt-2 text-sm text-white/70">Accès protégé pour garder une gestion simple et propre.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/55">
                  <Sparkles className="h-4 w-4" />
                  Démo
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Login: <span className="font-medium text-white">admin@khidma.shop</span>
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Mot de passe: <span className="font-medium text-white">khidma123</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Connexion</p>
              <h2 className="text-3xl font-semibold tracking-tight">Accéder à l’administration</h2>
              <p className="text-sm text-black/60">Entrez vos identifiants administrateur pour ouvrir le tableau de bord.</p>
            </div>

            <div className="card-base space-y-4 p-5 sm:p-6">
              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Login
                </span>
                <input
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  placeholder="admin@khidma.shop"
                  className="input-base"
                />
              </label>

              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="khidma123"
                  className="input-base"
                />
              </label>

              <button
                type="button"
                onClick={() => mutation.mutate({ login, password })}
                disabled={!login || !password || mutation.isPending}
                className="btn-base w-full bg-black px-5 py-4 text-white"
              >
                {mutation.isPending ? <Loader label="Connexion..." /> : "Se connecter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
