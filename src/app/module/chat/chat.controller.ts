import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ChatService } from "./chat.service";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
	const senderId = req.user!.userId;
	const senderRole = req.user!.role;
	const senderName = req.user!.email;
	const senderAvatar = "";

	const result = await ChatService.sendMessage(
		senderId,
		senderName,
		senderRole,
		senderAvatar,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Message sent successfully!",
		data: result,
	});
});

const getOrCreateRoom = catchAsync(async (req: Request, res: Response) => {
	const studentUserId = req.params.studentUserId || req.user!.userId;
	const applicationId = req.query.applicationId as string;
	const result = await ChatService.getOrCreateRoom(
		studentUserId,
		applicationId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Chat room loaded successfully!",
		data: result,
	});
});

const toggleRoomLock = catchAsync(async (req: Request, res: Response) => {
	const roomId = req.params.roomId;
	const agentUserId = req.user!.userId;
	const agentName = req.user!.email;
	const lock = req.body.lock !== undefined ? req.body.lock : Boolean(req.body.isLocked);

	const result = await ChatService.toggleRoomLock(
		roomId,
		agentUserId,
		agentName,
		lock,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: lock
			? "Chat room locked for exclusive 1-on-1 session!"
			: "Chat room unlocked for collaborative staff participation!",
		data: result,
	});
});

const setChatMode = catchAsync(async (req: Request, res: Response) => {
	const roomId = req.params.roomId;
	const { mode } = req.body;
	const result = await ChatService.setChatMode(roomId, mode);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `Chat mode set to ${mode}!`,
		data: result,
	});
});

const getRoomMessages = catchAsync(async (req: Request, res: Response) => {
	const roomId = req.params.roomId;
	const result = await ChatService.getRoomMessages(roomId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Room messages retrieved!",
		data: result,
	});
});

const updateStudentBudget = catchAsync(async (req: Request, res: Response) => {
	const studentUserId = req.params.studentUserId;
	const result = await ChatService.updateStudentBudgetInChat(
		studentUserId,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Student target budget updated successfully!",
		data: result,
	});
});

const getConversationMessages = catchAsync(
	async (req: Request, res: Response) => {
		const currentUserId = req.user!.userId;
		const otherUserId = req.params.otherUserId;
		const result = await ChatService.getConversationMessages(
			currentUserId,
			otherUserId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Conversation messages retrieved!",
			data: result,
		});
	},
);

const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
	const currentUserId = req.user!.userId;
	const senderId = req.params.senderId;
	const result = await ChatService.markMessagesAsRead(currentUserId, senderId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Messages marked as read!",
		data: result,
	});
});

export const ChatController = {
	sendMessage,
	getOrCreateRoom,
	toggleRoomLock,
	setChatMode,
	getRoomMessages,
	updateStudentBudget,
	getConversationMessages,
	markMessagesAsRead,
};
