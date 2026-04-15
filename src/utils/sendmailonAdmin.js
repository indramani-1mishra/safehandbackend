const nodemailer = require("nodemailer");
const { EMAIL_USER_ID, EMAIL_PASSWORD_ID, DEFAULT_ADMIN_EMAIL } = require("../config/serverConfig");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER_ID,
    pass: EMAIL_PASSWORD_ID
  }
});

const sendMailOnAdmin = async (enqueryData, to = EMAIL_USER_ID, subject = "New Enquiry Received") => {
  if (!enqueryData) {
    console.error("sendMailOnAdmin: enqueryData is undefined");
    return;
  }
  try {
    await transporter.sendMail({
      from: EMAIL_USER_ID,
      to,
      subject,
      html: ` 
            <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Enquiry - SafeHand Lifecare</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb;">
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
          
          <!-- Header with Logo/Brand -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <span style="font-size: 30px;">🏥</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                SafeHand Lifecare Pvt Ltd
              </h1>
              <p style="margin: 8px 0 0; color: #d1fae5; font-size: 14px; font-weight: 500;">
                Professional Home Healthcare Services
              </p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 30px 30px 0;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 10px; margin-bottom: 25px;">
                <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">⚡</span>
                  <strong>New Enquiry Received!</strong> Please review and respond at your earliest convenience.
                </p>
              </div>
            </td>
          </tr>

          <!-- Basic Information Card -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background: linear-gradient(to right, #eff6ff, #dbeafe); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <span>📋</span> Basic Information
                </h2>
                
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${enqueryData.email}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">${enqueryData.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0;">
                      <a href="tel:${enqueryData.phone}" style="color: #10b981; text-decoration: none; font-weight: 600;">${enqueryData.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">City:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.city}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Message:</td>
                    <td style="padding: 8px 0; color: #1e293b; line-height: 1.6;">${enqueryData.message}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Enquiry Type:</td>
                    <td style="padding: 8px 0;">
                      <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">
                        ${enqueryData.enquiryType === 'urgentEnquery' ? '🚨 Urgent Enquiry' : '📞 Service Enquiry'}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Urgent Enquiry Details (Conditional) -->
          ${enqueryData.enquiryType === "urgentEnquery" ? `
          <tr>
            <td style="padding: 0 30px 20px;">
              
              <!-- Patient Information -->
              <div style="background: linear-gradient(to right, #fef2f2, #fee2e2); border-left: 4px solid #ef4444; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; color: #991b1b; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <span>👤</span> Patient Details
                </h2>
                
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Patient Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.patientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Age:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.age} years</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Gender:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.gender}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Patient Condition:</td>
                    <td style="padding: 8px 0; color: #dc2626; font-weight: 700; line-height: 1.6;">${enqueryData.patientCondition}</td>
                  </tr>
                </table>
              </div>

              <!-- Location & Contact -->
              <div style="background: linear-gradient(to right, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <span>📍</span> Location & Additional Contact
                </h2>
                
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Address:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; line-height: 1.6;">${enqueryData.address}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Pincode:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.pincode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Contact Person:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.contactPersonName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Alternate Number:</td>
                    <td style="padding: 8px 0;">
                      <a href="tel:${enqueryData.alternateNumber}" style="color: #10b981; text-decoration: none; font-weight: 600;">${enqueryData.alternateNumber}</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Service Details -->
              <div style="background: linear-gradient(to right, #f0fdf4, #dcfce7); border-left: 4px solid #10b981; padding: 20px; border-radius: 10px;">
                <h2 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <span>⚙️</span> Service Requirements
                </h2>
                
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Start Date:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.startDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Preferred Staff:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.preferredStaff}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment Mode:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.paymentMode}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- Service Enquiry Details (Conditional) -->
          ${enqueryData.enquiryType === "serviceEnquery" ? `
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background: linear-gradient(to right, #f0fdf4, #dcfce7); border-left: 4px solid #10b981; padding: 20px; border-radius: 10px;">
                <h2 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <span>💼</span> Service Details
                </h2>
                
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Service:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.service}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Service Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Enquiry For:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.enquiryFor}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Service Duration:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${enqueryData.serviceDuration}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- Call-to-Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="tel:${enqueryData.phone}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                      📞 Call ${enqueryData.name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; line-height: 1.6;">
                <strong style="color: #1e293b;">SafeHand Lifecare Pvt Ltd</strong><br>
                Professional Home Healthcare Services<br>
                🔒 This is an automated notification. Please respond within 24 hours.
              </p>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} SafeHand Lifecare. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
            `
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendMailOnAdmin
};