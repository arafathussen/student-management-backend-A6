import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttendanceService } from "./attendance.service";

const recordSectionAttendance = catchAsync(
	async (req: Request, res: Response) => {
		const facultyId = req.user!.facultyId || req.user!.userId;
		const { sectionId, date, records } = req.body;
		const result = await AttendanceService.recordSectionAttendance(
			facultyId,
			sectionId,
			date,
			records,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Attendance recorded successfully!",
			data: result,
		});
	},
);

const getStudentAttendance = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const result = await AttendanceService.getStudentAttendance(studentId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Student attendance summary retrieved!",
		data: result,
	});
});

const getSectionAttendanceSummary = catchAsync(
	async (req: Request, res: Response) => {
		const sectionId = req.params.sectionId as string;
		const result =
			await AttendanceService.getSectionAttendanceSummary(sectionId);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Section attendance records fetched!",
			data: result,
		});
	},
);

export const AttendanceController = {
	recordSectionAttendance,
	getStudentAttendance,
	getSectionAttendanceSummary,
};
