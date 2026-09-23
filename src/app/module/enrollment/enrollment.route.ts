import { Router } from "express";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { EnrollmentController } from "./enrollment.controller";

const router = Router();

router.post(
	"/register",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	EnrollmentController.registerCourseSection,
);

router.get(
	"/my-courses",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	EnrollmentController.getMyEnrollments,
);

router.delete(
	"/:id",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	EnrollmentController.dropCourseSection,
);

export const EnrollmentRoutes = router;
