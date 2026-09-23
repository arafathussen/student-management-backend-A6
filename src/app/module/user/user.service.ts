import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import type {
	Role,
	StudentAccessScope,
	UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import type { IQuery } from "../../interfaces";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { sendPasswordResetOtpEmail } from "../../utils/emailHelper";

const getMe = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			student: true,
			counselor: true,
		},
	});

	if (!user || user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
	}

	return user;
};

const updateMe = async (userId: string, payload: any) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { student: true, counselor: true },
	});

	if (!user || user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	const result = await prisma.$transaction(async (tx) => {
		if (payload.name) {
			await tx.user.update({
				where: { id: userId },
				data: { name: payload.name },
			});
		}

		if (user.role === "STUDENT" && user.student) {
			await tx.student.update({
				where: { id: user.student.id },
				data: {
					contactNumber: payload.contactNumber,
					address: payload.address,
					gender: payload.gender,
					dateOfBirth: payload.dateOfBirth
						? new Date(payload.dateOfBirth)
						: undefined,
				},
			});
		}

		if (user.role === "COUNSELOR" && user.counselor) {
			await tx.counselor.update({
				where: { id: user.counselor.id },
				data: {
					contactNumber: payload.contactNumber,
					designation: payload.designation,
					specialization: payload.specialization,
				},
			});
		}

		return tx.user.findUnique({
			where: { id: userId },
			include: { student: true, counselor: true },
		});
	});

	return result;
};

const updateProfileImage = async (
	userId: string,
	file: Express.Multer.File,
) => {
	if (!file) {
		throw new AppError(httpStatus.BAD_REQUEST, "Please upload an image file!");
	}

	const uploadResult = await new Promise<any>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{ resource_type: "image", folder: "university/avatars" },
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				},
			)
			.end(file.buffer);
	});

	const updated = await prisma.user.update({
		where: { id: userId },
		data: {
			imageUrl: uploadResult.secure_url,
			imagePublicId: uploadResult.public_id,
		},
	});

	return updated;
};

// 1. Create Admin (Only SUPER_ADMIN)
const createAdmin = async (payload: {
	name: string;
	email: string;
	password?: string;
}) => {
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({ where: { email } });
	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User with this email already exists!");
	}

	const password = payload.password || "Admin12345!";
	const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

	const admin = await prisma.user.create({
		data: {
			name: payload.name,
			email,
			password: hashedPassword,
			role: "ADMIN",
			status: "ACTIVE",
			isEmailVerified: true,
			authProvider: "CREDENTIAL",
		},
	});

	return {
		id: admin.id,
		name: admin.name,
		email: admin.email,
		role: admin.role,
		status: admin.status,
	};
};

// 2. Delete Admin (Only SUPER_ADMIN)
const deleteAdmin = async (adminId: string) => {
	const admin = await prisma.user.findUnique({ where: { id: adminId } });
	if (!admin) {
		throw new AppError(httpStatus.NOT_FOUND, "Admin not found!");
	}

	if (admin.role === "SUPER_ADMIN") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Cannot delete the Super Admin account!",
		);
	}

	if (admin.role !== "ADMIN") {
		throw new AppError(httpStatus.BAD_REQUEST, "Target user is not an Admin!");
	}

	await prisma.user.delete({ where: { id: adminId } });

	return { message: "Admin account deleted successfully!" };
};

// 3. Create Counselor (SUPER_ADMIN or ADMIN)
const createCounselor = async (payload: {
	name: string;
	email: string;
	password?: string;
	designation?: string;
	contactNumber?: string;
	specialization?: string;
}) => {
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({ where: { email } });
	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User with this email already exists!");
	}

	const password = payload.password || "Counselor123!";
	const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

	const result = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				name: payload.name,
				email,
				password: hashedPassword,
				role: "COUNSELOR",
				status: "ACTIVE",
				isEmailVerified: true,
				authProvider: "CREDENTIAL",
			},
		});

		const counselor = await tx.counselor.create({
			data: {
				userId: user.id,
				counselorId: `CNS-${Date.now().toString().slice(-4)}`,
				designation: payload.designation || "Study Abroad Counselor",
				contactNumber: payload.contactNumber,
				specialization: payload.specialization || "Global Admissions",
			},
		});

		return { user, counselor };
	});

	return {
		id: result.user.id,
		name: result.user.name,
		email: result.user.email,
		role: result.user.role,
		counselorId: result.counselor.counselorId,
		designation: result.counselor.designation,
	};
};

// 4. Custom Create User (Only SUPER_ADMIN)
const customCreateUser = async (payload: {
	name: string;
	email: string;
	password: string;
	role: Role;
}) => {
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({ where: { email } });
	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User with this email already exists!");
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		config.bcrypt_salt_rounds,
	);

	const user = await prisma.user.create({
		data: {
			name: payload.name,
			email,
			password: hashedPassword,
			role: payload.role,
			status: "ACTIVE",
			isEmailVerified: true,
			authProvider: "CREDENTIAL",
		},
	});

	if (payload.role === "STUDENT") {
		await prisma.student.create({
			data: {
				userId: user.id,
				studentId: `STU-${Date.now().toString().slice(-4)}`,
				accessScope: "BOTH",
			},
		});
	} else if (payload.role === "COUNSELOR") {
		await prisma.counselor.create({
			data: {
				userId: user.id,
				counselorId: `CNS-${Date.now().toString().slice(-4)}`,
				designation: "Study Abroad Counselor",
			},
		});
	}

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		status: user.status,
	};
};

// 5. Admin Reset User Password
const adminResetUserPassword = async (
	requesterRole: Role,
	payload: {
		userId: string;
		newPassword?: string;
		sendResetEmail?: boolean;
	},
) => {
	const targetUser = await prisma.user.findUnique({
		where: { id: payload.userId },
	});

	if (!targetUser) {
		throw new AppError(httpStatus.NOT_FOUND, "Target user not found!");
	}

	// Normal Admin cannot reset Super Admin or other Admins
	if (requesterRole === "ADMIN") {
		if (targetUser.role === "SUPER_ADMIN" || targetUser.role === "ADMIN") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Admins cannot reset passwords of Super Admins or peer Admins!",
			);
		}
	}

	if (payload.sendResetEmail) {
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

		await prisma.user.update({
			where: { id: targetUser.id },
			data: {
				otpCode: otp,
				otpExpiresAt,
				otpType: "PASSWORD_RESET",
			},
		});

		await sendPasswordResetOtpEmail(targetUser.email, targetUser.name, otp);

		return {
			message: `Password reset OTP has been sent to ${targetUser.email}`,
		};
	}

	if (!payload.newPassword) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Please provide a newPassword or set sendResetEmail to true!",
		);
	}

	const hashedPassword = await bcrypt.hash(
		payload.newPassword,
		config.bcrypt_salt_rounds,
	);

	await prisma.user.update({
		where: { id: targetUser.id },
		data: {
			password: hashedPassword,
			otpCode: null,
			otpExpiresAt: null,
			otpType: null,
		},
	});

	return {
		message: `Password for ${targetUser.email} has been updated successfully!`,
	};
};

// 6. Delete User (Admins can only delete Students/Counselors; Super Admin can delete anyone except self)
const deleteUser = async (requesterRole: Role, userId: string) => {
	const targetUser = await prisma.user.findUnique({ where: { id: userId } });
	if (!targetUser) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	if (targetUser.role === "SUPER_ADMIN") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Super Admin account cannot be deleted!",
		);
	}

	if (requesterRole === "ADMIN") {
		if (targetUser.role === "ADMIN") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Admins cannot delete other Admins!",
			);
		}
	}

	await prisma.user.delete({ where: { id: userId } });

	return { message: "User deleted successfully!" };
};

// 7. Update User Status (ACTIVE / BLOCKED)
const updateUserStatus = async (
	requesterRole: Role,
	userId: string,
	status: UserStatus,
) => {
	const targetUser = await prisma.user.findUnique({ where: { id: userId } });
	if (!targetUser) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	if (targetUser.role === "SUPER_ADMIN") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Cannot modify status of Super Admin!",
		);
	}

	if (requesterRole === "ADMIN" && targetUser.role === "ADMIN") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Admins cannot modify status of other Admins!",
		);
	}

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { status },
	});

	return updated;
};

// 8. Get All Users with filters
const getAllUsers = async (query: IQuery, requesterRole: Role) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const whereConditions: any = {
		isDeleted: false,
	};

	// Normal Admin cannot see other Admins unless Super Admin
	if (requesterRole === "ADMIN") {
		whereConditions.role = {
			in: ["COUNSELOR", "STUDENT"],
		};
	} else if (query.role) {
		whereConditions.role = query.role as Role;
	}

	if (query.status) {
		whereConditions.status = query.status as UserStatus;
	}

	if (query.searchTerm) {
		whereConditions.OR = [
			{ name: { contains: query.searchTerm, mode: "insensitive" } },
			{ email: { contains: query.searchTerm, mode: "insensitive" } },
		];
	}

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where: whereConditions,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: { student: true, counselor: true },
		}),
		prisma.user.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: users,
	};
};

export const UserService = {
	getMe,
	updateMe,
	updateProfileImage,
	createAdmin,
	deleteAdmin,
	createCounselor,
	customCreateUser,
	adminResetUserPassword,
	deleteUser,
	updateUserStatus,
	getAllUsers,
};
