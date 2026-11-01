import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { sendContactAutoResponderEmail } from "../../utils/emailHelper";
import { cloudinary } from "../../lib/cloudinary";

export interface IContactSettingsPayload {
	headquartersTitle?: string;
	headquartersAddress?: string;
	headquartersNote?: string;
	officeHoursTitle?: string;
	officeHoursSchedule?: string;
	officeHoursNote?: string;
	autoResponderSubject?: string;
	autoResponderSenderName?: string;
	autoResponderSenderEmail?: string;
	autoResponderWhatsAppText?: string;
	autoResponderWhatsAppNumber?: string;
	autoResponderOfficeAddress?: string;
	autoResponderHotline?: string;
	autoResponderEmail?: string;
	autoResponderHours?: string;
	autoResponderLogoUrl?: string;
	otpEmailSubject?: string;
	otpEmailHeading?: string;
	otpEmailBodyMessage?: string;
	otpEmailExpiryNote?: string;
	regOtpEmailSubject?: string;
	regOtpEmailHeading?: string;
	regOtpEmailBodyMessage?: string;
	regOtpEmailExpiryNote?: string;
	welcomeEmailSubject?: string;
	welcomeEmailHeading?: string;
	welcomeEmailMessage?: string;
	welcomeEmailBtnText?: string;
	welcomeEmailBtnUrl?: string;
}

export interface ISupportMemberPayload {
	name: string;
	role: string;
	badge?: string;
	badgeColor?: string;
	department: string;
	avatar: string;
	avatarAlt?: string;
	phone: string;
	email: string;
	whatsapp: string;
	facebook: string;
	order?: number;
	isActive?: boolean;
}

const DEFAULT_SETTINGS = {
	headquartersTitle: "Dhaka Headquarters",
	headquartersAddress:
		"Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh.",
	headquartersNote: "Direct access via Gulshan Circle 1",
	officeHoursTitle: "Office Hours & Counseling",
	officeHoursSchedule: "Saturday – Thursday: 10:00 AM – 7:00 PM",
	officeHoursNote: "Friday: Closed (Hotline & WhatsApp Active)",
	autoResponderSubject: "We Have Received Your Inquiry — Rise Abroad Education",
	autoResponderSenderName: "Rise Abroad Admissions Desk",
	autoResponderSenderEmail: "admissions@riseabroad.com",
	autoResponderWhatsAppText: "জরুরি কোনো তথ্যের প্রয়োজন হলে অথবা ২৪ ঘণ্টার মধ্যে যোগাযোগ পেতে বিলম্ব হলে, আপনি সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপে নক দিতে পারেন:",
	autoResponderWhatsAppNumber: "+880 1712-345678",
	autoResponderOfficeAddress: "Rise Abroad Education • Level 6, Navana Tower, Gulshan-1, Dhaka",
	autoResponderHotline: "+880 1712-345678",
	autoResponderEmail: "admissions@riseabroad.com",
	autoResponderHours: "Counseling Desk: Sat – Thu (10AM – 7PM)",
	autoResponderLogoUrl: "",
	otpEmailSubject: "Your Password Reset Code — Rise Abroad Education",
	otpEmailHeading: "Password Reset Verification Code",
	otpEmailBodyMessage: "We received a request to reset the password for your Rise Abroad Education account. Use the verification code below to proceed with resetting your password:",
	otpEmailExpiryNote: "This code expires in 10 minutes. For your security, do not share this code with anyone.",
	regOtpEmailSubject: "Account Verification Code — Rise Abroad Education",
	regOtpEmailHeading: "Verify Your Student Account",
	regOtpEmailBodyMessage: "Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:",
	regOtpEmailExpiryNote: "This code is valid for 10 minutes. For your security, do not share this code with anyone.",
	welcomeEmailSubject: "Welcome to Rise Abroad Education — Your Journey Begins!",
	welcomeEmailHeading: "Welcome to Rise Abroad Education",
	welcomeEmailMessage: "Thank you for registering with Rise Abroad Education. Your global higher education journey starts here! Our certified counselors and admissions desk are here to guide you to your dream university.",
	welcomeEmailBtnText: "Access Student Portal",
	welcomeEmailBtnUrl: "https://riseabroad.com/dashboard",
};

const DEFAULT_MEMBERS = [
	{
		name: "Arafat Hossain",
		role: "Founder & Chief Executive Officer",
		badge: "EXECUTIVE",
		badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
		department: "Executive Strategy & University Alliances",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
		avatarAlt: "Arafat Hossain - Founder & CEO",
		phone: "+880 1712-345678",
		whatsapp:
			"https://wa.me/8801712345678?text=Hello%20Arafat%2C%20I%20would%20like%20to%20discuss%20higher%20study%20admissions.",
		facebook: "https://facebook.com/riseabroad",
		email: "ceo@riseabroad.com",
		order: 1,
		isActive: true,
	},
	{
		name: "Dr. Tariqul Islam",
		role: "Head of Global Admissions",
		badge: "ADMISSIONS",
		badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
		department: "Direct University Offers & Partner Relations",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
		avatarAlt: "Dr. Tariqul Islam - Head of Global Admissions",
		phone: "+880 1823-456789",
		whatsapp:
			"https://wa.me/8801823456789?text=Hello%20Admissions%20Team%2C%20I%20need%20assistance%20with%20my%20university%20offer.",
		facebook: "https://facebook.com/riseabroad",
		email: "admissions@riseabroad.com",
		order: 2,
		isActive: true,
	},
	{
		name: "Nusrat Jahan",
		role: "Lead Visa & Scholarship Counselor",
		badge: "VISA DESK",
		badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
		department: "Embassy Interviews, SOP Review & Visas",
		avatar:
			"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
		avatarAlt: "Nusrat Jahan - Lead Visa & Scholarship Counselor",
		phone: "+880 1934-567890",
		whatsapp:
			"https://wa.me/8801934567890?text=Hello%20Nusrat%2C%20I%20have%20questions%20about%20my%20visa%20interview.",
		facebook: "https://facebook.com/riseabroad",
		email: "counseling@riseabroad.com",
		order: 3,
		isActive: true,
	},
	{
		name: "24/7 Student Hotline & Support",
		role: "Customer Care & Help Center",
		badge: "24/7 HOTLINE",
		badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
		department: "Instant Student Support & Document Guidance",
		avatar:
			"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
		avatarAlt: "24/7 Student Hotline & Support Desk",
		phone: "+880 9612-000000",
		whatsapp:
			"https://wa.me/8809612000000?text=Hello%20Support%2C%20I%20need%20urgent%20admission%20assistance.",
		facebook: "https://facebook.com/riseabroad",
		email: "support@riseabroad.com",
		order: 4,
		isActive: true,
	},
];

// 1. Get Contact Settings (with auto-seed if empty)
const getContactSettings = async () => {
	let settings = await prisma.contactPageSetting.findFirst();
	if (!settings) {
		settings = await prisma.contactPageSetting.create({
			data: DEFAULT_SETTINGS,
		});
	}
	return settings;
};

// 2. Update Contact Settings (Admin)
const updateContactSettings = async (payload: IContactSettingsPayload) => {
	let settings = await prisma.contactPageSetting.findFirst();
	if (!settings) {
		settings = await prisma.contactPageSetting.create({
			data: {
				...DEFAULT_SETTINGS,
				...payload,
			},
		});
	} else {
		settings = await prisma.contactPageSetting.update({
			where: { id: settings.id },
			data: payload,
		});
	}
	return settings;
};

// 3. Get All Support Team Members (with auto-seed if empty)
const getSupportMembers = async (includeInactive = false) => {
	const count = await prisma.supportTeamMember.count();
	if (count === 0) {
		await prisma.supportTeamMember.createMany({
			data: DEFAULT_MEMBERS,
		});
	}

	const whereCondition = includeInactive ? {} : { isActive: true };
	const members = await prisma.supportTeamMember.findMany({
		where: whereCondition,
		orderBy: [{ order: "asc" }, { createdAt: "asc" }],
	});
	return members;
};

// 4. Create Support Team Member (Admin)
const createSupportMember = async (payload: ISupportMemberPayload) => {
	if (!payload.name || !payload.role || !payload.department) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Name, Role, and Department are required",
		);
	}

	const newMember = await prisma.supportTeamMember.create({
		data: {
			name: payload.name,
			role: payload.role,
			badge: payload.badge || "SUPPORT",
			badgeColor:
				payload.badgeColor ||
				"bg-blue-500/10 text-blue-400 border-blue-500/30",
			department: payload.department,
			avatar:
				payload.avatar ||
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
			avatarAlt: payload.avatarAlt || `${payload.name} - ${payload.role}`,
			phone: payload.phone || "",
			email: payload.email || "",
			whatsapp: payload.whatsapp || "",
			facebook: payload.facebook || "https://facebook.com/riseabroad",
			order: payload.order ?? 0,
			isActive: payload.isActive ?? true,
		},
	});

	return newMember;
};

// 5. Update Support Team Member (Admin)
const updateSupportMember = async (
	id: string,
	payload: Partial<ISupportMemberPayload>,
) => {
	const member = await prisma.supportTeamMember.findUnique({
		where: { id },
	});
	if (!member) {
		throw new AppError(httpStatus.NOT_FOUND, "Support member not found");
	}

	const updated = await prisma.supportTeamMember.update({
		where: { id },
		data: payload,
	});
	return updated;
};

// 6. Delete Support Team Member (Admin)
const deleteSupportMember = async (id: string) => {
	const member = await prisma.supportTeamMember.findUnique({
		where: { id },
	});
	if (!member) {
		throw new AppError(httpStatus.NOT_FOUND, "Support member not found");
	}

	await prisma.supportTeamMember.delete({
		where: { id },
	});
	return { id, message: "Member deleted successfully" };
};

export interface ICreateInquiryPayload {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
	country?: string;
}

// 7. Create Contact Inquiry (Public)
const createInquiry = async (payload: ICreateInquiryPayload) => {
	if (!payload.name || !payload.email || !payload.subject || !payload.message) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Name, email, subject, and message are required.",
		);
	}
	const inquiry = await prisma.contactInquiry.create({
		data: {
			name: payload.name.trim(),
			email: payload.email.trim().toLowerCase(),
			phone: payload.phone?.trim() || null,
			subject: payload.subject.trim(),
			message: payload.message.trim(),
			country: payload.country?.trim() || "Bangladesh",
			status: "UNREAD",
			isRead: false,
		},
	});

	// Trigger automated confirmation email (Auto-Responder)
	try {
		const settings = await prisma.contactPageSetting.findFirst();
		sendContactAutoResponderEmail(inquiry.email, inquiry.name, settings);
	} catch (e) {
		console.log("[Auto-Responder] Email dispatch error:", e);
	}

	return inquiry;
};

// 8. Get All Contact Inquiries (Admin)
const getInquiries = async () => {
	const inquiries = await prisma.contactInquiry.findMany({
		orderBy: { createdAt: "desc" },
	});
	const unreadCount = inquiries.filter((inq) => !inq.isRead).length;
	return { inquiries, unreadCount };
};

// 9. Mark Inquiry as Read (Admin)
const markInquiryRead = async (id: string) => {
	const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
	if (!inquiry) {
		throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
	}
	return await prisma.contactInquiry.update({
		where: { id },
		data: {
			isRead: true,
			status: inquiry.status === "UNREAD" ? "READ" : inquiry.status,
		},
	});
};

// 10. Reply to Inquiry (Admin)
const replyToInquiry = async (id: string, replyMessage: string) => {
	const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
	if (!inquiry) {
		throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
	}
	return await prisma.contactInquiry.update({
		where: { id },
		data: {
			reply: replyMessage,
			repliedAt: new Date(),
			status: "REPLIED",
			isRead: true,
		},
	});
};

// 11. Delete Inquiry (Admin)
const deleteInquiry = async (id: string) => {
	const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
	if (!inquiry) {
		throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
	}
	await prisma.contactInquiry.delete({ where: { id } });
	return { id, message: "Inquiry deleted successfully" };
};

// 12. Upload Auto-Responder High Quality Logo (Admin)
const uploadLogo = async (file: Express.Multer.File) => {
	if (!file) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Please upload an image file (PNG/JPEG)!",
		);
	}
	const uploadResult = await new Promise<any>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: "rise_abroad/brand",
					transformation: [{ quality: "auto:best" }],
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				},
			)
			.end(file.buffer);
	});

	const settings = await prisma.contactPageSetting.findFirst();
	if (settings) {
		await prisma.contactPageSetting.update({
			where: { id: settings.id },
			data: { autoResponderLogoUrl: uploadResult.secure_url },
		});
	}

	return {
		url: uploadResult.secure_url,
		publicId: uploadResult.public_id,
	};
};

export const ContactService = {
	getContactSettings,
	updateContactSettings,
	getSupportMembers,
	createSupportMember,
	updateSupportMember,
	deleteSupportMember,
	createInquiry,
	getInquiries,
	markInquiryRead,
	replyToInquiry,
	deleteInquiry,
	uploadLogo,
};

