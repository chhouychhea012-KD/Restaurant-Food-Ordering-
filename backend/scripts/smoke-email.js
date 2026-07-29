require('dotenv').config();

const { sendNotificationEmail } = require('../src/services/email.service');

async function main() {
  const recipient = process.env.SMTP_TEST_TO || process.env.SMTP_USER;
  if (!recipient) {
    throw new Error('Set SMTP_TEST_TO or SMTP_USER before running the Gmail smoke test.');
  }

  const result = await sendNotificationEmail({
    to: recipient,
    title: 'Gmail notification smoke test',
    message: 'This confirms promotion/order notification email delivery is connected to SMTP/Gmail.',
    kind: 'system',
    ctaLabel: 'Open app',
    ctaUrl: (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_ORIGIN || 'http://localhost:5173').replace(/\/$/, ''),
  });

  if (!result.delivered || result.provider !== 'smtp') {
    throw new Error(result.message || 'SMTP/Gmail delivery did not run. Check SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
  }

  console.log(`Gmail smoke email sent to ${recipient}. Message id: ${result.messageId || 'n/a'}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});