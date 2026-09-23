import httpStatus from "http-status";
import type { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

// Departments
const createDepartment = async (payload: any) => {
	const isExist = await prisma.department.findFirst({
		where: {
			OR: [{ name: payload.name }, { code: payload.code }],
		},
	});

	if (isExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Department with this name or code already exists!",
		);
	}

	const department = await prisma.department.create({
		data: payload,
	});

	return department;
};

const getDepartments = async () => {
	const departments = await prisma.department.findMany({
		where: { isDeleted: false },
		include: {
			_count: {
				select: { courses: true, students: true, faculties: true },
			},
		},
	});
	return departments;
};

// Semesters
const createSemester = async (payload: any) => {
	const isExist = await prisma.semester.findUnique({
		where: { code: payload.code },
	});

	if (isExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Semester with this code already exists!",
		);
	}

	const semester = await prisma.semester.create({
		data: {
			...payload,
			startDate: new Date(payload.startDate),
			endDate: new Date(payload.endDate),
		},
	});

	return semester;
};

const getSemesters = async () => {
	const semesters = await prisma.semester.findMany({
		where: { isDeleted: false },
		orderBy: { startDate: "desc" },
	});
	return semesters;
};

// Courses
const createCourse = async (payload: any) => {
	const isExist = await prisma.course.findUnique({
		where: { code: payload.code },
	});

	if (isExist) {
		throw new AppError(httpStatus.CONFLICT, "Course code already exists!");
	}

	const course = await prisma.course.create({
		data: payload,
		include: { department: true, prerequisite: true },
	});

	return course;
};

const getCourses = async (query: IQuery) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy || "code";
	const sortOrder = query.sortOrder || "asc";

	const whereConditions: any = {
		isDeleted: false,
	};

	if (query.departmentId) {
		whereConditions.departmentId = query.departmentId;
	}

	if (query.searchTerm) {
		whereConditions.OR = [
			{ title: { contains: query.searchTerm, mode: "insensitive" } },
			{ code: { contains: query.searchTerm, mode: "insensitive" } },
		];
	}

	const [courses, total] = await Promise.all([
		prisma.course.findMany({
			where: whereConditions,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: {
				department: true,
				prerequisite: true,
			},
		}),
		prisma.course.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: courses,
	};
};

// Sections
const createSection = async (payload: any) => {
	const isExist = await prisma.section.findFirst({
		where: {
			courseId: payload.courseId,
			semesterId: payload.semesterId,
			sectionName: payload.sectionName,
			isDeleted: false,
		},
	});

	if (isExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This section name already exists for this course in this semester!",
		);
	}

	const capacity = payload.maxCapacity || 40;

	const section = await prisma.section.create({
		data: {
			...payload,
			maxCapacity: capacity,
			availableSeats: capacity,
		},
		include: {
			course: true,
			semester: true,
			faculty: { include: { user: true } },
		},
	});

	return section;
};

const getSectionsByCourse = async (courseId: string, semesterId?: string) => {
	const whereConditions: any = {
		courseId,
		isDeleted: false,
	};

	if (semesterId) {
		whereConditions.semesterId = semesterId;
	}

	const sections = await prisma.section.findMany({
		where: whereConditions,
		include: {
			course: true,
			semester: true,
			faculty: { include: { user: true } },
		},
	});

	return sections;
};

export const AcademicService = {
	createDepartment,
	getDepartments,
	createSemester,
	getSemesters,
	createCourse,
	getCourses,
	createSection,
	getSectionsByCourse,
};
