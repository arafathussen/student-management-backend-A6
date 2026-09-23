import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type {
	Role,
	StudentAccessScope,
	UserStatus,
} from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { jwtUtils } from "../utils/jwt";

export interface RequestUser {
	userId: string;
	email: string;
	role: Role;
	status: UserStatus;
	studentId?: string;
	counselorId?: string;
	facultyId?: string;
	accessScope?: StudentAccessScope;
}

declare global {
	namespace Express {
		interface Request {
			user?: RequestUser;
		}
	}
}

export const checkAuth = (...requiredRoles: Role[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const authHeader = req.headers.authorization;
			let token: string | undefined;

			if (authHeader && authHeader.startsWith("Bearer ")) {
				token = authHeader.split(" ")[1];
			} else if (req.cookies?.accessToken) {
				token = req.cookies.accessToken;
			}

			if (!token) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"You are not authorized. Token missing!",
				);
			}

			const verifyResult = jwtUtils.verifyToken(
				token,
				config.jwt_access_secret,
			);

			if (!verifyResult.success || !verifyResult.data) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"Invalid or expired token!",
				);
			}

			const payload = verifyResult.data as any;

			const user = await prisma.user.findUnique({
				where: { id: payload.userId },
				include: {
					student: true,
					faculty: true,
					counselor: true,
				},
			});

			if (!user || user.isDeleted) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"User account not found or deleted!",
				);
			}

			if (user.status === "BLOCKED") {
				throw new AppError(
					httpStatus.FORBIDDEN,
					"Your account has been suspended/blocked!",
				);
			}

			if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
				throw new AppError(
					httpStatus.FORBIDDEN,
					`Forbidden: Role '${user.role}' is not permitted to access this resource!`,
				);
			}

			req.user = {
				userId: user.id,
				email: user.email,
				role: user.role,
				status: user.status,
				studentId: user.student?.id,
				counselorId: user.counselor?.id,
				facultyId: user.faculty?.id,
				accessScope: user.student?.accessScope,
			};

			next();
		} catch (error) {
			next(error);
		}
	};
};

export const checkStudentScope = (
	requiredScope: "ACADEMIC" | "HIGHER_STUDY",
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;
			if (!user) {
				throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user!");
			}

			if (user.role === "STUDENT") {
				const scope = user.accessScope || "BOTH";

				if (requiredScope === "ACADEMIC" && scope === "HIGHER_STUDY_ONLY") {
					throw new AppError(
						httpStatus.FORBIDDEN,
						"Forbidden: Your student profile has Higher Study Only access. Campus academic operations are restricted.",
					);
				}

				if (requiredScope === "HIGHER_STUDY" && scope === "ACADEMIC_ONLY") {
					throw new AppError(
						httpStatus.FORBIDDEN,
						"Forbidden: Your student profile has Academic Only access. Higher study desk operations are restricted.",
					);
				}
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
