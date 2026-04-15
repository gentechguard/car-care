import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhone, maskPhone } from '../_shared/phone-utils.ts';
import { sendOtpWhatsApp } from '../_shared/whatsapp.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { installerMobile } = await req.json();

    if (!installerMobile || installerMobile.length !== 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_phone', message: 'Please provide a valid 10-digit mobile number.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const normalizedInput = normalizePhone(installerMobile);

    // 1. Fetch all active dealers
    const { data: dealers, error: dealerError } = await supabase
      .from('dealers')
      .select('id, dealer_name, phone')
      .eq('is_active', true);

    if (dealerError) {
      console.error('Dealer fetch error:', dealerError);
      return new Response(
        JSON.stringify({ success: false, error: 'server_error', message: 'Unable to verify dealer. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Find matching dealer by normalized phone
    const matchedDealer = dealers?.find(d => normalizePhone(d.phone) === normalizedInput);

    if (!matchedDealer) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'dealer_not_found',
          message: 'This mobile number is not registered with any active Gentech Guard dealer. Please verify the number or contact support.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Rate limiting: check for OTPs sent in the last 60 seconds
    const { data: recentOtp } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('phone', normalizedInput)
      .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString())
      .limit(1);

    if (recentOtp && recentOtp.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'rate_limited',
          message: 'Please wait 60 seconds before requesting a new code.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Invalidate any existing unexpired OTPs for this phone
    await supabase
      .from('otp_verifications')
      .update({ expires_at: new Date().toISOString() })
      .eq('phone', normalizedInput)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString());

    // 5. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 6. Store OTP (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        phone: normalizedInput,
        otp_code: otp,
        dealer_id: matchedDealer.id,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('OTP insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'server_error', message: 'Failed to generate verification code.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Send OTP via WhatsApp (Meta Cloud API)
    const waResult = await sendOtpWhatsApp(normalizedInput, otp);

    if (!waResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'whatsapp_failed',
          message: 'Unable to send verification code via WhatsApp. Please try again in a moment.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Return success with masked phone
    return new Response(
      JSON.stringify({
        success: true,
        dealerId: matchedDealer.id,
        dealerName: matchedDealer.dealer_name,
        maskedPhone: maskPhone(normalizedInput),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('verify-dealer-send-otp error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error', message: 'An unexpected error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
