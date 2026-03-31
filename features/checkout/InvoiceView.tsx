"use client";

import { Order } from "@/types/order";
import { formatCurrency, formatDate, orderLabel } from "@/utils/format";
import { generateInvoicePdf } from "@/utils/pdf";
import { statusTone } from "@/utils/identity";

type InvoiceViewProps = {
  order: Order;
};

export function InvoiceView({ order }: InvoiceViewProps) {
  return (
    <div className="card-base space-y-8 rounded-[32px] border border-black/10 bg-gradient-to-b from-white to-black/5 p-6 shadow-2xl shadow-black/10">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.5em] text-black/45">FACTURE</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black">KHIDMA SHOP</h2>
            <p className="text-sm text-black/60">{orderLabel(order)}</p>
          </div>
          <button
            type="button"
            onClick={() => generateInvoicePdf(order)}
            className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-black transition hover:border-black/70"
          >
            Télécharger PDF
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr,1.1fr]">
        <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">Émetteur</p>
          <p className="text-base font-semibold text-black">Khidma Service</p>
          <p className="text-sm text-black/60">Plateau, Abidjan</p>
          <p className="text-sm text-black/60">Email: contact@khidma.shop</p>
          <p className="text-sm text-black/60">Tél: +225 27 20 00 00 00</p>
        </div>
        <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">Facturation</p>
          <p className="text-base font-semibold text-black">{order.customerName}</p>
          <p className="text-sm text-black/60">{order.phone || "Téléphone inconnu"}</p>
          {order.address && <p className="text-sm text-black/60">{order.address}</p>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr,1fr]">
        <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-black/40">Détails</span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase ${statusTone(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-black/60">
            <div>
              <p className="text-xs uppercase text-black/40">Date</p>
              <p className="font-semibold text-black">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-black/40">Articles</p>
              <p className="font-semibold text-black">{order.items.length}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs uppercase text-black/40">Référence</p>
              <p className="font-semibold text-black">{order.reference || "Aucune"}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Montant</p>
          <p className="text-4xl font-bold text-black">{formatCurrency(order.total)}</p>
          <p className="text-sm text-black/60">À régler sous 15 jours</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-xl shadow-black/5">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-black/5 text-[10px] font-semibold uppercase tracking-[0.4em] text-black/50">
              <th className="px-4 py-3 text-left">Article</th>
              <th className="px-4 py-3 text-center">Quantité</th>
              <th className="px-4 py-3 text-right">Prix unitaire</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="px-4 py-4">
                  <p className="font-medium text-black">{item.productSnapshot.name}</p>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-black">{item.quantity}</td>
                <td className="px-4 py-4 text-right text-black/60">
                  {formatCurrency(item.productSnapshot.price)}
                </td>
                <td className="px-4 py-4 text-right font-bold text-black">
                  {formatCurrency(item.productSnapshot.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
