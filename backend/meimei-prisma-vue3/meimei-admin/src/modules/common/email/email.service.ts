import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import config from 'src/config';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * 发送找回密码邮件
   */
  async sendPasswordResetEmail(email: string, token: string, userName: string) {
    const resetUrl = `${config().website.resetPasswordUrl}?token=${token}&email=${encodeURIComponent(email)}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Password Reset Request - ${config().website.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #2F562A;
                margin: 0;
              }
              .content {
                background: white;
                padding: 25px;
                border-radius: 5px;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: #2F562A;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .button:hover {
                background: #1f3a1a;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${config().website.name}</h1>
              </div>
              
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello <strong>${userName}</strong>,</p>
                <p>We received a request to reset your password. Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2F562A;">${resetUrl}</p>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul style="margin: 10px 0;">
                    <li>This link will expire in <strong>1 hour</strong></li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Your password won't change until you create a new one</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated email, please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} ${config().website.name}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * 发送欢迎邮件（可选）
   */
  async sendWelcomeEmail(email: string, userName: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Welcome to ${config().website.name}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #2F562A;
                margin: 0;
              }
              .content {
                background: white;
                padding: 25px;
                border-radius: 5px;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: #2F562A;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to ${config().website.name}! 🎉</h1>
              </div>
              
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Thank you for registering with us. We're excited to have you on board!</p>
                <p>You can now:</p>
                <ul>
                  <li>Browse our products</li>
                  <li>Manage your profile</li>
                  <li>Track your orders</li>
                  <li>And much more!</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${config().website.url}" class="button">Visit Our Website</a>
                </div>
              </div>
              
              <div class="footer">
                <p>If you have any questions, feel free to contact us.</p>
                <p>&copy; ${new Date().getFullYear()} ${config().website.name}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // 欢迎邮件失败不应该阻止注册流程
      return { success: false };
    }
  }
}

