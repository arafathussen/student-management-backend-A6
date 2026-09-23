import { Router } from "express";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { GradingController } from "./grading.controller";

const router = Router();

router.post(
	"/submit",
	checkAuth("FACULTY", "ADMIN", "SUPER_ADMIN"),
	GradingController.submitCourseGrade,
);

router.get(
	"/my-results",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	GradingController.getStudentResults,
);

router.get(
	"/transcript-pdf",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	GradingController.downloadTranscriptPDF,
);

export const GradingRoutes = router;
