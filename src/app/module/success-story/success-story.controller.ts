import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SuccessStoryService } from "./success-story.service";

const createSuccessStory = catchAsync(async (req: Request, res: Response) => {
	const user = (req as any).user;
	const result = await SuccessStoryService.createSuccessStory(user, req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Student success story published successfully!",
		data: result,
	});
});

const getSuccessStories = catchAsync(async (req: Request, res: Response) => {
	const result = await SuccessStoryService.getSuccessStories(req.query);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Success stories fetched successfully!",
		data: result,
	});
});

const getSuccessStoryById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const result = await SuccessStoryService.getSuccessStoryById(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Success story details retrieved successfully!",
		data: result,
	});
});

const updateSuccessStory = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const user = (req as any).user;
	const result = await SuccessStoryService.updateSuccessStory(id, user, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Success story updated successfully!",
		data: result,
	});
});

const trashSuccessStory = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const user = (req as any).user;
	const result = await SuccessStoryService.trashSuccessStory(id, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: result.data,
	});
});

const restoreSuccessStory = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const user = (req as any).user;
	const result = await SuccessStoryService.restoreSuccessStory(id, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: result.data,
	});
});

const getTrashedSuccessStories = catchAsync(async (_req: Request, res: Response) => {
	const result = await SuccessStoryService.getTrashedSuccessStories();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Trashed success stories retrieved!",
		data: result,
	});
});

const getActivityLogs = catchAsync(async (req: Request, res: Response) => {
	const result = await SuccessStoryService.getActivityLogs(req.query);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Activity logs retrieved successfully!",
		data: result,
	});
});

const getSuccessPageSettings = catchAsync(async (_req: Request, res: Response) => {
	const result = await SuccessStoryService.getSuccessPageSettings();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Success page settings retrieved successfully!",
		data: result,
	});
});

const updateSuccessPageSettings = catchAsync(async (req: Request, res: Response) => {
	const result = await SuccessStoryService.updateSuccessPageSettings(req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Success page settings updated successfully!",
		data: result,
	});
});

const getDistinctCountries = catchAsync(async (_req: Request, res: Response) => {
	const result = await SuccessStoryService.getDistinctCountries();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Distinct story countries retrieved successfully!",
		data: result,
	});
});

export const SuccessStoryController = {
	createSuccessStory,
	getSuccessStories,
	getSuccessStoryById,
	getDistinctCountries,
	updateSuccessStory,
	trashSuccessStory,
	restoreSuccessStory,
	getTrashedSuccessStories,
	getActivityLogs,
	getSuccessPageSettings,
	updateSuccessPageSettings,
};
