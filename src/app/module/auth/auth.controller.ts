import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerStudent = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.registerStudent(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: result.message,
		data: {
			email: result.email,
			isEmailVerified: result.isEmailVerified,
		},
	});
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.verifyEmail(req.body);

	if (result.refreshToken) {
		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});
	}

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: {
			accessToken: result.accessToken,
			user: result.user,
		},
	});
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.resendOtp(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.loginUser(req.body);

	res.cookie("refreshToken", result.refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Logged in successfully!",
		data: {
			accessToken: result.accessToken,
			user: result.user,
		},
	});
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.googleLogin(req.body);

	res.cookie("refreshToken", result.refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Google Social Login successful!",
		data: {
			accessToken: result.accessToken,
			user: result.user,
		},
	});
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.forgotPassword(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.resetPassword(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const token = req.cookies?.refreshToken || req.body?.refreshToken;
	const result = await AuthService.refreshToken(token);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Access token refreshed successfully!",
		data: result,
	});
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user!.userId;
	const result = await AuthService.changePassword(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

export const AuthController = {
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
