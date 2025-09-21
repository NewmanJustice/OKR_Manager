export async function sendEmail(token: string, payload: object) {
  const res = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res;
}
