// Simple dev utility for sending password reset emails
// In production, replace with a real email provider (e.g., nodemailer, Gov Notify)

// EmailProvider interface
export interface EmailProvider {
  sendResetEmail(email: string, token: string, name?: string): Promise<void>;
}

// Default (dev) provider logs to console
export class ConsoleEmailProvider implements EmailProvider {
  async sendResetEmail(email: string, token: string, name?: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`Password reset link for ${name ? name + ' <' + email + '>' : email}: ${resetUrl}`);
  }
}

// Example: GovNotifyEmailProvider (real implementation)
import fetch from 'node-fetch';

export class GovNotifyEmailProvider implements EmailProvider {
  async sendResetEmail(email: string, token: string, name?: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const apiKey = process.env.GOV_NOTIFY_API_KEY;
    const templateId = process.env.GOV_NOTIFY_RESET_PASSWORD_TEMPLATE_ID;
    if (!apiKey || !templateId) {
      throw new Error('Gov Notify API key or template ID not set');
    }
    const payload = {
      email_address: email,
      template_id: templateId,
      personalisation: { reset_url: resetUrl, name: name || email },
    };
    const response = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey-v1 ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gov Notify error: ${response.status} ${errorText}`);
    }
  }
}

// Configurable provider selection
const providerName = process.env.EMAIL_PROVIDER || 'console';

let provider: EmailProvider;
if (providerName === 'govnotify') {
  provider = new GovNotifyEmailProvider();
} else {
  provider = new ConsoleEmailProvider();
}

export async function sendResetEmail(email: string, token: string, name?: string) {
  await provider.sendResetEmail(email, token, name);
}
