import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const createNotification = catchAsync(async (req: Request, res: Response) => {
	const result = await NotificationService.createNotification(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Notification created & broadcasted successfully!",
		data: result,
	});
});

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user!.userId;
	const userScope = req.user!.accessScope;
	const result = await NotificationService.getMyNotifications(
		userId,
		userScope,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Targeted notifications retrieved successfully!",
		data: result,
	});
});

const markNotificationAsRead = catchAsync(
	async (req: Request, res: Response) => {
		const notificationId = req.params.id as string;
		const result =
			await NotificationService.markNotificationAsRead(notificationId);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Notification marked as read!",
			data: result,
		});
	},
);

export const NotificationController = {
	createNotification,
	getMyNotifications,
	markNotificationAsRead,
};
