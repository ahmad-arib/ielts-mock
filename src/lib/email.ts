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
  const subject = 'Your IELTS Mock Test Token';
  const appBaseUrl = getAppBaseUrl();
  const text = `Hello ${name || ''},

Here is your token to access the IELTS Mock Test:

${token}

This token is valid until ${expiresAt.toISOString()}.

Use it on the login page: ${appBaseUrl}/login
`;
  await transporter.sendMail({ from: process.env.FROM_EMAIL!, to, subject, text });
}
