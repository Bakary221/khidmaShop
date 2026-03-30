 "use client";

import { Order } from "@/types/order";
import { formatCurrency, formatDate, orderLabel } from "@/utils/format";
import { generateInvoicePdf } from "@/utils/pdf";

type InvoiceViewProps = {
  order: Order;
};

export function InvoiceView({ order }: InvoiceViewProps) {
  return (
    <div className="card-base space-y-4 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">Facture</p>
          <h3 className="mt-1 text-xl font-semibold">{orderLabel(order)}</h3>
        </div>
        <button type="button" onClick={() => generateInvoicePdf(order)} className="btn-base bg-black px-4 py-2 text-white">
          Télécharger PDF
        </button>
      </div>

      <div className="space-y-2 rounded-2xl border border-black/10 bg-black/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Khidma Service</p>
        <p className="text-sm font-semibold">Support & préparation</p>
        <p className="text-xs text-black/60">Email: contact@khidma.shop</p>
        <p className="text-xs text-black/60">Tél: +225 27 20 00 00 00</p>
      </div>

      <div className="space-y-3 border-y border-black/10 py-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">{item.productSnapshot.name}</p>
              <p className="text-black/55">
                {item.quantity} x {formatCurrency(item.productSnapshot.price)}
              </p>
            </div>
            <p className="font-semibold">{formatCurrency(item.productSnapshot.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-black/55">Date</span>
        <span className="font-medium">{formatDate(order.createdAt)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/55">Client</span>
        <span className="font-medium">{order.customerName}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/55">Total</span>
        <span className="font-semibold">{formatCurrency(order.total)}</span>
      </div>
    </div>
  );
}
