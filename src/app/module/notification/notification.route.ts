import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { NotificationController } from "./notification.controller";

const router = Router();

router.post(
	"/broadcast",
	checkAuth("ADMIN", "SUPER_ADMIN"),
	NotificationController.createNotification,
);

router.get(
	"/my",
	checkAuth("ADMIN", "SUPER_ADMIN", "FACULTY", "STUDENT"),
	NotificationController.getMyNotifications,
);

router.patch(
	"/:id/read",
	checkAuth("ADMIN", "SUPER_ADMIN", "FACULTY", "STUDENT"),
	NotificationController.markNotificationAsRead,
);

export const NotificationRoutes = router;
