import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ChecklistPresetService } from "./checklist-preset.service";
import { HigherStudyService } from "./higher-study.service";

// Countries
const createCountry = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.createCountry(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Country created successfully!",
		data: result,
	});
});

const getCountries = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.getCountries();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Countries fetched successfully!",
		data: result,
	});
});

// Universities
const createGlobalUniversity = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.createGlobalUniversity(req.body);
		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Global university added successfully!",
			data: result,
		});
	},
);

const updateGlobalUniversity = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.updateGlobalUniversity(
			req.params.id as string,
			req.body,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Global university updated successfully!",
			data: result,
		});
	},
);

const deleteGlobalUniversity = catchAsync(
	async (req: Request, res: Response) => {
		const hardDelete = req.query.hard === "true";
		const result = await HigherStudyService.deleteGlobalUniversity(
			req.params.id as string,
			hardDelete,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: hardDelete ? "University permanently deleted!" : "University moved to trash!",
			data: result,
		});
	},
);

const restoreGlobalUniversity = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.restoreGlobalUniversity(
			req.params.id as string,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "University restored from trash successfully!",
			data: result,
		});
	},
);

const uploadUniversityCover = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.uploadUniversityCover(
			req.file as Express.Multer.File,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "University cover uploaded to Cloudinary successfully!",
			data: result,
		});
	},
);

const deleteUniversityImage = catchAsync(
	async (req: Request, res: Response) => {
		const payload = {
			publicId: (req.body?.publicId || req.query?.publicId) as string,
			imageUrl: (req.body?.imageUrl || req.query?.imageUrl) as string,
		};
		const result = await HigherStudyService.deleteUniversityImage(payload);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: result.message,
			data: null,
		});
	},
);

const getGlobalUniversities = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.getGlobalUniversities(req.query);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Global universities retrieved!",
			meta: result.meta,
			data: result.data,
		});
	},
);

const getGlobalUniversityDetails = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.getGlobalUniversityDetails(
			req.params.id as string,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "University details retrieved!",
			data: result,
		});
	},
);

// Dynamic Document Requirements
const addUniversityDocRequirement = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.addUniversityDocRequirement(
			req.params.universityId as string,
			req.body,
		);
		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Document requirement added to university!",
			data: result,
		});
	},
);

const getUniversityDocRequirements = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.getUniversityDocRequirements(
			req.params.universityId as string,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Document requirements fetched!",
			data: result,
		});
	},
);

const deleteUniversityDocRequirement = catchAsync(
	async (req: Request, res: Response) => {
		const result = await HigherStudyService.deleteUniversityDocRequirement(
			req.params.reqId as string,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: result.message,
			data: null,
		});
	},
);

// Programs
const createGlobalProgram = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.createGlobalProgram(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Global degree program added!",
		data: result,
	});
});

const getGlobalPrograms = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.getGlobalPrograms(req.query);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Global degree programs fetched!",
		meta: result.meta,
		data: result.data,
	});
});

// Applications
const applyForProgram = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const { programId } = req.body;
	const result = await HigherStudyService.applyForProgram(studentId, programId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Higher study application created with checklist!",
		data: result,
	});
});

const getMyApplications = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const result = await HigherStudyService.getMyApplications(studentId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your applications retrieved successfully!",
		data: result,
	});
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
	const userRole = req.user!.role;
	const userId = req.user!.userId;
	const result = await HigherStudyService.getAllApplications(
		req.query,
		userRole,
		userId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All applications fetched successfully!",
		meta: result.meta,
		data: result.data,
	});
});

const assignCounselor = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const { counselorId } = req.body;
	const result = await HigherStudyService.assignCounselor(
		applicationId,
		counselorId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Counselor assigned successfully!",
		data: result,
	});
});

const addCounselorNote = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const counselorUserId = req.user!.userId;
	const result = await HigherStudyService.addCounselorNote(
		applicationId,
		counselorUserId,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Note added to application!",
		data: result,
	});
});

const uploadApplicationDocument = catchAsync(
	async (req: Request, res: Response) => {
		const documentId = req.params.documentId as string;
		const result = await HigherStudyService.uploadApplicationDocument(
			documentId,
			req.file as Express.Multer.File,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Document uploaded to Cloudinary successfully!",
			data: result,
		});
	},
);

const verifyDocument = catchAsync(async (req: Request, res: Response) => {
	const documentId = req.params.documentId as string;
	const adminUserId = req.user?.userId;
	const result = await HigherStudyService.verifyDocument(documentId, req.body, adminUserId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `Document status marked as ${req.body.status}!`,
		data: result,
	});
});

const addCustomDocument = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const adminUserId = req.user?.userId;
	const result = await HigherStudyService.addCustomDocument(
		applicationId,
		req.body,
		adminUserId,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Document requirement added successfully!",
		data: result,
	});
});

const assignPresetDocuments = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const adminUserId = req.user?.userId;
	const { presetType, customTitles } = req.body;
	const result = await HigherStudyService.assignPresetDocuments(
		applicationId,
		presetType,
		customTitles,
		adminUserId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Document preset assigned successfully!",
		data: result,
	});
});

const deleteApplicationDocument = catchAsync(
	async (req: Request, res: Response) => {
		const documentId = req.params.documentId as string;
		const result = await HigherStudyService.deleteApplicationDocument(documentId);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Document requirement deleted successfully!",
			data: result,
		});
	},
);

const updateApplicationStage = catchAsync(
	async (req: Request, res: Response) => {
		const applicationId = req.params.applicationId as string;
		const result = await HigherStudyService.updateApplicationStage(
			applicationId,
			req.body.status,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: `Application stage updated to ${req.body.status}!`,
			data: result,
		});
	},
);

const issueOfferLetter = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const result = await HigherStudyService.issueOfferLetter(
		applicationId,
		req.file as Express.Multer.File,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Offer letter issued and uploaded!",
		data: result,
	});
});

const downloadOfferLetter = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const studentUserId = req.user!.userId;
	const result = await HigherStudyService.getOfferLetterDownload(
		applicationId,
		studentUserId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Offer letter download URL retrieved!",
		data: result,
	});
});

const toggleOfferLetterLock = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const { isOfferUnlocked } = req.body;
	const result = await HigherStudyService.toggleOfferLetterLock(
		applicationId,
		isOfferUnlocked,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `Offer letter ${isOfferUnlocked ? "unlocked" : "locked"} successfully!`,
		data: result,
	});
});

// Educational Blog Posts
const createBlogPost = catchAsync(async (req: Request, res: Response) => {
	const authorId = req.user!.userId;
	const result = await HigherStudyService.createBlogPost(authorId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Blog article published successfully!",
		data: result,
	});
});

const getBlogPosts = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.getBlogPosts(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Blog posts fetched successfully!",
		meta: result.meta,
		data: result.data,
	});
});

const getBlogPostBySlug = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.getBlogPostBySlug(
		req.params.slug as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Blog article retrieved successfully!",
		data: result,
	});
});

const deleteBlogPost = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.deleteBlogPost(
		req.params.id as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

// Application Trash & Deletion
const deleteApplication = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as any;
	const result = await HigherStudyService.deleteApplication(
		req.params.id as string,
		user.role,
		user.id,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application moved to trash successfully!",
		data: result,
	});
});

const getTrashApplications = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.getTrashApplications();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Trash applications retrieved successfully!",
		data: result,
	});
});

const restoreApplication = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.restoreApplication(
		req.params.id as string,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application restored from trash successfully!",
		data: result,
	});
});

const permanentDeleteApplication = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.permanentDeleteApplication(
		req.params.id as string,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application permanently deleted from database!",
		data: result,
	});
});

const emptyTrashApplications = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.emptyTrashApplications();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: result,
	});
});

// Checklist Presets Controllers
const getChecklistPresets = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.getAllPresets();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Checklist presets retrieved successfully!",
		data: result,
	});
});

const createChecklistPreset = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.createPreset(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Checklist preset bundle created successfully!",
		data: result,
	});
});

const updateChecklistPreset = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.updatePreset(
		req.params.id as string,
		req.body,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Checklist preset updated successfully!",
		data: result,
	});
});

const deleteChecklistPreset = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.deletePreset(
		req.params.id as string,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

// Individual Checklist Item Controllers
const getChecklistItems = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.getAllItems();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Checklist items retrieved successfully!",
		data: result,
	});
});

const createChecklistItem = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.createItem(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Checklist item created successfully!",
		data: result,
	});
});

const updateChecklistItem = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.updateItem(
		req.params.id as string,
		req.body,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Checklist item updated successfully!",
		data: result,
	});
});

const deleteChecklistItem = catchAsync(async (req: Request, res: Response) => {
	const result = await ChecklistPresetService.deleteItem(
		req.params.id as string,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

const applyPresetToApplication = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as any;
	const result = await HigherStudyService.applyPresetToApplication(
		req.params.applicationId as string,
		req.body,
		user.id,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Checklist preset bundle applied to student application successfully!",
		data: result,
	});
});

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.getApplicationById(req.params.id as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application details fetched successfully!",
		data: result,
	});
});

const downloadApplicationDossierPDF = catchAsync(async (req: Request, res: Response) => {
	const applicationId = req.params.applicationId as string;
	const { documentIds, customTitle } = req.body || {};
	const { buffer, fileName } = await HigherStudyService.generateApplicationDossierPDF(applicationId, {
		documentIds,
		customTitle,
	});

	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
	res.setHeader("Content-Length", buffer.length);
	res.end(buffer);
});

const updateApplicationInformation = catchAsync(async (req: Request, res: Response) => {
	const applicationId = (req.params.id || req.params.applicationId) as string;
	const result = await HigherStudyService.updateApplicationInformation(applicationId, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application information updated successfully!",
		data: result,
	});
});

const updateApplicationTracking = catchAsync(async (req: Request, res: Response) => {
	const applicationId = (req.params.id || req.params.applicationId) as string;
	const result = await HigherStudyService.updateApplicationTracking(applicationId, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application tracking updated successfully!",
		data: result,
	});
});

const addApplicationInternalNote = catchAsync(async (req: Request, res: Response) => {
	const applicationId = (req.params.id || req.params.applicationId) as string;
	const userId = (req as any).user.userId;
	const result = await HigherStudyService.addApplicationInternalNote(applicationId, userId, req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Internal case note added successfully!",
		data: result,
	});
});

const deleteApplicationInternalNote = catchAsync(async (req: Request, res: Response) => {
	const applicationId = (req.params.id || req.params.applicationId) as string;
	const noteId = req.params.noteId as string;
	const result = await HigherStudyService.deleteApplicationInternalNote(applicationId, noteId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Internal case note deleted successfully!",
		data: result,
	});
});

export const HigherStudyController = {
	createCountry,
	getCountries,
	createGlobalUniversity,
	updateGlobalUniversity,
	deleteGlobalUniversity,
	restoreGlobalUniversity,
	getGlobalUniversities,
	getGlobalUniversityDetails,
	addUniversityDocRequirement,
	getUniversityDocRequirements,
	deleteUniversityDocRequirement,
	createGlobalProgram,
	getGlobalPrograms,
	applyForProgram,
	getMyApplications,
	getAllApplications,
	getApplicationById,
	downloadApplicationDossierPDF,
	assignCounselor,
	addCounselorNote,
	uploadApplicationDocument,
	verifyDocument,
	addCustomDocument,
	assignPresetDocuments,
	deleteApplicationDocument,
	updateApplicationStage,
	issueOfferLetter,
	downloadOfferLetter,
	toggleOfferLetterLock,
	createBlogPost,
	getBlogPosts,
	getBlogPostBySlug,
	deleteBlogPost,
	uploadUniversityCover,
	deleteUniversityImage,
	deleteApplication,
	getTrashApplications,
	restoreApplication,
	permanentDeleteApplication,
	emptyTrashApplications,
	getChecklistPresets,
	createChecklistPreset,
	updateChecklistPreset,
	deleteChecklistPreset,
	getChecklistItems,
	createChecklistItem,
	updateChecklistItem,
	deleteChecklistItem,
	applyPresetToApplication,
	updateApplicationInformation,
	updateApplicationTracking,
	addApplicationInternalNote,
	deleteApplicationInternalNote,
};
