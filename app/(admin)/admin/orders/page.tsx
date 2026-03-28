"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Package2, CheckCircle2, Clock3, ReceiptText, Share2, MessageCircle } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listOrders, updateOrderStatus } from "@/services/order.service";
import { formatCurrency, formatDate, orderLabel } from "@/utils/format";
import { Order } from "@/types/order";
import { getInitials, statusTone } from "@/utils/identity";
import { cn } from "@/utils/cn";

function normalizeWhatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("225")) return digits;
  if (digits.startsWith("0")) return `225${digits.slice(1)}`;
  return digits;
}

function buildLocationMessage(order: Order) {
  const label = orderLabel(order);
  if (order.latitude != null && order.longitude != null) {
    return [
      `Bonjour ${order.customerName}, voici la géolocalisation de votre commande ${label}.`,
      `Position: https://www.google.com/maps?q=${order.latitude},${order.longitude}`,
      order.address ? `Adresse: ${order.address}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Bonjour ${order.customerName}, voici le suivi de votre commande ${label}.`,
    order.address ? `Adresse: ${order.address}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildWhatsappShareUrl(order: Order) {
  const phone = normalizeWhatsappPhone(order.phone);
  const text = encodeURIComponent(buildLocationMessage(order));
  return `https://wa.me/${phone}?text=${text}`;
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: listOrders });
  const [selected, setSelected] = useState<Order | null>(null);
  const [view, setView] = useState<"details" | "invoice">("details");

  const columns = useMemo(
    () => [
      { header: "Commande" },
      { header: "Client" },
      { header: "Total" },
      { header: "Statut" },
    ],
    [],
  );

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order["status"] }) => updateOrderStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Commandes"
        title="Suivi des commandes"
        description="Visualisez rapidement les achats en attente, confirmés et livrés pour garder le rythme de la boutique."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
            <Clock3 className="h-4 w-4" />
            En attente
          </div>
          <p className="mt-2 text-3xl font-semibold">{orders.filter((order) => order.status === "pending").length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
            <CheckCircle2 className="h-4 w-4" />
            Confirmées
          </div>
          <p className="mt-2 text-3xl font-semibold">{orders.filter((order) => order.status === "confirmed").length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_100%)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-black/45">
            <Package2 className="h-4 w-4" />
            Livrées
          </div>
          <p className="mt-2 text-3xl font-semibold">{orders.filter((order) => order.status === "delivered").length}</p>
        </div>
      </div>

      {isLoading ? (
        <Loader className="py-10" />
      ) : (
        <AdminTable
          columns={columns}
          rows={orders}
          renderRow={(order) => (
            <>
              <td className="px-4 py-4">
                <p className="font-medium">{orderLabel(order)}</p>
                <p className="text-xs text-black/55">{formatDate(order.createdAt)}</p>
                <p className="mt-1 text-xs text-black/45">{order.items.length} article(s)</p>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black text-xs font-semibold text-white">
                    {getInitials(order.customerName)}
                  </div>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-black/45">{order.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 font-medium">{formatCurrency(order.total)}</td>
              <td className="px-4 py-4">
                <button
                  onClick={() => {
                    setSelected(order);
                    setView("details");
                  }}
                  className={cn("rounded-full border px-3 py-2 text-sm capitalize", statusTone(order.status))}
                >
                  {order.status}
                </button>
              </td>
            </>
          )}
          renderMobileRow={(order) => (
            <div className="card-base space-y-3 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{orderLabel(order)}</p>
                  <p className="text-sm text-black/55">{order.customerName}</p>
                  <p className="mt-1 text-xs text-black/45">{order.phone}</p>
                </div>
                <p className="font-semibold">{formatCurrency(order.total)}</p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelected(order);
                    setView("details");
                  }}
                  className="rounded-full border border-black/10 px-3 py-2 text-sm"
                >
                  Détails
                </button>
                <span className={cn("rounded-full border px-3 py-2 text-xs capitalize", statusTone(order.status))}>{order.status}</span>
              </div>
            </div>
          )}
        />
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setView("details");
        }}
        title={selected ? orderLabel(selected) : "Commande"}
        className="max-w-5xl"
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setView("details")}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  view === "details" ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/65",
                )}
              >
                Détails
              </button>
              <button
                type="button"
                onClick={() => setView("invoice")}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  view === "invoice" ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/65",
                )}
              >
                Facture
              </button>
            </div>

            {view === "details" ? (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-black/45">Résumé</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={cn("rounded-full border px-3 py-1 text-xs capitalize", statusTone(selected.status))}>{selected.status}</span>
                    <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{selected.items.length} article(s)</span>
                    <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{formatCurrency(selected.total)}</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-3">
                    <p className="text-xs text-black/45">Client</p>
                    <p className="mt-1 font-medium">{selected.customerName}</p>
                    <p className="mt-1 text-xs text-black/45">{selected.phone}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 p-3">
                    <p className="text-xs text-black/45">Commande</p>
                    <p className="mt-1 font-medium">{orderLabel(selected)}</p>
                    <p className="mt-1 text-xs text-black/45">{formatDate(selected.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 p-3 sm:col-span-2">
                    <p className="text-xs text-black/45">Localisation</p>
                    <p className="mt-1 font-medium">
                      <MapPin className="mr-1 inline h-4 w-4" />
                      {selected.latitude ?? "-"} / {selected.longitude ?? "-"}
                    </p>
                    <p className="mt-2 text-sm text-black/55">{selected.address ?? "Adresse non renseignée"}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(buildWhatsappShareUrl(selected), "_blank", "noopener,noreferrer")}
                        className="btn-base bg-black px-4 py-3 text-white"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Partager sur WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("invoice")}
                        className="btn-base border border-black/10 bg-white px-4 py-3 text-black"
                      >
                        <ReceiptText className="mr-2 h-4 w-4" />
                        Voir la facture
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-3 text-sm">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-black/55">
                          {item.quantity} x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {(["pending", "confirmed", "delivered"] as Order["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => statusMutation.mutate({ id: selected.id, status })}
                      className="btn-base border border-black/10 bg-white px-4 py-3 text-sm capitalize"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(135deg,#111111,#2b2f37)] p-4 text-white shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/55">Facture</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">Commande {orderLabel(selected)}</h3>
                      <p className="mt-2 text-sm text-white/65">{formatDate(selected.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs text-white/55">Total</p>
                      <p className="mt-1 text-xl font-semibold">{formatCurrency(selected.total)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-black/45">Client</p>
                    <p className="mt-2 text-lg font-semibold">{selected.customerName}</p>
                    <p className="mt-1 text-sm text-black/55">{selected.phone}</p>
                    <p className="mt-2 text-sm text-black/55">{selected.address ?? "Adresse non renseignée"}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-black/45">Statut</p>
                    <p className={cn("mt-2 inline-flex rounded-full border px-3 py-1 text-xs capitalize", statusTone(selected.status))}>
                      {selected.status}
                    </p>
                    <p className="mt-3 text-sm text-black/55">{selected.items.length} article(s) dans cette facture.</p>
                    <button
                      type="button"
                      onClick={() => window.open(buildWhatsappShareUrl(selected), "_blank", "noopener,noreferrer")}
                      className="mt-4 btn-base bg-black px-4 py-3 text-white"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Partager la géolocalisation
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-black/10">
                  <div className="grid grid-cols-[1.6fr_0.4fr_0.4fr] gap-2 bg-black/[0.03] px-4 py-3 text-xs uppercase tracking-[0.22em] text-black/45">
                    <span>Article</span>
                    <span className="text-right">Qté</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="divide-y divide-black/5 bg-white">
                    {selected.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1.6fr_0.4fr_0.4fr] gap-2 px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-black/55">
                            {item.size ? `Taille ${item.size}` : "Taille non précisée"}
                            {item.color ? ` • ${item.color}` : ""}
                          </p>
                        </div>
                        <p className="text-right text-black/65">{item.quantity}</p>
                        <p className="text-right font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-black/45">Total facture</p>
                    <p className="mt-1 text-sm text-black/55">Montant TTC de la commande</p>
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(selected.total)}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
