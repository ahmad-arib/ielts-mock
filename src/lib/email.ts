import nodemailer from 'nodemailer';
import { getAppBaseUrl } from './appConfig';

function getSenderEmail(): string | null {
  const fromEnv = process.env.FROM_EMAIL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }

  const mailFromEnv = process.env.MAIL_FROM;
  if (typeof mailFromEnv === 'string' && mailFromEnv.trim()) {
    return mailFromEnv.trim();
  }

  return null;
}

function resolveInterestRecipient(): string | null {
  const configuredRecipient = process.env.INTEREST_NOTIFICATION_EMAIL;
  if (typeof configuredRecipient === 'string' && configuredRecipient.trim()) {
    return configuredRecipient.trim();
  }

  return getSenderEmail();
}

function ensureSenderEmail(context: string): string | null {
  const sender = getSenderEmail();
  if (!sender) {
    console.warn(`No sender email configured; skipping ${context}. Set FROM_EMAIL or MAIL_FROM.`);
    return null;
  }
  return sender;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendTokenEmail({
  to, name, token, expiresAt,
}: { to: string; name: string | null; token: string; expiresAt: Date; }) {
  const sender = ensureSenderEmail('token email delivery');
  if (!sender) return;

  const subject = 'Your IELTS Try Out Token';
  const appBaseUrl = getAppBaseUrl();
  const text = `Hello ${name || ''},

Here is your token to access the IELTS Try Out:

${token}

This token is valid until ${expiresAt.toISOString()}.

Use it on the login page: ${appBaseUrl}/login

This try out currently covers the Listening and Reading sections. Writing & Speaking are being prepared and we will email updates soon.
`;
  await transporter.sendMail({ from: sender, to, subject, text });
}

export async function sendInterestNotification({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const sender = ensureSenderEmail('interest notification email delivery');
  if (!sender) return;

  const recipient = resolveInterestRecipient();
  if (!recipient) {
    console.warn('No recipient configured for interest notifications.');
    return;
  }

  const subject = 'Writing & Speaking Try Out interest received';
  const text = `A learner wants to join the upcoming Writing & Speaking Try Out.

Name: ${name}
Email: ${email}

Please follow up by email.`;

  await transporter.sendMail({ from: sender, to: recipient, subject, text });
}
