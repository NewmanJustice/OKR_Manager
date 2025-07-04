// Simple dev utility for sending password reset emails
// In production, replace with a real email provider (e.g., nodemailer, Gov Notify)

// EmailProvider interface
export interface EmailProvider {
  sendResetEmail(email: string, token: string, name?: string): Promise<void>;
  sendVerifyEmail?(email: string, token: string, name?: string): Promise<void>;
}

// Default (dev) provider logs to console
export class ConsoleEmailProvider implements EmailProvider {
  async sendResetEmail() {
    // Removed console.log for password reset link
  }
  async sendVerifyEmail() {
    // Removed console.log for verify account link
  }
}

import { createNotifyJwt } from './jwt_generater';
import fetch from 'node-fetch';


export class GovNotifyEmailProvider implements EmailProvider {
  
  async sendResetEmail(email: string, token: string) {
    const apiKey = process.env.GOV_NOTIFY_API_KEY;
    const templateId = process.env.GOV_NOTIFY_RESET_PASSWORD_TEMPLATE_ID;
    if (!apiKey || !templateId) {
      throw new Error('Gov Notify API key or template ID not set');
    }

    // Generate the required JWT for authentication
    const notifyToken = createNotifyJwt(apiKey);

    const payload = {
      email_address: email,
      template_id: templateId,
      personalisation: { reset_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}` },
    };
    const response = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gov Notify error: ${response.status} ${errorText}`);
    }
  }
  async sendVerifyEmail(email: string, token: string) {
    const apiKey = process.env.GOV_NOTIFY_API_KEY;
    const templateId = process.env.GOV_NOTIFY_VERIFY_ACCOUNT_TEMPLATE_ID;
    if (!apiKey || !templateId) {
      throw new Error('Gov Notify API key or verify account template ID not set');
    }

    // Generate the required JWT for authentication
    const notifyToken = createNotifyJwt(apiKey);

    const payload = {
      email_address: email,
      template_id: templateId,
      personalisation: { verify_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${token}` },
    };
    const response = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notifyToken}`,
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

export async function sendResetEmail(email: string, token: string) {
  await provider.sendResetEmail(email, token);
}

export async function sendVerifyEmail(email: string, token: string) {
  if (provider.sendVerifyEmail) {
    await provider.sendVerifyEmail(email, token);
  } else {
    throw new Error('Email provider does not support sendVerifyEmail');
  }
}
