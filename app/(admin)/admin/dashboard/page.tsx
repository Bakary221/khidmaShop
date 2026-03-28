"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Box, ClipboardList, Users2 } from "lucide-react";
import { listProducts, listProductStats } from "@/services/product.service";
import { listOrderStats, listOrders } from "@/services/order.service";
import { listUserStats } from "@/services/user.service";
import { listCategories } from "@/services/category.service";
import { formatCurrency, formatDate } from "@/utils/format";
import { Loader } from "@/components/ui/Loader";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { statusTone } from "@/utils/identity";

export default function AdminDashboardPage() {
  const { data: productStats } = useQuery({ queryKey: ["admin-product-stats"], queryFn: listProductStats });
  const { data: orderStats } = useQuery({ queryKey: ["admin-order-stats"], queryFn: listOrderStats });
  const { data: userStats } = useQuery({ queryKey: ["admin-user-stats"], queryFn: listUserStats });
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products-sample"],
    queryFn: () => listProducts(),
  });
  const { data: orders = [], isLoading: ordersLoading } = useQuery({ queryKey: ["admin-orders-sample"], queryFn: listOrders });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories-sample"], queryFn: listCategories });
  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  const cards = [
    { label: "Produits", value: productStats?.total ?? 0, icon: Box, note: "Catalogue actif" },
    { label: "Commandes", value: orderStats?.total ?? 0, icon: ClipboardList, note: "Commandes totales" },
    { label: "Utilisateurs", value: userStats?.total ?? 0, icon: Users2, note: "Comptes enregistrés" },
    { label: "Catégories", value: categories.length, icon: BadgeCheck, note: "Collections visibles" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Vue d'ensemble de Khidma Shop"
        description="Un aperçu clair du catalogue, des commandes et des clients pour piloter la boutique au quotidien."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-black/55">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-black/45">{card.note}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,#111111,#2b2f37)] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">Lecture rapide</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Les commandes récentes reflètent la demande actuelle.</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Les meilleures pièces de la boutique restent la chemise, les sneakers et les produits électroniques les plus sobres.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/55">Chiffre</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(revenue)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/55">En attente</p>
              <p className="mt-1 text-lg font-semibold">{orderStats?.pending ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/55">Livrées</p>
              <p className="mt-1 text-lg font-semibold">{orderStats?.delivered ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">Commandes</p>
              <h2 className="text-lg font-semibold tracking-tight">Récentes</h2>
            </div>
            <ArrowRight className="h-4 w-4 text-black/40" />
          </div>
          <div className="mt-4 space-y-3">
            {ordersLoading ? (
              <Loader />
            ) : (
              orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 p-3 text-sm transition hover:border-black/20 hover:bg-black/5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-black/55">{formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-xs text-black/45">{order.items.length} article(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${statusTone(order.status)}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">Produits</p>
              <h2 className="text-lg font-semibold tracking-tight">Les plus visibles</h2>
            </div>
            <ArrowRight className="h-4 w-4 text-black/40" />
          </div>
          <div className="mt-4 space-y-3">
            {productsLoading ? (
              <Loader />
            ) : (
              products.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-black/10 p-3 text-sm transition hover:border-black/20 hover:bg-black/5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-black/55">{product.brand}</p>
                    <p className="mt-1 text-xs text-black/45">{product.categoryName}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(product.price)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
