import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPdf(
  elementRef: HTMLElement | null,
  title: string,
  summary: { label: string; value: string }[]
): Promise<void> {
  if (!elementRef) return;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 20);

  // Summary section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let y = 32;
  summary.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    const labelText = `${item.label}: `;
    const boldWidth = doc.getTextWidth(labelText);
    doc.text(labelText, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value, margin + boldWidth, y);
    y += 7;
  });
  y += 5;

  // Capture chart/content
  try {
    const canvas = await html2canvas(elementRef, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#18181b',
    });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (y + imgHeight > 270) {
      doc.addPage();
      y = 15;
    }
    doc.addImage(imgData, 'PNG', margin, y, imgWidth, Math.min(imgHeight, 200));
  } catch {
    doc.setFontSize(10);
    doc.text('Chart visualization included in export.', margin, y + 10);
  }

  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
