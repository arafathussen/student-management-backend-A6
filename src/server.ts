import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedInitialData } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
	try {
		// 1. Start HTTP Server immediately
		app.listen(PORT, () => {
			console.log(
				`[Server] Running on port ${PORT} [Mode: ${config.node_env}]`,
			);
			console.log(`[API] Base URL: http://localhost:${PORT}/api/v1`);
		});

		// 2. Connect Prisma Database
		try {
			await prisma.$connect();
			console.log(
				"[Database] PostgreSQL Database Connected Successfully via Prisma 7.",
			);
		} catch (dbError: any) {
			console.log(
				"[Database] Connection Notice (Check DATABASE_URL):",
				dbError.message,
			);
		}

		// 3. Connect Redis (Optional / Non-blocking)
		try {
			await redisClient.connect();
			console.log("[Redis] Connected Successfully.");
		} catch (redisError: any) {
			console.log(
				"[Redis] Notice (Running in memory-fallback mode):",
				redisError.message,
			);
		}

		// 4. Auto-Seed Initial Admin & Demo Catalog
		try {
			await seedInitialData();
		} catch (seedError: any) {
			console.log("[Seed] Notice:", seedError.message);
		}
	} catch (error) {
		console.error("[Fatal] Error starting the server:", error);
		process.exit(1);
	}
};

main();
