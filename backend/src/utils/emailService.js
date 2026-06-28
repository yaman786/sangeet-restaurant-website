// Brevo Email Configuration
const getSenderEmail = () => process.env.EMAIL_USER || 'ranayaman66@gmail.com';
const getApiKey = () => process.env.BREVO_API_KEY || '';

// HTML Escaping Utility for XSS Prevention
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Test email function (logs instead of sending)
const sendTestEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    
    console.log('📧 TEST EMAIL (not actually sent):');
    console.log('📧 To:', to);
    console.log('📧 Subject:', emailContent.subject);
    console.log('📧 Content length:', emailContent.html.length, 'characters');
    console.log('📧 Email would be sent successfully!');
    
    return { success: true, messageId: 'test-' + Date.now() };
  } catch (error) {
    console.error('❌ Test email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  reservationCreated: (reservation) => ({
    subject: `Thank You for Your Reservation Request - Sangeet Restaurant`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 100%; width: 100%; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e9ecef; max-width: 100%;">
          
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f8f9fa;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍽️ Sangeet Restaurant</h1>
            </div>
            <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Hong Kong's Premier Dining Destination</p>
          </div>
          
          <!-- Thank You Message -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #28a745;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🙏</div>
              <h2 style="color: #155724; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">Thank You for Choosing Sangeet!</h2>
              <p style="color: #155724; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                We're delighted to receive your reservation request! Our team is carefully reviewing your booking and will send you a confirmation email shortly.
              </p>
            </div>
          </div>
          
          <!-- Reservation Summary -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #495057; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">📋 Your Reservation Request</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #d4af37;">
                <strong style="color: #495057; font-size: 14px;">👤 Guest Name</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${reservation.customer_name}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #d4af37;">
                <strong style="color: #495057; font-size: 14px;">👥 Number of Guests</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${reservation.guests} people</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #d4af37;">
                <strong style="color: #495057; font-size: 14px;">📅 Date</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #d4af37;">
                <strong style="color: #495057; font-size: 14px;">🕐 Time</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${reservation.time}</p>
              </div>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center; border: 1px solid #ffeaa7;">
              <strong style="color: #856404; font-size: 14px;">⏳ Status: Awaiting Confirmation</strong>
            </div>
          </div>
          
          ${reservation.special_requests ? `
          <!-- Special Requests -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💬 Special Requests</h3>
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e3f2fd;">
              <p style="color: #1565c0; margin: 0; font-style: italic; font-size: 16px; line-height: 1.5;">"${escapeHtml(reservation.special_requests)}"</p>
            </div>
          </div>
          ` : ''}
          
          <!-- Next Steps -->
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📧 What Happens Next?</h3>
            <div style="color: #856404; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">✅ <strong>Within 2 hours:</strong> You'll receive a confirmation email with your table details</p>
              <p style="margin: 0 0 10px 0;">✅ <strong>Confirmation includes:</strong> Table number, arrival instructions, and restaurant policies</p>
              <p style="margin: 0 0 10px 0;">✅ <strong>Need changes?</strong> Reply to this email or call us at +852 1234 5678</p>
              <p style="margin: 0;">✅ <strong>Special requests:</strong> We'll accommodate your preferences to ensure a perfect dining experience</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 16px; font-weight: 500;">
              We look forward to creating an unforgettable dining experience for you!
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Contact Information</p>
              <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 13px;">📧 Email: info@sangeet-restaurant.com</p>
              <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 13px;">📞 Phone: +852 1234 5678</p>
              <p style="color: #6c757d; margin: 0; font-size: 13px;">📍 Address: 123 Restaurant Street, Hong Kong</p>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); border-radius: 10px;">
              <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 600;">🍽️ Experience the finest Indian cuisine in Hong Kong</p>
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
          
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f8f9fa;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍽️ Sangeet Restaurant</h1>
            </div>
            <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Hong Kong's Premier Dining Destination</p>
          </div>
          
          <!-- Confirmation Celebration -->
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 40px; border-radius: 20px; margin-bottom: 30px; text-align: center; border: 2px solid #28a745;">
            <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #155724; margin: 0 0 15px 0; font-size: 28px; font-weight: 700;">Your Reservation is Confirmed!</h2>
            <p style="color: #155724; margin: 0; font-size: 18px; line-height: 1.6; font-weight: 500;">
              Great news! Your table is reserved and our team is excited to welcome you to Sangeet Restaurant.
            </p>
          </div>
          
          <!-- Confirmed Details -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 30px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #155724; margin: 0 0 25px 0; font-size: 22px; font-weight: 600; text-align: center;">✅ Confirmed Reservation Details</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #28a745; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <strong style="color: #155724; font-size: 14px;">👤 Guest Name</strong>
                <p style="color: #212529; margin: 8px 0 0 0; font-weight: 600; font-size: 16px;">${reservation.customer_name}</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #28a745; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <strong style="color: #155724; font-size: 14px;">👥 Number of Guests</strong>
                <p style="color: #212529; margin: 8px 0 0 0; font-weight: 600; font-size: 16px;">${reservation.guests} people</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #28a745; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <strong style="color: #155724; font-size: 14px;">📅 Date</strong>
                <p style="color: #212529; margin: 8px 0 0 0; font-weight: 600; font-size: 16px;">${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #28a745; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <strong style="color: #155724; font-size: 14px;">🕐 Time</strong>
                <p style="color: #212529; margin: 8px 0 0 0; font-weight: 600; font-size: 16px;">${reservation.time}</p>
              </div>
            </div>
            ${reservation.table_id ? `
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
              <strong style="color: #ffffff; font-size: 16px;">🪑 Your Table: Table ${reservation.table_id}</strong>
              <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Perfectly reserved for your party</p>
            </div>
            ` : ''}
          </div>
          
          ${reservation.special_requests ? `
          <!-- Special Requests -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💬 Special Requests</h3>
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e3f2fd;">
              <p style="color: #1565c0; margin: 0; font-style: italic; font-size: 16px; line-height: 1.5;">"${escapeHtml(reservation.special_requests)}"</p>
            </div>
          </div>
          ` : ''}
          
          <!-- Important Information -->
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 30px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Important Information</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #ffc107;">
                <strong style="color: #856404; font-size: 14px;">⏰ Arrival Time</strong>
                <p style="color: #495057; margin: 5px 0 0 0; font-size: 14px;">Please arrive 5-10 minutes before your reservation time</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #ffc107;">
                <strong style="color: #856404; font-size: 14px;">👔 Dress Code</strong>
                <p style="color: #495057; margin: 5px 0 0 0; font-size: 14px;">Smart casual attire is recommended</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #ffc107;">
                <strong style="color: #856404; font-size: 14px;">🚫 Cancellation Policy</strong>
                <p style="color: #495057; margin: 5px 0 0 0; font-size: 14px;">Free cancellation up to 2 hours before your reservation</p>
              </div>
            </div>
          </div>
          
          <!-- What to Expect -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🌟 What to Expect</h3>
            <div style="color: #495057; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">🍽️ <strong>Exquisite Cuisine:</strong> Authentic Indian flavors with modern twists</p>
              <p style="margin: 0 0 10px 0;">🎵 <strong>Ambiance:</strong> Elegant atmosphere with traditional music</p>
              <p style="margin: 0 0 10px 0;">👨‍🍳 <strong>Service:</strong> Attentive staff dedicated to your comfort</p>
              <p style="margin: 0 0 10px 0;">🍷 <strong>Beverages:</strong> Fine selection of wines and signature cocktails</p>
              <p style="margin: 0 0 10px 0;">✨ <strong>Experience:</strong> Memorable dining moments with family and friends</p>
            </div>
          </div>
          
          <!-- Special Message -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #28a745;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💝 Special Message from Our Team</h3>
            <div style="color: #155724; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">Dear ${reservation.customer_name},</p>
              <p style="margin: 0 0 10px 0;">We're thrilled to confirm your reservation and can't wait to welcome you to Sangeet Restaurant. Our team has prepared everything to ensure your dining experience is nothing short of extraordinary.</p>
              <p style="margin: 0;">From our signature dishes to our warm hospitality, we promise to make your visit memorable. See you soon!</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 18px; font-weight: 500;">
              We can't wait to create an unforgettable dining experience for you!
            </p>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-top: 20px;">
              <p style="color: #495057; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Need to Make Changes?</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6;">
                  <p style="color: #495057; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">📧 Email</p>
                  <p style="color: #6c757d; margin: 0; font-size: 13px;">info@sangeet-restaurant.com</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #dee2e6;">
                  <p style="color: #495057; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">📞 Phone</p>
                  <p style="color: #6c757d; margin: 0; font-size: 13px;">+852 1234 5678</p>
                </div>
              </div>
              <p style="color: #6c757d; margin: 0; font-size: 13px;">📍 123 Restaurant Street, Hong Kong</p>
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
          
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f8f9fa;">
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍽️ Sangeet Restaurant</h1>
            </div>
            <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Hong Kong's Premier Dining Destination</p>
          </div>
          
          <!-- Cancellation Notice -->
          <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center; border: 2px solid #dc3545;">
            <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
            <h2 style="color: #721c24; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">Reservation Cancelled</h2>
            <p style="color: #721c24; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
              Your reservation has been cancelled as requested. We understand that plans can change.
            </p>
          </div>
          
          <!-- Cancelled Details -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #495057; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">📋 Cancelled Reservation Details</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #6c757d;">
                <strong style="color: #495057; font-size: 14px;">👤 Guest Name</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${reservation.customer_name}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #6c757d;">
                <strong style="color: #495057; font-size: 14px;">👥 Number of Guests</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${reservation.guests} people</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #6c757d;">
                <strong style="color: #495057; font-size: 14px;">📅 Date</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 10px; border-left: 4px solid #6c757d;">
                <strong style="color: #495057; font-size: 14px;">🕐 Time</strong>
                <p style="color: #212529; margin: 5px 0 0 0; font-weight: 600;">${reservation.time}</p>
              </div>
            </div>
            <div style="background: #f8d7da; padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center; border: 1px solid #f5c6cb;">
              <strong style="color: #721c24; font-size: 14px;">❌ Status: Cancelled</strong>
            </div>
          </div>
          
          <!-- Future Booking Encouragement -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #28a745;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🌟 We Hope to See You Soon!</h3>
            <div style="color: #155724; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">We understand that plans can change, and we're here whenever you're ready to dine with us again.</p>
              <p style="margin: 0 0 15px 0;">Our team is always ready to create another memorable dining experience for you.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #f8f9fa;">
            <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
              Thank you for considering Sangeet Restaurant. We look forward to welcoming you back!
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p style="color: #495057; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Ready to Book Again?</p>
              <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 13px;">📧 Email: info@sangeet-restaurant.com</p>
              <p style="color: #6c757d; margin: 0 0 5px 0; font-size: 13px;">📞 Phone: +852 1234 5678</p>
              <p style="color: #6c757d; margin: 0; font-size: 13px;">📍 Address: 123 Restaurant Street, Hong Kong</p>
            </div>
          </div>
          
        </div>
      </div>
    `
  })
};

// Send email function using Brevo REST API
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    const apiKey = getApiKey();
    
    // Check if we have proper API credentials
    if (!apiKey) {
      console.log('📧 EMAIL LOGGED (not sent - missing BREVO_API_KEY):');
      console.log('📧 To:', to);
      console.log('📧 Subject:', emailContent.subject);
      return { success: true, messageId: 'logged-' + Date.now() };
    }
    
    const payload = {
      sender: {
        name: 'Sangeet Restaurant',
        email: getSenderEmail()
      },
      to: [
        { email: to }
      ],
      subject: emailContent.subject,
      htmlContent: emailContent.html
    };

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

    const result = await response.json();
    console.log('📧 Email sent successfully via Brevo:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email via Brevo:', error);
    return { success: false, error: error.message };
  }
};

// Email notification functions
const sendReservationCreatedEmail = async (reservation) => {
  return await sendEmail(reservation.email, 'reservationCreated', reservation);
};

const sendReservationConfirmedEmail = async (reservation) => {
  return await sendEmail(reservation.email, 'reservationConfirmed', reservation);
};

const sendReservationCancelledEmail = async (reservation) => {
  return await sendEmail(reservation.email, 'reservationCancelled', reservation);
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const apiKey = getApiKey();
    console.log('📧 Testing Brevo API configuration...');
    console.log('📧 API Key:', apiKey ? '***SET***' : '***NOT SET***');
    
    if (apiKey) {
      console.log('✅ Brevo configuration looks good');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendReservationCreatedEmail,
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail,
  testEmailConfig,
  sendTestEmail
};
