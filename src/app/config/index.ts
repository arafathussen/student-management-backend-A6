import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	node_env: process.env.NODE_ENV || "development",
	port: process.env.PORT || 5000,
	database_url: process.env.DATABASE_URL,
	frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
	bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

	jwt_access_secret: process.env.JWT_ACCESS_SECRET || "dev-jwt-access-secret",
	jwt_refresh_secret:
		process.env.JWT_REFRESH_SECRET || "dev-jwt-refresh-secret",
	jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

	super_admin_name: process.env.SUPER_ADMIN_NAME || "System Super Admin",
	super_admin_email: process.env.SUPER_ADMIN_EMAIL || "admin@university.com",
	super_admin_password: process.env.SUPER_ADMIN_PASSWORD || "AdminPassword123!",

	stripe_secret_key: process.env.STRIPE_SECRET_KEY || "sk_test_mock_stripe_key",
	stripe_webhook_secret:
		process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_stripe_webhook",

	cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY || "",
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || "",

	google_client_id: process.env.GOOGLE_CLIENT_ID || "",

	smtp_user: process.env.SMTP_USER || "",
	smtp_password: process.env.SMTP_PASSWORD || "",
	email_sender:
		process.env.EMAIL_SENDER || "University Portal <no-reply@university.ac>",

	redis_url: process.env.REDIS_URL,
	redis_host: process.env.REDIS_HOST || "127.0.0.1",
	redis_port: Number(process.env.REDIS_PORT) || 6379,
	redis_user: process.env.REDIS_USER || "default",
	redis_password: process.env.REDIS_PASSWORD || "",
};
