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
import PDFDocument from "pdfkit";
import { PDFDocument as PDFLibDoc } from "pdf-lib";
import { ChecklistPresetService } from "./checklist-preset.service";

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

export const extractCloudinaryPublicId = (url?: string): string | null => {
	if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return null;
	try {
		const parts = url.split("/upload/");
		if (parts.length < 2) return null;
		let remaining = parts[1];
		remaining = remaining.replace(/^v\d+\//, "");
		const lastDotIndex = remaining.lastIndexOf(".");
		if (lastDotIndex !== -1) {
			remaining = remaining.substring(0, lastDotIndex);
		}
		return remaining;
	} catch {
		return null;
	}
};

const uploadUniversityCover = async (file: Express.Multer.File) => {
	if (!file) {
		throw new AppError(httpStatus.BAD_REQUEST, "Please provide an image file!");
	}

	const uploadResult = await new Promise<any>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					resource_type: "image",
					folder: "university/covers",
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				},
			)
			.end(file.buffer);
	});

	return {
		url: uploadResult.secure_url,
		publicId: uploadResult.public_id,
	};
};

const deleteUniversityImage = async (payload: { publicId?: string; imageUrl?: string }) => {
	const targetPublicId = payload.publicId || extractCloudinaryPublicId(payload.imageUrl);
	if (!targetPublicId) {
		return { message: "No Cloudinary asset found to remove." };
	}

	try {
		await cloudinary.uploader.destroy(targetPublicId, { resource_type: "image" });
		return { message: "Image removed from Cloudinary successfully!" };
	} catch (err: any) {
		console.error("Failed to delete image from Cloudinary:", err);
		return { message: "Failed to delete image from Cloudinary." };
	}
};

const updateGlobalUniversity = async (id: string, payload: any) => {
	const university = await prisma.globalUniversity.findUnique({ where: { id } });
	if (!university) {
		throw new AppError(httpStatus.NOT_FOUND, "University not found!");
	}

	// If cover image is updated or cleared, destroy the old one in Cloudinary
	if (
		payload.coverImageUrl !== undefined &&
		university.coverImageUrl &&
		payload.coverImageUrl !== university.coverImageUrl
	) {
		const oldPublicId = extractCloudinaryPublicId(university.coverImageUrl);
		if (oldPublicId) {
			cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" }).catch((e) =>
				console.error("Failed to purge old university image from Cloudinary:", e),
			);
		}
	}

	const updated = await prisma.globalUniversity.update({
		where: { id },
		data: payload,
		include: { country: true, docRequirements: true },
	});

	return updated;
};

const deleteGlobalUniversity = async (id: string, hardDelete = false) => {
	const university = await prisma.globalUniversity.findUnique({ where: { id } });
	if (!university) {
		throw new AppError(httpStatus.NOT_FOUND, "University not found!");
	}

	if (hardDelete) {
		if (university.coverImageUrl) {
			const oldPublicId = extractCloudinaryPublicId(university.coverImageUrl);
			if (oldPublicId) {
				cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" }).catch((e) =>
					console.error("Failed to purge university cover from Cloudinary:", e),
				);
			}
		}
		// Clean up relations first to prevent foreign key errors
		await prisma.universityDocRequirement.deleteMany({ where: { universityId: id } });
		await prisma.globalProgram.deleteMany({ where: { universityId: id } });
		await prisma.globalUniversity.delete({ where: { id } });
		return { message: "University permanently removed!" };
	}

	const updated = await prisma.globalUniversity.update({
		where: { id },
		data: { isDeleted: true, deletedAt: new Date() },
	});
	return updated;
};

const restoreGlobalUniversity = async (id: string) => {
	const university = await prisma.globalUniversity.findUnique({ where: { id } });
	if (!university) {
		throw new AppError(httpStatus.NOT_FOUND, "University not found!");
	}

	const updated = await prisma.globalUniversity.update({
		where: { id },
		data: { isDeleted: false, deletedAt: null },
	});
	return updated;
};

const getGlobalUniversities = async (query: IQuery) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 50;
	const skip = (page - 1) * limit;

	const whereConditions: any = {};

	if (query.onlyDeleted === "true") {
		whereConditions.isDeleted = true;
	} else if (query.includeDeleted === "true") {
		// Include both active and deleted
	} else {
		whereConditions.isDeleted = false;
	}

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
				programs: { where: { isDeleted: false } },
				_count: { select: { programs: true } },
			},
			orderBy: { createdAt: "desc" },
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

const getGlobalUniversityDetails = async (idOrSlug: string) => {
	const isUuid = /^[0-9a-fA-F-]{10,}$/.test(idOrSlug);
	let university: any = null;

	if (isUuid) {
		university = await prisma.globalUniversity.findUnique({
			where: { id: idOrSlug },
			include: {
				country: true,
				docRequirements: true,
				programs: { where: { isDeleted: false } },
			},
		});
	}

	if (!university) {
		// Lookup by slugified university name
		const allUniversities = await prisma.globalUniversity.findMany({
			where: { isDeleted: false },
			include: {
				country: true,
				docRequirements: true,
				programs: { where: { isDeleted: false } },
			},
		});

		university = allUniversities.find((u) => {
			const slug = u.name
				.toLowerCase()
				.trim()
				.replace(/\s+/g, "-")
				.replace(/&/g, "-and-")
				.replace(/[^\w\-]+/g, "")
				.replace(/\-\-+/g, "-")
				.replace(/^-+/, "")
				.replace(/-+$/, "");
			return (
				slug === idOrSlug.toLowerCase() ||
				u.id === idOrSlug ||
				u.name.toLowerCase() === idOrSlug.toLowerCase()
			);
		});
	}

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
			documents: { orderBy: { createdAt: "asc" } },
			payments: { orderBy: { createdAt: "desc" } },
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
				documents: { orderBy: { createdAt: "asc" } },
				payments: { orderBy: { createdAt: "desc" } },
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

	const docBefore = await prisma.applicationDocument.findUnique({
		where: { id: documentId },
		include: { application: { include: { student: { include: { user: true } } } } },
	});

	if (!docBefore) {
		throw new AppError(httpStatus.NOT_FOUND, "Document item not found!");
	}

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

	// Trigger automated in-app Notification for Admins & Counselors
	try {
		const studentName = docBefore.application.student?.user?.name || "Student";
		await prisma.notification.create({
			data: {
				title: `Document Uploaded: ${docBefore.title}`,
				body: `${studentName} uploaded '${docBefore.title}' for Application #${docBefore.application.applicationNumber || docBefore.applicationId.slice(0, 8)}. Awaiting admissions review.`,
				audience: "HIGHER_STUDY",
				priority: "ACTION_REQUIRED",
				actionUrl: "/admin",
			},
		});
	} catch (notifErr: any) {
		console.error("Failed to create admin notification on doc upload:", notifErr?.message);
	}

	// Trigger automated Live Chat notification
	await sendChatSystemNotification(
		docBefore.application.student.userId,
		`📄 Document Submitted: Student uploaded '${docBefore.title}'. It is now under review by the Admissions Desk.`,
		docBefore.applicationId,
	);

	return updated;
};

const sendChatSystemNotification = async (
	studentUserId: string,
	message: string,
	applicationId?: string,
	senderId?: string,
) => {
	try {
		let room = await prisma.chatRoom.findFirst({
			where: {
				studentUserId,
				...(applicationId ? { applicationId } : {}),
			},
		});

		if (!room) {
			room = await prisma.chatRoom.create({
				data: {
					studentUserId,
					applicationId,
					mode: "COLLABORATIVE_GROUP",
				},
			});
		}

		await prisma.chatMessage.create({
			data: {
				roomId: room.id,
				senderId: senderId || studentUserId,
				message,
				senderDisplayName: "System Notification",
				senderRoleBadge: "[SYSTEM]",
			},
		});
	} catch (err: any) {
		console.error("Failed to send chat system message:", err?.message);
	}
};

const verifyDocument = async (
	documentId: string,
	payload: { status: DocumentStatus; adminFeedback?: string },
	adminUserId?: string,
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

	if (payload.status === "VERIFIED") {
		await prisma.notification.create({
			data: {
				userId: doc.application.student.userId,
				title: "Document Verified & Approved",
				body: `Your document '${doc.title}' has been verified and cleared by the Admissions Desk.`,
				audience: "HIGHER_STUDY",
				priority: "INFO",
			},
		});

		await sendChatSystemNotification(
			doc.application.student.userId,
			`✔️ Document Verified: Admissions Desk has approved your '${doc.title}'.`,
			doc.applicationId,
			adminUserId,
		);
	} else if (payload.status === "REJECTED") {
		await prisma.notification.create({
			data: {
				userId: doc.application.student.userId,
				title: "Document Rejected — Re-upload Needed",
				body: `Your document '${doc.title}' was rejected. Note: ${payload.adminFeedback || "Please review requirements and re-upload."}`,
				audience: "HIGHER_STUDY",
				priority: "CRITICAL_ALERT",
			},
		});

		await sendChatSystemNotification(
			doc.application.student.userId,
			`⚠️ Document Action Needed: Admissions Desk requested re-upload for '${doc.title}'. Note: ${payload.adminFeedback || "Please upload a clear scanned original."}`,
			doc.applicationId,
			adminUserId,
		);
	}

	return updated;
};

const addCustomDocument = async (
	applicationId: string,
	payload: { title: string; instruction?: string },
	adminUserId?: string,
) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: { include: { user: true } } },
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const doc = await prisma.applicationDocument.create({
		data: {
			applicationId,
			title: payload.title,
			instruction: payload.instruction || "Official scanned document required for university verification.",
			status: "REQUIRED",
			isCustom: true,
		},
	});

	await prisma.notification.create({
		data: {
			userId: app.student.userId,
			title: `New Requirement: ${payload.title}`,
			body: `Admissions Desk added '${payload.title}' to your checklist. Note: ${payload.instruction || "Upload requested document."}`,
			audience: "HIGHER_STUDY",
			priority: "ACTION_REQUIRED",
		},
	});

	await sendChatSystemNotification(
		app.student.userId,
		`📋 New Document Requirement: Admissions Desk has added '${payload.title}' to your application checklist. ${payload.instruction ? `Note: ${payload.instruction}` : ""}`,
		app.id,
		adminUserId,
	);

	return doc;
};

const assignPresetDocuments = async (
	applicationId: string,
	presetType: "5_DOCS" | "7_DOCS" | "9_DOCS" | "CUSTOM",
	customTitles?: string[],
	adminUserId?: string,
) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			student: { include: { user: true } },
			documents: true,
		},
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const PRESET_DEFINITIONS: Record<string, { title: string; instruction: string }[]> = {
		"5_DOCS": [
			{ title: "Passport Copy (Information Page)", instruction: "Upload high-quality scanned copy of valid international Passport (Mandatory)." },
			{ title: "Academic Transcripts & Certificates", instruction: "Upload verified scanned copies of official degree/marksheets (Mandatory)." },
			{ title: "English Language Proficiency (IELTS / PTE / MOI)", instruction: "Upload valid English language test scorecard or Medium of Instruction (MOI) certificate." },
			{ title: "Statement of Purpose (SOP)", instruction: "Upload your personal statement detailing motivation and academic goals." },
			{ title: "Letters of Recommendation (LOR - 2 Copies)", instruction: "Upload 2 recommendation letters from academic professors or employers." },
		],
		"7_DOCS": [
			{ title: "Passport Copy (Information Page)", instruction: "Upload high-quality scanned copy of valid international Passport (Mandatory)." },
			{ title: "Academic Transcripts & Certificates", instruction: "Upload verified scanned copies of official degree/marksheets (Mandatory)." },
			{ title: "English Language Proficiency (IELTS / PTE / MOI)", instruction: "Upload valid English language test scorecard or Medium of Instruction (MOI) certificate." },
			{ title: "Statement of Purpose (SOP)", instruction: "Upload your personal statement detailing motivation and academic goals." },
			{ title: "Letters of Recommendation (LOR - 2 Copies)", instruction: "Upload 2 recommendation letters from academic professors or employers." },
			{ title: "Bank Solvency Certificate & 6-Month Statement", instruction: "Upload official bank solvency certificate with minimum 6 months transaction history." },
			{ title: "Police Clearance Certificate (PCC)", instruction: "Upload official police verification certificate issued within last 6 months." },
		],
		"9_DOCS": [
			{ title: "Passport Copy (Information Page)", instruction: "Upload high-quality scanned copy of valid international Passport (Mandatory)." },
			{ title: "Academic Transcripts & Certificates", instruction: "Upload verified scanned copies of official degree/marksheets (Mandatory)." },
			{ title: "English Language Proficiency (IELTS / PTE / MOI)", instruction: "Upload valid English language test scorecard or Medium of Instruction (MOI) certificate." },
			{ title: "Statement of Purpose (SOP)", instruction: "Upload your personal statement detailing motivation and academic goals." },
			{ title: "Letters of Recommendation (LOR - 2 Copies)", instruction: "Upload 2 recommendation letters from academic professors or employers." },
			{ title: "Bank Solvency Certificate & 6-Month Statement", instruction: "Upload official bank solvency certificate with minimum 6 months transaction history." },
			{ title: "Police Clearance Certificate (PCC)", instruction: "Upload official police verification certificate issued within last 6 months." },
			{ title: "Medical Fitness & Vaccination Certificate", instruction: "Upload certified health examination report and TB/vaccine clearance." },
			{ title: "Updated Curriculum Vitae (CV / Resume)", instruction: "Upload detailed academic and professional resume formatted for embassy review." },
		],
	};

	let targetList = PRESET_DEFINITIONS[presetType] || [];
	if (presetType === "CUSTOM" && Array.isArray(customTitles)) {
		targetList = customTitles.map((t) => ({
			title: t,
			instruction: "Upload requested document for admissions processing (Mandatory).",
		}));
	}

	const existingTitles = new Set(app.documents.map((d) => d.title.toLowerCase().trim()));
	const createdDocs = [];

	for (const item of targetList) {
		if (!existingTitles.has(item.title.toLowerCase().trim())) {
			const newDoc = await prisma.applicationDocument.create({
				data: {
					applicationId,
					title: item.title,
					instruction: item.instruction,
					status: "REQUIRED",
					isCustom: true,
				},
			});
			createdDocs.push(newDoc);
			existingTitles.add(item.title.toLowerCase().trim());
		}
	}

	const count = app.documents.length + createdDocs.length;

	await prisma.notification.create({
		data: {
			userId: app.student.userId,
			title: `Checklist Updated: ${count} Documents Required`,
			body: `Admissions Desk assigned the ${presetType.replace("_", " ")} checklist (${count} items total). Please review and upload required documents.`,
			audience: "HIGHER_STUDY",
			priority: "ACTION_REQUIRED",
		},
	});

	await sendChatSystemNotification(
		app.student.userId,
		`📋 Checklist Assigned: Admissions Desk has assigned the ${presetType.replace("_", " ")} checklist to your file (${count} total required documents). Please review and upload remaining items.`,
		app.id,
		adminUserId,
	);

	return prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			documents: { orderBy: { createdAt: "asc" } },
			program: { include: { university: true } },
		},
	});
};

const deleteApplicationDocument = async (documentId: string) => {
	const doc = await prisma.applicationDocument.findUnique({
		where: { id: documentId },
	});

	if (!doc) {
		throw new AppError(httpStatus.NOT_FOUND, "Document not found!");
	}

	await prisma.applicationDocument.delete({
		where: { id: documentId },
	});

	return { message: "Document requirement removed successfully!" };
};

const deleteApplication = async (
	applicationId: string,
	userRole: Role,
	userId: string,
) => {
	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: { include: { user: true } } },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const updated = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return {
		message: "Application moved to trash successfully",
		data: updated,
	};
};

const getTrashApplications = async () => {
	const applications = await prisma.higherStudyApplication.findMany({
		where: { isDeleted: true },
		include: {
			student: { include: { user: true } },
			counselor: { include: { user: true } },
			program: { include: { university: { include: { country: true } } } },
			documents: { orderBy: { createdAt: "asc" } },
			payments: { orderBy: { createdAt: "desc" } },
		},
		orderBy: { deletedAt: "desc" },
	});

	const enriched = applications.map((app) => {
		const deletedDate = app.deletedAt ? new Date(app.deletedAt) : new Date(app.updatedAt);
		const daysElapsed = Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
		const daysRemaining = Math.max(0, 30 - daysElapsed);
		return {
			...app,
			daysElapsed,
			daysRemaining,
		};
	});

	return enriched;
};

const restoreApplication = async (applicationId: string) => {
	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const restored = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: {
			isDeleted: false,
			deletedAt: null,
		},
	});

	return {
		message: "Application restored from trash successfully",
		data: restored,
	};
};

const permanentDeleteApplication = async (applicationId: string) => {
	const application = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { documents: true },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	for (const doc of application.documents) {
		if (doc.filePublicId) {
			try {
				await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: "raw" });
			} catch (e) {
				console.warn("Could not destroy Cloudinary doc:", e);
			}
		}
	}

	if (application.offerLetterPublicId) {
		try {
			await cloudinary.uploader.destroy(application.offerLetterPublicId, { resource_type: "raw" });
		} catch (e) {
			console.warn("Could not destroy Cloudinary offer letter:", e);
		}
	}

	await prisma.applicationDocument.deleteMany({ where: { applicationId } });
	await prisma.counselorNote.deleteMany({ where: { applicationId } });
	await prisma.payment.deleteMany({ where: { higherStudyApplicationId: applicationId } });
	await prisma.higherStudyApplication.delete({ where: { id: applicationId } });

	return { message: "Application permanently purged from database." };
};

const emptyTrashApplications = async () => {
	const deletedApps = await prisma.higherStudyApplication.findMany({
		where: { isDeleted: true },
		include: { documents: true },
	});

	for (const app of deletedApps) {
		for (const doc of app.documents) {
			if (doc.filePublicId) {
				try {
					await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: "raw" });
				} catch (e) {}
			}
		}
		if (app.offerLetterPublicId) {
			try {
				await cloudinary.uploader.destroy(app.offerLetterPublicId, { resource_type: "raw" });
			} catch (e) {}
		}

		await prisma.applicationDocument.deleteMany({ where: { applicationId: app.id } });
		await prisma.counselorNote.deleteMany({ where: { applicationId: app.id } });
		await prisma.payment.deleteMany({ where: { higherStudyApplicationId: app.id } });
		await prisma.higherStudyApplication.delete({ where: { id: app.id } });
	}

	return {
		message: `Successfully emptied trash (${deletedApps.length} applications permanently purged).`,
		count: deletedApps.length,
	};
};

const applyPresetToApplication = async (
	applicationId: string,
	payload: {
		presetId?: string;
		items?: Array<{ title: string; instruction?: string; isRequired?: boolean }>;
	},
	adminUserId?: string,
) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			student: { include: { user: true } },
			documents: true,
		},
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	let targetItems: Array<{ title: string; instruction?: string; isRequired?: boolean }> = [];
	let presetTitle = "Checklist Bundle";

	if (payload.presetId) {
		const preset = await ChecklistPresetService.getPresetById(payload.presetId);
		targetItems = preset.items;
		presetTitle = preset.title;
	} else if (Array.isArray(payload.items) && payload.items.length > 0) {
		targetItems = payload.items;
	}

	if (targetItems.length === 0) {
		throw new AppError(httpStatus.BAD_REQUEST, "No document checklist items provided to assign!");
	}

	const existingTitles = new Set(app.documents.map((d) => d.title.toLowerCase().trim()));
	const createdDocs = [];

	for (const item of targetItems) {
		if (!existingTitles.has(item.title.toLowerCase().trim())) {
			const newDoc = await prisma.applicationDocument.create({
				data: {
					applicationId,
					title: item.title,
					instruction: item.instruction || "Official scanned document required for university verification.",
					status: "REQUIRED",
					isCustom: true,
				},
			});
			createdDocs.push(newDoc);
			existingTitles.add(item.title.toLowerCase().trim());
		}
	}

	const totalCount = app.documents.length + createdDocs.length;

	await prisma.notification.create({
		data: {
			userId: app.student.userId,
			title: `Checklist Updated: ${createdDocs.length} Requirements Added`,
			body: `Admissions Desk assigned '${presetTitle}' (${totalCount} total documents). Please upload required documents.`,
			audience: "HIGHER_STUDY",
			priority: "ACTION_REQUIRED",
		},
	});

	await sendChatSystemNotification(
		app.student.userId,
		`📋 Checklist Assigned: Admissions Desk has assigned '${presetTitle}' to your application (${createdDocs.length} new items added, ${totalCount} total required). Please review and upload remaining documents.`,
		app.id,
		adminUserId,
	);

	return prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			documents: { orderBy: { createdAt: "asc" } },
			program: { include: { university: true } },
		},
	});
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

const getApplicationById = async (id: string) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id },
		include: {
			student: { include: { user: true } },
			counselor: { include: { user: true } },
			program: { include: { university: { include: { country: true } } } },
			documents: { orderBy: { createdAt: "asc" } },
			payments: { orderBy: { createdAt: "desc" } },
			notes: { orderBy: { createdAt: "desc" } },
			internalNotes: { orderBy: { createdAt: "asc" } },
		},
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application dossier not found!");
	}

	return app;
};

const updateApplicationInformation = async (
	applicationId: string,
	payload: {
		customInformation?: any;
		appliedUniversities?: any;
		contactNumber?: string;
		address?: string;
	},
) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: true },
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application record not found!");
	}

	const updateData: any = {};
	if (payload.customInformation !== undefined) {
		updateData.customInformation = payload.customInformation;
	}
	if (payload.appliedUniversities !== undefined) {
		updateData.appliedUniversities = payload.appliedUniversities;
	}

	if (payload.contactNumber !== undefined || payload.address !== undefined) {
		await prisma.student.update({
			where: { id: app.studentId },
			data: {
				...(payload.contactNumber !== undefined ? { contactNumber: payload.contactNumber } : {}),
				...(payload.address !== undefined ? { address: payload.address } : {}),
			},
		});
		if (payload.contactNumber !== undefined) {
			await prisma.user.update({
				where: { id: app.student.userId },
				data: { contactNumber: payload.contactNumber },
			});
		}
	}

	const updated = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: updateData,
		include: {
			student: { include: { user: true } },
			counselor: { include: { user: true } },
			program: { include: { university: { include: { country: true } } } },
			documents: { orderBy: { createdAt: "asc" } },
			payments: { orderBy: { createdAt: "desc" } },
			notes: { orderBy: { createdAt: "desc" } },
			internalNotes: { orderBy: { createdAt: "asc" } },
		},
	});

	return updated;
};

const updateApplicationTracking = async (
	applicationId: string,
	payload: { trackingMilestones: any; notifyStudent?: boolean; updateMessage?: string },
) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: { include: { user: true } } },
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application record not found!");
	}

	const updated = await prisma.higherStudyApplication.update({
		where: { id: applicationId },
		data: { trackingMilestones: payload.trackingMilestones },
		include: {
			student: { include: { user: true } },
			counselor: { include: { user: true } },
			program: { include: { university: { include: { country: true } } } },
			documents: { orderBy: { createdAt: "asc" } },
			payments: { orderBy: { createdAt: "desc" } },
			notes: { orderBy: { createdAt: "desc" } },
			internalNotes: { orderBy: { createdAt: "asc" } },
		},
	});

	if (payload.notifyStudent && app.student?.user?.id) {
		await prisma.notification.create({
			data: {
				userId: app.student.user.id,
				title: "Admission Tracking Updated",
				body: payload.updateMessage || "Your higher study admission tracking has been updated.",
				audience: "HIGHER_STUDY",
				priority: "INFO",
			},
		});
	}

	return updated;
};

const addApplicationInternalNote = async (
	applicationId: string,
	userId: string,
	payload: { note: string },
) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
	}

	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: { student: { include: { user: true } } },
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application record not found!");
	}

	const internalNote = await prisma.applicationInternalNote.create({
		data: {
			applicationId,
			note: payload.note,
			authorId: user.id,
			authorName: user.name,
			authorRole: user.role,
			authorAvatar: user.imageUrl || null,
		},
	});

	// Notify other Admins & Super Admins
	try {
		const otherAdmins = await prisma.user.findMany({
			where: {
				role: { in: ["SUPER_ADMIN", "ADMIN"] },
				id: { not: user.id },
				isDeleted: false,
			},
			select: { id: true },
		});

		const studentName = app.student?.user?.name || "Student";
		for (const admin of otherAdmins) {
			await prisma.notification.create({
				data: {
					userId: admin.id,
					title: `Internal Note: ${studentName}`,
					body: `${user.name} posted: "${payload.note.slice(0, 80)}${payload.note.length > 80 ? "..." : ""}"`,
					audience: "HIGHER_STUDY",
					priority: "INFO",
				},
			});
		}
	} catch (nErr) {
		console.error("Failed to notify admins of internal note", nErr);
	}

	return internalNote;
};

const deleteApplicationInternalNote = async (
	applicationId: string,
	noteId: string,
) => {
	await prisma.applicationInternalNote.delete({
		where: { id: noteId },
	});
	return { message: "Internal note deleted successfully!" };
};

const generateApplicationDossierPDF = async (
	applicationId: string,
	options: { documentIds?: string[]; customTitle?: string } = {},
): Promise<{ buffer: Buffer; fileName: string }> => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: applicationId },
		include: {
			student: { include: { user: true } },
			program: { include: { university: { include: { country: true } } } },
			documents: true,
		},
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application record not found!");
	}

	// Order documents by requested documentIds if provided
	let docs = app.documents;
	if (Array.isArray(options.documentIds) && options.documentIds.length > 0) {
		const orderMap = new Map(options.documentIds.map((id, idx) => [id, idx]));
		docs = [...docs].sort((a, b) => {
			const aIdx = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 999;
			const bIdx = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 999;
			return aIdx - bIdx;
		});
	}

	// Include only documents that actually have an uploaded file
	const uploadedDocs = docs.filter((d) => Boolean(d.fileUrl));

	const studentName = app.student?.user?.name || (app.student as any)?.name || "Student";
	const safeStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
	const fileName = options.customTitle?.trim()
		? `${options.customTitle.trim().replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
		: `${safeStudentName}_All_Documents.pdf`;

	const mergedPdf = await PDFLibDoc.create();

	for (const d of uploadedDocs) {
		if (!d.fileUrl) continue;

		try {
			const res = await fetch(d.fileUrl);
			if (!res.ok) continue;
			const arrayBuffer = await res.arrayBuffer();
			const fileBuffer = Buffer.from(arrayBuffer);

			// Check if the uploaded file is already a PDF
			const isPdf =
				d.fileUrl.toLowerCase().endsWith(".pdf") ||
				(res.headers.get("content-type") || "").includes("pdf") ||
				fileBuffer.subarray(0, 4).toString() === "%PDF";

			if (isPdf) {
				try {
					const srcPdf = await PDFLibDoc.load(fileBuffer, { ignoreEncryption: true });
					const pageIndices = srcPdf.getPageIndices();
					const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
					for (const page of copiedPages) {
						mergedPdf.addPage(page);
					}
					continue;
				} catch (pdfErr) {
					console.error(`Failed to load external PDF for doc ${d.id}:`, pdfErr);
				}
			}

			// Embed image (JPG or PNG)
			let embeddedImage: any = null;
			const isPng =
				d.fileUrl.toLowerCase().includes(".png") ||
				fileBuffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";

			try {
				if (isPng) {
					embeddedImage = await mergedPdf.embedPng(fileBuffer);
				} else {
					embeddedImage = await mergedPdf.embedJpg(fileBuffer);
				}
			} catch (e1) {
				try {
					embeddedImage = await mergedPdf.embedPng(fileBuffer);
				} catch (e2) {
					try {
						embeddedImage = await mergedPdf.embedJpg(fileBuffer);
					} catch (e3) {
						console.error(`Could not embed image format for doc ${d.id}:`, e3);
					}
				}
			}

			if (embeddedImage) {
				const imgWidth = embeddedImage.width;
				const imgHeight = embeddedImage.height;

				const margin = 24;
				const baseWidth = 595.28; // Standard A4 width (pt)

				// Calculate target width & height keeping exact aspect ratio
				let targetWidth = baseWidth - margin * 2;
				let targetHeight = targetWidth * (imgHeight / imgWidth);

				let finalPageWidth = baseWidth;
				let finalPageHeight = targetHeight + margin * 2;

				// If it's a tall portrait image exceeding A4 max height (841.89 pt)
				if (finalPageHeight > 841.89) {
					finalPageHeight = 841.89;
					const maxContentHeight = finalPageHeight - margin * 2;
					targetWidth = maxContentHeight * (imgWidth / imgHeight);
					targetHeight = maxContentHeight;
					finalPageWidth = Math.max(baseWidth, targetWidth + margin * 2);
				}

				// Add page tailored cleanly to the image (no massive top/bottom empty space)
				const page = mergedPdf.addPage([finalPageWidth, finalPageHeight]);
				const x = (finalPageWidth - targetWidth) / 2;
				const y = (finalPageHeight - targetHeight) / 2;

				page.drawImage(embeddedImage, {
					x,
					y,
					width: targetWidth,
					height: targetHeight,
				});
			}
		} catch (err) {
			console.error(`Failed processing document ${d.id} for dossier:`, err);
		}
	}

	// Fallback page if no documents were processed
	if (mergedPdf.getPageCount() === 0) {
		mergedPdf.addPage([595.28, 841.89]);
	}

	const pdfBytes = await mergedPdf.save();
	const buffer = Buffer.from(pdfBytes);

	return { buffer, fileName };
};

export const HigherStudyService = {
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
	assignCounselor,
	addCounselorNote,
	uploadApplicationDocument,
	verifyDocument,
	addCustomDocument,
	assignPresetDocuments,
	deleteApplicationDocument,
	updateApplicationStage,
	issueOfferLetter,
	getOfferLetterDownload,
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
	applyPresetToApplication,
	generateApplicationDossierPDF,
	updateApplicationInformation,
	updateApplicationTracking,
	addApplicationInternalNote,
	deleteApplicationInternalNote,
};
