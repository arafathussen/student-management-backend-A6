import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AcademicService } from "./academic.service";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.createDepartment(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Department created successfully!",
		data: result,
	});
});

const getDepartments = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.getDepartments();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Departments retrieved successfully!",
		data: result,
	});
});

const createSemester = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.createSemester(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Semester created successfully!",
		data: result,
	});
});

const getSemesters = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.getSemesters();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Semesters retrieved successfully!",
		data: result,
	});
});

const createCourse = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.createCourse(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Course created successfully!",
		data: result,
	});
});

const getCourses = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.getCourses(req.query);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Courses retrieved successfully!",
		meta: result.meta,
		data: result.data,
	});
});

const createSection = catchAsync(async (req: Request, res: Response) => {
	const result = await AcademicService.createSection(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Section created successfully!",
		data: result,
	});
});

const getSectionsByCourse = catchAsync(async (req: Request, res: Response) => {
	const courseId = req.params.courseId;
	const semesterId = req.query.semesterId as string | undefined;
	const result = await AcademicService.getSectionsByCourse(
		courseId,
		semesterId,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Sections retrieved successfully!",
		data: result,
	});
});

export const AcademicController = {
	createDepartment,
	getDepartments,
	createSemester,
	getSemesters,
	createCourse,
	getCourses,
	createSection,
	getSectionsByCourse,
};
