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
    const isUrgent = enqueryData.enquiryType === "urgentEnquery";
    const enquiryLabel = enqueryData.enquiryType === 'quickEnquery' ? '🚨 quickEnquery' : isUrgent ? "urgent Enquiry" : "serviceEnquery";

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
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${isUrgent ? '#ef4444' : '#10b981'} 0%, ${isUrgent ? '#b91c1c' : '#059669'} 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">SafeHand Lifecare Pvt Ltd</h1>
              <p style="margin: 8px 0 0; color: #ffffff; opacity: 0.9; font-size: 14px;">${enquiryLabel.toUpperCase()}</p>
            </td>
          </tr>

          <!-- Basic Info -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 18px;">📋 Basic Contact Information</h2>
                <table width="100%" style="font-size: 14px;">
                  <tr><td style="color: #64748b; font-weight: 600; width: 35%;">Name:</td><td style="font-weight: 700;">${enqueryData.name}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">Phone:</td><td style="color: #10b981; font-weight: 700;">${enqueryData.phone}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">Email:</td><td>${enqueryData.email || 'N/A'}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">City:</td><td style="font-weight: 700;">${enqueryData.city || 'N/A'}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600; vertical-align: top;">Message:</td><td>${enqueryData.message || 'No specific message'}</td></tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Location & Logistics -->
          ${(enqueryData.address || enqueryData.pincode || enqueryData.landmark) ? `
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: #fffaf0; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">📍 Location & Logistics</h2>
                <table width="100%" style="font-size: 14px;">
                  <tr><td style="color: #64748b; font-weight: 600; width: 35%;">Address:</td><td style="font-weight: 700;">${enqueryData.address || 'N/A'}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">Pincode:</td><td style="font-weight: 700;">${enqueryData.pincode || 'N/A'}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">Landmark:</td><td>${enqueryData.landmark || 'N/A'}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">Contact Person:</td><td>${enqueryData.contactPersonName || 'N/A'}</td></tr>
                  <tr><td style="color: #64748b; font-weight: 600;">Alternate No:</td><td>${enqueryData.alternateNumber || 'N/A'}</td></tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- Specialized Details -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: ${isUrgent ? '#fff5f5' : '#f0fdf4'}; border-left: 4px solid ${isUrgent ? '#ef4444' : '#10b981'}; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0 0 15px 0; color: ${isUrgent ? '#991b1b' : '#065f46'}; font-size: 18px;">💡 Service & Patient Details</h2>
                <table width="100%" style="font-size: 14px;">
                  ${enqueryData.serviceName ? `<tr><td style="color: #64748b; font-weight: 600; width: 35%;">Service:</td><td style="font-weight: 700;">${enqueryData.serviceName}</td></tr>` : ""}
                  ${enqueryData.packageType ? `<tr><td style="color: #64748b; font-weight: 600;">Package:</td><td><strong style="text-transform: uppercase; background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${enqueryData.packageType}</strong></td></tr>` : ""}
                  ${enqueryData.serviceDuration ? `<tr><td style="color: #64748b; font-weight: 600;">Duration:</td><td>${enqueryData.serviceDuration} Hours</td></tr>` : ""}
                  ${enqueryData.patientName ? `<tr><td style="color: #64748b; font-weight: 600;">Patient Name:</td><td style="font-weight: 700;">${enqueryData.patientName}</td></tr>` : ""}
                  ${enqueryData.age ? `<tr><td style="color: #64748b; font-weight: 600;">Patient Age:</td><td>${enqueryData.age} Years</td></tr>` : ""}
                  ${enqueryData.gender ? `<tr><td style="color: #64748b; font-weight: 600;">Gender:</td><td>${enqueryData.gender}</td></tr>` : ""}
                  ${enqueryData.startDate ? `<tr><td style="color: #64748b; font-weight: 600;">Start Date:</td><td style="color: #ef4444; font-weight: 700;">${enqueryData.startDate}</td></tr>` : ""}
                  ${enqueryData.patientCondition ? `<tr><td style="color: #64748b; font-weight: 600; vertical-align: top;">Condition:</td><td>${enqueryData.patientCondition}</td></tr>` : ""}
                  ${enqueryData.preferredStaff ? `<tr><td style="color: #64748b; font-weight: 600;">Staff Pref:</td><td>${enqueryData.preferredStaff}</td></tr>` : ""}
                  ${enqueryData.paymentMode ? `<tr><td style="color: #64748b; font-weight: 600;">Payment Mode:</td><td>${enqueryData.paymentMode}</td></tr>` : ""}
                </table>
              </div>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="tel:${enqueryData.phone}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">📞 CALL CUSTOMER NOW</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">SafeHand Lifecare Pvt Ltd. © ${new Date().getFullYear()}</p>
              <p style="margin: 5px 0 0; color: #94a3b8; font-size: 11px;">This is an automated system notification.</p>
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