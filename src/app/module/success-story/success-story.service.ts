import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { logActivity } from "../../utils/activityLogger";

export interface ISuccessStoryPayload {
	slug?: string;
	studentName: string;
	photoUrl?: string;
	thumbnailUrl?: string;
	homeInstitution: string;
	hometown?: string;
	country: string;
	universityName: string;
	degreeName: string;
	intake?: string;
	visaDate?: string;
	youtubeUrl?: string;
	testimonial?: string;
	storyContent: string;
	scholarshipNote?: string;
	isPublished?: boolean;
}

const toSlug = (text: string) => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

const generateUniqueSlug = async (studentName: string, excludeId?: string) => {
	const base = toSlug(studentName) || "student";
	const totalCount = await prisma.studentSuccessStory.count({
		where: { isDeleted: false },
	});
	
	let seq = totalCount + 1;
	let serialStr = seq.toString().padStart(2, "0");
	let candidate = `${base}-${serialStr}`;

	while (true) {
		const existing = await prisma.studentSuccessStory.findFirst({
			where: {
				slug: candidate,
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});
		if (!existing) break;
		seq++;
		serialStr = seq.toString().padStart(2, "0");
		candidate = `${base}-${serialStr}`;
	}

	return candidate;
};

const backfillMissingSlugs = async () => {
	try {
		const missing = await prisma.studentSuccessStory.findMany({
			where: { slug: null },
			orderBy: { createdAt: "asc" },
		});
		if (missing.length === 0) return;

		for (let i = 0; i < missing.length; i++) {
			const item = missing[i];
			const serialStr = (i + 1).toString().padStart(2, "0");
			const base = toSlug(item.studentName) || "student";
			const slug = `${base}-${serialStr}`;
			await prisma.studentSuccessStory.update({
				where: { id: item.id },
				data: { slug },
			});
		}
	} catch (e) {
		console.error("Failed to backfill slugs", e);
	}
};

const createSuccessStory = async (
	user: { id: string; name?: string; email?: string; role: string },
	payload: ISuccessStoryPayload,
) => {
	let slug = payload.slug?.trim() ? toSlug(payload.slug.trim()) : "";
	if (slug) {
		const conflict = await prisma.studentSuccessStory.findFirst({
			where: { slug, isDeleted: false },
		});
		if (conflict) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`The custom slug "${slug}" is already in use by another story! Please choose another serial or slug.`
			);
		}
	} else {
		slug = await generateUniqueSlug(payload.studentName);
	}

	const story = await prisma.studentSuccessStory.create({
		data: {
			slug,
			studentName: payload.studentName,
			photoUrl: payload.photoUrl || null,
			thumbnailUrl: payload.thumbnailUrl || null,
			homeInstitution: payload.homeInstitution,
			hometown: payload.hometown || null,
			country: payload.country,
			universityName: payload.universityName,
			degreeName: payload.degreeName,
			intake: payload.intake || null,
			visaDate: payload.visaDate || null,
			youtubeUrl: payload.youtubeUrl || null,
			testimonial: payload.testimonial || null,
			storyContent: payload.storyContent,
			scholarshipNote: payload.scholarshipNote || null,
			isPublished: payload.isPublished !== undefined ? payload.isPublished : true,
			createdBy: user.id,
		},
	});

	await logActivity({
		action: "CREATE",
		module: "SUCCESS_STORY",
		targetId: story.id,
		targetTitle: `${story.studentName} (${story.universityName})`,
		performedBy: user.id,
		userName: user.name,
		userEmail: user.email,
		details: `Created new success story for student ${story.studentName} destined for ${story.universityName}, ${story.country}.`,
	});

	return story;
};

const getSuccessStories = async (query: {
	page?: string | number;
	limit?: string | number;
	country?: string;
	searchTerm?: string;
}) => {
	// Auto-backfill slugs if any record is missing one
	await backfillMissingSlugs();

	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 20;
	const skip = (page - 1) * limit;

	const whereConditions: any = {
		isDeleted: false,
		isPublished: true,
	};

	if (query.country && query.country.toLowerCase() !== "all") {
		whereConditions.country = {
			contains: query.country,
			mode: "insensitive",
		};
	}

	if (query.searchTerm && query.searchTerm.trim() !== "") {
		const term = query.searchTerm.trim();
		whereConditions.OR = [
			{ studentName: { contains: term, mode: "insensitive" } },
			{ homeInstitution: { contains: term, mode: "insensitive" } },
			{ hometown: { contains: term, mode: "insensitive" } },
			{ universityName: { contains: term, mode: "insensitive" } },
			{ degreeName: { contains: term, mode: "insensitive" } },
			{ country: { contains: term, mode: "insensitive" } },
			{ intake: { contains: term, mode: "insensitive" } },
			{ scholarshipNote: { contains: term, mode: "insensitive" } },
			{ testimonial: { contains: term, mode: "insensitive" } },
			{ slug: { contains: term, mode: "insensitive" } },
		];
	}

	const [data, total] = await Promise.all([
		prisma.studentSuccessStory.findMany({
			where: whereConditions,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.studentSuccessStory.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data,
	};
};

const getDistinctCountries = async () => {
	const stories = await prisma.studentSuccessStory.findMany({
		where: { isDeleted: false, isPublished: true },
		select: { country: true, viewsCount: true },
	});

	const map: Record<string, { country: string; count: number; totalViews: number }> = {};
	for (const s of stories) {
		const c = s.country?.trim();
		if (!c) continue;
		if (!map[c]) {
			map[c] = { country: c, count: 0, totalViews: 0 };
		}
		map[c].count += 1;
		map[c].totalViews += s.viewsCount || 0;
	}

	const sorted = Object.values(map).sort((a, b) => {
		if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
		return b.count - a.count;
	});

	return sorted;
};

const getSuccessStoryById = async (idOrSlug: string) => {
	const story = await prisma.studentSuccessStory.findFirst({
		where: {
			OR: [
				{ id: idOrSlug },
				{ slug: idOrSlug }
			],
			isDeleted: false,
		},
	});

	if (!story) {
		throw new AppError(httpStatus.NOT_FOUND, "Success story not found!");
	}

	// Increment view count asynchronously
	prisma.studentSuccessStory
		.update({
			where: { id: story.id },
			data: { viewsCount: { increment: 1 } },
		})
		.catch(() => {});

	return story;
};

const updateSuccessStory = async (
	id: string,
	user: { id: string; name?: string; email?: string; role: string },
	payload: Partial<ISuccessStoryPayload>,
) => {
	const existing = await prisma.studentSuccessStory.findUnique({
		where: { id },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Success story not found!");
	}

	const changes: string[] = [];
	if (payload.studentName && payload.studentName !== existing.studentName) {
		changes.push(`Student name changed from "${existing.studentName}" to "${payload.studentName}"`);
	}
	if (payload.photoUrl && payload.photoUrl !== existing.photoUrl) {
		changes.push(`Photo URL updated by admin`);
	}
	if (payload.youtubeUrl && payload.youtubeUrl !== existing.youtubeUrl) {
		changes.push(`YouTube video link updated`);
	}
	if (payload.universityName && payload.universityName !== existing.universityName) {
		changes.push(`University changed to "${payload.universityName}"`);
	}

	let slug = payload.slug?.trim() ? toSlug(payload.slug.trim()) : existing.slug;
	if (payload.slug && payload.slug.trim() !== existing.slug) {
		const conflict = await prisma.studentSuccessStory.findFirst({
			where: { slug, id: { not: id }, isDeleted: false },
		});
		if (conflict) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`The custom slug "${slug}" is already in use by another story! Please choose another serial or slug.`
			);
		}
	} else if (!slug && (payload.studentName || existing.studentName)) {
		slug = await generateUniqueSlug(payload.studentName || existing.studentName, id);
	}

	const updated = await prisma.studentSuccessStory.update({
		where: { id },
		data: {
			...payload,
			slug,
			updatedAt: new Date(),
		},
	});

	await logActivity({
		action: "UPDATE",
		module: "SUCCESS_STORY",
		targetId: updated.id,
		targetTitle: `${updated.studentName} (${updated.universityName})`,
		performedBy: user.id,
		userName: user.name,
		userEmail: user.email,
		details: changes.length > 0 ? changes.join(", ") : "Updated story content and parameters.",
	});

	return updated;
};

const trashSuccessStory = async (
	id: string,
	user: { id: string; name?: string; email?: string; role: string },
) => {
	const existing = await prisma.studentSuccessStory.findUnique({
		where: { id },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Success story not found!");
	}

	const trashed = await prisma.studentSuccessStory.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	await logActivity({
		action: "TRASH",
		module: "SUCCESS_STORY",
		targetId: existing.id,
		targetTitle: `${existing.studentName} (${existing.universityName})`,
		performedBy: user.id,
		userName: user.name,
		userEmail: user.email,
		details: `Moved success story of ${existing.studentName} to Trash.`,
	});

	return {
		message: "Success story moved to Trash successfully!",
		data: trashed,
	};
};

const restoreSuccessStory = async (
	id: string,
	user: { id: string; name?: string; email?: string; role: string },
) => {
	const existing = await prisma.studentSuccessStory.findUnique({
		where: { id },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Success story not found!");
	}

	const restored = await prisma.studentSuccessStory.update({
		where: { id },
		data: {
			isDeleted: false,
			deletedAt: null,
		},
	});

	await logActivity({
		action: "RESTORE",
		module: "SUCCESS_STORY",
		targetId: existing.id,
		targetTitle: `${existing.studentName} (${existing.universityName})`,
		performedBy: user.id,
		userName: user.name,
		userEmail: user.email,
		details: `Restored success story of ${existing.studentName} from Trash to Live.`,
	});

	return {
		message: "Success story restored from Trash successfully!",
		data: restored,
	};
};

const getTrashedSuccessStories = async () => {
	const trashed = await prisma.studentSuccessStory.findMany({
		where: { isDeleted: true },
		orderBy: { deletedAt: "desc" },
	});

	return trashed;
};

const getActivityLogs = async (query: { limit?: string | number; module?: string }) => {
	const limit = Number(query.limit) || 50;
	const whereConditions: any = {};
	if (query.module) {
		whereConditions.module = query.module;
	}

	const logs = await prisma.activityLog.findMany({
		where: whereConditions,
		take: limit,
		orderBy: { createdAt: "desc" },
	});

	return logs;
};

export interface ISuccessPageSettingsPayload {
	badgeText?: string;
	titlePart1?: string;
	titlePart2?: string;
	description?: string;
	stat1Value?: string;
	stat1Label?: string;
	stat2Value?: string;
	stat2Label?: string;
	stat3Value?: string;
	stat3Label?: string;
	stat4Value?: string;
	stat4Label?: string;
}

const DEFAULT_SUCCESS_PAGE_SETTINGS = {
	badgeText: "Real Students • Real Visas • Proven Results",
	titlePart1: "Student",
	titlePart2: "Success Stories",
	description:
		"Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education.",
	stat1Value: "98.4%",
	stat1Label: "Visa Success Rate",
	stat2Value: "1,250+",
	stat2Label: "Visas Approved",
	stat3Value: "50%+",
	stat3Label: "Average Scholarship",
	stat4Value: "15+",
	stat4Label: "Study Destinations",
};

const getSuccessPageSettings = async () => {
	let settings = await prisma.successPageSetting.findFirst();
	if (!settings) {
		settings = await prisma.successPageSetting.create({
			data: DEFAULT_SUCCESS_PAGE_SETTINGS,
		});
	}
	return settings;
};

const updateSuccessPageSettings = async (payload: ISuccessPageSettingsPayload) => {
	let settings = await prisma.successPageSetting.findFirst();
	if (!settings) {
		settings = await prisma.successPageSetting.create({
			data: {
				...DEFAULT_SUCCESS_PAGE_SETTINGS,
				...payload,
			},
		});
	} else {
		settings = await prisma.successPageSetting.update({
			where: { id: settings.id },
			data: payload,
		});
	}
	return settings;
};

export const SuccessStoryService = {
	createSuccessStory,
	getSuccessStories,
	getSuccessStoryById,
	updateSuccessStory,
	trashSuccessStory,
	restoreSuccessStory,
	getTrashedSuccessStories,
	getActivityLogs,
	getDistinctCountries,
	getSuccessPageSettings,
	updateSuccessPageSettings,
};
