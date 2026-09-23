import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
	"/dashboard-stats",
	checkAuth("ADMIN", "SUPER_ADMIN"),
	AdminController.getDashboardStats,
);

export const AdminRoutes = router;
