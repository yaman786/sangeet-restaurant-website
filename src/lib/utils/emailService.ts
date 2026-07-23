import config from '@/lib/utils/env';
import logger from './logger';
import type { EmailContent, EmailTemplate, EmailResult, ReservationRow } from '../types';

// Brevo Email Configuration
const getSenderEmail = (): string | undefined => config.EMAIL_USER;
const getApiKey = (): string => config.BREVO_API_KEY as string;

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

type ReservationEmailData = Pick<ReservationRow, 'customer_name' | 'email' | 'date' | 'time' | 'guests' | 'special_requests' | 'table_id'>;

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
              <p><strong>👤 Guest Name:</strong> ${reservation.customer_name}</p>
              <p><strong>👥 Number of Guests:</strong> ${reservation.guests} people</p>
              <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>🕐 Time:</strong> ${reservation.time}</p>
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
              <p style="color: #6c757d; font-size: 13px;">📧 info@sangeet-restaurant.com | 📞 +852 1234 5678</p>
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
            <p><strong>👤 Guest Name:</strong> ${reservation.customer_name}</p>
            <p><strong>👥 Guests:</strong> ${reservation.guests} people</p>
            <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Time:</strong> ${reservation.time}</p>
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
              <p style="color: #6c757d; font-size: 13px;">📧 info@sangeet-restaurant.com | 📞 +852 1234 5678</p>
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
            <p><strong>👤 Guest Name:</strong> ${reservation.customer_name}</p>
            <p><strong>👥 Guests:</strong> ${reservation.guests} people</p>
            <p><strong>📅 Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Time:</strong> ${reservation.time}</p>
          </div>
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d;">We hope to see you soon!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #6c757d; font-size: 13px;">📧 info@sangeet-restaurant.com | 📞 +852 1234 5678</p>
            </div>
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

// Send email function using Brevo REST API with Exponential Backoff
export const sendEmail = async (to: string, template: EmailTemplate, data: ReservationEmailData): Promise<EmailResult> => {
  const emailContent = emailTemplates[template](data);
  const apiKey = getApiKey();
  const senderEmail = getSenderEmail();
  
  // Check if we have proper API credentials
  if (!apiKey) {
    logger.info('📧 EMAIL LOGGED (not sent - missing BREVO_API_KEY):');
    logger.info('📧 To:', to);
    logger.info('📧 Subject:', emailContent.subject);
    return { success: true, messageId: 'logged-' + Date.now() };
  }
  
  const payload = {
    sender: {
      name: 'Sangeet Restaurant',
      email: senderEmail
    },
    to: [
      { email: to }
    ],
    replyTo: {
      email: senderEmail,
      name: 'Sangeet Restaurant'
    },
    subject: emailContent.subject,
    htmlContent: emailContent.html
  };

  let lastError: Error | null = null;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json() as { messageId: string };
      logger.info(`📧 Email sent successfully via Brevo (Attempt ${attempt}):`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`⚠️ Email attempt ${attempt} failed: ${lastError.message}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s
        const backoffMs = attempt * 2000;
        logger.info(`⏳ Waiting ${backoffMs}ms before retrying...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  // If we reach here, all retries exhausted
  logger.error('❌ CRITICAL: All email sending attempts failed:', lastError?.message);
  return { success: false, error: lastError?.message || 'Unknown error occurred after retries' };
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

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    const apiKey = getApiKey();
    logger.info('📧 Testing Brevo API configuration...');
    logger.info('📧 API Key:', apiKey ? '***SET***' : '***NOT SET***');
    
    if (apiKey) {
      logger.info('✅ Brevo configuration looks good');
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
