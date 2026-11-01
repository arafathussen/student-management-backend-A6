import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
	async (req: Request, res: Response) => {
		const studentId = req.user!.studentId!;
		const userEmail = req.user!.email;
		const result = await PaymentService.createCheckoutSession(
			studentId,
			userEmail,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Stripe checkout session initialized!",
			data: result,
		});
	},
);

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
	const sig = req.headers["stripe-signature"] as string | undefined;
	const result = await PaymentService.handleStripeWebhook(req.body, sig);

	res.status(httpStatus.OK).json(result);
});

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
	const studentId = req.user!.studentId!;
	const result = await PaymentService.getMyPaymentHistory(studentId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment history fetched successfully!",
		data: result,
	});
});

const downloadPaymentReceiptPDF = catchAsync(
	async (req: Request, res: Response) => {
		const paymentId = req.params.paymentId as string;
		const pdfBuffer = await PaymentService.generatePaymentReceiptPDF(paymentId);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`inline; filename="receipt_${paymentId}.pdf"`,
		);
		res.setHeader("Content-Length", pdfBuffer.length);
		res.end(pdfBuffer);
	},
);

const verifyCheckoutSession = catchAsync(async (req: Request, res: Response) => {
	const { sessionId, paymentId } = req.body;
	const result = await PaymentService.verifyCheckoutSession(
		sessionId,
		paymentId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Stripe payment verified successfully!",
		data: result,
	});
});

const createApplicationInvoice = catchAsync(
	async (req: Request, res: Response) => {
		const adminUserId = req.user?.userId;
		const result = await PaymentService.createApplicationInvoice(
			req.body,
			adminUserId,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Invoice created and notified successfully!",
			data: result,
		});
	},
);

const deletePendingInvoice = catchAsync(
	async (req: Request, res: Response) => {
		const paymentId = req.params.id as string;
		const result = await PaymentService.deletePendingInvoice(paymentId);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: result.message,
			data: null,
		});
	},
);

const updatePendingInvoice = catchAsync(
	async (req: Request, res: Response) => {
		const paymentId = req.params.id as string;
		const result = await PaymentService.updatePendingInvoice(paymentId, req.body);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Invoice updated successfully!",
			data: result,
		});
	},
);

export const PaymentController = {
	createCheckoutSession,
	handleStripeWebhook,
	verifyCheckoutSession,
	getMyPaymentHistory,
	downloadPaymentReceiptPDF,
	createApplicationInvoice,
	deletePendingInvoice,
	updatePendingInvoice,
};
