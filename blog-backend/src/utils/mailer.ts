import { Resend } from 'resend';
import env from '../config/env';

const resend = new Resend(env.RESEND_API);

/**
 * Send an email via Resend.
 * @param params.to   - Recipient email address(es)
 * @param params.subject
 * @param params.html - HTML body
 */
export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  const { data, error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(`Failed to send email: ${(error as any).message}`);
  }

  return data;
};
