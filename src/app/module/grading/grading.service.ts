import httpStatus from "http-status";
import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const calculateGrade = (marks: number) => {
	if (marks >= 80) return { gradePoint: 4.0, letterGrade: "A+" };
	if (marks >= 75) return { gradePoint: 3.75, letterGrade: "A" };
	if (marks >= 70) return { gradePoint: 3.5, letterGrade: "A-" };
	if (marks >= 65) return { gradePoint: 3.25, letterGrade: "B+" };
	if (marks >= 60) return { gradePoint: 3.0, letterGrade: "B" };
	if (marks >= 55) return { gradePoint: 2.75, letterGrade: "B-" };
	if (marks >= 50) return { gradePoint: 2.5, letterGrade: "C+" };
	if (marks >= 45) return { gradePoint: 2.25, letterGrade: "C" };
	if (marks >= 40) return { gradePoint: 2.0, letterGrade: "D" };
	return { gradePoint: 0.0, letterGrade: "F" };
};

const submitCourseGrade = async (payload: {
	studentId: string;
	sectionId: string;
	marks: number;
	remarks?: string;
}) => {
	const section = await prisma.section.findUnique({
		where: { id: payload.sectionId },
	});

	if (!section) {
		throw new AppError(httpStatus.NOT_FOUND, "Section not found!");
	}

	const { gradePoint, letterGrade } = calculateGrade(payload.marks);

	const result = await prisma.courseResult.upsert({
		where: {
			unique_student_course_grade: {
				studentId: payload.studentId,
				sectionId: payload.sectionId,
			},
		},
		update: {
			marks: payload.marks,
			gradePoint,
			letterGrade,
			remarks: payload.remarks,
			isPublished: true,
		},
		create: {
			studentId: payload.studentId,
			sectionId: payload.sectionId,
			semesterId: section.semesterId,
			marks: payload.marks,
			gradePoint,
			letterGrade,
			remarks: payload.remarks,
			isPublished: true,
		},
		include: {
			student: { include: { user: true } },
			section: { include: { course: true, semester: true } },
		},
	});

	return result;
};

const getStudentResults = async (studentId: string) => {
	const student = await prisma.student.findUnique({
		where: { id: studentId },
		include: { user: true, department: true },
	});

	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student profile not found!");
	}

	const results = await prisma.courseResult.findMany({
		where: { studentId, isPublished: true },
		include: {
			section: {
				include: { course: true, semester: true },
			},
			semester: true,
		},
		orderBy: { createdAt: "asc" },
	});

	let totalCredits = 0;
	let totalGradePoints = 0;

	for (const res of results) {
		const credits = res.section.course.credits;
		totalCredits += credits;
		totalGradePoints += res.gradePoint * credits;
	}

	const cgpa =
		totalCredits > 0
			? Number((totalGradePoints / totalCredits).toFixed(2))
			: 0.0;

	return {
		student: {
			name: student.user.name,
			studentId: student.studentId,
			department: student.department?.name || "N/A",
			totalCreditsCompleted: totalCredits,
			cumulativeGpa: cgpa,
		},
		results,
	};
};

const generateTranscriptPDF = async (studentId: string): Promise<Buffer> => {
	const data = await getStudentResults(studentId);

	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ margin: 40 });
		const chunks: Buffer[] = [];

		doc.on("data", (chunk) => chunks.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", (err) => reject(err));

		// Header
		doc.fontSize(20).text("OFFICIAL ACADEMIC TRANSCRIPT", {
			align: "center",
			underline: true,
		});
		doc.moveDown(0.5);
		doc
			.fontSize(12)
			.text("Global University & Higher Study Portal", { align: "center" });
		doc.moveDown(1.5);

		// Student Info Box
		doc.fontSize(11).text(`Student Name: ${data.student.name}`);
		doc.text(`Student ID: ${data.student.studentId}`);
		doc.text(`Department: ${data.student.department}`);
		doc.text(`Total Credits Completed: ${data.student.totalCreditsCompleted}`);
		doc.text(`Cumulative CGPA: ${data.student.cumulativeGpa} / 4.00`);
		doc.moveDown(1);

		doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();
		doc.moveDown(1);

		// Course Table Header
		doc.fontSize(11).font("Helvetica-Bold");
		doc.text("Course Code", 40, doc.y, { width: 90, continued: true });
		doc.text("Course Title", 130, doc.y, { width: 200, continued: true });
		doc.text("Credits", 340, doc.y, { width: 50, continued: true });
		doc.text("Marks", 400, doc.y, { width: 50, continued: true });
		doc.text("Grade", 460, doc.y, { width: 50, continued: true });
		doc.text("Point", 520, doc.y, { width: 50 });
		doc.font("Helvetica").moveDown(0.5);

		// Rows
		for (const item of data.results) {
			const y = doc.y;
			doc.text(item.section.course.code, 40, y, { width: 90 });
			doc.text(item.section.course.title, 130, y, { width: 200 });
			doc.text(item.section.course.credits.toString(), 340, y, { width: 50 });
			doc.text(item.marks.toString(), 400, y, { width: 50 });
			doc.text(item.letterGrade, 460, y, { width: 50 });
			doc.text(item.gradePoint.toFixed(2), 520, y, { width: 50 });
			doc.moveDown(0.5);
		}

		doc.moveDown(2);
		doc
			.fontSize(9)
			.text(`Generated automatically on ${new Date().toLocaleDateString()}`, {
				align: "center",
			});

		doc.end();
	});
};

export const GradingService = {
	submitCourseGrade,
	getStudentResults,
	generateTranscriptPDF,
};
