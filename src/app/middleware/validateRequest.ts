import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const parsed = await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
				cookies: req.cookies,
			});

			req.body = parsed.body || req.body;
			next();
		} catch (error) {
			next(error);
		}
	};
};
