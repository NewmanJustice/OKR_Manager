// Simple dev utility for sending password reset emails
// In production, replace with a real email provider (e.g., nodemailer, Gov Notify)

// EmailProvider interface
export interface EmailProvider {
  sendResetEmail(email: string, token: string, name?: string): Promise<void>;
  sendVerifyEmail?(email: string, token: string, name?: string): Promise<void>;
}

// Default (dev) provider logs to console when running in development prints to console 
export class ConsoleEmailProvider implements EmailProvider {
  async sendResetEmail() {
  }
  async sendVerifyEmail() {
  }
}

import fetch from 'node-fetch';
import { createNotifyJwt } from './jwt_generater';

export class GovNotifyEmailProvider implements EmailProvider {
  
  async sendResetEmail(email: string, token: string, name?: string) {
    const templateId = process.env.GOV_NOTIFY_RESET_PASSWORD_TEMPLATE_ID;
    const notifyJwt = createNotifyJwt(process.env.GOV_NOTIFY_API_KEY || '');
    if (!notifyJwt || !templateId) {
      throw new Error('Gov Notify API key or template ID not set');
    }

    const payload = {
      email_address: email,
      template_id: templateId,
      personalisation: {
        reset_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`,
        name: name || ''
      },
    };
    const response = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notifyJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gov Notify error: ${response.status} ${errorText}`);
    }
  }
  async sendVerifyEmail(email: string, token: string, name?: string) {
    const notifyJwt = createNotifyJwt(process.env.GOV_NOTIFY_API_KEY || '');
    const templateId = process.env.GOV_NOTIFY_VERIFY_ACCOUNT_TEMPLATE_ID;
    if (!notifyJwt || !templateId) {
      throw new Error('Gov Notify API key or verify account template ID not set');
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify?token=${token || ''}`;
    const personalisation = {
      verify_url: verifyUrl,
      name: name || 'User'
    };
    // Uncomment for debugging:
    console.log('Notify personalisation:', personalisation);
    const payload = {
      email_address: email,
      template_id: templateId,
      personalisation,
    };
    const response = await fetch('https://api.notifications.service.gov.uk/v2/notifications/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notifyJwt}`,
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
console.log('EMAIL_PROVIDER:', providerName);

let provider: EmailProvider;
if (providerName === 'govnotify') {
  provider = new GovNotifyEmailProvider();
  console.log('Using GovNotifyEmailProvider');
} else {
  provider = new ConsoleEmailProvider();
  console.log('Using ConsoleEmailProvider');
}

export async function sendResetEmail(email: string, token: string, name?: string) {
  await provider.sendResetEmail(email, token, name);
}

export async function sendVerifyEmail(email: string, token: string, name?: string) {
  console.log('sendVerifyEmail called with:', { email, token, name });
  if (provider.sendVerifyEmail) {
    await provider.sendVerifyEmail(email, token, name);
  } else {
    throw new Error('Email provider does not support sendVerifyEmail');
  }
}
