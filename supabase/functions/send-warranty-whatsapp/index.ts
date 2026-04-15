import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhone } from '../_shared/phone-utils.ts';
import { sendDocumentWhatsApp } from '../_shared/whatsapp.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      pdfUrl,
      warrantyId,
      customerName,
      customerPhone,
      dealerPhone,
      vehicleRegNumber,
      productName,
    } = await req.json();

    if (!pdfUrl || !warrantyId || !customerPhone || !dealerPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_fields', message: 'Required fields are missing.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const adminPhone = Deno.env.get('ADMIN_WHATSAPP_NUMBER') || '+919989820222';

    const normalizedDealer = normalizePhone(dealerPhone);
    const normalizedCustomer = normalizePhone(customerPhone);
    const normalizedAdmin = normalizePhone(adminPhone);

    const filename = `Gentech-Warranty-${warrantyId}.pdf`;

    // Body parameters for the template: {{1}}=customerName, {{2}}=warrantyId, {{3}}=vehicleRegNumber
    const bodyParams = [customerName, warrantyId, vehicleRegNumber];

    // Send to all 3 recipients via Meta WhatsApp Cloud API
    const results = await Promise.allSettled([
      sendDocumentWhatsApp(normalizedDealer, pdfUrl, filename, bodyParams),
      sendDocumentWhatsApp(normalizedCustomer, pdfUrl, filename, bodyParams),
      sendDocumentWhatsApp(normalizedAdmin, pdfUrl, filename, bodyParams),
    ]);

    const deliveryResults = {
      dealer: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: 'failed' },
      customer: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: 'failed' },
      admin: results[2].status === 'fulfilled' ? results[2].value : { success: false, error: 'failed' },
    };

    // Track delivery in warranty_certificates table
    const deliveryErrors: Array<{ recipient: string; error: string }> = [];
    if (!deliveryResults.dealer.success) deliveryErrors.push({ recipient: 'dealer', error: deliveryResults.dealer.error || 'unknown' });
    if (!deliveryResults.customer.success) deliveryErrors.push({ recipient: 'customer', error: deliveryResults.customer.error || 'unknown' });
    if (!deliveryResults.admin.success) deliveryErrors.push({ recipient: 'admin', error: deliveryResults.admin.error || 'unknown' });

    await supabase
      .from('warranty_certificates')
      .update({
        delivered_to_dealer: deliveryResults.dealer.success,
        delivered_to_customer: deliveryResults.customer.success,
        delivered_to_admin: deliveryResults.admin.success,
        delivery_errors: deliveryErrors,
      })
      .eq('warranty_id', warrantyId);

    return new Response(
      JSON.stringify({
        success: true,
        deliveryResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('send-warranty-whatsapp error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error', message: 'An unexpected error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
