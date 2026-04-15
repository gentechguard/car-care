import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizePhone } from '../_shared/phone-utils.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { installerMobile, otpCode } = await req.json();

    if (!installerMobile || !otpCode || otpCode.length !== 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_input', message: 'Please provide a valid 6-digit code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const normalizedPhone = normalizePhone(installerMobile);

    // 1. Find the latest unexpired, unverified OTP for this phone
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'otp_expired_or_invalid',
          message: 'Verification code has expired or not found. Please request a new one.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check max attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'max_attempts_exceeded',
          message: 'Too many incorrect attempts. Please request a new code.',
          remainingAttempts: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Increment attempts
    await supabase
      .from('otp_verifications')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    // 4. Compare OTP codes
    if (otpRecord.otp_code !== otpCode) {
      const remaining = otpRecord.max_attempts - (otpRecord.attempts + 1);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'incorrect_otp',
          message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          remainingAttempts: remaining
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Mark as verified
    await supabase
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', otpRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        verificationId: otpRecord.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('verify-otp error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error', message: 'An unexpected error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
