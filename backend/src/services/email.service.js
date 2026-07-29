const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function brandName() {
  return process.env.APP_NAME || 'Golden Land Restaurant';
}

function sender() {
  const brand = brandName();
  return process.env.SMTP_FROM || process.env.SMTP_USER || brand + ' <no-reply@goldenlandrestaurant.store>';
}

async function sendMail({ to, subject, text, html }) {
  const recipients = Array.isArray(to) ? [...new Set(to.filter(Boolean))] : [to].filter(Boolean);
  if (!recipients.length) return { delivered: false, provider: 'none', message: 'No recipients.' };

  if (!hasSmtpConfig()) {
    console.log(['Email preview', 'To: ' + recipients.join(', '), 'Subject: ' + subject, '', text].join('\n'));
    return { delivered: false, provider: 'console', recipients, message: 'SMTP is not configured; email was written to the console preview only.' };
  }

  const info = await createTransporter().sendMail({ from: sender(), to: recipients, subject, text, html });
  return { delivered: true, provider: 'smtp', messageId: info.messageId, recipients };
}

function layoutEmail({ eyebrow, title, bodyHtml, footer }) {
  const brand = escapeHtml(brandName());
  return [
    '<!doctype html>',
    '<html>',
    '<body style="margin:0;background:#f8fafc;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.08)">',
    '<tr><td style="background:#fb6b16;padding:24px 28px;color:#ffffff">',
    '<div style="font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:.9">' + escapeHtml(eyebrow) + '</div>',
    '<div style="margin-top:8px;font-size:24px;font-weight:800;line-height:1.25">' + brand + '</div>',
    '</td></tr>',
    '<tr><td style="padding:30px 28px">',
    '<h1 style="margin:0;font-size:24px;line-height:1.3;color:#0f172a">' + escapeHtml(title) + '</h1>',
    bodyHtml,
    '</td></tr>',
    '<tr><td style="padding:18px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px;line-height:1.6;color:#64748b">' + escapeHtml(footer || ('Sent by ' + brandName() + '. This is an automated email.')) + '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}

async function sendPasswordResetCode({ to, name, code, expiresInSeconds }) {
  const brand = brandName();
  const safeName = escapeHtml(name || 'Customer');
  const safeCode = escapeHtml(code);
  const subject = brand + ' password reset code';
  const text = [
    brand + ' password reset',
    '',
    'Hello ' + (name || 'Customer') + ',',
    '',
    'Use this verification code to reset your password: ' + code,
    '',
    'This code expires in ' + expiresInSeconds + ' seconds.',
    'For your security, do not share this code with anyone.',
    'If you did not request this password reset, please ignore this email. Your password will not change.',
    '',
    'Thank you,',
    brand + ' Team',
  ].join('\n');
  const html = layoutEmail({
    eyebrow: 'Account Security',
    title: 'Reset your password',
    bodyHtml: [
      '<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#475569">Hello <strong>' + safeName + '</strong>, use the verification code below to continue resetting your password.</p>',
      '<div style="margin:26px 0;padding:22px;border:1px solid #fed7aa;background:#fff7ed;border-radius:14px;text-align:center">',
      '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c2410c">Verification code</div>',
      '<div style="margin-top:10px;font-size:34px;font-weight:800;letter-spacing:8px;color:#fb6b16">' + safeCode + '</div>',
      '</div>',
      '<p style="margin:0;font-size:14px;line-height:1.7;color:#475569">This code expires in <strong>' + expiresInSeconds + ' seconds</strong>. For your security, do not share this code with anyone.</p>',
      '<div style="margin-top:22px;padding:14px 16px;background:#f1f5f9;border-radius:12px;font-size:13px;line-height:1.6;color:#64748b">If you did not request this password reset, you can safely ignore this email. Your password will not change unless this code is verified.</div>',
    ].join(''),
    footer: 'Sent by ' + brand + '. This is an automated security email.',
  });

  return sendMail({ to, subject, text, html });
}

async function sendNotificationEmail({ to, title, message, kind = 'system', ctaLabel, ctaUrl }) {
  const brand = brandName();
  const subjectPrefix = kind === 'promo' ? 'Promotion' : kind === 'order' ? 'Order update' : 'Notification';
  const subject = subjectPrefix + ': ' + title;
  const actionText = ctaLabel && ctaUrl ? ctaLabel + ': ' + ctaUrl : '';
  const text = [title, '', message, '', actionText, '', brand].filter(Boolean).join('\n');
  const html = layoutEmail({
    eyebrow: subjectPrefix,
    title,
    bodyHtml: [
      '<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#475569">' + escapeHtml(message) + '</p>',
      ctaLabel && ctaUrl
        ? '<p style="margin:24px 0 0"><a href="' + escapeHtml(ctaUrl) + '" style="display:inline-block;background:#fb6b16;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-size:14px;font-weight:700">' + escapeHtml(ctaLabel) + '</a></p>'
        : '',
    ].join(''),
  });

  return sendMail({ to, subject, text, html });
}

async function sendOrderEmail({ to, title, message, order, ctaUrl, ctaLabel = 'View order' }) {
  const brand = brandName();
  const subject = 'Order update: ' + order.id;
  const text = [
    title,
    '',
    message,
    '',
    'Order: ' + order.id,
    'Restaurant: ' + order.restaurantName,
    'Status: ' + order.status,
    'Total: $' + Number(order.total || 0).toFixed(2),
    ctaUrl ? ctaLabel + ': ' + ctaUrl : '',
    '',
    brand,
  ].filter(Boolean).join('\n');
  const html = layoutEmail({
    eyebrow: 'Order Update',
    title,
    bodyHtml: [
      '<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#475569">' + escapeHtml(message) + '</p>',
      '<div style="margin:24px 0;padding:16px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:14px;font-size:14px;line-height:1.8;color:#334155">',
      '<div><strong>Order:</strong> ' + escapeHtml(order.id) + '</div>',
      '<div><strong>Restaurant:</strong> ' + escapeHtml(order.restaurantName) + '</div>',
      '<div><strong>Status:</strong> ' + escapeHtml(order.status) + '</div>',
      '<div><strong>Total:</strong> $' + Number(order.total || 0).toFixed(2) + '</div>',
      '</div>',
      ctaUrl
        ? '<p style="margin:24px 0 0"><a href="' + escapeHtml(ctaUrl) + '" style="display:inline-block;background:#fb6b16;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-size:14px;font-weight:700">' + escapeHtml(ctaLabel) + '</a></p>'
        : '',
    ].join(''),
  });

  return sendMail({ to, subject, text, html });
}

module.exports = {
  sendMail,
  sendNotificationEmail,
  sendOrderEmail,
  sendPasswordResetCode,
};
