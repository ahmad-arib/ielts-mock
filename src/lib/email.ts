import nodemailer from 'nodemailer';
import { getAppBaseUrl } from './appConfig';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendTokenEmail({
  to, name, token, expiresAt,
}: { to: string; name: string | null; token: string; expiresAt: Date; }) {
  const subject = 'Your IELTS Try Out Token';
  const appBaseUrl = getAppBaseUrl();
  const text = `Hello ${name || ''},

Here is your token to access the IELTS Try Out:

${token}

This token is valid until ${expiresAt.toISOString()}.

Use it on the login page: ${appBaseUrl}/login

This try out currently covers the Listening and Reading sections. Writing & Speaking are being prepared and we will email updates soon.
`;
  await transporter.sendMail({ from: process.env.FROM_EMAIL!, to, subject, text });
}

export async function sendInterestNotification({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const recipient = process.env.INTEREST_NOTIFICATION_EMAIL || process.env.FROM_EMAIL;
  if (!recipient) {
    console.warn('No recipient configured for interest notifications.');
    return;
  }

  const subject = 'Writing & Speaking Try Out interest received';
  const text = `A learner wants to join the upcoming Writing & Speaking Try Out.

Name: ${name}
Email: ${email}

Please follow up by email.`;

  await transporter.sendMail({ from: process.env.FROM_EMAIL!, to: recipient, subject, text });
}
