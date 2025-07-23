// GOV.UK Notify email sending utility for account verification
import { createNotifyJwt } from './jwt_generater';

const NOTIFY_API_KEY = process.env.GOV_NOTIFY_API_KEY;
const VERIFY_TEMPLATE_ID = process.env.GOV_NOTIFY_VERIFY_ACCOUNT_TEMPLATE_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function sendVerificationEmail(name: string, email: string, token: string) {
  if (!NOTIFY_API_KEY || !VERIFY_TEMPLATE_ID || !BASE_URL) throw new Error("Notify config missing");
  const notifyJwt = createNotifyJwt(process.env.GOV_NOTIFY_API_KEY || '');
  const verificationUrl = `${BASE_URL}/verify?token=${token}`;
  const personalisation = {
      verify_url: verificationUrl,
      name: name || 'User'
    };
  const payload = {
    email_address: email,
    template_id: VERIFY_TEMPLATE_ID,
    personalisation
  };
  const res = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notifyJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.[0]?.message || "Failed to send verification email");
  }
  return true;
}
