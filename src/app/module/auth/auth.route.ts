import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(AuthValidation.registerStudentSchema),
	AuthController.registerStudent,
);

router.post(
	"/verify-email",
	validateRequest(AuthValidation.verifyEmailSchema),
	AuthController.verifyEmail,
);

router.post(
	"/resend-otp",
	validateRequest(AuthValidation.resendOtpSchema),
	AuthController.resendOtp,
);

router.post(
	"/login",
	validateRequest(AuthValidation.loginSchema),
	AuthController.loginUser,
);

router.post(
	"/google",
	validateRequest(AuthValidation.googleLoginSchema),
	AuthController.googleLogin,
);

router.post(
	"/forgot-password",
	validateRequest(AuthValidation.forgotPasswordSchema),
	AuthController.forgotPassword,
);

router.post(
	"/reset-password",
	validateRequest(AuthValidation.resetPasswordSchema),
	AuthController.resetPassword,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
	"/change-password",
	checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
	validateRequest(AuthValidation.changePasswordSchema),
	AuthController.changePassword,
);

export const AuthRoutes = router;
