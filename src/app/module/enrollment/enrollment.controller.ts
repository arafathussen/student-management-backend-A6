import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { EnrollmentService } from "./enrollment.service";

const registerCourseSection = catchAsync(
	async (req: Request, res: Response) => {
		const studentId = req.user!.studentId!;
		const { sectionId } = req.body;
		const result = await EnrollmentService.registerCourseSection(
			studentId,
			sectionId,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Successfully enrolled in course section!",
			data: result,
		});
	},
);

const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const result = await EnrollmentService.getMyEnrollments(studentId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Enrolled courses fetched successfully!",
		data: result,
	});
});

const dropCourseSection = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const enrollmentId = req.params.id;
	const result = await EnrollmentService.dropCourseSection(
		studentId,
		enrollmentId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Course dropped successfully!",
		data: result,
	});
});

export const EnrollmentController = {
	registerCourseSection,
	getMyEnrollments,
	dropCourseSection,
};
