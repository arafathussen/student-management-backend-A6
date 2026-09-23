import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { ChatController } from "./chat.controller";

const router = Router();

router.post(
	"/send",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	ChatController.sendMessage,
);

router.get(
	"/room/:studentUserId",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	ChatController.getOrCreateRoom,
);

router.get(
	"/room/messages/:roomId",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	ChatController.getRoomMessages,
);

router.patch(
	"/room/:roomId/lock",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	ChatController.toggleRoomLock,
);

router.patch(
	"/room/:roomId/mode",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ChatController.setChatMode,
);

router.patch(
	"/student/:studentUserId/budget",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	ChatController.updateStudentBudget,
);

router.get(
	"/conversation/:otherUserId",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	ChatController.getConversationMessages,
);

router.patch(
	"/read/:senderId",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	ChatController.markMessagesAsRead,
);

export const ChatRoutes = router;
