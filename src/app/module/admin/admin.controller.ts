import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminService.getDashboardStats();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dashboard analytics & stats fetched successfully!",
		data: result,
	});
});

const recordVisitorPing = catchAsync(async (req: Request, res: Response) => {
	const sessionId = req.body?.sessionId || (req.query?.sessionId as string);
	const isPageLoad = req.body?.isPageLoad !== false;
	const clientIp = 
		(req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
		req.socket?.remoteAddress ||
		req.ip ||
		"127.0.0.1";
	const result = AdminService.recordVisitorPing(sessionId, clientIp, isPageLoad);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Visitor ping recorded successfully!",
		data: result,
	});
});

const getVisitorStats = catchAsync(async (req: Request, res: Response) => {
	const result = AdminService.getVisitorStats();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Live visitor statistics fetched successfully!",
		data: result,
	});
});

export const AdminController = {
	getDashboardStats,
	recordVisitorPing,
	getVisitorStats,
};
