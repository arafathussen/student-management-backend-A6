import { Router } from "express";
import { upload } from "../../lib/multer";
import { checkAuth } from "../../middleware/checkAuth";
import { UserController } from "./user.controller";

const router = Router();

router.get(
	"/me",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	UserController.getMe,
);

router.patch(
	"/me",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	UserController.updateMe,
);

router.patch(
	"/profile-image",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	upload.single("image"),
	UserController.updateProfileImage,
);

// Super Admin Only Operations
router.post("/create-admin", checkAuth("SUPER_ADMIN"), UserController.createAdmin);
router.delete("/admin/:adminId", checkAuth("SUPER_ADMIN"), UserController.deleteAdmin);
router.post("/custom-create", checkAuth("SUPER_ADMIN"), UserController.customCreateUser);

// Admin & Super Admin Operations
router.post(
	"/create-counselor",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	UserController.createCounselor,
);

router.post(
	"/reset-user-password",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	UserController.adminResetUserPassword,
);

router.patch(
	"/:userId/status",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	UserController.updateUserStatus,
);

router.delete(
	"/:userId",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	UserController.deleteUser,
);

router.get("/", checkAuth("SUPER_ADMIN", "ADMIN"), UserController.getAllUsers);

export const UserRoutes = router;
