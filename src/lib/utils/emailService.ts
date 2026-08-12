import config from '@/lib/utils/env';
import logger from './logger';
import { formatRestaurantTime } from './timeUtils';
import type { EmailContent, EmailTemplate, EmailResult, ReservationRow } from '../types';
// Resend Email Configuration
import { Resend } from 'resend';

const getSenderEmail = (): string => config.EMAIL_SENDER || 'reservations@sangeet.hk';
const getReplyToEmail = (): string => config.EMAIL_REPLY_TO || 'ranaji13@sangeet.hk';
const getApiKey = (): string | undefined => config.RESEND_API_KEY as string;

const resend = getApiKey() ? new Resend(getApiKey()) : null;

// HTML Escaping Utility for XSS Prevention
const escapeHtml = (unsafe: unknown): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

type ReservationEmailData = Pick<ReservationRow, 'customer_name' | 'email' | 'date' | 'time' | 'guests' | 'special_requests' | 'table_id'> & {
  phone?: string;
  subject?: string;
  message?: string;
};

// Email templates
const emailTemplates: Record<EmailTemplate, (data: ReservationEmailData) => EmailContent> = {
  reservationCreated: (reservation) => ({
    subject: `Thank You for Your Reservation Request - Sangeet Restaurant`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 100%; width: 100%; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e9ecef; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f8f9fa;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">🍽️ Sangeet Restaurant</h1>
            </div>
            <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 16px;">Hong Kong's Premier Dining Destination</p>
          </div>
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #28a745;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🙏</div>
              <h2 style="color: #155724; margin: 0 0 15px 0; font-size: 24px;">Thank You for Choosing Sangeet!</h2>
              <p style="color: #155724; margin: 0; font-size: 16px; line-height: 1.6;">
                We're delighted to receive your reservation request! Our team is carefully reviewing your booking and will send you a confirmation email shortly.
              </p>
            </div>
          </div>
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #495057; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📋 Your Reservation Request</h3>
            <div>
              <p><strong>👤 Guest Name:</strong> ${escapeHtml(reservation.customer_name)}</p>
              <p><strong>👥 Number of Guests:</strong> ${reservation.guests} people</p>
              <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>🕐 Time:</strong> ${formatRestaurantTime(reservation.time)}</p>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center;">
              <strong style="color: #856404;">⏳ Status: Awaiting Confirmation</strong>
            </div>
          </div>
          ${reservation.special_requests ? `
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0;">💬 Special Requests</h3>
            <p style="color: #1565c0; font-style: italic;">"${escapeHtml(reservation.special_requests)}"</p>
          </div>
          ` : ''}
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d;">We look forward to creating an unforgettable dining experience for you!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #6c757d; font-size: 13px;">📍 Wanchai, Hong Kong | 📞 +852 2345 6789 | 📧 info@sangeet.hk</p>
            </div>
          </div>
        </div>
      </div>
    `
  }),

  reservationConfirmed: (reservation) => ({
    subject: `🎉 Your Reservation is Confirmed! - Sangeet Restaurant`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 100%; width: 100%; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e9ecef; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f8f9fa;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🍽️ Sangeet Restaurant</h1>
            </div>
          </div>
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 40px; border-radius: 20px; margin-bottom: 30px; text-align: center; border: 2px solid #28a745;">
            <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #155724; margin: 0 0 15px 0; font-size: 28px;">Your Reservation is Confirmed!</h2>
            <p style="color: #155724; margin: 0; font-size: 18px;">Great news! Your table is reserved.</p>
          </div>
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 30px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #155724; margin: 0 0 25px 0; text-align: center;">✅ Confirmed Reservation Details</h3>
            <p><strong>👤 Guest Name:</strong> ${escapeHtml(reservation.customer_name)}</p>
            <p><strong>👥 Guests:</strong> ${reservation.guests} people</p>
            <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Time:</strong> ${formatRestaurantTime(reservation.time)}</p>
            ${reservation.table_id ? `<p><strong>🪑 Table:</strong> Table ${reservation.table_id}</p>` : ''}
          </div>
          ${reservation.special_requests ? `
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0;">💬 Special Requests</h3>
            <p style="color: #1565c0; font-style: italic;">"${escapeHtml(reservation.special_requests)}"</p>
          </div>
          ` : ''}
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d;">We can't wait to create an unforgettable dining experience for you!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #6c757d; font-size: 13px;">📍 Wanchai, Hong Kong | 📞 +852 2345 6789 | 📧 info@sangeet.hk</p>
            </div>
          </div>
        </div>
      </div>
    `
  }),

  reservationCancelled: (reservation) => ({
    subject: `Reservation Cancelled - Sangeet Restaurant`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 100%; width: 100%; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e9ecef; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f8f9fa;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🍽️ Sangeet Restaurant</h1>
            </div>
          </div>
          <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center; border: 2px solid #dc3545;">
            <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
            <h2 style="color: #721c24; margin: 0 0 15px 0; font-size: 24px;">Reservation Cancelled</h2>
            <p style="color: #721c24; margin: 0; font-size: 16px;">Your reservation has been cancelled as requested.</p>
          </div>
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #495057; margin: 0 0 20px 0; text-align: center;">📋 Cancelled Reservation Details</h3>
            <p><strong>👤 Guest Name:</strong> ${escapeHtml(reservation.customer_name)}</p>
            <p><strong>👥 Guests:</strong> ${reservation.guests} people</p>
            <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Time:</strong> ${formatRestaurantTime(reservation.time)}</p>
          </div>
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d;">We hope to see you soon!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #6c757d; font-size: 13px;">📍 Wanchai, Hong Kong | 📞 +852 2345 6789 | 📧 info@sangeet.hk</p>
            </div>
          </div>
        </div>
      </div>
    `
  }),

  adminReservationNotice: (reservation) => ({
    subject: `🔔 NEW RESERVATION ALERT: ${reservation.customer_name} (${reservation.guests} Guests)`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 100%; width: 100%; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%);">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border: 1px solid #d4af37; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🔔 ADMIN ALERT: New Booking Request</h1>
            </div>
            <p style="color: #4b5563; margin: 5px 0 0 0; font-size: 15px;">Sangeet Restaurant Reservation System</p>
          </div>
          <div style="background: #fffbeb; padding: 25px; border-radius: 15px; margin-bottom: 25px; border: 1px solid #fef3c7;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; text-align: center;">📋 Booking Details</h3>
            <p><strong>👤 Guest Name:</strong> ${escapeHtml(reservation.customer_name)}</p>
            <p><strong>👥 Party Size:</strong> ${reservation.guests} guests</p>
            <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Time:</strong> ${formatRestaurantTime(reservation.time)}</p>
            <p><strong>📧 Guest Email:</strong> <a href="mailto:${escapeHtml(reservation.email)}">${escapeHtml(reservation.email)}</a></p>
          </div>
          ${reservation.special_requests ? `
          <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">💬 Special Requests / Notes</h4>
            <p style="color: #1e3a8a; font-style: italic; margin: 0;">"${escapeHtml(reservation.special_requests)}"</p>
          </div>
          ` : ''}
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid #f3f4f6;">
            <a href="https://sangeet.hk/admin" style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Open Admin Dashboard & Confirm
            </a>
          </div>
        </div>
      </div>
    `
  }),

  contactEnquiry: (data) => ({
    subject: `📬 New Contact Enquiry: ${(data as any).subject} — from ${data.customer_name}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 100%; width: 100%; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%);">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border: 1px solid #d4af37; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">📬 New Contact Enquiry</h1>
            </div>
            <p style="color: #4b5563; margin: 5px 0 0 0; font-size: 15px;">Submitted via sangeet.hk/contact</p>
          </div>
          <div style="background: #fffbeb; padding: 25px; border-radius: 15px; margin-bottom: 25px; border: 1px solid #fef3c7;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; text-align: center;">👤 Contact Details</h3>
            <p><strong>Name:</strong> ${escapeHtml(data.customer_name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
            <p><strong>Phone:</strong> ${escapeHtml((data as any).phone) || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${escapeHtml((data as any).subject)}</p>
          </div>
          <div style="background: #f0fdf4; padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
            <h3 style="color: #166534; margin: 0 0 15px 0;">💬 Message</h3>
            <p style="color: #15803d; line-height: 1.8; white-space: pre-wrap;">${escapeHtml((data as any).message)}</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid #f3f4f6;">
            <a href="mailto:${escapeHtml(data.email)}" style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
              Reply to ${escapeHtml(data.customer_name)}
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Test email function (logs instead of sending)
export const sendTestEmail = async (to: string, template: EmailTemplate, data: ReservationEmailData): Promise<EmailResult> => {
  try {
    const emailContent = emailTemplates[template](data);
    
    logger.info('📧 TEST EMAIL (not actually sent):');
    logger.info('📧 To:', to);
    logger.info('📧 Subject:', emailContent.subject);
    logger.info('📧 Content length:', emailContent.html.length, 'characters');
    logger.info('📧 Email would be sent successfully!');
    
    return { success: true, messageId: 'test-' + Date.now() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('❌ Test email error:', message);
    return { success: false, error: message };
  }
};

// Send email function using Resend SDK
export const sendEmail = async (to: string, template: EmailTemplate, data: ReservationEmailData, customReplyTo?: string): Promise<EmailResult> => {
  const emailContent = emailTemplates[template](data);
  const senderEmail = getSenderEmail();
  const replyToEmail = customReplyTo || getReplyToEmail();
  
  // Check if we have proper API credentials
  if (!resend) {
    logger.info('📧 EMAIL LOGGED (not sent - missing RESEND_API_KEY):');
    logger.info('📧 To:', to);
    logger.info('📧 Subject:', emailContent.subject);
    return { success: true, messageId: 'logged-' + Date.now() };
  }
  
  try {
    const { data: responseData, error } = await resend.emails.send({
      from: `Sangeet Restaurant <${senderEmail}>`,
      to: [to],
      replyTo: replyToEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      logger.error('❌ Resend API Error:', error.message);
      return { success: false, error: error.message };
    }

    logger.info(`📧 Email sent successfully via Resend:`, responseData?.id);
    return { success: true, messageId: responseData?.id || 'unknown' };
  } catch (error) {
    const lastError = error instanceof Error ? error : new Error(String(error));
    logger.error('❌ CRITICAL: Email sending failed:', lastError.message);
    return { success: false, error: lastError.message };
  }
};

// Email notification functions
export const sendReservationCreatedEmail = async (reservation: ReservationEmailData): Promise<EmailResult> => {
  return await sendEmail(reservation.email, 'reservationCreated', reservation);
};

export const sendReservationConfirmedEmail = async (reservation: ReservationEmailData): Promise<EmailResult> => {
  return await sendEmail(reservation.email, 'reservationConfirmed', reservation);
};

export const sendReservationCancelledEmail = async (reservation: ReservationEmailData): Promise<EmailResult> => {
  return await sendEmail(reservation.email, 'reservationCancelled', reservation);
};

export const sendAdminReservationNoticeEmail = async (reservation: ReservationEmailData): Promise<EmailResult> => {
  const rawEnvEmail = config.ADMIN_NOTIFY_EMAIL;
  const adminNotifyEmail = (rawEnvEmail && rawEnvEmail.trim() !== '' && !rawEnvEmail.includes('prithvi')) ? rawEnvEmail.trim() : 'ranaji13@sangeet.hk';
  const customerReplyTo = (reservation.email && reservation.email.includes('@')) ? reservation.email : undefined;
  return await sendEmail(adminNotifyEmail, 'adminReservationNotice', reservation, customerReplyTo);
};

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    const apiKey = getApiKey();
    logger.info('📧 Testing Resend API configuration...');
    logger.info('📧 API Key:', apiKey ? '***SET***' : '***NOT SET***');
    
    if (apiKey && resend) {
      logger.info('✅ Resend configuration looks good');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('❌ Email configuration error:', message);
    return false;
  }
};
