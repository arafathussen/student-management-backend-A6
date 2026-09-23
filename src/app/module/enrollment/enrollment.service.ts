import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const registerCourseSection = async (studentId: string, sectionId: string) => {
	const result = await prisma.$transaction(async (tx) => {
		const section = await tx.section.findUnique({
			where: { id: sectionId },
			include: {
				course: true,
				semester: true,
			},
		});

		if (!section || section.isDeleted) {
			throw new AppError(httpStatus.NOT_FOUND, "Section not found!");
		}

		// 1. Check if section has available seats
		if (section.availableSeats <= 0) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"This section is fully booked! No seats available.",
			);
		}

		// 2. Check if student already enrolled in any section of this course in this semester
		const existingEnrollment = await tx.enrollment.findFirst({
			where: {
				studentId,
				section: {
					courseId: section.courseId,
					semesterId: section.semesterId,
				},
				status: "ENROLLED",
				isDeleted: false,
			},
		});

		if (existingEnrollment) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"You are already enrolled in this course for the current semester!",
			);
		}

		// 3. Check Prerequisite if exists
		if (section.course.prerequisiteId) {
			const prerequisiteCompleted = await tx.courseResult.findFirst({
				where: {
					studentId,
					section: {
						courseId: section.course.prerequisiteId,
					},
					marks: { gte: 40 }, // passing marks
				},
			});

			if (!prerequisiteCompleted) {
				const prereqCourse = await tx.course.findUnique({
					where: { id: section.course.prerequisiteId },
				});
				throw new AppError(
					httpStatus.BAD_REQUEST,
					`Prerequisite required: You must pass '${prereqCourse?.title || "Prerequisite course"}' before enrolling.`,
				);
			}
		}

		// 4. Decrement available seats
		await tx.section.update({
			where: { id: sectionId },
			data: {
				availableSeats: {
					decrement: 1,
				},
			},
		});

		// 5. Create enrollment record
		const enrollment = await tx.enrollment.create({
			data: {
				studentId,
				sectionId,
				status: "ENROLLED",
			},
			include: {
				section: {
					include: {
						course: true,
						semester: true,
					},
				},
			},
		});

		return enrollment;
	});

	return result;
};

const getMyEnrollments = async (studentId: string) => {
	const enrollments = await prisma.enrollment.findMany({
		where: {
			studentId,
			status: "ENROLLED",
			isDeleted: false,
		},
		include: {
			section: {
				include: {
					course: true,
					semester: true,
					faculty: { include: { user: true } },
				},
			},
		},
		orderBy: { enrolledAt: "desc" },
	});

	return enrollments;
};

const dropCourseSection = async (studentId: string, enrollmentId: string) => {
	const result = await prisma.$transaction(async (tx) => {
		const enrollment = await tx.enrollment.findUnique({
			where: { id: enrollmentId },
			include: { section: true },
		});

		if (
			!enrollment ||
			enrollment.studentId !== studentId ||
			enrollment.isDeleted
		) {
			throw new AppError(httpStatus.NOT_FOUND, "Enrollment record not found!");
		}

		if (enrollment.status !== "ENROLLED") {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Course is already dropped or completed!",
			);
		}

		// 1. Increment available seats back
		await tx.section.update({
			where: { id: enrollment.sectionId },
			data: {
				availableSeats: {
					increment: 1,
				},
			},
		});

		// 2. Mark enrollment as dropped
		const dropped = await tx.enrollment.update({
			where: { id: enrollmentId },
			data: {
				status: "DROPPED",
				isDeleted: true,
				deletedAt: new Date(),
			},
		});

		return dropped;
	});

	return result;
};

export const EnrollmentService = {
	registerCourseSection,
	getMyEnrollments,
	dropCourseSection,
};
