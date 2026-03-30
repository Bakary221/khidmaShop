"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { listOrders } from "@/services/order.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { formatCurrency, formatDate, orderLabel, orderStatusLabel } from "@/utils/format";
import { Loader } from "@/components/ui/Loader";

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const localOrders = useOrderStore((state) => state.orders);

  const { data: remoteOrders = [], isLoading } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: listOrders,
  });

  const orders = useMemo(() => {
    const merged = [...localOrders, ...remoteOrders];
    const unique = new Map<string, (typeof merged)[number]>();

    merged.forEach((order) => {
      unique.set(order.id, order);
    });

    const allOrders = Array.from(unique.values());

    if (!user) return allOrders;
    return allOrders.filter((order) => order.phone === user.phone);
  }, [localOrders, remoteOrders, user]);

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/auth");
    }
  }, [isHydrated, router, user]);

  if (!isHydrated) {
    return (
      <div className="container-safe py-6">
        <div className="card-base p-6 text-sm text-black/55">Chargement des commandes...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container-safe space-y-6 py-6 pb-28 md:pb-8">
      <button onClick={() => router.back()} className="btn-base border border-black/10 bg-white px-4 py-2 text-sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </button>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Commandes</p>
        <h1 className="section-title">Historique de vos achats</h1>
      </div>

      {isLoading ? (
        <Loader className="py-10" />
      ) : orders.length ? (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Link key={order.id} href="/checkout" className="card-base block p-4 transition hover:border-black/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4" />
                    <p className="text-sm font-medium">{orderLabel(order)}</p>
                  </div>
                  <p className="mt-2 text-sm text-black/55">{formatDate(order.createdAt)}</p>
                  <p className="mt-1 text-sm text-black/55">{order.items.length} article(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/45">
                    {orderStatusLabel(order.status)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-base p-6 text-sm text-black/60">
          Vous n’avez encore passé aucune commande.
          <div className="mt-4">
            <Link href="/products" className="btn-base bg-black px-4 py-3 text-white">
              Découvrir le catalogue
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
