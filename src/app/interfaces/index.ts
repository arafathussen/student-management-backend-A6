export interface IQuery {
	page?: string | number;
	limit?: string | number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	searchTerm?: string;
	[key: string]: any;
}
