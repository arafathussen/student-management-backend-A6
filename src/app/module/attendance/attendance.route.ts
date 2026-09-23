import { Router } from "express";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { AttendanceController } from "./attendance.controller";

const router = Router();

router.post(
	"/record",
	checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR"),
	AttendanceController.recordSectionAttendance,
);

router.get(
	"/my",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	AttendanceController.getStudentAttendance,
);

router.get(
	"/section/:sectionId",
	checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR"),
	AttendanceController.getSectionAttendanceSummary,
);

export const AttendanceRoutes = router;
