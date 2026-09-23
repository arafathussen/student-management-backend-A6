import type { Response } from "express";

interface IMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

interface IApiResponse<T> {
	statusCode: number;
	success: boolean;
	message: string;
	meta?: IMeta;
	data: T;
}

export const sendResponse = <T>(res: Response, jsonData: IApiResponse<T>) => {
	res.status(jsonData.statusCode).json({
		success: jsonData.success,
		message: jsonData.message,
		meta: jsonData.meta || null,
		data: jsonData.data,
	});
};
