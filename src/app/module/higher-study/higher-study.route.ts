import { Router } from "express";
import { upload } from "../../lib/multer";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { HigherStudyController } from "./higher-study.controller";

const router = Router();

// Country Routes
router.post(
	"/countries",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.createCountry,
);
router.get("/countries", HigherStudyController.getCountries);

// University Routes
router.post(
	"/universities",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.createGlobalUniversity,
);
router.patch(
	"/universities/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.updateGlobalUniversity,
);
router.get("/universities", HigherStudyController.getGlobalUniversities);
router.get(
	"/universities/:id",
	HigherStudyController.getGlobalUniversityDetails,
);

// Dynamic Document Requirements per University
router.post(
	"/universities/:universityId/doc-requirements",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.addUniversityDocRequirement,
);
router.get(
	"/universities/:universityId/doc-requirements",
	HigherStudyController.getUniversityDocRequirements,
);
router.delete(
	"/doc-requirements/:reqId",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteUniversityDocRequirement,
);

// Program Routes
router.post(
	"/programs",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.createGlobalProgram,
);
router.get("/programs", HigherStudyController.getGlobalPrograms);

// Student Application Routes
router.post(
	"/applications/apply",
	checkAuth("STUDENT"),
	checkStudentScope("HIGHER_STUDY"),
	HigherStudyController.applyForProgram,
);

router.get(
	"/applications/my",
	checkAuth("STUDENT"),
	checkStudentScope("HIGHER_STUDY"),
	HigherStudyController.getMyApplications,
);

router.get(
	"/applications",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.getAllApplications,
);

router.patch(
	"/applications/:applicationId/assign-counselor",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.assignCounselor,
);

router.post(
	"/applications/:applicationId/notes",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.addCounselorNote,
);

router.post(
	"/documents/:documentId/upload",
	checkAuth("STUDENT"),
	checkStudentScope("HIGHER_STUDY"),
	upload.single("file"),
	HigherStudyController.uploadApplicationDocument,
);

router.patch(
	"/documents/:documentId/verify",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.verifyDocument,
);

router.patch(
	"/applications/:applicationId/stage",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.updateApplicationStage,
);

router.post(
	"/applications/:applicationId/issue-offer-letter",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	upload.single("file"),
	HigherStudyController.issueOfferLetter,
);

router.get(
	"/applications/:applicationId/download-offer-letter",
	checkAuth("STUDENT"),
	HigherStudyController.downloadOfferLetter,
);

router.patch(
	"/applications/:applicationId/toggle-offer-lock",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.toggleOfferLetterLock,
);

// Educational Blog Posts
router.post(
	"/blogs",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.createBlogPost,
);
router.get("/blogs", HigherStudyController.getBlogPosts);
router.get("/blogs/:slug", HigherStudyController.getBlogPostBySlug);
router.delete(
	"/blogs/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteBlogPost,
);

export const HigherStudyRoutes = router;
