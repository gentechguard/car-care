const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')!;
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!;
const META_API_VERSION = 'v21.0';

const baseUrl = `https://graph.facebook.com/${META_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

const headers = {
  'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

/**
 * Format phone for Meta API: strip everything except digits, ensure country code.
 * Meta expects: "919989820222" (no + sign)
 */
function metaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits.slice(-10)}`;
}

/**
 * Send OTP via WhatsApp using an authentication template.
 * Template name must be pre-approved in Meta Business Manager.
 */
export async function sendOtpWhatsApp(
  to: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const templateName = Deno.env.get('WA_OTP_TEMPLATE_NAME') || 'gentech_otp';

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: metaPhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: otp },
              ],
            },
          ],
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error('Meta WhatsApp OTP error:', result);
      return { success: false, error: result.error?.message || 'WhatsApp OTP send failed' };
    }

    return { success: true };
  } catch (err) {
    console.error('Meta WhatsApp OTP exception:', err);
    return { success: false, error: 'WhatsApp service unavailable' };
  }
}

/**
 * Send a document (PDF) via WhatsApp using a utility template.
 * Template must have a DOCUMENT header and body parameters.
 */
export async function sendDocumentWhatsApp(
  to: string,
  documentUrl: string,
  filename: string,
  bodyParams: string[]
): Promise<{ success: boolean; error?: string }> {
  const templateName = Deno.env.get('WA_CERTIFICATE_TEMPLATE_NAME') || 'gentech_warranty_certificate';

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: metaPhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'document',
                  document: {
                    link: documentUrl,
                    filename,
                  },
                },
              ],
            },
            {
              type: 'body',
              parameters: bodyParams.map(text => ({ type: 'text', text })),
            },
          ],
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error('Meta WhatsApp document error:', result);
      return { success: false, error: result.error?.message || 'WhatsApp send failed' };
    }

    return { success: true };
  } catch (err) {
    console.error('Meta WhatsApp document exception:', err);
    return { success: false, error: 'WhatsApp service unavailable' };
  }
}
