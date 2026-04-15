import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Capture a Certificate DOM element to a PDF blob.
 * Uses the same pattern as WarrantyChecker.tsx downloadPdf.
 */
export async function generateWarrantyPdf(certElement: HTMLElement): Promise<Blob> {
  // Wait for fonts and images to settle
  await new Promise(resolve => setTimeout(resolve, 300));

  const dataUrl = await toPng(certElement, {
    quality: 1.0,
    pixelRatio: 3,
    backgroundColor: '#020618',
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const certWidth = certElement.scrollWidth;
  const certHeight = certElement.scrollHeight;
  const finalHeight = (certHeight * pdfWidth) / certWidth;

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, finalHeight);

  return pdf.output('blob');
}

/**
 * Upload a PDF blob to Supabase Storage and return the public URL.
 */
export async function uploadWarrantyPdf(
  supabase: any,
  warrantyId: string,
  pdfBlob: Blob
): Promise<string> {
  const fileName = `${warrantyId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('warranty-certificates')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('warranty-certificates')
    .getPublicUrl(fileName);

  return publicUrl;
}
