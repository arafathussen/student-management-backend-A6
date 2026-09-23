import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CommissionService } from "./commission.service";

const createCommission = catchAsync(async (req: Request, res: Response) => {
	const result = await CommissionService.createCommission(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Agency commission calculated and created successfully!",
		data: result,
	});
});

const updateCommissionStatus = catchAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const { status, notes } = req.body;
		const result = await CommissionService.updateCommissionStatus(
			id,
			status,
			notes,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: `Commission status updated to ${status}!`,
			data: result,
		});
	},
);

const assignStudentReferral = catchAsync(
	async (req: Request, res: Response) => {
		const studentId = req.params.studentId as string;
		const { referredByUserId } = req.body;
		const result = await CommissionService.assignStudentReferral(
			studentId,
			referredByUserId,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Student referral assigned successfully!",
			data: result,
		});
	},
);

const toggleCounselorCommissionVisibility = catchAsync(
	async (req: Request, res: Response) => {
		const counselorId = req.params.counselorId as string;
		const mode =
			req.body.mode ||
			req.body.visibilityMode ||
			(req.body.canViewCommission === false ? "HIDDEN" : "FULL_BREAKDOWN");
		const result = await CommissionService.updateCounselorVisibilityMode(
			counselorId,
			{
				mode,
				defaultVatPercentage: req.body.defaultVatPercentage,
				defaultCompanySharePercentage: req.body.defaultCompanySharePercentage,
			},
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: `Counselor commission visibility mode set to ${mode}!`,
			data: result,
		});
	},
);

const getMyReferralLedger = catchAsync(async (req: Request, res: Response) => {
	const userRole = req.user!.role;
	const userId = req.user!.userId;
	const result = await CommissionService.getMyReferralLedger(userRole, userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Referral commission ledger retrieved!",
		data: result,
	});
});

const getAllAgencyCommissions = catchAsync(
	async (req: Request, res: Response) => {
		const result = await CommissionService.getAllAgencyCommissions(req.query);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "All agency commissions and master financial summary fetched!",
			meta: result.meta,
			data: {
				masterFinancialSummary: result.masterFinancialSummary,
				commissions: result.data,
			},
		});
	},
);

export const CommissionController = {
	createCommission,
	updateCommissionStatus,
	assignStudentReferral,
	toggleCounselorCommissionVisibility,
	getMyReferralLedger,
	getAllAgencyCommissions,
};
