import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import config from "../config";
import { AppError } from "../utils/AppError";

export const globalErrorHandler: ErrorRequestHandler = (
	error,
	req,
	res,
	next,
) => {
	let statusCode = Number(error.statusCode) || httpStatus.INTERNAL_SERVER_ERROR;
	let message = error.message || "Something went wrong!";
	let errorDetails: any = null;

	if (error instanceof ZodError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "Validation Error";
		errorDetails = error.issues.map((issue) => ({
			path: issue.path[issue.path.length - 1],
			message: issue.message,
		}));
	} else if (error?.code === "P2002") {
		statusCode = httpStatus.CONFLICT;
		message = "A record with this unique field already exists!";
		errorDetails = error.meta;
	} else if (error?.code === "P2025") {
		statusCode = httpStatus.NOT_FOUND;
		message = "Requested record not found in database!";
		errorDetails = error.meta;
	} else if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
	}

	res.status(statusCode).json({
		success: false,
		message,
		errors: errorDetails || (error.message ? [{ message: error.message }] : []),
		stack: config.node_env === "development" ? error?.stack : undefined,
	});
};
