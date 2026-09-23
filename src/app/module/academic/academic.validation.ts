import { z } from "zod";

const createDepartmentSchema = z.object({
	body: z.object({
		name: z.string({ required_error: "Department name is required" }),
		code: z.string({ required_error: "Department code is required" }),
		description: z.string().optional(),
	}),
});

const createSemesterSchema = z.object({
	body: z.object({
		name: z.string({ required_error: "Semester name is required" }),
		code: z.string({ required_error: "Semester code is required" }),
		startDate: z.string({ required_error: "Start date is required" }),
		endDate: z.string({ required_error: "End date is required" }),
		isCurrent: z.boolean().optional(),
	}),
});

const createCourseSchema = z.object({
	body: z.object({
		title: z.string({ required_error: "Course title is required" }),
		code: z.string({ required_error: "Course code is required" }),
		credits: z.number().int().min(1).max(6).default(3),
		tuitionFee: z.number().min(0).default(15000),
		description: z.string().optional(),
		departmentId: z.string({ required_error: "Department ID is required" }),
		prerequisiteId: z.string().optional(),
	}),
});

const createSectionSchema = z.object({
	body: z.object({
		sectionName: z.string({ required_error: "Section name is required" }),
		maxCapacity: z.number().int().min(1).default(40),
		roomNumber: z.string().optional(),
		scheduleTime: z.string().optional(),
		courseId: z.string({ required_error: "Course ID is required" }),
		semesterId: z.string({ required_error: "Semester ID is required" }),
		facultyId: z.string().optional(),
	}),
});

export const AcademicValidation = {
	createDepartmentSchema,
	createSemesterSchema,
	createCourseSchema,
	createSectionSchema,
};
