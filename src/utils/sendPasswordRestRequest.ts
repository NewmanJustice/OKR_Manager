import { sendEmail } from './sendGovNotifyEmail';
import { createNotifyJwt } from './jwt_generater';

const NOTIFY_API_KEY = process.env.GOV_NOTIFY_API_KEY;
const RESET_PASSWORD_TEMPLATE_ID = process.env.GOV_NOTIFY_RESET_PASSWORD_TEMPLATE_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function sendPasswordResetEmail(name: string, email: string, token: string) {
  if (!NOTIFY_API_KEY || !RESET_PASSWORD_TEMPLATE_ID || !BASE_URL) throw new Error("Notify config missing");
  const notifyJwt = createNotifyJwt(process.env.GOV_NOTIFY_API_KEY || '');
  const resetUrl = `${BASE_URL}/password-reset?token=${token}`;
  const personalisation = {
      reset_url: resetUrl,
      name: name || 'User'
    };
  const payload = {
    email_address: email,
    template_id: RESET_PASSWORD_TEMPLATE_ID,
    personalisation
  };
  const res = await sendEmail(notifyJwt, payload);
  if (!res.ok) {
    const data = await res.json();
    console.error("Failed to send password reset email:", data);
    throw new Error(data.errors?.[0]?.message || "Failed to send password reset email");
  }
  return true;
}