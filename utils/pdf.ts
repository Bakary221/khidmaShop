import jsPDF from "jspdf";
import { Order } from "@/types/order";
import { formatCurrency, formatDate, orderLabel } from "@/utils/format";

const cleanCurrency = (value: number) => formatCurrency(value).replace(/\//g, "");

export function generateInvoicePdf(order: Order) {
  const pdf = new jsPDF({ unit: "pt" });
  const margin = 36;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 40;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("KhidmaShop", margin, y);
  y += 34;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text("Adresse d’expédition • numéro de téléphone", margin, y);
  y += 22;

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, y, pageWidth - margin * 2, 24);
  pdf.text("Facture pro forma", margin + 10, y + 16);
  y += 40;

  pdf.setFont("helvetica", "bold");
  pdf.text("Date d’expédition :", margin, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(order.createdAt), margin + 120, y);
  pdf.setFont("helvetica", "bold");
  pdf.text("Numéro de suivi :", margin + 250, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(order.id.toUpperCase(), margin + 340, y);
  y += 30;

  const boxWidth = (pageWidth - margin * 2 - 12) / 2;
  const boxHeight = 80;
  pdf.setLineWidth(0.6);
  pdf.rect(margin, y, boxWidth, boxHeight);
  pdf.rect(margin + boxWidth + 12, y, boxWidth, boxHeight);
  pdf.setFont("helvetica", "bold");
  pdf.text("EXPÉDITEUR", margin + 8, y + 18);
  pdf.text("DESTINATAIRE", margin + boxWidth + 20, y + 18);
  pdf.setFont("helvetica", "normal");
  const senderLines = [
    "Nom de l’expéditeur : Khidma Service",
    "Adresse : Plateau, Abidjan",
    "Email : contact@khidma.shop",
    "Téléphone : +225 27 20 00 00 00",
  ];
  senderLines.forEach((line, index) => {
    pdf.text(line, margin + 8, y + 32 + index * 12);
  });
  const receiverLines = [
    `Nom : ${order.customerName}`,
    order.address ? `Adresse : ${order.address}` : "Adresse : non renseignée",
    order.phone ? `Téléphone : ${order.phone}` : "Téléphone : non renseigné",
  ];
  receiverLines.forEach((line, index) => {
    pdf.text(line, margin + boxWidth + 20, y + 32 + index * 12);
  });
  y += boxHeight + 24;

  pdf.setFont("helvetica", "bold");
  pdf.text("OBJET : Commercial", margin, y);
  y += 24;

  const tableX = margin;
  const cols = [
    { label: "DESCRIPTION", width: boxWidth + 40 },
    { label: "PAYS", width: 60 },
    { label: "QUANTITÉ", width: 70 },
    { label: "PRIX", width: 80 },
    { label: "TOTAL", width: 90 },
  ];

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  let cursor = tableX;
  const tableWidth = cols.reduce((acc, col) => acc + col.width, 0);
  cols.forEach((col) => {
    pdf.rect(cursor, y - 12, col.width, 22);
    pdf.text(col.label, cursor + 6, y);
    cursor += col.width;
  });
  y += 22;

  pdf.setFont("helvetica", "normal");
  const pageHeight = pdf.internal.pageSize.getHeight();
  order.items.forEach((item) => {
    const descLines = pdf.splitTextToSize(item.productSnapshot.name, cols[0].width - 12);
    const rowHeight = Math.max(descLines.length * 12, 18);
    if (y + rowHeight > pageHeight - margin - 60) {
      pdf.addPage();
      y = margin;
      cursor = tableX;
      pdf.setFont("helvetica", "bold");
      cols.forEach((col) => {
        pdf.rect(cursor, y - 12, col.width, 22);
        pdf.text(col.label, cursor + 6, y);
        cursor += col.width;
      });
      pdf.setFont("helvetica", "normal");
      y += 22;
    }
    pdf.rect(tableX, y - 12, tableWidth, rowHeight + 4);
    descLines.forEach((descLine, index) => {
      pdf.text(descLine, tableX + 6, y + index * 12);
    });
    pdf.text("FR", tableX + cols[0].width + 6, y);
    pdf.text(`${item.quantity}`, tableX + cols[0].width + cols[1].width + 6, y);
    pdf.text(cleanCurrency(item.productSnapshot.price), tableX + cols[0].width + cols[1].width + cols[2].width + 6, y);
    pdf.text(
      cleanCurrency(item.quantity * item.productSnapshot.price),
      tableX + cols[0].width + cols[1].width + cols[2].width + cols[3].width + 6,
      y
    );
    y += rowHeight + 14;
  });

  y += 12;
  pdf.setFont("helvetica", "bold");
  pdf.text("VALEUR TOTALE", tableX + 6, y);
  pdf.text(
    cleanCurrency(order.total),
    tableX + cols[0].width + cols[1].width + cols[2].width + cols[3].width + 12,
    y
  );
  y += 24;

  pdf.setFont("helvetica", "normal");
  pdf.text("Nom Prénom", margin + 8, y + 48);
  pdf.text(`DATE : ${formatDate(order.createdAt)}`, margin + boxWidth + 120, y + 48);

  pdf.save(`${orderLabel(order)}.pdf`);
}
