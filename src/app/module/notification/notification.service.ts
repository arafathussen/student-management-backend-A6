import httpStatus from "http-status";
import type {
	NotificationAudience,
	NotificationPriority,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const createNotification = async (payload: {
	title: string;
	body: string;
	audience: NotificationAudience;
	priority?: NotificationPriority;
	userId?: string;
	actionUrl?: string;
}) => {
	const notification = await prisma.notification.create({
		data: {
			title: payload.title,
			body: payload.body,
			audience: payload.audience,
			priority: payload.priority || "INFO",
			userId: payload.userId,
			actionUrl: payload.actionUrl,
		},
	});

	return notification;
};

const getMyNotifications = async (userId: string, userScope?: string) => {
	// Auto delete notifications older than 3 days (3-Day TTL Cleanup)
	const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
	try {
		await prisma.notification.deleteMany({
			where: {
				createdAt: { lt: threeDaysAgo },
			},
		});
	} catch (cleanupErr: any) {
		console.error("Failed to auto-cleanup expired notifications:", cleanupErr?.message);
	}

	const whereConditions: any = {
		createdAt: { gte: threeDaysAgo },
		OR: [{ userId }, { userId: null }],
	};

	if (userScope === "ACADEMIC_ONLY") {
		whereConditions.audience = { in: ["ACADEMIC", "ALL"] };
	} else if (userScope === "HIGHER_STUDY_ONLY") {
		whereConditions.audience = { in: ["HIGHER_STUDY", "ALL"] };
	}

	const notifications = await prisma.notification.findMany({
		where: whereConditions,
		orderBy: { createdAt: "desc" },
		take: 50,
	});

	return notifications;
};

const markNotificationAsRead = async (notificationId: string) => {
	const notification = await prisma.notification.update({
		where: { id: notificationId },
		data: { isRead: true },
	});

	return notification;
};

const markAllNotificationsAsRead = async (userId: string) => {
	const result = await prisma.notification.updateMany({
		where: {
			OR: [{ userId }, { userId: null }],
			isRead: false,
		},
		data: { isRead: true },
	});

	return result;
};

export const NotificationService = {
	createNotification,
	getMyNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
};
