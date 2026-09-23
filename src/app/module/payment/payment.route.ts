import { Router } from "express";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post(
	"/create-checkout-session",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	PaymentController.createCheckoutSession,
);

router.post("/webhook", PaymentController.handleStripeWebhook);

router.get(
	"/my-history",
	checkAuth("STUDENT"),
	checkStudentScope("ACADEMIC"),
	PaymentController.getMyPaymentHistory,
);

router.get(
	"/receipt/:paymentId",
	checkAuth("STUDENT", "ADMIN", "SUPER_ADMIN"),
	PaymentController.downloadPaymentReceiptPDF,
);

export const PaymentRoutes = router;
