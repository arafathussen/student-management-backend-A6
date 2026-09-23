import config from "../config";
import { transporter } from "../lib/nodemailer";

export const sendVerificationOtpEmail = async (
	to: string,
	name: string,
	otp: string,
) => {
	const subject = "Verification Code for Your University Portal Account";
	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to Study Abroad Portal</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering. Please use the following 6-digit verification code to activate your account:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; border-radius: 6px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 13px;">This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
  `;

	try {
		if (
			config.smtp_user &&
			config.smtp_password &&
			!config.smtp_user.includes("demo")
		) {
			await transporter.sendMail({
				from: config.email_sender || config.smtp_user,
				to,
				subject,
				html,
			});
		} else {
			console.log(
				`\n[Email Simulation] To: ${to} | Verification OTP: ${otp}\n`,
			);
		}
	} catch (error: any) {
		console.log(
			`\n[Email Delivery Notice] Failed to send email to ${to}:`,
			error.message,
		);
		console.log(`[OTP] Verification code fallback: ${otp}\n`);
	}
};

export const sendPasswordResetOtpEmail = async (
	to: string,
	name: string,
	otp: string,
) => {
	const subject = "Password Reset OTP - University Portal";
	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #dc2626; text-align: center;">Password Reset Request</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Use the following code to proceed:</p>
      <div style="background-color: #fef2f2; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #991b1b; border-radius: 6px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 13px;">This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
    </div>
  `;

	try {
		if (
			config.smtp_user &&
			config.smtp_password &&
			!config.smtp_user.includes("demo")
		) {
			await transporter.sendMail({
				from: config.email_sender || config.smtp_user,
				to,
				subject,
				html,
			});
		} else {
			console.log(
				`\n[Email Simulation] To: ${to} | Password Reset OTP: ${otp}\n`,
			);
		}
	} catch (error: any) {
		console.log(
			`\n[Email Delivery Notice] Failed to send email to ${to}:`,
			error.message,
		);
		console.log(`[OTP] Password reset fallback: ${otp}\n`);
	}
};
