import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { SuccessStoryController } from "./success-story.controller";

const router = Router();

// Public routes
router.get("/", SuccessStoryController.getSuccessStories);
router.get("/settings", SuccessStoryController.getSuccessPageSettings);
router.patch(
	"/settings",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.updateSuccessPageSettings,
);

// Admin-only trash & activity log endpoints (before :id parameter)
router.get(
	"/admin/trash",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.getTrashedSuccessStories,
);

router.get(
	"/admin/activity-logs",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.getActivityLogs,
);

// Distinct countries with popularity counts
router.get("/countries", SuccessStoryController.getDistinctCountries);

// Single story detail
router.get("/:id", SuccessStoryController.getSuccessStoryById);

// Admin operations
router.post(
	"/",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.createSuccessStory,
);

router.patch(
	"/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.updateSuccessStory,
);

router.patch(
	"/:id/trash",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.trashSuccessStory,
);

router.patch(
	"/:id/restore",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	SuccessStoryController.restoreSuccessStory,
);

export const SuccessStoryRoutes = router;
