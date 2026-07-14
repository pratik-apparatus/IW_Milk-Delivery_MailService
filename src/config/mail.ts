import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure env vars are loaded
dotenv.config();

const { EMAIL_USER, EMAIL_PASS } = process.env;

export const hasEmailCredentials = Boolean(EMAIL_USER && EMAIL_PASS);

export const transporter = hasEmailCredentials
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true }); // fallback to avoid runtime crash

// Verify transport only when real creds exist; otherwise warn once.
if (hasEmailCredentials) {
  transporter.verify((error: Error | null) => {
    if (error) {
      console.error('Nodemailer error:', error);
    } else {
      console.log('Nodemailer is ready to send emails');
    }
  });
} else {
  console.warn(
    'EMAIL_USER/EMAIL_PASS not set. Emails will NOT be delivered (jsonTransport only).',
  );
}
