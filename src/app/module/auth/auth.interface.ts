import type {
	Gender,
	StudentAccessScope,
} from "../../../generated/prisma/enums";

export interface IRegisterStudentPayload {
	name: string;
	email: string;
	password: string;
	studentId?: string;
	contactNumber?: string;
	address?: string;
	gender?: Gender;
	accessScope?: StudentAccessScope;
}

export interface ILoginPayload {
	email: string;
	password: string;
}

export interface IGoogleLoginPayload {
	idToken: string;
}

export interface IChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}
