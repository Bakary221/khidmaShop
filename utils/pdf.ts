import jsPDF from "jspdf";
import { Order } from "@/types/order";
import { formatCurrency, formatDate } from "@/utils/format";

export function generateInvoicePdf(order: Order) {
  const doc = new jsPDF();
  let y = 30;
  const margin = 20;
  
  // Header simple
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("KHIDMA SHOP", margin, y);
  y += 15;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Rufisque Tally Bou Bess, pres Usine vinaigre", margin, y);
  y += 8;
  doc.text("bakarydiassy28@gmail.com", margin, y);
  y += 8;
  doc.text("+221 77 862 70 52", margin, y);
  y += 20;
  
  // Facture
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FACTURE", margin, y);
  y += 20;
  
  // Infos
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${formatDate(order.createdAt)}`, margin, y);
  y += 8;
  doc.text(`Référence: ${order.id.toUpperCase()}`, margin, y);
  y += 15;
  
  // Expéditeur / Client
  doc.line(margin, y, 190, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Expéditeur", margin, y);
  doc.text("Client", 100, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.text("Khidma Shop", margin, y);
  doc.text(order.customerName, 100, y);
  y += 8;
  doc.text("Rufisque", margin, y);
  doc.text(order.phone || "", 100, y);
  y += 8;
  doc.text("+221 77 862 70 52", margin, y);
  doc.text(order.address || "", 100, y);
  y += 25;
  
  // Table simple
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Produit", margin, y);
  doc.text("Qte", 110, y);
  doc.text("Prix", 130, y);
  doc.text("Total", 160, y);
  y += 8;
  doc.line(margin, y, 190, y);
  y += 5;
  
  doc.setFont("helvetica", "normal");
  let totalItemsHeight = 0;
  order.items.forEach((item) => {
    const name = item.productSnapshot.name.length > 25 ? item.productSnapshot.name.substring(0, 25) + "..." : item.productSnapshot.name;
    doc.text(name, margin, y);
    doc.text(item.quantity.toString(), 110, y);
    doc.text(formatCurrency(item.productSnapshot.price), 130, y);
    doc.text(formatCurrency(item.productSnapshot.price * item.quantity), 160, y);
    y += 8;
    totalItemsHeight += 8;
  });
  
  y += 10;
  doc.line(margin, y, 190, y);
  y += 5;
  
  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL", margin, y);
  doc.text(formatCurrency(order.total), 130, y);
  y += 30;
  
  // Signature
  doc.line(margin, y, 190, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Khidma Shop", margin, y);
  doc.text(formatDate(new Date()), 150, y);
  
  doc.save(`facture-${order.id.substring(0, 8).toUpperCase()}.pdf`);
}

