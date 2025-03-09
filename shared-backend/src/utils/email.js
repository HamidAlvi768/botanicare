const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  // Send email
  async sendEmail(options) {
    const mailOptions = {
      from: config.smtp.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome to Botani Care!</h1>
      <p>Dear ${user.firstName},</p>
      <p>Thank you for registering with Botani Care. We're excited to have you on board!</p>
      <p>You can now start shopping for your favorite plants and gardening supplies.</p>
      <p>Best regards,<br>The Botani Care Team</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Botani Care',
      html
    });
  }

  // Send order confirmation
  async sendOrderConfirmation(order, user) {
    const html = `
      <h1>Order Confirmation</h1>
      <p>Dear ${user.firstName},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
      <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
      <p>We'll notify you when your order has been shipped.</p>
      <p>Best regards,<br>The Botani Care Team</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Dear ${user.firstName},</p>
      <p>You requested to reset your password. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The Botani Care Team</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html
    });
  }

  // Send order status update
  async sendOrderStatusUpdate(order, user) {
    const html = `
      <h1>Order Status Update</h1>
      <p>Dear ${user.firstName},</p>
      <p>Your order ${order.orderNumber} has been updated to: <strong>${order.orderStatus}</strong></p>
      ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
      ${order.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate.toLocaleDateString()}</p>` : ''}
      <p>Thank you for shopping with Botani Care!</p>
      <p>Best regards,<br>The Botani Care Team</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html
    });
  }
}

module.exports = new EmailService(); 