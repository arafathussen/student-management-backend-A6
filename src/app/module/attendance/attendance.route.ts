import { Router } from "express";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { AttendanceController } from "./attendance.controller";

const router = Router();

router.post(
	"/record",
	checkAuth("FACULTY", "ADMIN", "SUPER_ADMIN"),
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
	checkAuth("FACULTY", "ADMIN", "SUPER_ADMIN"),
	AttendanceController.getSectionAttendanceSummary,
);

export const AttendanceRoutes = router;
