import { createClient } from "redis";
import config from "../config";

const getRedisUrl = () => {
	if (config.redis_url) return config.redis_url;
	if (config.redis_password) {
		return `redis://${config.redis_user || "default"}:${config.redis_password}@${config.redis_host}:${config.redis_port}`;
	}
	return `redis://${config.redis_host}:${config.redis_port}`;
};

export const redisClient = createClient({
	url: getRedisUrl(),
	socket: {
		connectTimeout: 5000,
	},
});

redisClient.on("connect", () => {
	console.log("[Redis] Cloud Connected Successfully.");
});

redisClient.on("error", (err) => {
	console.log(
		"[Redis] Notice (Ignored if offline/fallback):",
		err.message,
	);
});
