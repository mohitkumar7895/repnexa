import nodemailer from "nodemailer";

interface SendOtpOptions {
  to: string;
  customerName: string;
  otp: string;
  jobCode: string;
  serviceTitle?: string;
  technicianName?: string;
}

export async function sendJobOtpEmail({
  to,
  customerName,
  otp,
  jobCode,
  serviceTitle = "Home Appliance Repair",
  technicianName = "Authorized Technician",
}: SendOtpOptions) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Repnexa Service" <noreply@repnexa.com>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Repnexa Service OTP</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #581c87 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.85; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
        .otp-box { background: #faf5ff; border: 2px dashed #9333ea; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #7e22ce; margin-bottom: 6px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #581c87; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; background: #f8fafc; border-radius: 8px; overflow: hidden; }
        .info-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
        .info-table td:first-child { font-weight: 600; color: #64748b; width: 40%; }
        .warning-box { background: #fff7ed; border-left: 4px solid #ea580c; padding: 12px 16px; font-size: 12px; color: #9a3412; border-radius: 4px; margin-top: 24px; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>REPNEXA SERVICE</h1>
          <p>Doorstep Appliance & Electronic Repair Verification</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${customerName || "Customer"},</div>
          <p style="font-size: 13px; line-height: 1.6; color: #475569;">
            Your service visit for <strong>${serviceTitle}</strong> has been scheduled. Please share the following one-time verification code with our verified technician only when they arrive at your doorstep.
          </p>

          <div class="otp-box">
            <div class="otp-label">Your Secure Service OTP</div>
            <div class="otp-code">${otp}</div>
            <div style="font-size: 11px; color: #6b21a8; margin-top: 6px;">Valid for Job #${jobCode}</div>
          </div>

          <table class="info-table">
            <tr>
              <td>Job Reference</td>
              <td><strong>#${jobCode}</strong></td>
            </tr>
            <tr>
              <td>Service Item</td>
              <td>${serviceTitle}</td>
            </tr>
            <tr>
              <td>Assigned Partner</td>
              <td>${technicianName}</td>
            </tr>
          </table>

          <div class="warning-box">
            ⚠️ <strong>Security Caution:</strong> Do NOT share this OTP over the phone or with anyone before the technician is physically present at your location.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Repnexa Appliance Service Network • Verified Doorstep Protection
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log to console for development visibility
  console.log("--------------------------------------------------");
  console.log(`📧 [EMAIL OTP DISPATCH] To: ${to}`);
  console.log(`🔑 OTP Code: ${otp} | Job: #${jobCode} | Customer: ${customerName}`);
  console.log("--------------------------------------------------");

  if (!user || !pass) {
    console.log("⚠️ SMTP_USER or SMTP_PASS not set in .env. Email logged above (Dev Mode).");
    return {
      success: true,
      mode: "dev_logged",
      message: `OTP generated & logged for ${to}: [${otp}]`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: `[Repnexa] Your Service Verification OTP: ${otp} (Job #${jobCode})`,
      html: htmlContent,
      text: `Hello ${customerName}, your Repnexa verification OTP for ${serviceTitle} (Job #${jobCode}) is: ${otp}. Share this with technician upon doorstep arrival.`,
    });

    console.log(`✅ Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true, mode: "live_smtp", messageId: info.messageId };
  } catch (error: any) {
    console.error("❌ Failed to send SMTP email:", error);
    return { success: false, error: error.message };
  }
}
