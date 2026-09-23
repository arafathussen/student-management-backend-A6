import httpStatus from "http-status";
import type { AttendanceStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

interface IRecordAttendanceItem {
	studentId: string;
	status: AttendanceStatus;
	remarks?: string;
}

const recordSectionAttendance = async (
	facultyId: string,
	sectionId: string,
	dateStr: string,
	records: IRecordAttendanceItem[],
) => {
	const section = await prisma.section.findUnique({
		where: { id: sectionId },
	});

	if (!section) {
		throw new AppError(httpStatus.NOT_FOUND, "Section not found!");
	}

	const date = new Date(dateStr);

	const createdOrUpdated = await prisma.$transaction(async (tx) => {
		const results = [];
		for (const record of records) {
			const item = await tx.courseAttendance.upsert({
				where: {
					unique_student_daily_attendance: {
						studentId: record.studentId,
						sectionId,
						date,
					},
				},
				update: {
					status: record.status,
					remarks: record.remarks,
				},
				create: {
					studentId: record.studentId,
					sectionId,
					date,
					status: record.status,
					remarks: record.remarks,
				},
			});
			results.push(item);
		}
		return results;
	});

	return createdOrUpdated;
};

const getStudentAttendance = async (studentId: string) => {
	const enrollments = await prisma.enrollment.findMany({
		where: { studentId, status: "ENROLLED", isDeleted: false },
		include: {
			section: {
				include: { course: true, semester: true },
			},
		},
	});

	const attendanceSummary = await Promise.all(
		enrollments.map(async (enrollment) => {
			const attendances = await prisma.courseAttendance.findMany({
				where: {
					studentId,
					sectionId: enrollment.sectionId,
				},
				orderBy: { date: "asc" },
			});

			const totalClasses = attendances.length;
			const presentCount = attendances.filter(
				(a) => a.status === "PRESENT" || a.status === "LATE",
			).length;
			const percentage =
				totalClasses > 0
					? Number(((presentCount / totalClasses) * 100).toFixed(1))
					: 100;
			const hasWarning = percentage < 75;

			return {
				courseTitle: enrollment.section.course.title,
				courseCode: enrollment.section.course.code,
				sectionName: enrollment.section.sectionName,
				totalClasses,
				presentCount,
				percentage,
				hasWarning,
				warningMessage: hasWarning
					? `Attendance is ${percentage}% (Below 75%). At risk of exam debarment!`
					: null,
				records: attendances,
			};
		}),
	);

	return attendanceSummary;
};

const getSectionAttendanceSummary = async (sectionId: string) => {
	const attendances = await prisma.courseAttendance.findMany({
		where: { sectionId },
		include: {
			student: {
				include: { user: true },
			},
		},
		orderBy: { date: "desc" },
	});

	return attendances;
};

export const AttendanceService = {
	recordSectionAttendance,
	getStudentAttendance,
	getSectionAttendanceSummary,
};
