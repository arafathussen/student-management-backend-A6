import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { CommissionController } from "./commission.controller";

const router = Router();

// Super Admin Only Operations
router.post(
	"/",
	checkAuth("SUPER_ADMIN"),
	CommissionController.createCommission,
);

router.patch(
	"/:id/status",
	checkAuth("SUPER_ADMIN"),
	CommissionController.updateCommissionStatus,
);

router.get(
	"/all-ledger",
	checkAuth("SUPER_ADMIN"),
	CommissionController.getAllAgencyCommissions,
);

// Admin & Super Admin Operations
router.patch(
	"/referral/:studentId",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	CommissionController.assignStudentReferral,
);

router.patch(
	"/counselor/:counselorId/visibility",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	CommissionController.toggleCounselorCommissionVisibility,
);

// Counselor & Admin Own Earnings & Referral Ledger
router.get(
	"/my-ledger",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
	CommissionController.getMyReferralLedger,
);

export const CommissionRoutes = router;
