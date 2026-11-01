import { Router } from "express";
import { checkAuth, checkStudentScope } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post(
	"/create-checkout-session",
	checkAuth("STUDENT"),
	PaymentController.createCheckoutSession,
);

router.post("/webhook", PaymentController.handleStripeWebhook);

router.post(
	"/verify-session",
	checkAuth("STUDENT", "ADMIN", "SUPER_ADMIN"),
	PaymentController.verifyCheckoutSession,
);

router.get(
	"/my-history",
	checkAuth("STUDENT"),
	PaymentController.getMyPaymentHistory,
);

router.post(
	"/invoices",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	PaymentController.createApplicationInvoice,
);

router.delete(
	"/invoices/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	PaymentController.deletePendingInvoice,
);

router.patch(
	"/invoices/:id",
	checkAuth("SUPER_ADMIN", "ADMIN"),
	PaymentController.updatePendingInvoice,
);

router.get(
	"/receipt/:paymentId",
	checkAuth("STUDENT", "ADMIN", "SUPER_ADMIN"),
	PaymentController.downloadPaymentReceiptPDF,
);

export const PaymentRoutes = router;
