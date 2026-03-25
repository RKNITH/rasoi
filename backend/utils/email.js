import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6B35, #F7931E); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px 30px; }
    .body h2 { color: #1a1a2e; font-size: 22px; margin-bottom: 16px; }
    .body p { color: #555; line-height: 1.6; margin-bottom: 16px; }
    .otp-box { background: #fff8f5; border: 2px dashed #FF6B35; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 800; color: #FF6B35; letter-spacing: 8px; }
    .otp-expiry { font-size: 13px; color: #888; margin-top: 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #FF6B35, #F7931E); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 16px 0; }
    .footer { background: #f8f9fa; padding: 24px 30px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #888; font-size: 12px; margin: 4px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Rasoi</h1>
      <p>Restaurant Management System</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Rasoi. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for registering with Rasoi. Please use the OTP below to verify your email address:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-expiry">⏱ This OTP expires in 10 minutes</div>
    </div>
    <div class="warning">
      ⚠️ Never share this OTP with anyone. Our team will never ask for it.
    </div>
    <p>If you didn't create an account, please ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email - Rasoi',
    html: emailTemplate('Email Verification', content)
  });
  logger.info(`Verification email sent to ${email}`);
};

export const sendPasswordResetEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Use the OTP below:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-expiry">⏱ This OTP expires in 10 minutes</div>
    </div>
    <div class="warning">
      ⚠️ If you didn't request a password reset, please secure your account immediately.
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset OTP - Rasoi',
    html: emailTemplate('Password Reset', content)
  });
};

export const sendWelcomeEmail = async (email, name, role) => {
  const transporter = createTransporter();
  const content = `
    <h2>Welcome to Rasoi! 🎉</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your account has been successfully created with the role of <strong>${role}</strong>.</p>
    <p>You can now log in and start using the system.</p>
    <a href="${process.env.FRONTEND_URL}/login" class="btn">Login to Dashboard →</a>
    <p>If you have any questions, feel free to contact our support team.</p>
  `;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Welcome to Rasoi!',
    html: emailTemplate('Welcome', content)
  });
};

export const sendInvoiceEmail = async (email, name, invoiceBuffer, invoiceNumber) => {
  const transporter = createTransporter();
  const content = `
    <h2>Your Invoice is Ready</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for dining with us! Please find your invoice <strong>#${invoiceNumber}</strong> attached.</p>
    <p>We hope to see you again soon!</p>
  `;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: `Invoice #${invoiceNumber} - Rasoi`,
    html: emailTemplate('Invoice', content),
    attachments: [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: invoiceBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};
