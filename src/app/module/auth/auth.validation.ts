import { z } from "zod";

const registerStudentSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email format"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		studentId: z.string().optional(),
		contactNumber: z.string().optional(),
		address: z.string().optional(),
		gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
		accessScope: z
			.enum(["ACADEMIC_ONLY", "HIGHER_STUDY_ONLY", "BOTH"])
			.optional(),
	}),
});

const verifyEmailSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email format"),
		otpCode: z.string().length(6, "OTP code must be exactly 6 digits"),
	}),
});

const resendOtpSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email format"),
	}),
});

const loginSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email format"),
		password: z.string().min(1, "Password is required"),
	}),
});

const googleLoginSchema = z.object({
	body: z.object({
		idToken: z.string().min(1, "Google idToken is required"),
	}),
});

const forgotPasswordSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email format"),
	}),
});

const resetPasswordSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email format"),
		otpCode: z.string().length(6, "OTP must be exactly 6 digits"),
		newPassword: z.string().min(6, "Password must be at least 6 characters"),
	}),
});

const changePasswordSchema = z.object({
	body: z.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(6, "New password must be at least 6 characters"),
	}),
});

export const AuthValidation = {
	registerStudentSchema,
	verifyEmailSchema,
	resendOtpSchema,
	loginSchema,
	googleLoginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	changePasswordSchema,
};
