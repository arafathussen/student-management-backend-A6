import { prisma } from "../../lib/prisma";

const getDashboardStats = async () => {
	const [
		totalStudents,
		totalFaculties,
		totalCourses,
		totalSections,
		totalApplications,
		totalCountries,
		totalUniversities,
		paidPayments,
		applicationsByStatus,
	] = await Promise.all([
		prisma.student.count({ where: { isDeleted: false } }),
		prisma.faculty.count({ where: { isDeleted: false } }),
		prisma.course.count({ where: { isDeleted: false } }),
		prisma.section.count({ where: { isDeleted: false } }),
		prisma.higherStudyApplication.count({ where: { isDeleted: false } }),
		prisma.country.count({ where: { isDeleted: false } }),
		prisma.globalUniversity.count({ where: { isDeleted: false } }),
		prisma.payment.aggregate({
			_sum: { amount: true },
			_count: { id: true },
			where: { status: "PAID" },
		}),
		prisma.higherStudyApplication.groupBy({
			by: ["status"],
			_count: { id: true },
		}),
	]);

	const totalRevenue = paidPayments._sum.amount
		? Number(paidPayments._sum.amount)
		: 0;
	const totalSuccessfulTransactions = paidPayments._count.id;

	return {
		summary: {
			totalStudents,
			totalFaculties,
			totalCourses,
			totalSections,
			totalApplications,
			totalCountries,
			totalUniversities,
			totalRevenue,
			totalSuccessfulTransactions,
		},
		applicationsByStatus,
	};
};

// Live & Traffic Analytics Tracker
const activeGuestSessions = new Map<string, number>(); // sessionId -> timestamp
const uniqueVisitorIps = new Set<string>(); // Set of distinct IP addresses
const lastVisitTimestamps = new Map<string, number>(); // debounce key -> timestamp
let totalGuestVisits = 0; // Total visits / page loads / reloads

const recordVisitorPing = (sessionId: string, clientIp: string = "127.0.0.1", isPageLoad: boolean = true) => {
	const now = Date.now();
	const sid = sessionId || `guest_${Math.random().toString(36).substring(2, 9)}`;
	// Normalize IP address (e.g. ::1 or ::ffff:127.0.0.1 -> 127.0.0.1)
	const rawIp = clientIp || "127.0.0.1";
	const cleanIp = rawIp.includes("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp === "::1" ? "127.0.0.1" : rawIp;

	// Every visit or page reload increments Total Visits
	// Debounce rapid duplicate pings within 3 seconds (e.g. React StrictMode double-mount in dev)
	if (isPageLoad) {
		const debounceKey = `${cleanIp}_${sid}`;
		const lastTime = lastVisitTimestamps.get(debounceKey) || 0;
		if (now - lastTime > 3000) {
			totalGuestVisits += 1;
			lastVisitTimestamps.set(debounceKey, now);
		}
	}

	// Unique visitors tracked strictly by distinct IP address
	if (cleanIp) {
		uniqueVisitorIps.add(cleanIp);
	}

	// Active session for Live Guests (active within rolling 5 mins)
	activeGuestSessions.set(sid, now);

	// Clean up sessions older than 5 minutes
	for (const [id, time] of activeGuestSessions.entries()) {
		if (now - time > 5 * 60 * 1000) {
			activeGuestSessions.delete(id);
		}
	}

	// Clean up debounce cache older than 1 minute
	for (const [key, time] of lastVisitTimestamps.entries()) {
		if (now - time > 60 * 1000) {
			lastVisitTimestamps.delete(key);
		}
	}

	return {
		liveVisitors: activeGuestSessions.size,
		totalGuestVisits,
		uniqueVisitors: Math.max(1, uniqueVisitorIps.size),
	};
};

const getVisitorStats = () => {
	const now = Date.now();
	for (const [id, time] of activeGuestSessions.entries()) {
		if (now - time > 5 * 60 * 1000) {
			activeGuestSessions.delete(id);
		}
	}

	return {
		liveVisitors: activeGuestSessions.size,
		totalGuestVisits,
		uniqueVisitors: Math.max(uniqueVisitorIps.size, totalGuestVisits > 0 ? 1 : 0),
	};
};

export const AdminService = {
	getDashboardStats,
	recordVisitorPing,
	getVisitorStats,
};
