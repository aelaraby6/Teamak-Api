import nodemailer from "nodemailer";

export default class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  // Create transporter
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send Email
  async send(subject, message) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // Send Password Reset Code
  async sendPasswordResetCode(resetCode) {
    const subject = "Password Reset Verification Code";
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${this.firstName},</p>
        <p>You requested to reset your password. Please use the following verification code:</p>
        <div style="background-color: #f8f9fa; border: 2px dashed #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 8px; margin: 0;">${resetCode}</h1>
        </div>
        <p style="color: #666;">⚠️ This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Best regards,<br>Your App Team</p>
      </div>
    `;

    await this.send(subject, message);
  }
}
