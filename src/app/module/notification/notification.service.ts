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
	const whereConditions: any = {
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
		take: 30,
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

export const NotificationService = {
	createNotification,
	getMyNotifications,
	markNotificationAsRead,
};
