import path from "path";
import fs from "fs";
import config from "../config";
import { transporter } from "../lib/nodemailer";
import { prisma } from "../lib/prisma";

const getBrandAssetsAndHtml = (
	subject: string,
	recipientName: string,
	contentHtml: string,
	settings?: any,
) => {
	const senderName =
		settings?.autoResponderSenderName || "Rise Abroad Admissions Desk";
	const senderEmail =
		settings?.autoResponderSenderEmail || "admissions@riseabroad.com";
	const officeAddress =
		settings?.autoResponderOfficeAddress ||
		"Rise Abroad Education • Level 6, Navana Tower, Gulshan-1, Dhaka";
	const hotline = settings?.autoResponderHotline || "+880 1712-345678";
	const hours =
		settings?.autoResponderHours ||
		"Counseling Desk: Sat – Thu (10AM – 7PM)";

	const possiblePaths = [
		path.join(__dirname, "../assets/logo.png"),
		path.join(__dirname, "../../assets/logo.png"),
		path.join(process.cwd(), "src/assets/logo.png"),
		path.join(process.cwd(), "dist/assets/logo.png"),
		path.join(process.cwd(), "../university-management-frontend/public/logo.png"),
	];
	const logoPath = possiblePaths.find((p) => fs.existsSync(p));

	const isHostedLogo =
		typeof settings?.autoResponderLogoUrl === "string" &&
		settings.autoResponderLogoUrl.trim().startsWith("http");

	const logoSrc = isHostedLogo
		? settings.autoResponderLogoUrl.trim()
		: "cid:brand_logo";

	const attachments: any[] = [];
	if (!isHostedLogo && logoPath) {
		attachments.push({
			filename: "logo.png",
			path: logoPath,
			cid: "brand_logo",
			contentType: "image/png",
			contentDisposition: "inline",
		});
	}

	const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; -webkit-font-smoothing: antialiased;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);">
              
              <!-- Brand Header Bar with Real Website Logo & Compact Gap -->
              <tr>
                <td style="padding: 18px 24px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 3px;">
                        <img src="${logoSrc}" alt="Rise Abroad Education" width="40" height="40" style="display: block; width: 40px; height: 40px; object-fit: contain;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px; line-height: 1.2;">
                          Rise Abroad Education
                        </div>
                        <div style="font-size: 10px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">
                          HIGHER STUDY &amp; ADMISSIONS
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body -->
              <tr>
                <td style="padding: 26px 24px 20px 24px;">
                  <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 14px;">
                    Dear ${recipientName},
                  </div>
                  
                  ${contentHtml}

                  <!-- Minimalist Dark Signature & Footer -->
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    <div style="font-weight: 600; color: #f1f5f9; font-size: 13px; margin-bottom: 3px;">
                      ${senderName}
                    </div>
                    <div>${officeAddress}</div>
                    <div style="margin-top: 3px;">Direct Hotline: <strong style="color: #e2e8f0; font-family: monospace;">${hotline}</strong></div>
                    <div style="margin-top: 2px;">Email: <a href="mailto:${senderEmail}" style="color: #60a5fa; text-decoration: none;">${senderEmail}</a></div>
                    <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${hours}</div>
                  </div>

                  <p style="text-align: center; color: #475569; font-size: 11px; margin: 20px 0 0 0; font-style: italic;">
                    * Note: This is an automated email. Please do not reply directly to this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

	return {
		html,
		attachments,
		senderName,
		senderEmail,
		officeAddress,
		hotline,
	};
};

export const sendVerificationOtpEmail = async (
	to: string,
	name: string,
	otp: string,
) => {
	const settings = await prisma.contactPageSetting.findFirst().catch(() => null);
	const subject =
		settings?.regOtpEmailSubject || "Account Verification Code — Rise Abroad Education";
	const heading = settings?.regOtpEmailHeading || "Verify Your Student Account";
	const bodyMessage =
		settings?.regOtpEmailBodyMessage ||
		"Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:";
	const expiryNote =
		settings?.regOtpEmailExpiryNote ||
		"This code is valid for 10 minutes. For your security, do not share this code with anyone.";

	const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.02em;">${heading}</h2>
      <p style="color: #94a3b8; font-size: 13.5px; line-height: 1.6; margin: 0 auto; max-width: 480px;">
        ${bodyMessage}
      </p>
    </div>
    
    <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 26px 20px; text-align: center; margin: 24px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #64748b; font-weight: 700; margin-bottom: 12px;">Your Account Verification Code</div>
      <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #38bdf8; font-family: 'SF Mono', Consolas, Monaco, monospace; text-shadow: 0 0 25px rgba(56, 189, 248, 0.35);">${otp}</div>
      <div style="display: inline-block; margin-top: 14px; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; padding: 4px 14px; font-size: 11.5px; color: #7dd3fc; font-weight: 600;">
        ⏱ Valid for 10 minutes only
      </div>
    </div>

    <div style="background-color: #0b1329; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12px; line-height: 1.6; color: #94a3b8;">
      <strong style="color: #cbd5e1; display: block; margin-bottom: 2px;">Security Notice:</strong>
      ${expiryNote}
    </div>
  `;

	const { html, attachments, senderName, officeAddress, hotline } = getBrandAssetsAndHtml(
		subject,
		name,
		contentHtml,
		settings,
	);

	const plainText = `Rise Abroad Education — Account Verification Code\n\nDear ${name},\n\nYour 6-digit verification code is: ${otp}\n\n${bodyMessage}\n\nSecurity Notice: ${expiryNote}\n\n---\n${senderName}\n${officeAddress}\nHotline: ${hotline}`;

	try {
		if (
			config.smtp_user &&
			config.smtp_password &&
			!config.smtp_user.includes("demo")
		) {
			await transporter.sendMail({
				from: `"${senderName}" <${config.smtp_user}>`,
				to,
				subject,
				text: plainText,
				html,
				attachments,
				headers: {
					"X-Priority": "1",
					Importance: "high",
				},
			});
		} else {
			console.log(`\n[Email Simulation] To: ${to} | Verification OTP: ${otp}\n`);
		}
	} catch (error: any) {
		console.log(`\n[Email Delivery Notice] Failed to send email to ${to}:`, error.message);
	}
};

export const sendPasswordResetOtpEmail = async (
	to: string,
	name: string,
	otp: string,
) => {
	const settings = await prisma.contactPageSetting.findFirst().catch(() => null);
	const subject =
		settings?.otpEmailSubject || "Your Password Reset Code — Rise Abroad Education";
	const heading =
		settings?.otpEmailHeading || "Password Reset Verification Code";
	const bodyMessage =
		settings?.otpEmailBodyMessage ||
		"We received a request to reset the password for your Rise Abroad Education account. Use the verification code below to proceed with resetting your password:";
	const expiryNote =
		settings?.otpEmailExpiryNote ||
		"This code expires in 10 minutes. For your security, do not share this code with anyone.";

	const contentHtml = `
    <div style="font-size: 14px; font-weight: 600; color: #38bdf8; margin-bottom: 10px;">
      ${heading}
    </div>
    <div style="font-size: 13.5px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px;">
      ${bodyMessage}
    </div>
    <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
      <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace;">${otp}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">${expiryNote}</div>
    </div>
    <p style="font-size: 11.5px; color: #64748b; margin-top: 14px;">If you did not request a password reset, you can safely ignore this email or contact our counseling desk immediately.</p>
  `;

	const { html, attachments, senderName, officeAddress, hotline } = getBrandAssetsAndHtml(
		subject,
		name,
		contentHtml,
		settings,
	);

	const plainText = `Rise Abroad Education — Password Reset Code\n\nDear ${name},\n\nYour 6-digit password reset code is: ${otp}\n\n${bodyMessage}\n\n${expiryNote}\n\n---\n${senderName}\n${officeAddress}\nHotline: ${hotline}`;

	try {
		if (
			config.smtp_user &&
			config.smtp_password &&
			!config.smtp_user.includes("demo")
		) {
			await transporter.sendMail({
				from: `"${senderName}" <${config.smtp_user}>`,
				to,
				subject,
				text: plainText,
				html,
				attachments,
				headers: {
					"X-Priority": "1",
					Importance: "high",
				},
			});
		} else {
			console.log(`\n[Email Simulation] To: ${to} | Password Reset OTP: ${otp}\n`);
		}
	} catch (error: any) {
		console.log(`\n[Email Delivery Notice] Failed to send email to ${to}:`, error.message);
	}
};

export const sendWelcomeRegistrationEmail = async (
	to: string,
	name: string,
) => {
	const settings = await prisma.contactPageSetting.findFirst().catch(() => null);
	const subject =
		settings?.welcomeEmailSubject ||
		"Welcome to Rise Abroad Education — Your Journey Begins!";
	const heading =
		settings?.welcomeEmailHeading || "Welcome to Rise Abroad Education";
	const message =
		settings?.welcomeEmailMessage ||
		"Thank you for registering with Rise Abroad Education. Your global higher education journey starts here! Our certified counselors and admissions desk are here to guide you to your dream university.";
	const btnText = settings?.welcomeEmailBtnText || "Access Student Portal";
	const btnUrl = settings?.welcomeEmailBtnUrl || "https://riseabroad.com/dashboard";

	const contentHtml = `
    <div style="font-size: 15px; font-weight: 600; color: #38bdf8; margin-bottom: 10px;">
      ${heading}
    </div>
    <div style="font-size: 13.5px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px;">
      ${message}
    </div>
    <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <div style="font-size: 12.5px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">🌟 What you can do next:</div>
      <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #94a3b8; line-height: 1.7;">
        <li>Explore 500+ world-class partner universities in UK, USA, Canada, Europe</li>
        <li>Apply online with direct guidance from senior admissions counselors</li>
        <li>Track your admission & visa application progress in real-time</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${btnUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 26px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
        ${btnText} &rarr;
      </a>
    </div>
  `;

	const { html, attachments, senderName, officeAddress, hotline } = getBrandAssetsAndHtml(
		subject,
		name,
		contentHtml,
		settings,
	);

	const plainText = `Welcome to Rise Abroad Education — Higher Study & Admissions\n\nDear ${name},\n\n${heading}\n\n${message}\n\nAccess Your Student Portal: ${btnUrl}\n\n---\n${senderName}\n${officeAddress}\nHotline: ${hotline}`;

	try {
		if (
			config.smtp_user &&
			config.smtp_password &&
			!config.smtp_user.includes("demo")
		) {
			await transporter.sendMail({
				from: `"${senderName}" <${config.smtp_user}>`,
				to,
				subject,
				text: plainText,
				html,
				attachments,
				headers: {
					"X-Priority": "2",
					Importance: "normal",
				},
			});
		} else {
			console.log(`\n[Email Simulation] To: ${to} | Welcome Email dispatched\n`);
		}
	} catch (error: any) {
		console.log(`\n[Email Delivery Notice] Failed to send welcome email to ${to}:`, error.message);
	}
};

export const sendContactAutoResponderEmail = async (
	to: string,
	studentName: string,
	settings?: any,
) => {
	const subject =
		settings?.autoResponderSubject ||
		"We Have Received Your Inquiry — Rise Abroad Education";
	const senderName =
		settings?.autoResponderSenderName || "Rise Abroad Admissions Desk";
	const senderEmail =
		settings?.autoResponderSenderEmail || "admissions@riseabroad.com";
	const whatsappText =
		settings?.autoResponderWhatsAppText ||
		"জরুরি কোনো তথ্যের প্রয়োজন হলে অথবা ২৪ ঘণ্টার মধ্যে যোগাযোগ পেতে বিলম্ব হলে, আপনি সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপে নক দিতে পারেন:";
	const whatsappNumber =
		settings?.autoResponderWhatsAppNumber || "+880 1712-345678";
	const officeAddress =
		settings?.autoResponderOfficeAddress ||
		"Rise Abroad Education • Level 6, Navana Tower, Gulshan-1, Dhaka";
	const hotline = settings?.autoResponderHotline || "+880 1712-345678";
	const hours =
		settings?.autoResponderHours ||
		"Counseling Desk: Sat – Thu (10AM – 7PM)";
	const waDigits = whatsappNumber.replace(/[^0-9]/g, "");

	const possiblePaths = [
		path.join(__dirname, "../assets/logo.png"),
		path.join(__dirname, "../../assets/logo.png"),
		path.join(process.cwd(), "src/assets/logo.png"),
		path.join(process.cwd(), "dist/assets/logo.png"),
		path.join(process.cwd(), "../university-management-frontend/public/logo.png"),
	];
	const logoPath = possiblePaths.find((p) => fs.existsSync(p));

	const isHostedLogo =
		typeof settings?.autoResponderLogoUrl === "string" &&
		settings.autoResponderLogoUrl.trim().startsWith("http");

	const logoSrc = isHostedLogo
		? settings.autoResponderLogoUrl.trim()
		: "cid:brand_logo";

	const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; -webkit-font-smoothing: antialiased;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);">
              
              <!-- Brand Header Bar with Real Website Logo & Compact Gap -->
              <tr>
                <td style="padding: 18px 24px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 3px;">
                        <img src="${logoSrc}" alt="Rise Abroad Education" width="40" height="40" style="display: block; width: 40px; height: 40px; object-fit: contain;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px; line-height: 1.2;">
                          Rise Abroad Education
                        </div>
                        <div style="font-size: 10px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">
                          HIGHER STUDY &amp; ADMISSIONS
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body: Merged Continuous Paragraph -->
              <tr>
                <td style="padding: 26px 24px 20px 24px;">
                  <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 14px;">
                    Dear ${studentName},
                  </div>
                  
                  <!-- Merged, uninterrupted text with no line break -->
                  <div style="font-size: 13.5px; line-height: 1.7; color: #cbd5e1; margin-bottom: 22px;">
                    Thank you for reaching out to <strong style="color: #ffffff;">Rise Abroad Education</strong>. We have successfully received your inquiry. Our admissions counseling desk is currently reviewing your details, and one of our senior counselors will contact you directly via phone, WhatsApp, or email <strong style="color: #ffffff;">within the next 24 hours</strong>.
                  </div>

                  <!-- 24-Hour Urgent / WhatsApp Callout Box -->
                  <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 22px;">
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 12px;">
                      ${whatsappText}
                    </div>
                    <a href="https://wa.me/${waDigits}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 12px; padding: 10px 18px; border-radius: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                      Chat Directly on WhatsApp (${whatsappNumber})
                    </a>
                  </div>

                  <!-- Minimalist Dark Signature & Footer -->
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    <div style="font-weight: 600; color: #f1f5f9; font-size: 13px; margin-bottom: 3px;">
                      ${senderName}
                    </div>
                    <div>${officeAddress}</div>
                    <div style="margin-top: 3px;">Direct Hotline: <strong style="color: #e2e8f0; font-family: monospace;">${hotline}</strong></div>
                    <div style="margin-top: 2px;">Email: <a href="mailto:${senderEmail}" style="color: #60a5fa; text-decoration: none;">${senderEmail}</a></div>
                    <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${hours}</div>
                  </div>

                  <p style="text-align: center; color: #475569; font-size: 11px; margin: 20px 0 0 0; font-style: italic;">
                    * Note: This is an automated confirmation email. Please do not reply directly to this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

	const plainText = `Rise Abroad Education — Inquiry Received\n\nDear ${studentName},\n\nThank you for reaching out to Rise Abroad Education. We have successfully received your inquiry.\nOur admissions counseling desk is reviewing your message and will reach out to you within 24 hours.\n\nWhatsApp: ${whatsappNumber}\n\n---\n${senderName}\n${officeAddress}\nHotline: ${hotline}`;

	const attachments: any[] = [];
	// Only attach file if it is NOT a hosted URL
	if (!isHostedLogo && logoPath) {
		attachments.push({
			filename: "logo.png",
			path: logoPath,
			cid: "brand_logo",
			contentType: "image/png",
			contentDisposition: "inline",
		});
	}

	try {
		if (
			config.smtp_user &&
			config.smtp_password &&
			!config.smtp_user.includes("demo")
		) {
			await transporter.sendMail({
				from: `"${senderName}" <${config.smtp_user}>`,
				to,
				subject,
				text: plainText,
				html,
				attachments,
			});
		} else {
			console.log(
				`\n[Auto-Responder Simulation] Sent confirmation email to ${to} (${studentName}) for inquiry.\n`,
			);
		}
	} catch (error: any) {
		console.log(
			`\n[Auto-Responder Delivery Notice] Failed to send email to ${to}:`,
			error.message,
		);
	}
};


