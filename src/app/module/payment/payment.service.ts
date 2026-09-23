import httpStatus from "http-status";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import type { PaymentType } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../utils/AppError";

const createCheckoutSession = async (
	studentId: string,
	userEmail: string,
	payload: {
		amount: number;
		paymentType: PaymentType;
		description?: string;
		semesterId?: string;
	},
) => {
	const student = await prisma.student.findUnique({
		where: { id: studentId },
		include: { user: true },
	});

	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student profile not found!");
	}

	// 1. Create a pending payment record
	const payment = await prisma.payment.create({
		data: {
			studentId,
			amount: payload.amount,
			currency: "USD",
			paymentType: payload.paymentType,
			status: "PENDING",
			description:
				payload.description ||
				`${payload.paymentType.replace("_", " ")} Payment`,
			semesterId: payload.semesterId,
		},
	});

	// 2. Create Stripe checkout session
	let sessionUrl = `https://checkout.stripe.com/pay/cs_test_${payment.id}`;
	let sessionId = `cs_test_${payment.id}`;

	try {
		if (
			config.stripe_secret_key &&
			!config.stripe_secret_key.includes("placeholder")
		) {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: {
								name:
									payload.description || `University ${payload.paymentType}`,
							},
							unit_amount: Math.round(payload.amount * 100), // in cents
						},
						quantity: 1,
					},
				],
				mode: "payment",
				customer_email: userEmail,
				client_reference_id: payment.id,
				success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
				cancel_url: `${config.frontend_url}/payment/cancelled?payment_id=${payment.id}`,
			});

			sessionUrl = session.url || sessionUrl;
			sessionId = session.id;
		}
	} catch (err: any) {
		console.log(
			"Stripe Session Warning (Using mock session URL for testing):",
			err.message,
		);
	}

	// 3. Update payment record with stripe session id
	await prisma.payment.update({
		where: { id: payment.id },
		data: { stripeSessionId: sessionId },
	});

	return {
		paymentId: payment.id,
		checkoutUrl: sessionUrl,
		amount: payload.amount,
		currency: "USD",
	};
};

const handleStripeWebhook = async (
	rawBody: Buffer | string,
	signature?: string,
) => {
	let event: Stripe.Event;

	try {
		if (
			signature &&
			config.stripe_webhook_secret &&
			!config.stripe_webhook_secret.includes("placeholder")
		) {
			event = stripe.webhooks.constructEvent(
				rawBody,
				signature,
				config.stripe_webhook_secret,
			);
		} else {
			// Mock parsing for direct testing
			event =
				typeof rawBody === "string"
					? JSON.parse(rawBody)
					: JSON.parse(rawBody.toString());
		}
	} catch (err: any) {
		throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const paymentId = session.client_reference_id;

		if (paymentId) {
			await prisma.payment.update({
				where: { id: paymentId },
				data: {
					status: "PAID",
					paidAt: new Date(),
					stripePaymentIntentId:
						typeof session.payment_intent === "string"
							? session.payment_intent
							: undefined,
				},
			});
		}
	}

	return { received: true };
};

const getMyPaymentHistory = async (studentId: string) => {
	const payments = await prisma.payment.findMany({
		where: { studentId },
		include: { semester: true },
		orderBy: { createdAt: "desc" },
	});

	return payments;
};

const generatePaymentReceiptPDF = async (
	paymentId: string,
): Promise<Buffer> => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: {
			student: { include: { user: true, department: true } },
			semester: true,
		},
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");
	}

	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ margin: 45 });
		const chunks: Buffer[] = [];

		doc.on("data", (chunk) => chunks.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", (err) => reject(err));

		// Header
		doc
			.fontSize(22)
			.text("OFFICIAL PAYMENT RECEIPT", { align: "center", underline: true });
		doc.moveDown(0.5);
		doc
			.fontSize(12)
			.text("Global University & Higher Study Portal", { align: "center" });
		doc.moveDown(1.5);

		// Receipt Info Box
		doc.fontSize(11).text(`Receipt No: ${payment.id}`);
		doc.text(
			`Payment Date: ${payment.paidAt ? payment.paidAt.toLocaleDateString() : new Date().toLocaleDateString()}`,
		);
		doc.text(`Payment Status: ${payment.status}`);
		doc.text(`Payment Type: ${payment.paymentType.replace("_", " ")}`);
		doc.moveDown(1);

		doc.moveTo(45, doc.y).lineTo(565, doc.y).stroke();
		doc.moveDown(1);

		// Student Info
		doc.fontSize(12).font("Helvetica-Bold").text("Student Information:");
		doc.font("Helvetica").fontSize(11);
		doc.text(`Name: ${payment.student.user.name}`);
		doc.text(`Student ID: ${payment.student.studentId}`);
		doc.text(`Email: ${payment.student.user.email}`);
		doc.text(`Department: ${payment.student.department?.name || "General"}`);
		doc.moveDown(1);

		doc.moveTo(45, doc.y).lineTo(565, doc.y).stroke();
		doc.moveDown(1);

		// Payment Breakdown
		doc.fontSize(12).font("Helvetica-Bold").text("Payment Breakdown:");
		doc.font("Helvetica").fontSize(11);
		doc.text(`Description: ${payment.description || "University Tuition Fee"}`);
		if (payment.semester) {
			doc.text(`Semester: ${payment.semester.name}`);
		}
		doc.moveDown(1);

		doc
			.fontSize(14)
			.font("Helvetica-Bold")
			.text(`Total Amount Paid: $${payment.amount} ${payment.currency}`, {
				align: "right",
			});

		doc.moveDown(3);
		doc
			.fontSize(10)
			.font("Helvetica-Oblique")
			.text(
				"This is an electronically generated official receipt verified by Stripe.",
				{
					align: "center",
				},
			);

		doc.end();
	});
};

export const PaymentService = {
	createCheckoutSession,
	handleStripeWebhook,
	getMyPaymentHistory,
	generatePaymentReceiptPDF,
};
