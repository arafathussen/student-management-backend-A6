import httpStatus from "http-status";
import type {
	CommissionStatus,
	CommissionVisibilityMode,
	Role,
} from "../../../generated/prisma/enums";
import type { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

// 1. Create Commission (Only SUPER_ADMIN)
const createCommission = async (payload: {
	studentId: string;
	referredByUserId: string;
	universityName: string;
	grossAmount: number;
	currency?: string;
	vatPercentage?: number; // e.g. 0, 2, 5, 10
	companySharePercentage?: number; // e.g. 0, 10, 15
	exchangeRateToBDT?: number; // e.g. 135 for EUR
	notes?: string;
	applicationId?: string;
}) => {
	const student = await prisma.student.findUnique({
		where: { id: payload.studentId },
		include: { user: true },
	});

	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student not found!");
	}

	const agentUser = await prisma.user.findUnique({
		where: { id: payload.referredByUserId },
		include: { counselor: true },
	});

	if (!agentUser) {
		throw new AppError(httpStatus.NOT_FOUND, "Referred agent user not found!");
	}

	const gross = Number(payload.grossAmount);
	const vatPct = Number(
		payload.vatPercentage !== undefined
			? payload.vatPercentage
			: agentUser.counselor?.defaultVatPercentage || 10.0,
	);
	const companyPct = Number(
		payload.companySharePercentage !== undefined
			? payload.companySharePercentage
			: agentUser.counselor?.defaultCompanySharePercentage || 10.0,
	);
	const fxRate = Number(payload.exchangeRateToBDT || 135.0);

	// 3-Way Split Mathematical Calculation:
	// VAT / Tax deduction
	const vatAmount = (gross * vatPct) / 100.0;
	// Company / Agency Management Share
	const companyShareAmount = (gross * companyPct) / 100.0;
	// Net payable to Counselor / Agent
	const netAmount = Math.max(0, gross - vatAmount - companyShareAmount);

	// BDT Conversions
	const netAmountBDT = netAmount * fxRate;
	const grossAmountBDT = gross * fxRate;
	const companyShareAmountBDT = companyShareAmount * fxRate;

	const commission = await prisma.agencyCommission.create({
		data: {
			studentId: payload.studentId,
			referredByUserId: payload.referredByUserId,
			universityName: payload.universityName,
			grossAmount: gross,
			currency: payload.currency || "EUR",
			vatPercentage: vatPct,
			vatAmount,
			companySharePercentage: companyPct,
			companyShareAmount,
			companyShareAmountBDT,
			netAmount,
			exchangeRateToBDT: fxRate,
			netAmountBDT,
			grossAmountBDT,
			notes: payload.notes,
			applicationId: payload.applicationId,
			status: "PENDING",
		},
		include: {
			referredByUser: { select: { id: true, name: true, email: true, role: true } },
		},
	});

	return commission;
};

// 2. Mark Commission Payout / Withdrawn (Only SUPER_ADMIN)
const updateCommissionStatus = async (
	id: string,
	status: CommissionStatus,
	notes?: string,
) => {
	const commission = await prisma.agencyCommission.findUnique({ where: { id } });
	if (!commission) {
		throw new AppError(httpStatus.NOT_FOUND, "Commission record not found!");
	}

	const updated = await prisma.agencyCommission.update({
		where: { id },
		data: {
			status,
			withdrawnAt: status === "WITHDRAWN" ? new Date() : commission.withdrawnAt,
			notes: notes || commission.notes,
		},
		include: {
			referredByUser: { select: { id: true, name: true, email: true, role: true } },
		},
	});

	return updated;
};

// 3. Assign Student Referral (Admin & Super Admin)
const assignStudentReferral = async (
	studentId: string,
	referredByUserId: string,
) => {
	const student = await prisma.student.findUnique({ where: { id: studentId } });
	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student not found!");
	}

	const agent = await prisma.user.findUnique({ where: { id: referredByUserId } });
	if (!agent) {
		throw new AppError(httpStatus.NOT_FOUND, "Agent/Counselor user not found!");
	}

	const updated = await prisma.student.update({
		where: { id: studentId },
		data: { referredByUserId },
		include: { referredByUser: { select: { id: true, name: true, role: true } } },
	});

	return updated;
};

// 4. Update Counselor Commission Visibility Mode & Default Rates (Super Admin & Admin)
const updateCounselorVisibilityMode = async (
	counselorId: string,
	payload: {
		mode: CommissionVisibilityMode;
		defaultVatPercentage?: number;
		defaultCompanySharePercentage?: number;
	},
) => {
	const counselor = await prisma.counselor.findUnique({ where: { id: counselorId } });
	if (!counselor) {
		throw new AppError(httpStatus.NOT_FOUND, "Counselor not found!");
	}

	const updated = await prisma.counselor.update({
		where: { id: counselorId },
		data: {
			commissionVisibilityMode: payload.mode,
			defaultVatPercentage:
				payload.defaultVatPercentage !== undefined
					? payload.defaultVatPercentage
					: counselor.defaultVatPercentage,
			defaultCompanySharePercentage:
				payload.defaultCompanySharePercentage !== undefined
					? payload.defaultCompanySharePercentage
					: counselor.defaultCompanySharePercentage,
		},
	});

	return updated;
};

// 5. Get My Referral Commission Ledger (Counselor / Admin)
const getMyReferralLedger = async (userRole: Role, userId: string) => {
	let visibilityMode: CommissionVisibilityMode = "FULL_BREAKDOWN";

	if (userRole === "COUNSELOR") {
		const counselor = await prisma.counselor.findUnique({ where: { userId } });
		if (counselor) {
			visibilityMode = counselor.commissionVisibilityMode;
		}
	}

	// Fetch all referred students
	const referredStudents = await prisma.student.findMany({
		where: { referredByUserId: userId, isDeleted: false },
		include: {
			user: { select: { id: true, name: true, email: true, imageUrl: true } },
			higherStudyApps: {
				include: {
					program: { include: { university: true } },
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	// Fetch all commission records for this agent
	const commissions = await prisma.agencyCommission.findMany({
		where: { referredByUserId: userId },
		orderBy: { createdAt: "desc" },
	});

	// Calculate totals
	let totalEarnedBDT = 0;
	let totalWithdrawnBDT = 0;
	let pendingBalanceBDT = 0;

	for (const comm of commissions) {
		const bdt = Number(comm.netAmountBDT);
		totalEarnedBDT += bdt;
		if (comm.status === "WITHDRAWN") {
			totalWithdrawnBDT += bdt;
		} else {
			pendingBalanceBDT += bdt;
		}
	}

	// Format commissions according to visibility mode
	let formattedCommissions: any[] = [];
	if (visibilityMode === "FULL_BREAKDOWN") {
		formattedCommissions = commissions;
	} else if (visibilityMode === "NET_ONLY") {
		formattedCommissions = commissions.map((c) => ({
			id: c.id,
			studentId: c.studentId,
			universityName: c.universityName,
			currency: c.currency,
			netAmount: c.netAmount,
			exchangeRateToBDT: c.exchangeRateToBDT,
			netAmountBDT: c.netAmountBDT,
			status: c.status,
			withdrawnAt: c.withdrawnAt,
			createdAt: c.createdAt,
		}));
	} else {
		// HIDDEN
		formattedCommissions = commissions.map((c) => ({
			id: c.id,
			studentId: c.studentId,
			universityName: c.universityName,
			status: c.status,
			createdAt: c.createdAt,
		}));
	}

	return {
		visibilityMode,
		summary:
			visibilityMode !== "HIDDEN"
				? {
						totalReferredStudents: referredStudents.length,
						totalEarnedBDT,
						totalWithdrawnBDT,
						pendingBalanceBDT,
					}
				: {
						totalReferredStudents: referredStudents.length,
						notice: "Commission financial details are hidden for this counselor account.",
					},
		commissions: formattedCommissions,
		students: referredStudents,
	};
};

// 6. Get All Agency Commissions (Super Admin Exclusive Master Report)
const getAllAgencyCommissions = async (query: IQuery) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const whereConditions: any = {};
	if (query.status) {
		whereConditions.status = query.status as CommissionStatus;
	}
	if (query.agentUserId) {
		whereConditions.referredByUserId = query.agentUserId;
	}

	const [commissions, total, allComms] = await Promise.all([
		prisma.agencyCommission.findMany({
			where: whereConditions,
			skip,
			take: limit,
			include: {
				referredByUser: { select: { id: true, name: true, email: true, role: true } },
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.agencyCommission.count({ where: whereConditions }),
		prisma.agencyCommission.findMany({
			select: {
				grossAmountBDT: true,
				vatAmount: true,
				companyShareAmountBDT: true,
				netAmountBDT: true,
				status: true,
			},
		}),
	]);

	let agencyGrossBDT = 0;
	let totalVatRetainedEUR = 0;
	let totalCompanyProfitBDT = 0;
	let totalCounselorPayoutBDT = 0;
	let totalWithdrawnBDT = 0;

	for (const c of allComms) {
		agencyGrossBDT += Number(c.grossAmountBDT);
		totalVatRetainedEUR += Number(c.vatAmount);
		totalCompanyProfitBDT += Number(c.companyShareAmountBDT);
		totalCounselorPayoutBDT += Number(c.netAmountBDT);
		if (c.status === "WITHDRAWN") {
			totalWithdrawnBDT += Number(c.netAmountBDT);
		}
	}

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		masterFinancialSummary: {
			agencyGrossBDT,
			totalVatRetainedEUR,
			totalCompanyProfitBDT,
			totalCounselorPayableBDT: totalCounselorPayoutBDT,
			totalWithdrawnBDT,
			pendingPayoutBalanceBDT: totalCounselorPayoutBDT - totalWithdrawnBDT,
		},
		data: commissions,
	};
};

export const CommissionService = {
	createCommission,
	updateCommissionStatus,
	assignStudentReferral,
	updateCounselorVisibilityMode,
	getMyReferralLedger,
	getAllAgencyCommissions,
};
