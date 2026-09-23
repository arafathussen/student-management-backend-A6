import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { GradingService } from "./grading.service";

const submitCourseGrade = catchAsync(async (req: Request, res: Response) => {
	const result = await GradingService.submitCourseGrade(req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Grade submitted and published successfully!",
		data: result,
	});
});

const getStudentResults = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const result = await GradingService.getStudentResults(studentId);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Academic results and CGPA fetched successfully!",
		data: result,
	});
});

const downloadTranscriptPDF = catchAsync(
	async (req: Request, res: Response) => {
		const studentId = req.user!.studentId!;
		const pdfBuffer = await GradingService.generateTranscriptPDF(studentId);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			'attachment; filename="official_transcript.pdf"',
		);
		res.send(pdfBuffer);
	},
);

export const GradingController = {
	submitCourseGrade,
	getStudentResults,
	downloadTranscriptPDF,
};
