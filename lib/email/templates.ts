
export interface EmailTemplateOptions {
  title: string;
  greeting: string;
  message: string;
  otp?: string;
  actionLink?: string;
  actionText?: string;
  expiryText?: string;
  warningText?: string;
}

export function getCommonEmailTemplate(options: EmailTemplateOptions): string {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "https://firgomart.com/logo/firgomart.png";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://firgomart.com").replace(/\/+$/, "");
  const currentYear = new Date().getFullYear();

  const {
    title,
    greeting,
    message,
    otp,
    actionLink,
    actionText,
    expiryText = "This code is valid for 10 minutes.",
    warningText = "If you did not request this, please contact support immediately or ignore this email."
  } = options;

  let actionContent = "";
  
  if (otp) {
    actionContent = `<div class="otp-box">${otp}</div>`;
  } else if (actionLink && actionText) {
    actionContent = `<a href="${actionLink}" class="btn">${actionText}</a>
    <p style="font-size: 12px; color: #888; margin-top: 10px; word-break: break-all;">
      Or copy this link: ${actionLink}
    </p>`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px; }
        .logo { max-width: 150px; height: auto; }
        .content { text-align: center; padding: 0 20px; }
        .otp-box { background-color: #f8f9fa; border: 1px dashed #ced4da; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; display: inline-block; margin: 20px 0; border-radius: 6px; }
        .btn { display: inline-block; background-color: #7800C8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px; }
        .warning { font-size: 13px; color: #666666; margin-top: 20px; font-style: italic; }
        p { font-size: 16px; line-height: 1.5; color: #555555; }
        h2 { color: #0f172a; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUrl}" alt="FirgoMart" class="logo">
        </div>
        <div class="content">
            <h2>${title}</h2>
            <p>
                ${greeting},<br>
                ${message}
            </p>
            
            ${actionContent}
            
            <p style="font-size: 14px; color: #666666;">
                ${expiryText}<br>
                Please do not share this with anyone.
            </p>

            <div class="warning">
                ${warningText}
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${currentYear} FirgoMart. All rights reserved.</p>
            <p>
                <a href="${appUrl}" style="color: #0f172a; text-decoration: none;">Visit Website</a> | 
                <a href="${appUrl}/privacy-policy" style="color: #0f172a; text-decoration: none;">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
