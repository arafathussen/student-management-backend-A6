import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { ContactController } from "./contact.controller";
import { upload } from "../../lib/multer";

const router = Router();

// Public routes for Contact Page (SEO & Public Display)
router.get("/settings", ContactController.getSettings);
router.get("/team", ContactController.getTeamMembers);

// Super Admin / Admin management endpoints
router.patch(
	"/settings",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.updateSettings,
);

router.post(
	"/team",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.createTeamMember,
);

router.patch(
	"/team/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.updateTeamMember,
);

router.delete(
	"/team/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.deleteTeamMember,
);

// Inquiry routes
// 1. Public submission from Contact Page
router.post("/inquiries", ContactController.createInquiry);

// 2. Admin management of inquiries
router.get(
	"/inquiries",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.getInquiries,
);

router.patch(
	"/inquiries/:id/read",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.markInquiryRead,
);

router.post(
	"/inquiries/:id/reply",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.replyToInquiry,
);

router.delete(
	"/inquiries/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	ContactController.deleteInquiry,
);

router.post(
	"/upload-logo",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	upload.single("image"),
	ContactController.uploadLogo,
);

export const ContactRoutes = router;

