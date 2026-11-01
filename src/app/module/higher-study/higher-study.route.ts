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
router.post(
	"/universities/upload-cover",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	upload.single("image"),
	HigherStudyController.uploadUniversityCover,
);
router.delete(
	"/universities/delete-image",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteUniversityImage,
);
router.patch(
	"/universities/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.updateGlobalUniversity,
);
router.delete(
	"/universities/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteGlobalUniversity,
);
router.patch(
	"/universities/:id/restore",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.restoreGlobalUniversity,
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

// Applications Trash & Deletion
router.get(
	"/applications/trash",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.getTrashApplications,
);

router.delete(
	"/applications/trash/empty",
	checkAuth("SUPER_ADMIN"),
	HigherStudyController.emptyTrashApplications,
);

router.patch(
	"/applications/:id/restore",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.restoreApplication,
);

router.delete(
	"/applications/:id/permanent",
	checkAuth("SUPER_ADMIN"),
	HigherStudyController.permanentDeleteApplication,
);

router.delete(
	"/applications/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteApplication,
);

router.get(
	"/applications/:id",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	HigherStudyController.getApplicationById,
);

router.post(
	"/applications/:applicationId/download-dossier-pdf",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	HigherStudyController.downloadApplicationDossierPDF,
);

router.get(
	"/applications/:applicationId/download-dossier-pdf",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	HigherStudyController.downloadApplicationDossierPDF,
);

// Checklist Presets Management
router.get(
	"/checklist-presets",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.getChecklistPresets,
);

router.post(
	"/checklist-presets",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.createChecklistPreset,
);

router.put(
	"/checklist-presets/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.updateChecklistPreset,
);

router.delete(
	"/checklist-presets/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteChecklistPreset,
);

// Individual Checklist Items Management
router.get(
	"/checklist-items",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.getChecklistItems,
);

router.post(
	"/checklist-items",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.createChecklistItem,
);

router.put(
	"/checklist-items/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.updateChecklistItem,
);

router.delete(
	"/checklist-items/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteChecklistItem,
);

router.post(
	"/applications/:applicationId/apply-preset",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.applyPresetToApplication,
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

router.patch(
	"/applications/:id/information",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.updateApplicationInformation,
);

router.patch(
	"/applications/:id/tracking",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.updateApplicationTracking,
);

router.post(
	"/applications/:id/internal-notes",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.addApplicationInternalNote,
);

router.delete(
	"/applications/:id/internal-notes/:noteId",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	HigherStudyController.deleteApplicationInternalNote,
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

router.post(
	"/applications/:applicationId/documents",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.addCustomDocument,
);

router.post(
	"/applications/:applicationId/assign-presets",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.assignPresetDocuments,
);

router.delete(
	"/documents/:documentId",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	HigherStudyController.deleteApplicationDocument,
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
