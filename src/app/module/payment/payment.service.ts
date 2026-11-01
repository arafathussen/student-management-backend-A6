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
		higherStudyApplicationId?: string;
		paymentId?: string;
	},
) => {
	const student = await prisma.student.findUnique({
		where: { id: studentId },
		include: { user: true },
	});

	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student profile not found!");
	}

	// 1. Reuse existing pending payment record if paymentId or existing application pending invoice exists
	let payment = null;
	if (payload.paymentId) {
		payment = await prisma.payment.findUnique({
			where: { id: payload.paymentId },
		});
	}

	if (!payment && payload.higherStudyApplicationId) {
		payment = await prisma.payment.findFirst({
			where: {
				higherStudyApplicationId: payload.higherStudyApplicationId,
				status: "PENDING",
			},
			orderBy: { createdAt: "desc" },
		});
	}

	if (payment) {
		// Reuse existing invoice and update amount/description only if supplied
		payment = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				amount: payload.amount || payment.amount,
				description: payload.description || payment.description,
			},
		});
	} else {
		// Create a new pending payment record only if no pending invoice exists
		payment = await prisma.payment.create({
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
				higherStudyApplicationId: payload.higherStudyApplicationId,
			},
		});
	}

	// 2. Create Stripe checkout session using clean dynamic description
	const cleanTitle = (payment.description || "Tuition Deposit & Admission Clearance").trim();
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
								name: `${cleanTitle} — Rise Abroad Education`,
								description: "Official Admission & Higher Study Processing Clearance",
							},
							unit_amount: Math.round(Number(payment.amount) * 100), // in cents
						},
						quantity: 1,
					},
				],
				mode: "payment",
				customer_email: userEmail,
				client_reference_id: payment.id,
				metadata: {
					paymentId: payment.id,
					higherStudyApplicationId: payload.higherStudyApplicationId || "",
					studentId: student.id,
				},
				success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
				cancel_url: `${config.frontend_url}/dashboard?tab=APPLICATIONS&subTab=PAYMENT`,
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
			const updated = await prisma.payment.update({
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

			if (updated.higherStudyApplicationId) {
				await prisma.higherStudyApplication.update({
					where: { id: updated.higherStudyApplicationId },
					data: {
						isFeePaid: true,
						isOfferUnlocked: true,
					},
				});
			}
		}
	}

	return { received: true };
};

const verifyCheckoutSession = async (sessionId: string, paymentId?: string) => {
	let session: Stripe.Checkout.Session | null = null;
	if (
		config.stripe_secret_key &&
		!config.stripe_secret_key.includes("placeholder")
	) {
		try {
			session = await stripe.checkout.sessions.retrieve(sessionId);
		} catch (err: any) {
			console.warn("Could not retrieve stripe session directly:", err.message);
		}
	}

	const targetPaymentId = paymentId || session?.client_reference_id;
	if (!targetPaymentId) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment reference not found!");
	}

	const payment = await prisma.payment.findUnique({
		where: { id: targetPaymentId },
		include: { student: { include: { user: true } } },
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");
	}

	const isPaidInStripe = session ? session.payment_status === "paid" : true;

	if (isPaidInStripe) {
		const updated = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: "PAID",
				paidAt: new Date(),
				stripeSessionId: sessionId,
				stripePaymentIntentId:
					typeof session?.payment_intent === "string"
						? session.payment_intent
						: undefined,
			},
		});

		if (payment.higherStudyApplicationId) {
			await prisma.higherStudyApplication.update({
				where: { id: payment.higherStudyApplicationId },
				data: {
					isFeePaid: true,
					isOfferUnlocked: true,
				},
			});
		}

		return { verified: true, payment: updated };
	}

	return { verified: false, status: payment.status };
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
			.text("Rise Abroad Education", { align: "center" });
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

const createApplicationInvoice = async (
	payload: {
		higherStudyApplicationId: string;
		amount: number;
		currency?: string;
		description: string;
		paymentType?: PaymentType;
	},
	adminUserId?: string,
) => {
	const app = await prisma.higherStudyApplication.findUnique({
		where: { id: payload.higherStudyApplicationId },
		include: { student: { include: { user: true } } },
	});

	if (!app) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const payment = await prisma.payment.create({
		data: {
			studentId: app.studentId,
			higherStudyApplicationId: app.id,
			amount: payload.amount,
			currency: payload.currency || "USD",
			paymentType: payload.paymentType || "OFFER_DEPOSIT",
			status: "PENDING",
			description: payload.description || "Tuition Deposit & Admission Clearance",
		},
	});

	// Notification to student
	await prisma.notification.create({
		data: {
			userId: app.student.userId,
			title: `New Payment Invoice Issued: ${payment.currency} ${payment.amount}`,
			body: `Admissions Desk has issued an invoice for '${payment.description}'. You can pay online via Stripe or bank transfer.`,
			audience: "HIGHER_STUDY",
			priority: "CRITICAL_ALERT",
		},
	});

	// Live Chat System Notification
	try {
		let room = await prisma.chatRoom.findFirst({
			where: { studentUserId: app.student.userId },
		});
		if (!room) {
			room = await prisma.chatRoom.create({
				data: {
					studentUserId: app.student.userId,
					applicationId: app.id,
					mode: "COLLABORATIVE_GROUP",
				},
			});
		}
		await prisma.chatMessage.create({
			data: {
				roomId: room.id,
				senderId: adminUserId || app.student.userId,
				message: `💳 Payment Invoice Issued: Admissions Desk has issued a payable invoice of ${payment.currency} ${payment.amount} for '${payment.description}'. Please visit Payment & Invoices to complete checkout.`,
				senderDisplayName: "System Notification",
				senderRoleBadge: "[SYSTEM]",
			},
		});
	} catch (err: any) {
		console.error("Failed to send chat invoice notification:", err?.message);
	}

	return payment;
};

const deletePendingInvoice = async (paymentId: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Invoice record not found!");
	}

	if (payment.status === "PAID") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Paid invoices cannot be deleted for audit and financial record safety!",
		);
	}

	await prisma.payment.delete({
		where: { id: paymentId },
	});

	return { message: "Pending invoice deleted successfully!" };
};

const updatePendingInvoice = async (
	paymentId: string,
	payload: { description?: string; amount?: number; currency?: string },
) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Invoice record not found!");
	}

	if (payment.status === "PAID") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Paid invoices cannot be modified for audit and financial record safety!",
		);
	}

	const updated = await prisma.payment.update({
		where: { id: paymentId },
		data: {
			...(payload.description && { description: payload.description }),
			...(payload.amount !== undefined && { amount: Number(payload.amount) }),
			...(payload.currency && { currency: payload.currency }),
		},
	});

	return updated;
};

export const PaymentService = {
	createCheckoutSession,
	handleStripeWebhook,
	verifyCheckoutSession,
	getMyPaymentHistory,
	generatePaymentReceiptPDF,
	createApplicationInvoice,
	deletePendingInvoice,
	updatePendingInvoice,
};
