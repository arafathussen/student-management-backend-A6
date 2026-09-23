import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
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
			req.params.id,
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
			req.params.id,
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
			req.params.universityId,
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
			req.params.universityId,
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
			req.params.reqId,
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
	const { applicationId } = req.params;
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
	const { applicationId } = req.params;
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
		const { documentId } = req.params;
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
	const { documentId } = req.params;
	const result = await HigherStudyService.verifyDocument(documentId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `Document status marked as ${req.body.status}!`,
		data: result,
	});
});

const updateApplicationStage = catchAsync(
	async (req: Request, res: Response) => {
		const { applicationId } = req.params;
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
	const { applicationId } = req.params;
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
	const { applicationId } = req.params;
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
	const { applicationId } = req.params;
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
	const result = await HigherStudyService.getBlogPostBySlug(req.params.slug);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Blog article retrieved successfully!",
		data: result,
	});
});

const deleteBlogPost = catchAsync(async (req: Request, res: Response) => {
	const result = await HigherStudyService.deleteBlogPost(req.params.id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: result.message,
		data: null,
	});
});

export const HigherStudyController = {
	createCountry,
	getCountries,
	createGlobalUniversity,
	updateGlobalUniversity,
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
	assignCounselor,
	addCounselorNote,
	uploadApplicationDocument,
	verifyDocument,
	updateApplicationStage,
	issueOfferLetter,
	downloadOfferLetter,
	toggleOfferLetterLock,
	createBlogPost,
	getBlogPosts,
	getBlogPostBySlug,
	deleteBlogPost,
};
