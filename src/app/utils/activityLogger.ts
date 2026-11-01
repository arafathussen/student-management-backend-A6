import { prisma } from "../lib/prisma";

export interface IActivityLogPayload {
	action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "TRASH";
	module: "BLOG" | "SUCCESS_STORY" | "UNIVERSITY" | "USER";
	targetId: string;
	targetTitle?: string;
	performedBy: string;
	userName?: string;
	userEmail?: string;
	details?: string;
}

export const logActivity = async (payload: IActivityLogPayload) => {
	try {
		const log = await prisma.activityLog.create({
			data: {
				action: payload.action,
				module: payload.module,
				targetId: payload.targetId,
				targetTitle: payload.targetTitle || null,
				performedBy: payload.performedBy,
				userName: payload.userName || null,
				userEmail: payload.userEmail || null,
				details: payload.details || null,
			},
		});
		return log;
	} catch (error) {
		console.error("[ActivityLogger Notice]:", error);
	}
};
