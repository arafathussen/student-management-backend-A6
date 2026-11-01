import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedInitialData } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
	try {
		// 1. Start HTTP Server immediately
		const server = app.listen(PORT, () => {
			console.log(
				`[Server] Running on port ${PORT} [Mode: ${config.node_env}]`,
			);
			console.log(`[API] Base URL: http://localhost:${PORT}/api/v1`);
		});

		// 2. Connect Prisma Database in background
		prisma
			.$connect()
			.then(() => {
				console.log(
					"[Database] PostgreSQL Database Connected Successfully via Prisma 7.",
				);
				// 3. Auto-Seed Initial Admin & Demo Catalog after DB connects
				seedInitialData().catch((seedError) => {
					console.log("[Seed] Notice:", seedError.message);
				});
			})
			.catch((dbError) => {
				console.log(
					"[Database] Connection Notice (Check DATABASE_URL):",
					dbError.message,
				);
			});

		// 4. Connect Redis (Optional / Non-blocking)
		if (config.redis_url || config.redis_host) {
			redisClient
				.connect()
				.then(() => {
					console.log("[Redis] Connected Successfully.");
				})
				.catch((redisError) => {
					console.log(
						"[Redis] Notice (Running in memory-fallback mode):",
						redisError.message,
					);
				});
		}
	} catch (error) {
		console.error("[Fatal] Error starting the server:", error);
	}
};

main();

export default app;
