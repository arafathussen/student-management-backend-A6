import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AcademicRoutes } from "./app/module/academic/academic.route";
import { AdminRoutes } from "./app/module/admin/admin.route";
import { AttendanceRoutes } from "./app/module/attendance/attendance.route";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { ChatRoutes } from "./app/module/chat/chat.route";
import { EnrollmentRoutes } from "./app/module/enrollment/enrollment.route";
import { GradingRoutes } from "./app/module/grading/grading.route";
import { HigherStudyRoutes } from "./app/module/higher-study/higher-study.route";
import { NotificationRoutes } from "./app/module/notification/notification.route";
import { PaymentRoutes } from "./app/module/payment/payment.route";
import { UserRoutes } from "./app/module/user/user.route";
import { CommissionRoutes } from "./app/module/commission/commission.route";

const app: Application = express();

app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
	cors({
		origin: true,
		credentials: true,
	}),
);

// Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // Limit each IP to 200 requests per window
	message: {
		success: false,
		message:
			"Too many requests from this IP, please try again after 15 minutes!",
	},
});
app.use(limiter);

// Body Parsers & Cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Base Health Route
app.get("/", (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "University & Global Higher Study Management API is operational.",
		version: "1.0.0",
	});
});

// API v1 Health Route
app.get("/api/v1", (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "API v1 service is operational.",
		version: "1.0.0",
	});
});

// API Routes Registration
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/academic", AcademicRoutes);
app.use("/api/v1/enrollments", EnrollmentRoutes);
app.use("/api/v1/attendance", AttendanceRoutes);
app.use("/api/v1/grades", GradingRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/higher-study", HigherStudyRoutes);
app.use("/api/v1/chat", ChatRoutes);
app.use("/api/v1/notifications", NotificationRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/commissions", CommissionRoutes);

// Error Handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
