import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ContactService } from "./contact.service";

// 1. Get Contact Settings (Public)
const getSettings = catchAsync(async (req: Request, res: Response) => {
	const settings = await ContactService.getContactSettings();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contact settings retrieved successfully",
		data: settings,
	});
});

// 2. Update Contact Settings (Admin)
const updateSettings = catchAsync(async (req: Request, res: Response) => {
	const updated = await ContactService.updateContactSettings(req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contact settings updated successfully",
		data: updated,
	});
});

// 3. Get Support Team Members (Public or Admin with includeInactive query)
const getTeamMembers = catchAsync(async (req: Request, res: Response) => {
	const includeInactive = req.query.all === "true";
	const members = await ContactService.getSupportMembers(includeInactive);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Support team members retrieved successfully",
		data: members,
	});
});

// 4. Create Support Team Member (Admin)
const createTeamMember = catchAsync(async (req: Request, res: Response) => {
	const newMember = await ContactService.createSupportMember(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Support team member created successfully",
		data: newMember,
	});
});

// 5. Update Support Team Member (Admin)
const updateTeamMember = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const updated = await ContactService.updateSupportMember(id as string, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Support team member updated successfully",
		data: updated,
	});
});

// 6. Delete Support Team Member (Admin)
const deleteTeamMember = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await ContactService.deleteSupportMember(id as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Support team member deleted successfully",
		data: result,
	});
});

// 7. Create Contact Inquiry (Public - Student/Visitor)
const createInquiry = catchAsync(async (req: Request, res: Response) => {
	const inquiry = await ContactService.createInquiry(req.body);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Your inquiry has been submitted successfully.",
		data: inquiry,
	});
});

// 8. Get Inquiries (Admin)
const getInquiries = catchAsync(async (req: Request, res: Response) => {
	const data = await ContactService.getInquiries();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contact inquiries retrieved successfully",
		data,
	});
});

// 9. Mark Inquiry as Read (Admin)
const markInquiryRead = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const updated = await ContactService.markInquiryRead(id as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Inquiry marked as read",
		data: updated,
	});
});

// 10. Reply to Inquiry (Admin)
const replyToInquiry = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const { reply } = req.body;
	const updated = await ContactService.replyToInquiry(id as string, reply || "");
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Reply sent successfully",
		data: updated,
	});
});

// 11. Delete Inquiry (Admin)
const deleteInquiry = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await ContactService.deleteInquiry(id as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contact inquiry deleted successfully",
		data: result,
	});
});

// 12. Upload Auto-Responder High Quality Logo (Admin)
const uploadLogo = catchAsync(async (req: Request, res: Response) => {
	const result = await ContactService.uploadLogo(req.file as Express.Multer.File);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "High quality logo uploaded successfully!",
		data: result,
	});
});

export const ContactController = {
	getSettings,
	updateSettings,
	getTeamMembers,
	createTeamMember,
	updateTeamMember,
	deleteTeamMember,
	createInquiry,
	getInquiries,
	markInquiryRead,
	replyToInquiry,
	deleteInquiry,
	uploadLogo,
};

