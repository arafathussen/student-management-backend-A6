import httpStatus from "http-status";
import type {
	ApplicationStatus,
	DegreeLevel,
	DocumentStatus,
	Role,
	UniversityPaymentType,
} from "../../../generated/prisma/enums";
import type { IQuery } from "../../interfaces";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

// 1. Countries
const createCountry = async (payload: {
	name: string;
	code: string;
	currency?: string;
	description?: string;
	flagUrl?: string;
}) => {
	const isExist = await prisma.country.findFirst({
		where: {
			OR: [{ name: payload.name }, { code: payload.code }],
		},
	});

	if (isExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Country with this name or code already exists!",
		);
	}

	const country = await prisma.country.create({
		data: payload,
	});

	return country;
};

const getCountries = async () => {
	const countries = await prisma.country.findMany({
		where: { isDeleted: false },
		include: {
			_count: {
				select: { universities: true },
			},
		},
		orderBy: { name: "asc" },
	});

	return countries;
};

// 2. Universities
const createGlobalUniversity = async (payload: {
	name: string;
	city: string;
	countryId: string;
	website?: string;
	logoUrl?: string;
	coverImageUrl?: string;
	description?: string;
	paymentType?: UniversityPaymentType;
	applicationFee?: number;
	offerDepositFee?: number;
}) => {
	const university = await prisma.globalUniversity.create({
		data: {
			...payload,
			paymentType: payload.paymentType || "FREE",
			applicationFee: payload.applicationFee || 0.0,
			offerDepositFee: payload.offerDepositFee || 0.0,
		},
		include: { country: true, docRequirements: true },
	});

	return university;
};

const updateGlobalUniversity = async (id: string, payload: any) => {
	const university = await prisma.globalUniversity.findUnique({ where: { id } });
	if (!university || university.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "University not found!");
	}

	const updated = await prisma.globalUniversity.update({
		where: { id },
		data: payload,
		include: { country: true, docRequirements: true },
	});

	return updated;
};

const getGlobalUniversities = async (query: IQuery) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const whereConditions: any = { isDeleted: false };

	if (query.countryId) {
		whereConditions.countryId = query.countryId;
	}

	if (query.countryName) {
		whereConditions.country = {
			name: { contains: query.countryName, mode: "insensitive" },
		};
	}

	if (query.searchTerm) {
		whereConditions.OR = [
			{ name: { contains: query.searchTerm, mode: "insensitive" } },
			{ city: { contains: query.searchTerm, mode: "insensitive" } },
		];
	}

	const [universities, total] = await Promise.all([
		prisma.globalUniversity.findMany({
			where: whereConditions,
			skip,
			take: limit,
			include: {
				country: true,
				docRequirements: true,
				_count: { select: { programs: true } },
			},
			orderBy: { name: "asc" },
		}),
		prisma.globalUniversity.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: universities,
	};
};

const getGlobalUniversityDetails = async (id: string) => {
	const university = await prisma.globalUniversity.findUnique({
		where: { id },
		include: {
			country: true,
			docRequirements: true,
			programs: { where: { isDeleted: false } },
		},
	});

	if (!university || university.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "University not found!");
	}

	return university;
};

// 3. University Dynamic Document Requirements
const addUniversityDocRequirement = async (
	universityId: string,
	payload: {
		title: string;
		description?: string;
		isRequired?: boolean;
		docType?: string;
	},
) => {
	const university = await prisma.globalUniversity.findUnique({
		where: { id: universityId },
	});

	if (!university) {
		throw new AppError(httpStatus.NOT_FOUND, "University not found!");
	}

	const requirement = await prisma.universityDocRequirement.create({
		data: {
			universityId,
			title: payload.title,
			description: payload.description,
			isRequired: payload.isRequired !== undefined ? payload.isRequired : true,
			docType: payload.docType || "PDF",
		},
	});

	return requirement;
};

const getUniversityDocRequirements = async (universityId: string) => {
	const requirements = await prisma.universityDocRequirement.findMany({
		where: { universityId },
		orderBy: { createdAt: "asc" },
	});

	return requirements;
};

const deleteUniversityDocRequirement = async (reqId: string) => {
	await prisma.universityDocRequirement.delete({
		where: { id: reqId },
	});

	return { message: "Document requirement removed successfully!" };
};

// 4. Programs
const createGlobalProgram = async (payload: {
	name: string;
	universityId: string;
	degreeLevel: DegreeLevel;
	durationYears: number;
	tuitionFee: number;
	initialDeposit: number;
	intakeSeason?: string;
	applicationDeadline?: string;
	ieltsRequirement?: number;
	academicRequirement?: string;
}) => {
	const program = await prisma.globalProgram.create({
		data: {
			...payload,
			applicationDeadline: payload.applicationDeadline
				? new Date(payload.applicationDeadline)
				: undefined,
		},
		include: { university: { include: { country: true } } },
	});

	return program;
};

const getGlobalPrograms = async (query: IQuery) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const whereConditions: any = { isDeleted: false };

	if (query.universityId) {
		whereConditions.universityId = query.universityId;
	}

	if (query.degreeLevel) {
		whereConditions.degreeLevel = query.degreeLevel as DegreeLevel;
	}

	if (query.countryId) {
		whereConditions.university = {
			countryId: query.countryId,
		};
	}

	if (query.searchTerm) {
		whereConditions.OR = [
			{ name: { contains: query.searchTerm, mode: "insensitive" } },
			{
				university: {
					name: { contains: query.searchTerm, mode: "insensitive" },
				},
			},
		];
	}

	const [programs, total] = await Promise.all([
		prisma.globalProgram.findMany({
			where: whereConditions,
			skip,
			take: limit,
			include: {
				university: { include: { country: true, docRequirements: true } },
			},
			orderBy: { tuitionFee: "asc" },
		}),
		prisma.globalProgram.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: programs,
	};
};

// 5. Applications & Document Checklist
const applyForProgram = async (studentId: string, programId: string) => {
	const program = await prisma.globalProgram.findUnique({
		where: { id: programId },
		include: {
			university: {
				include: { country: true, docRequirements: true },
			},
		},
	});

	if (!program || program.isDeleted) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Selected program is not available!",
		);
	}

	const university = program.university;
	const applicationNumber = `HS-${Date.now().toString().slice(-6)}`;

	// Is fee required upfront?
	const isFeePaid = university.paymentType === "FREE";

	const application = await prisma.$transaction(async (tx) => {
		const app = await tx.higherStudyApplication.create({
			data: {
				applicationNumber,
				studentId,
				programId,
				status: "DOCS_PENDING",
				isFeePaid,
				isOfferUnlocked: false,
			},
		});

		// Dynamic doc checklist based on university requirements
		const docRequirements = university.docRequirements;
		if (docRequirements && docRequirements.length > 0) {
			for (const req of docRequirements) {
				await tx.applicationDocument.create({
					data: {
						applicationId: app.id,
						title: req.title,
						instruction: `${req.description || "Upload document"} (${req.isRequired ? "Mandatory" : "Optional"})`,
						status: "REQUIRED",
					},
				});
			}
		} else {
			// Fallback standard checklist
			const defaultChecklists = [
				{
					title: "Passport Copy (Information Page)",
					instruction: "Upload high quality scanned copy of valid Passport (Mandatory).",
				},
				{
					title: "Academic Transcripts & Certificates",
					instruction: "Upload verified scan of educational certificates (Mandatory).",
				},
				{
					title: "English Proficiency Scorecard (IELTS / PTE / MOI)",
					instruction: `Upload official English scorecard (Required: IELTS ${program.ieltsRequirement || "5.0+"}).`,
				},
				{
					title: "Statement of Purpose (SOP)",
					instruction: "Upload your Statement of Purpose (Optional).",
				},
			];

			for (const item of defaultChecklists) {
				await tx.applicationDocument.create({
					data: {
						applicationId: app.id,
						title: item.title,
						instruction: item.instruction,
						status: "REQUIRED",
					},
				});
			}
		}

		return tx.higherStudyApplication.findUnique({
			where: { id: app.id },
			include: {
				program: { include: { university: { include: { country: true } } } },
				documents: true,
			},
		});
	});

	return application;
};

const getMyApplications = async (studentId: string) => {
	const applications = await prisma.higherStudyApplication.findMany({
		where: { studentId, isDeleted: false },
		include: {
			program: {
				include: {
					university: { include: { country: true } },
				},
			},
			documents: true,
			counselor: { include: { user: true } },
			notes: { where: { isPrivate: false }, orderBy: { createdAt: "desc" } },
		},
		orderBy: { createdAt: "desc" },
	});

	const applicationsWithProgress = applications.map((app) => {
		const totalDocs = app.documents.length;
		const uploadedDocs = app.documents.filter(
			(d) => d.status === "UPLOADED" || d.status === "VERIFIED",
		).length;
		const verifiedDocs = app.documents.filter(
			(d) => d.status === "VERIFIED",
		).length;
		const completionPercentage =
			totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;

		return {
			...app,
			totalDocs,
			uploadedDocs,
			verifiedDocs,
			completionPercentage,
		};
	});

	return applicationsWithProgress;
};

const getAllApplications = async (query: IQuery, userRole: Role, userId: string) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const whereConditions: any = { isDeleted: false };

	if (userRole === "COUNSELOR") {
		const counselor = await prisma.counselor.findUnique({ where: { userId } });
		if (counselor) {
			whereConditions.counselorId = counselor.id;
		}
	}

	if (query.status) {
		whereConditions.status = query.status as ApplicationStatus;
	}

	const [applications, total] = await Promise.all([
		prisma.higherStudyApplication.findMany({
			where: whereConditions,
			skip,
			take: limit,
			include: {
				student: { include: { user: true } },
				counselor: { include: { user: true } },
				program: { include: { university: { include: { country: true } } } },
				documents: true,
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.higherStudyApplication.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: applications,
	};
};

const assignCounselor = async (applicationId: string, counselorId: string) => {
	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: { include: { user: true } } },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const counselor = await prisma.counselor.findUnique({
		where: { id: counselorId },
		include: { user: true },
	});

	if (!counselor) {
		throw new AppError(httpStatus.NOT_FOUND, "Counselor not found!");
	}

	const updated = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: { counselorId },
		include: { counselor: { include: { user: true } } },
	});

	// Notification to student
	await prisma.notification.create({
		data: {
			userId: application.student.userId,
			title: "Counselor Assigned to Your Application",
			body: `${counselor.user.name} has been assigned as your study abroad counselor.`,
			audience: "HIGHER_STUDY",
			priority: "INFO",
		},
	});

	return updated;
};

const addCounselorNote = async (
	applicationId: string,
	counselorUserId: string,
	payload: { note: string; isPrivate?: boolean },
) => {
	const counselor = await prisma.counselor.findUnique({
		where: { userId: counselorUserId },
	});

	if (!counselor) {
		throw new AppError(httpStatus.FORBIDDEN, "Counselor profile not found!");
	}

	const note = await prisma.counselorNote.create({
		data: {
			applicationId,
			counselorId: counselor.id,
			note: payload.note,
			isPrivate: payload.isPrivate || false,
		},
		include: { counselor: { include: { user: true } } },
	});

	return note;
};

const uploadApplicationDocument = async (
	documentId: string,
	file: Express.Multer.File,
) => {
	if (!file) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Please upload a document file (PDF/Image)!",
		);
	}

	const doc = await prisma.applicationDocument.findUnique({
		where: { id: documentId },
		include: { application: true },
	});

	if (!doc) {
		throw new AppError(httpStatus.NOT_FOUND, "Document item not found!");
	}

	const isPdf = file.mimetype.includes("pdf");
	const resourceType = isPdf ? "raw" : "image";

	const uploadResult = await new Promise<any>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					resource_type: resourceType,
					folder: "university/higher_study_documents",
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				},
			)
			.end(file.buffer);
	});

	const updated = await prisma.applicationDocument.update({
		where: { id: documentId },
		data: {
			fileUrl: uploadResult.secure_url,
			filePublicId: uploadResult.public_id,
			fileType: file.mimetype,
			status: "UPLOADED",
			uploadedAt: new Date(),
		},
	});

	return updated;
};

const verifyDocument = async (
	documentId: string,
	payload: { status: DocumentStatus; adminFeedback?: string },
) => {
	const doc = await prisma.applicationDocument.findUnique({
		where: { id: documentId },
		include: {
			application: { include: { student: { include: { user: true } } } },
		},
	});

	if (!doc) {
		throw new AppError(httpStatus.NOT_FOUND, "Document item not found!");
	}

	const updated = await prisma.applicationDocument.update({
		where: { id: documentId },
		data: {
			status: payload.status,
			adminFeedback: payload.adminFeedback,
		},
	});

	if (payload.status === "REJECTED") {
		await prisma.notification.create({
			data: {
				userId: doc.application.student.userId,
				title: "Document Rejected — Re-upload Needed",
				body: `Your document '${doc.title}' was rejected. Note: ${payload.adminFeedback || "Please review requirements and re-upload."}`,
				audience: "HIGHER_STUDY",
				priority: "CRITICAL_ALERT",
			},
		});
	}

	return updated;
};

const updateApplicationStage = async (
	applicationId: string,
	status: ApplicationStatus,
) => {
	const updated = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: { status },
		include: {
			student: { include: { user: true } },
			program: { include: { university: true } },
		},
	});

	await prisma.notification.create({
		data: {
			userId: updated.student.userId,
			title: `Application Status Updated: ${status}`,
			body: `Your application #${updated.applicationNumber} status has progressed to ${status}.`,
			audience: "HIGHER_STUDY",
			priority: "INFO",
		},
	});

	return updated;
};

const issueOfferLetter = async (
	applicationId: string,
	file: Express.Multer.File,
) => {
	if (!file) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Please upload the Offer Letter file!",
		);
	}

	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			student: { include: { user: true } },
			program: { include: { university: true } },
		},
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const isPdf = file.mimetype.includes("pdf");
	const resourceType = isPdf ? "raw" : "image";

	const uploadResult = await new Promise<any>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					resource_type: resourceType,
					folder: "university/offer_letters",
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				},
			)
			.end(file.buffer);
	});

	// If university paymentType is FREE, unlock automatically; if OFFER_DEPOSIT, keep locked until payment
	const isFree = application.program.university.paymentType === "FREE";

	const updatedApp = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: {
			offerLetterUrl: uploadResult.secure_url,
			offerLetterPublicId: uploadResult.public_id,
			offerIssuedAt: new Date(),
			status: "OFFER_ISSUED",
			isOfferUnlocked: isFree,
		},
	});

	// Notification to student
	const notificationBody = isFree
		? "Your official offer letter is ready! You can download it now."
		: `Your official offer letter is ready! Please pay the deposit of $${application.program.university.offerDepositFee} USD to unlock and download your offer letter.`;

	await prisma.notification.create({
		data: {
			userId: application.student.userId,
			title: "Official Offer Letter Issued",
			body: notificationBody,
			audience: "HIGHER_STUDY",
			priority: "INFO",
		},
	});

	return updatedApp;
};

// Download Offer Letter (Check unlock permission)
const getOfferLetterDownload = async (applicationId: string, studentUserId: string) => {
	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			student: true,
			program: { include: { university: true } },
		},
	});

	if (!application || application.student.userId !== studentUserId) {
		throw new AppError(httpStatus.FORBIDDEN, "Access denied to this application!");
	}

	if (!application.offerLetterUrl) {
		throw new AppError(httpStatus.NOT_FOUND, "Offer letter has not been issued yet!");
	}

	if (!application.isOfferUnlocked) {
		throw new AppError(
			httpStatus.PAYMENT_REQUIRED,
			`Offer Letter is locked. Please pay the deposit fee of $${application.program.university.offerDepositFee} USD to unlock.`,
		);
	}

	return {
		downloadUrl: application.offerLetterUrl,
		applicationNumber: application.applicationNumber,
	};
};

const toggleOfferLetterLock = async (
	applicationId: string,
	isOfferUnlocked: boolean,
) => {
	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: true, program: { include: { university: true } } },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const updated = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: { isOfferUnlocked },
	});

	await prisma.notification.create({
		data: {
			userId: application.student.userId,
			title: isOfferUnlocked
				? "Offer Letter Unlocked"
				: "Offer Letter Lock Updated",
			body: isOfferUnlocked
				? `Your offer letter for ${application.program.university.name} is now unlocked for free download!`
				: `Your offer letter for ${application.program.university.name} is locked and requires deposit payment.`,
			audience: "HIGHER_STUDY",
			priority: "INFO",
		},
	});

	return updated;
};

// 6. Educational Blog Posts
const createBlogPost = async (
	authorId: string,
	payload: {
		title: string;
		content: string;
		bannerUrl?: string;
		category?: string;
		tags?: string[];
	},
) => {
	const slug = `${payload.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

	const post = await prisma.blogPost.create({
		data: {
			title: payload.title,
			slug,
			content: payload.content,
			bannerUrl: payload.bannerUrl,
			category: payload.category || "Study Abroad Guide",
			tags: payload.tags || [],
			authorId,
		},
		include: { author: { select: { id: true, name: true, imageUrl: true } } },
	});

	return post;
};

const getBlogPosts = async (query: IQuery) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const whereConditions: any = { isPublished: true };

	if (query.category) {
		whereConditions.category = query.category;
	}

	if (query.searchTerm) {
		whereConditions.OR = [
			{ title: { contains: query.searchTerm, mode: "insensitive" } },
			{ content: { contains: query.searchTerm, mode: "insensitive" } },
		];
	}

	const [posts, total] = await Promise.all([
		prisma.blogPost.findMany({
			where: whereConditions,
			skip,
			take: limit,
			include: {
				author: { select: { id: true, name: true, imageUrl: true } },
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.blogPost.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: posts,
	};
};

const getBlogPostBySlug = async (slug: string) => {
	const post = await prisma.blogPost.findUnique({
		where: { slug },
		include: {
			author: { select: { id: true, name: true, imageUrl: true } },
		},
	});

	if (!post) {
		throw new AppError(httpStatus.NOT_FOUND, "Blog post not found!");
	}

	return post;
};

const deleteBlogPost = async (id: string) => {
	await prisma.blogPost.delete({ where: { id } });
	return { message: "Blog post deleted successfully!" };
};

export const HigherStudyService = {
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
	getOfferLetterDownload,
	toggleOfferLetterLock,
	createBlogPost,
	getBlogPosts,
	getBlogPostBySlug,
	deleteBlogPost,
};
