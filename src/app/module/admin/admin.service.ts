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

export const AdminService = {
	getDashboardStats,
};
