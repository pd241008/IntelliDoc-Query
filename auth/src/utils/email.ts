import nodemailer from 'nodemailer';

// Since we are mocking for now, we can use Ethereal Email (a fake SMTP service for testing)
// Or just log the OTP to the console.

export async function sendOTPEmail(to: string, otp: string) {
  // If no SMTP configured, we just mock it. 
  // We'll create a test account on the fly if needed, or just log.
  
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_HOST) {
    console.log(`\n========================================`);
    console.log(`MOCK EMAIL SENT TO: ${to}`);
    console.log(`YOUR OTP IS: ${otp}`);
    console.log(`========================================\n`);
    return;
  }

  // Real SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"IntelliDoc Admin" <noreply@intellidoc.com>',
    to,
    subject: 'Your Admin Login OTP',
    text: `Your One-Time Password for Admin Login is: ${otp}\nThis code will expire in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; text-align: center;">
        <h2>IntelliDoc Admin Login</h2>
        <p>Your One-Time Password is:</p>
        <h1 style="background: #eee; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}
