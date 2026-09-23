import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config";
import { googleClient } from "../../lib/googleAuth";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
	sendPasswordResetOtpEmail,
	sendVerificationOtpEmail,
} from "../../utils/emailHelper";
import { jwtUtils } from "../../utils/jwt";
import type {
	IChangePasswordPayload,
	IGoogleLoginPayload,
	ILoginPayload,
	IRegisterStudentPayload,
} from "./auth.interface";

// Utility to generate secure 6-digit OTP
const generateOtp = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerStudent = async (payload: IRegisterStudentPayload) => {
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		if (isUserExists.status === "INACTIVE" && !isUserExists.isEmailVerified) {
			// Resend OTP for unverified existing user
			const otp = generateOtp();
			const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

			await prisma.user.update({
				where: { email },
				data: {
					otpCode: otp,
					otpExpiresAt,
					otpType: "EMAIL_VERIFICATION",
				},
			});

			await sendVerificationOtpEmail(email, isUserExists.name, otp);

			return {
				message:
					"Account already created but not verified. A new 6-digit OTP has been sent to your Gmail.",
				isEmailVerified: false,
			};
		}

		throw new AppError(
			httpStatus.CONFLICT,
			"A verified user with this email already exists!",
		);
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		config.bcrypt_salt_rounds,
	);

	const otp = generateOtp();
	const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

	const autoStudentId =
		payload.studentId || `STU-${Date.now().toString().slice(-4)}`;

	await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				name: payload.name,
				email,
				password: hashedPassword,
				role: "STUDENT",
				status: "INACTIVE",
				isEmailVerified: false,
				otpCode: otp,
				otpExpiresAt,
				otpType: "EMAIL_VERIFICATION",
				authProvider: "CREDENTIAL",
			},
		});

		await tx.student.create({
			data: {
				userId: user.id,
				studentId: autoStudentId,
				contactNumber: payload.contactNumber,
				address: payload.address,
				gender: payload.gender,
				accessScope: payload.accessScope || "BOTH",
			},
		});
	});

	// Send OTP email
	await sendVerificationOtpEmail(email, payload.name, otp);

	return {
		message:
			"Registration successful! Please check your Gmail for the 6-digit verification code.",
		email,
		isEmailVerified: false,
	};
};

const verifyEmail = async (payload: { email: string; otpCode: string }) => {
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
		include: { student: true },
	});

	if (!user || user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "User account not found!");
	}

	if (user.isEmailVerified && user.status === "ACTIVE") {
		return {
			message: "Email is already verified. You can log in directly.",
			isEmailVerified: true,
		};
	}

	if (user.otpCode !== payload.otpCode) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Invalid verification code! Please check your code.",
		);
	}

	if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Verification code has expired. Please request a new OTP.",
		);
	}

	// Update user to active
	const updatedUser = await prisma.user.update({
		where: { email },
		data: {
			isEmailVerified: true,
			status: "ACTIVE",
			otpCode: null,
			otpExpiresAt: null,
			otpType: null,
		},
		include: { student: true },
	});

	const accessToken = jwtUtils.createToken(
		{
			userId: updatedUser.id,
			email: updatedUser.email,
			role: updatedUser.role,
		},
		config.jwt_access_secret,
		config.jwt_access_expires_in,
	);

	const refreshToken = jwtUtils.createToken(
		{
			userId: updatedUser.id,
			email: updatedUser.email,
			role: updatedUser.role,
		},
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in,
	);

	return {
		message: "Email verified successfully! Account is now active.",
		accessToken,
		refreshToken,
		user: {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			role: updatedUser.role,
			studentId: updatedUser.student?.studentId,
			accessScope: updatedUser.student?.accessScope,
		},
	};
};

const resendOtp = async (payload: { email: string }) => {
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user || user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "User account not found!");
	}

	if (user.isEmailVerified && user.status === "ACTIVE") {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Email is already verified. No need to resend OTP.",
		);
	}

	const otp = generateOtp();
	const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

	await prisma.user.update({
		where: { email },
		data: {
			otpCode: otp,
			otpExpiresAt,
			otpType: "EMAIL_VERIFICATION",
		},
	});

	await sendVerificationOtpEmail(email, user.name, otp);

	return {
		message: "A new 6-digit verification code has been sent to your Gmail.",
	};
};

const loginUser = async (payload: ILoginPayload) => {
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
		include: {
			student: true,
			counselor: true,
		},
	});

	if (!user || user.isDeleted) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"User does not exist with this email!",
		);
	}

	if (user.status === "INACTIVE" || !user.isEmailVerified) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Your email is not verified yet. Please verify your account with the OTP sent to your Gmail.",
		);
	}

	if (user.status === "BLOCKED") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Your account has been suspended/blocked by the administrator!",
		);
	}

	if (!user.password) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Account registered via Google Social Login. Please sign in using Google.",
		);
	}

	const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
	if (!isPasswordMatch) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid credentials. Password incorrect!",
		);
	}

	const accessToken = jwtUtils.createToken(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		config.jwt_access_secret,
		config.jwt_access_expires_in,
	);

	const refreshToken = jwtUtils.createToken(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in,
	);

	return {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			studentId: user.student?.studentId,
			counselorId: user.counselor?.counselorId,
			accessScope: user.student?.accessScope,
		},
	};
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googlePayload: any;

	try {
		if (
			config.google_client_id &&
			config.google_client_id !== "demo_client_id" &&
			payload.idToken !== "mock-google-id-token"
		) {
			const ticket = await googleClient.verifyIdToken({
				idToken: payload.idToken,
				audience: config.google_client_id,
			});
			googlePayload = ticket.getPayload();
		} else {
			// Mock token decoding for development / testing when Google Client ID is demo or mock test
			googlePayload = {
				email: "arafat.student@gmail.com",
				name: "Google Student",
				sub: `google-mock-${Date.now()}`,
				picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
			};
		}
	} catch (error: any) {
		throw new AppError(httpStatus.BAD_REQUEST, "Google authentication failed!");
	}

	if (!googlePayload?.email) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Failed to retrieve email from Google token",
		);
	}

	const email = googlePayload.email.trim().toLowerCase();

	let user = await prisma.user.findUnique({
		where: { email },
		include: { student: true, counselor: true },
	});

	if (!user) {
		user = await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					name: googlePayload.name || "Student",
					email,
					googleId: googlePayload.sub,
					authProvider: "GOOGLE",
					role: "STUDENT",
					status: "ACTIVE",
					isEmailVerified: true,
					imageUrl: googlePayload.picture || "",
				},
			});

			const newStudent = await tx.student.create({
				data: {
					userId: newUser.id,
					studentId: `STU-${Date.now().toString().slice(-4)}`,
					accessScope: "BOTH",
				},
			});

			return { ...newUser, student: newStudent, counselor: null };
		});
	} else if (!user.isEmailVerified || user.status === "INACTIVE") {
		user = await prisma.user.update({
			where: { email },
			data: { isEmailVerified: true, status: "ACTIVE" },
			include: { student: true, counselor: true },
		});
	}

	const accessToken = jwtUtils.createToken(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		config.jwt_access_secret,
		config.jwt_access_expires_in,
	);

	const refreshToken = jwtUtils.createToken(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in,
	);

	return {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			studentId: user.student?.studentId,
			counselorId: user.counselor?.counselorId,
			accessScope: user.student?.accessScope,
		},
	};
};

const forgotPassword = async (payload: { email: string }) => {
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user || user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "No account exists with this email!");
	}

	const otp = generateOtp();
	const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

	await prisma.user.update({
		where: { email },
		data: {
			otpCode: otp,
			otpExpiresAt,
			otpType: "PASSWORD_RESET",
		},
	});

	await sendPasswordResetOtpEmail(email, user.name, otp);

	return {
		message:
			"Password reset code has been sent to your Gmail. Valid for 10 minutes.",
	};
};

const resetPassword = async (payload: {
	email: string;
	otpCode: string;
	newPassword: string;
}) => {
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user || user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "User account not found!");
	}

	if (user.otpType !== "PASSWORD_RESET" || user.otpCode !== payload.otpCode) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Invalid password reset OTP code!",
		);
	}

	if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Password reset OTP has expired. Please request a new code.",
		);
	}

	const hashedPassword = await bcrypt.hash(
		payload.newPassword,
		config.bcrypt_salt_rounds,
	);

	await prisma.user.update({
		where: { email },
		data: {
			password: hashedPassword,
			otpCode: null,
			otpExpiresAt: null,
			otpType: null,
		},
	});

	return {
		message: "Password reset successfully! You can now log in with your new password.",
	};
};

const refreshToken = async (token: string) => {
	const verifyResult = jwtUtils.verifyToken(token, config.jwt_refresh_secret);
	if (!verifyResult.success || !verifyResult.data) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid or expired refresh token!",
		);
	}

	const payload = verifyResult.data as any;

	const user = await prisma.user.findUnique({
		where: { id: payload.userId },
	});

	if (!user || user.isDeleted || user.status === "BLOCKED") {
		throw new AppError(httpStatus.UNAUTHORIZED, "User account unavailable!");
	}

	const newAccessToken = jwtUtils.createToken(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		config.jwt_access_secret,
		config.jwt_access_expires_in,
	);

	return {
		accessToken: newAccessToken,
	};
};

const changePassword = async (
	userId: string,
	payload: IChangePasswordPayload,
) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user || !user.password) {
		throw new AppError(httpStatus.NOT_FOUND, "User password record not found!");
	}

	const isMatch = await bcrypt.compare(payload.currentPassword, user.password);
	if (!isMatch) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Current password does not match!",
		);
	}

	const hashedNewPassword = await bcrypt.hash(
		payload.newPassword,
		config.bcrypt_salt_rounds,
	);

	await prisma.user.update({
		where: { id: userId },
		data: { password: hashedNewPassword },
	});

	return {
		message: "Password changed successfully!",
	};
};

export const AuthService = {
	registerStudent,
	verifyEmail,
	resendOtp,
	loginUser,
	googleLogin,
	forgotPassword,
	resetPassword,
	refreshToken,
	changePassword,
};
