import { createNotifyJwt } from './jwt_generater';
import { sendEmail } from './sendGovNotifyEmail';

const NOTIFY_API_KEY = process.env.GOV_NOTIFY_API_KEY;
const INVITE_TEMPLATE_ID = process.env.GOV_NOTIFY_INVITE_TEMPLATE_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function sendInviteEmailGovNotify(lineManagerName: string, inviteeName: string, inviteeEmail: string, token: string) {
  if (!NOTIFY_API_KEY || !INVITE_TEMPLATE_ID || !BASE_URL) throw new Error("Notify config missing");
  const notifyJwt = createNotifyJwt(NOTIFY_API_KEY);
  const inviteUrl = `${BASE_URL}/register?invite=${token}`;
  const personalisation = {
    line_manager_name: lineManagerName,
    invitee_name: inviteeName || 'User',
    invite_link: inviteUrl,
    invitee_email: inviteeEmail
  };
  const payload = {
    email_address: inviteeEmail,
    template_id: INVITE_TEMPLATE_ID,
    personalisation
  };
  const res = await sendEmail(notifyJwt, payload);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.[0]?.message || "Failed to send invite email");
  }
  return true;
}
