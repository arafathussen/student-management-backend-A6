import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user!.userId;
	const result = await UserService.getMe(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully!",
		data: result,
	});
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user!.userId;
	const result = await UserService.updateMe(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile updated successfully!",
		data: result,
	});
});

const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user!.userId;
	const result = await UserService.updateProfileImage(
		userId,
		req.file as Express.Multer.File,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Profile image updated successfully!",
		data: result,
	});
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.createAdmin(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Admin account created successfully!",
		data: result,
	});
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.deleteAdmin(req.params.adminId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

const createCounselor = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.createCounselor(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Counselor account created successfully!",
		data: result,
	});
});

const customCreateUser = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.customCreateUser(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Custom user created successfully!",
		data: result,
	});
});

const adminResetUserPassword = catchAsync(
	async (req: Request, res: Response) => {
		const requesterRole = req.user!.role;
		const result = await UserService.adminResetUserPassword(
			requesterRole,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: result.message,
			data: null,
		});
	},
);

const deleteUser = catchAsync(async (req: Request, res: Response) => {
	const requesterRole = req.user!.role;
	const result = await UserService.deleteUser(
		requesterRole,
		req.params.userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
	const requesterRole = req.user!.role;
	const result = await UserService.updateUserStatus(
		requesterRole,
		req.params.userId as string,
		req.body.status,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User status updated successfully!",
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const requesterRole = req.user!.role;
	const result = await UserService.getAllUsers(req.query, requesterRole);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users fetched successfully!",
		meta: result.meta,
		data: result.data,
	});
});

export const UserController = {
	getMe,
	updateMe,
	updateProfileImage,
	createAdmin,
	deleteAdmin,
	createCounselor,
	customCreateUser,
	adminResetUserPassword,
	deleteUser,
	updateUserStatus,
	getAllUsers,
};
