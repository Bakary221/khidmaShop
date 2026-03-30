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

  y += 8;
  pdf.setFontSize(12);
  pdf.text("Khidma Service", margin, y);
  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Adresse: Plateau, Abidjan", margin, y);
  y += 6;
  pdf.text("Téléphone: +225 27 20 00 00 00", margin, y);
  y += 6;
  pdf.text("Email: contact@khidma.shop", margin, y);

  y += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text(`Facture: ${orderLabel(order)}`, margin, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Client: ${order.customerName}`, margin, y);
  y += 6;
  pdf.text(`Téléphone: ${order.phone}`, margin, y);
  y += 6;
  pdf.text(`Statut: ${order.status}`, margin, y);
  y += 6;
  pdf.text(`Date: ${formatDate(order.createdAt)}`, margin, y);

  y += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text("Produits", margin, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  order.items.forEach((item) => {
    const snapshot = item.productSnapshot;
    const line = `${snapshot.name} x${item.quantity} - ${formatCurrency(snapshot.price * item.quantity)}`;
    const split = pdf.splitTextToSize(line, 180);
    pdf.text(split, margin, y);
    y += split.length * 6 + 2;
  });

  y += 4;
  pdf.setFont("helvetica", "bold");
  pdf.text(`Total: ${formatCurrency(order.total)}`, margin, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Localisation: ${order.latitude ?? "-"}, ${order.longitude ?? "-"}`, margin, y);

  pdf.save(`${orderLabel(order)}.pdf`);
}
