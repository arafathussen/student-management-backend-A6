import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AcademicController } from "./academic.controller";
import { AcademicValidation } from "./academic.validation";

const router = Router();

// Departments
router.post(
	"/departments",
	checkAuth("ADMIN", "SUPER_ADMIN"),
	validateRequest(AcademicValidation.createDepartmentSchema),
	AcademicController.createDepartment,
);
router.get("/departments", AcademicController.getDepartments);

// Semesters
router.post(
	"/semesters",
	checkAuth("ADMIN", "SUPER_ADMIN"),
	validateRequest(AcademicValidation.createSemesterSchema),
	AcademicController.createSemester,
);
router.get("/semesters", AcademicController.getSemesters);

// Courses
router.post(
	"/courses",
	checkAuth("ADMIN", "SUPER_ADMIN"),
	validateRequest(AcademicValidation.createCourseSchema),
	AcademicController.createCourse,
);
router.get("/courses", AcademicController.getCourses);

// Sections
router.post(
	"/sections",
	checkAuth("ADMIN", "SUPER_ADMIN"),
	validateRequest(AcademicValidation.createSectionSchema),
	AcademicController.createSection,
);
router.get("/sections/:courseId", AcademicController.getSectionsByCourse);

export const AcademicRoutes = router;
