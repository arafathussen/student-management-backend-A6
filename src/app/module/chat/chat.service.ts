import httpStatus from "http-status";
import type { ChatMode, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const getOrCreateRoom = async (studentUserId: string, applicationId?: string) => {
	let room = await prisma.chatRoom.findFirst({
		where: {
			studentUserId,
			...(applicationId ? { applicationId } : {}),
		},
		include: {
			messages: {
				include: {
					sender: { select: { id: true, name: true, role: true, imageUrl: true } },
				},
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!room) {
		room = await prisma.chatRoom.create({
			data: {
				studentUserId,
				applicationId,
				mode: "COLLABORATIVE_GROUP",
			},
			include: {
				messages: {
					include: {
						sender: { select: { id: true, name: true, role: true, imageUrl: true } },
					},
				},
			},
		});
	}

	return room;
};

const sendMessage = async (
	senderId: string,
	senderName: string,
	senderRole: Role,
	senderAvatar: string,
	payload: {
		roomId?: string;
		studentUserId?: string;
		applicationId?: string;
		receiverId?: string;
		message: string;
		attachmentUrl?: string;
		senderDisplayName?: string; // Admin persona masking e.g. "Admissions Desk"
	},
) => {
	let roomId = payload.roomId;

	if (!roomId && payload.studentUserId) {
		const room = await getOrCreateRoom(payload.studentUserId, payload.applicationId);
		roomId = room.id;
	}

	if (roomId) {
		const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
		if (!room) {
			throw new AppError(httpStatus.NOT_FOUND, "Chat room not found!");
		}

		// Check exclusive lock: if locked and sender is staff other than lock owner
		if (
			room.isLocked &&
			senderRole !== "STUDENT" &&
			room.lockedByAgentId &&
			room.lockedByAgentId !== senderId
		) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				`Chat is currently locked exclusively by ${room.lockedByAgentName || "another agent"}. Other staff cannot send messages until released.`,
			);
		}
	}

	const displayName =
		payload.senderDisplayName ||
		(senderRole === "ADMIN" ? "Admissions Desk (Admin)" : senderName);

	const badge = `[${senderRole}]`;

	const chatMessage = await prisma.chatMessage.create({
		data: {
			roomId,
			senderId,
			receiverId: payload.receiverId,
			message: payload.message,
			attachmentUrl: payload.attachmentUrl,
			senderDisplayName: displayName,
			senderRoleBadge: badge,
		},
		include: {
			sender: { select: { id: true, name: true, role: true, imageUrl: true } },
			receiver: { select: { id: true, name: true, role: true, imageUrl: true } },
		},
	});

	return chatMessage;
};

const toggleRoomLock = async (
	roomId: string,
	agentUserId: string,
	agentName: string,
	lock: boolean,
) => {
	const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
	if (!room) {
		throw new AppError(httpStatus.NOT_FOUND, "Chat room not found!");
	}

	const updated = await prisma.chatRoom.update({
		where: { id: roomId },
		data: {
			isLocked: lock,
			lockedByAgentId: lock ? agentUserId : null,
			lockedByAgentName: lock ? agentName : null,
			mode: lock ? "EXCLUSIVE_LOCK" : "COLLABORATIVE_GROUP",
		},
	});

	return updated;
};

const setChatMode = async (roomId: string, mode: ChatMode) => {
	const updated = await prisma.chatRoom.update({
		where: { id: roomId },
		data: { mode },
	});

	return updated;
};

const getRoomMessages = async (roomId: string) => {
	const room = await prisma.chatRoom.findUnique({
		where: { id: roomId },
		include: {
			messages: {
				include: {
					sender: { select: { id: true, name: true, role: true, imageUrl: true } },
				},
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!room) {
		throw new AppError(httpStatus.NOT_FOUND, "Chat room not found!");
	}

	return room;
};

// Update Student Budget while in chat
const updateStudentBudgetInChat = async (
	studentUserId: string,
	payload: {
		targetBudget: number;
		preferredCurrency?: string;
		preferredCountry?: string;
	},
) => {
	const student = await prisma.student.findUnique({
		where: { userId: studentUserId },
	});

	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student not found!");
	}

	const updated = await prisma.student.update({
		where: { userId: studentUserId },
		data: {
			targetBudget: payload.targetBudget,
			preferredCurrency: payload.preferredCurrency || "USD",
			preferredCountry: payload.preferredCountry,
		},
		include: { user: true },
	});

	return updated;
};

const getConversationMessages = async (userId: string, otherUserId: string) => {
	const messages = await prisma.chatMessage.findMany({
		where: {
			OR: [
				{ senderId: userId, receiverId: otherUserId },
				{ senderId: otherUserId, receiverId: userId },
			],
		},
		include: {
			sender: { select: { id: true, name: true, role: true, imageUrl: true } },
			receiver: { select: { id: true, name: true, role: true, imageUrl: true } },
		},
		orderBy: { createdAt: "asc" },
	});

	return messages;
};

const markMessagesAsRead = async (currentUserId: string, senderId: string) => {
	const updated = await prisma.chatMessage.updateMany({
		where: {
			senderId,
			receiverId: currentUserId,
			isRead: false,
		},
		data: { isRead: true },
	});

	return { count: updated.count };
};

export const ChatService = {
	getOrCreateRoom,
	sendMessage,
	toggleRoomLock,
	setChatMode,
	getRoomMessages,
	updateStudentBudgetInChat,
	getConversationMessages,
	markMessagesAsRead,
};
