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

async function sendPasswordResetCode({ to, name, code, expiresInSeconds }) {
  const brandName = process.env.APP_NAME || 'Golden Land Restaurant';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || brandName + ' <no-reply@goldenlandrestaurant.store>';
  const subject = brandName + ' password reset code';
  const safeName = escapeHtml(name || 'Customer');
  const safeBrand = escapeHtml(brandName);
  const safeCode = escapeHtml(code);
  const text = [
    brandName + ' password reset',
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
    brandName + ' Team',
  ].join('\n');
  const html = [
    '<!doctype html>',
    '<html>',
    '<body style="margin:0;background:#f8fafc;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.08)">',
    '<tr><td style="background:#fb6b16;padding:24px 28px;color:#ffffff">',
    '<div style="font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:.9">Account Security</div>',
    '<div style="margin-top:8px;font-size:24px;font-weight:800;line-height:1.25">' + safeBrand + '</div>',
    '</td></tr>',
    '<tr><td style="padding:30px 28px">',
    '<h1 style="margin:0;font-size:24px;line-height:1.3;color:#0f172a">Reset your password</h1>',
    '<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#475569">Hello <strong>' + safeName + '</strong>, use the verification code below to continue resetting your password.</p>',
    '<div style="margin:26px 0;padding:22px;border:1px solid #fed7aa;background:#fff7ed;border-radius:14px;text-align:center">',
    '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c2410c">Verification code</div>',
    '<div style="margin-top:10px;font-size:34px;font-weight:800;letter-spacing:8px;color:#fb6b16">' + safeCode + '</div>',
    '</div>',
    '<p style="margin:0;font-size:14px;line-height:1.7;color:#475569">This code expires in <strong>' + expiresInSeconds + ' seconds</strong>. For your security, do not share this code with anyone.</p>',
    '<div style="margin-top:22px;padding:14px 16px;background:#f1f5f9;border-radius:12px;font-size:13px;line-height:1.6;color:#64748b">If you did not request this password reset, you can safely ignore this email. Your password will not change unless this code is verified.</div>',
    '</td></tr>',
    '<tr><td style="padding:18px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px;line-height:1.6;color:#64748b">Sent by ' + safeBrand + '. This is an automated security email.</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');

  if (!hasSmtpConfig()) {
    console.log(text);
    return { delivered: true, provider: 'console' };
  }

  const info = await createTransporter().sendMail({ from, to, subject, text, html });
  return { delivered: true, provider: 'smtp', messageId: info.messageId };
}

module.exports = {
  sendPasswordResetCode,
};
