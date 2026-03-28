import jsPDF from "jspdf";
import { Order } from "@/types/order";
import { formatCurrency, formatDate, orderLabel } from "@/utils/format";

export function generateInvoicePdf(order: Order) {
  const pdf = new jsPDF();
  const margin = 16;
  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("KHIDMA SHOP", margin, y);

  y += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Facture: ${orderLabel(order)}`, margin, y);
  y += 7;
  pdf.text(`Client: ${order.customerName}`, margin, y);
  y += 7;
  pdf.text(`Téléphone: ${order.phone}`, margin, y);
  y += 7;
  pdf.text(`Date: ${formatDate(order.createdAt)}`, margin, y);
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Produits", margin, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  order.items.forEach((item) => {
    const line = `${item.product.name} x${item.quantity} - ${formatCurrency(item.product.price * item.quantity)}`;
    const split = pdf.splitTextToSize(line, 180);
    pdf.text(split, margin, y);
    y += split.length * 6 + 2;
  });

  y += 4;
  pdf.setFont("helvetica", "bold");
  pdf.text(`Total: ${formatCurrency(order.total)}`, margin, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Localisation: ${order.latitude ?? "-"}, ${order.longitude ?? "-"}`, margin, y);

  pdf.save(`${orderLabel(order)}.pdf`);
}
