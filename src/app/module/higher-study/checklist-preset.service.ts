import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";

export interface IChecklistItem {
	id: string;
	title: string;
	instruction: string;
	isRequired: boolean;
	category?: string;
	createdAt?: string;
}

export interface IChecklistPreset {
	id: string;
	title: string;
	description?: string;
	country?: string;
	university?: string;
	degree?: string;
	category: string;
	isDefault?: boolean;
	items: IChecklistItem[];
	createdAt: string;
	updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRESETS_FILE = path.join(DATA_DIR, "checklist-presets.json");
const ITEMS_FILE = path.join(DATA_DIR, "checklist-items.json");

const DEFAULT_PRESETS: IChecklistPreset[] = [
	{
		id: "preset_5_docs",
		title: "Core Academic & Identity Bundle (5 Docs)",
		description: "Essential foundation requirements required for initial university evaluation.",
		category: "General",
		isDefault: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		items: [
			{
				id: "item_p5_1",
				title: "Passport Copy (Information Page)",
				instruction: "Upload high-quality color scanned copy of valid international Passport (Information & signature page).",
				isRequired: true,
				category: "Identity",
			},
			{
				id: "item_p5_2",
				title: "Academic Transcripts & Certificates",
				instruction: "Upload official verified scanned copies of academic degree certificates and all marksheets.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p5_3",
				title: "English Language Proficiency (IELTS / PTE / MOI)",
				instruction: "Upload valid official score report (IELTS/PTE/TOEFL) or English Medium of Instruction certificate.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p5_4",
				title: "Statement of Purpose (SOP)",
				instruction: "Upload detailed personal statement explaining academic motivation, university selection, and career goals.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p5_5",
				title: "Letters of Recommendation (LOR - 2 Copies)",
				instruction: "Upload 2 signed recommendation letters from university professors or current professional employer.",
				isRequired: true,
				category: "Academic",
			},
		],
	},
	{
		id: "preset_7_docs",
		title: "Standard Admission & Solvency Pack (7 Docs)",
		description: "Standard comprehensive bundle with 6-month financial verification.",
		category: "General",
		isDefault: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		items: [
			{
				id: "item_p7_1",
				title: "Passport Copy (Information Page)",
				instruction: "Upload high-quality color scanned copy of valid international Passport.",
				isRequired: true,
				category: "Identity",
			},
			{
				id: "item_p7_2",
				title: "Academic Transcripts & Certificates",
				instruction: "Upload official verified scanned copies of degree and transcripts.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p7_3",
				title: "English Language Proficiency (IELTS / PTE / MOI)",
				instruction: "Upload valid English language proficiency scorecard.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p7_4",
				title: "Statement of Purpose (SOP)",
				instruction: "Upload personal statement tailored for program admission.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p7_5",
				title: "Letters of Recommendation (LOR - 2 Copies)",
				instruction: "Upload 2 signed recommendation letters.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p7_6",
				title: "Bank Solvency Certificate & 6-Month Statement",
				instruction: "Upload official bank solvency certificate with minimum 6 months history showing continuous balance.",
				isRequired: true,
				category: "Financial",
			},
			{
				id: "item_p7_7",
				title: "Police Clearance Certificate (PCC)",
				instruction: "Upload government-issued official police clearance certificate (issued within last 6 months).",
				isRequired: true,
				category: "Security",
			},
		],
	},
	{
		id: "preset_9_docs",
		title: "Complete Visa & Embassy Dossier (9 Docs)",
		description: "Full dossier containing medical, financial, identity, and background documentation.",
		category: "General",
		isDefault: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		items: [
			{
				id: "item_p9_1",
				title: "Passport Copy (Information Page)",
				instruction: "Upload high-quality color scanned copy of valid international Passport.",
				isRequired: true,
				category: "Identity",
			},
			{
				id: "item_p9_2",
				title: "Academic Transcripts & Certificates",
				instruction: "Upload official verified scanned copies of degree and marksheets.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p9_3",
				title: "English Language Proficiency (IELTS / PTE / MOI)",
				instruction: "Upload valid English test scorecard (IELTS/PTE).",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p9_4",
				title: "Statement of Purpose (SOP)",
				instruction: "Upload comprehensive academic Statement of Purpose.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p9_5",
				title: "Letters of Recommendation (LOR - 2 Copies)",
				instruction: "Upload 2 signed reference letters.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_p9_6",
				title: "Bank Solvency Certificate & 6-Month Statement",
				instruction: "Upload bank solvency certificate and verified 6 months bank statement.",
				isRequired: true,
				category: "Financial",
			},
			{
				id: "item_p9_7",
				title: "Police Clearance Certificate (PCC)",
				instruction: "Upload official police verification certificate.",
				isRequired: true,
				category: "Security",
			},
			{
				id: "item_p9_8",
				title: "Medical Fitness & Vaccination Certificate",
				instruction: "Upload certified health examination report and TB/vaccine clearance certificate.",
				isRequired: true,
				category: "Medical",
			},
			{
				id: "item_p9_9",
				title: "Updated Curriculum Vitae (CV / Resume)",
				instruction: "Upload professional resume formatted for embassy and admission review.",
				isRequired: true,
				category: "Academic",
			},
		],
	},
	{
		id: "preset_uk_tier4",
		title: "UK Student Route (CAS & Visa Pack)",
		description: "Required checklist for UK universities and UKVI visa appointment.",
		category: "United Kingdom",
		isDefault: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		items: [
			{
				id: "item_uk_1",
				title: "Valid International Passport",
				instruction: "Upload color scan of passport with at least 6 months validity.",
				isRequired: true,
				category: "Identity",
			},
			{
				id: "item_uk_2",
				title: "Official CAS Statement Copy",
				instruction: "Upload formal Confirmation of Acceptance for Studies issued by UK university.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_uk_3",
				title: "UKVI Academic Transcripts & Degrees",
				instruction: "Upload all academic transcripts referenced in your CAS letter.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_uk_4",
				title: "IELTS for UKVI or SELT Scorecard",
				instruction: "Upload official SELT certificate showing CEFR B2 level proficiency.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_uk_5",
				title: "28-Day Financial Bank Statement",
				instruction: "Upload 28-day continuous funds statement covering tuition + UK maintenance.",
				isRequired: true,
				category: "Financial",
			},
			{
				id: "item_uk_6",
				title: "Tuberculosis (TB) Test Certificate (IOM)",
				instruction: "Upload TB test report issued by an approved IOM diagnostic center.",
				isRequired: true,
				category: "Medical",
			},
			{
				id: "item_uk_7",
				title: "Consent Letter & Birth Certificate (If Sponsored)",
				instruction: "If using parental funds, upload sponsor affidavit and official birth certificate.",
				isRequired: false,
				category: "Financial",
			},
		],
	},
	{
		id: "preset_canada_sds",
		title: "Canada Study Permit (SDS & PAL Pack)",
		description: "Complete requirements for IRCC Canadian student visa filing.",
		category: "Canada",
		isDefault: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		items: [
			{
				id: "item_ca_1",
				title: "Valid International Passport",
				instruction: "Upload clear bio-data pages of international passport.",
				isRequired: true,
				category: "Identity",
			},
			{
				id: "item_ca_2",
				title: "DLI Letter of Acceptance (LOA)",
				instruction: "Upload official unconditional acceptance letter from designated learning institution.",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_ca_3",
				title: "Provincial Attestation Letter (PAL)",
				instruction: "Upload government-issued provincial attestation letter (PAL).",
				isRequired: true,
				category: "Academic",
			},
			{
				id: "item_ca_4",
				title: "Guaranteed Investment Certificate (GIC)",
				instruction: "Upload GIC proof of purchase ($20,635 CAD) from approved Canadian financial institution.",
				isRequired: true,
				category: "Financial",
			},
			{
				id: "item_ca_5",
				title: "First-Year Tuition Fee Payment Receipt",
				instruction: "Upload official wire transfer receipt confirming full 1st year tuition payment.",
				isRequired: true,
				category: "Financial",
			},
			{
				id: "item_ca_6",
				title: "Upfront eMedical Examination Sheet",
				instruction: "Upload information sheet provided by panel physician after medical exam.",
				isRequired: true,
				category: "Medical",
			},
			{
				id: "item_ca_7",
				title: "Police Clearance Certificate",
				instruction: "Upload police clearance certificate issued within the past 6 months.",
				isRequired: true,
				category: "Security",
			},
		],
	},
];

const DEFAULT_ITEMS: IChecklistItem[] = [
	{
		id: "item_passport",
		title: "Upload your Passport",
		instruction: "Upload high-quality color scanned copy of first & last page of valid passport.",
		isRequired: true,
		category: "Identity",
		createdAt: new Date().toISOString(),
	},
	{
		id: "item_transcripts",
		title: "Academic Transcripts & Certificates",
		instruction: "Upload official verified scanned copies of academic degree certificates and all marksheets.",
		isRequired: true,
		category: "Academic",
		createdAt: new Date().toISOString(),
	},
	{
		id: "item_english",
		title: "English Language Proficiency (IELTS / PTE / MOI)",
		instruction: "Upload valid official score report (IELTS/PTE/TOEFL) or English Medium of Instruction certificate.",
		isRequired: true,
		category: "Academic",
		createdAt: new Date().toISOString(),
	},
	{
		id: "item_sop",
		title: "Statement of Purpose (SOP)",
		instruction: "Upload detailed personal statement explaining academic motivation, university selection, and career goals.",
		isRequired: true,
		category: "Academic",
		createdAt: new Date().toISOString(),
	},
	{
		id: "item_lor",
		title: "Letters of Recommendation (LOR - 2 Copies)",
		instruction: "Upload 2 signed recommendation letters from university professors or current employer.",
		isRequired: true,
		category: "Academic",
		createdAt: new Date().toISOString(),
	},
	{
		id: "item_financial",
		title: "Bank Statement & Financial Solvency",
		instruction: "Upload 6-month certified bank statement accompanied by official solvency certificate from bank.",
		isRequired: true,
		category: "Financial",
		createdAt: new Date().toISOString(),
	},
];

const ensureDataFileExists = () => {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
	if (!fs.existsSync(PRESETS_FILE)) {
		fs.writeFileSync(PRESETS_FILE, JSON.stringify(DEFAULT_PRESETS, null, 2), "utf-8");
	}
	if (!fs.existsSync(ITEMS_FILE)) {
		fs.writeFileSync(ITEMS_FILE, JSON.stringify(DEFAULT_ITEMS, null, 2), "utf-8");
	}
};

const readItems = (): IChecklistItem[] => {
	ensureDataFileExists();
	try {
		const raw = fs.readFileSync(ITEMS_FILE, "utf-8");
		return JSON.parse(raw);
	} catch {
		return DEFAULT_ITEMS;
	}
};

const writeItems = (items: IChecklistItem[]) => {
	ensureDataFileExists();
	fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2), "utf-8");
};

const readPresets = (): IChecklistPreset[] => {
	ensureDataFileExists();
	try {
		const raw = fs.readFileSync(PRESETS_FILE, "utf-8");
		return JSON.parse(raw);
	} catch {
		return DEFAULT_PRESETS;
	}
};

const writePresets = (presets: IChecklistPreset[]) => {
	ensureDataFileExists();
	fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2), "utf-8");
};

export const ChecklistPresetService = {
	// ==================== CHECKLIST ITEMS LIBRARY ====================
	getAllItems: async () => {
		return readItems();
	},

	createItem: async (payload: {
		title: string;
		instruction?: string;
		isRequired?: boolean;
		category?: string;
	}) => {
		if (!payload.title || !payload.title.trim()) {
			throw new AppError(httpStatus.BAD_REQUEST, "Checklist item title is required!");
		}

		const items = readItems();
		const newItem: IChecklistItem = {
			id: `item_${randomUUID().slice(0, 8)}`,
			title: payload.title.trim(),
			instruction: payload.instruction?.trim() || "Upload requested document.",
			isRequired: payload.isRequired !== false,
			category: payload.category?.trim() || "General",
			createdAt: new Date().toISOString(),
		};

		items.unshift(newItem);
		writeItems(items);
		return newItem;
	},

	updateItem: async (
		id: string,
		payload: {
			title?: string;
			instruction?: string;
			isRequired?: boolean;
			category?: string;
		},
	) => {
		const items = readItems();
		const idx = items.findIndex((i) => i.id === id);
		if (idx === -1) {
			throw new AppError(httpStatus.NOT_FOUND, "Checklist item not found!");
		}

		const existing = items[idx];
		const updated: IChecklistItem = {
			...existing,
			title: payload.title ? payload.title.trim() : existing.title,
			instruction: payload.instruction !== undefined ? payload.instruction.trim() : existing.instruction,
			isRequired: payload.isRequired !== undefined ? payload.isRequired : existing.isRequired,
			category: payload.category ? payload.category.trim() : existing.category,
		};

		items[idx] = updated;
		writeItems(items);
		return updated;
	},

	deleteItem: async (id: string) => {
		const items = readItems();
		const filtered = items.filter((i) => i.id !== id);
		writeItems(filtered);
		return { message: "Checklist item deleted successfully!" };
	},

	// ==================== CHECKLIST GROUPS / PRESETS ====================
	getAllPresets: async () => {
		return readPresets();
	},

	getPresetById: async (id: string) => {
		const presets = readPresets();
		const found = presets.find((p) => p.id === id);
		if (!found) {
			throw new AppError(httpStatus.NOT_FOUND, "Checklist group not found!");
		}
		return found;
	},

	createPreset: async (payload: {
		title: string;
		country?: string;
		university?: string;
		degree?: string;
		description?: string;
		category?: string;
		items: Array<{ id?: string; title: string; instruction?: string; isRequired?: boolean; category?: string }>;
	}) => {
		if (!payload.title || !payload.title.trim()) {
			throw new AppError(httpStatus.BAD_REQUEST, "Checklist group title is required!");
		}
		if (!Array.isArray(payload.items) || payload.items.length === 0) {
			throw new AppError(httpStatus.BAD_REQUEST, "Please provide at least one document requirement in this group!");
		}

		const presets = readPresets();
		const newPreset: IChecklistPreset = {
			id: `group_${randomUUID().slice(0, 8)}`,
			title: payload.title.trim(),
			country: payload.country?.trim() || "All Countries",
			university: payload.university?.trim() || "All Universities",
			degree: payload.degree?.trim() || "All Degrees",
			description: payload.description?.trim() || "",
			category: payload.category?.trim() || payload.country?.trim() || "General",
			isDefault: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			items: payload.items.map((item, idx) => ({
				id: item.id || `item_${randomUUID().slice(0, 8)}_${idx}`,
				title: item.title.trim(),
				instruction: item.instruction?.trim() || "Upload requested official document.",
				isRequired: item.isRequired !== false,
				category: item.category?.trim() || "General",
			})),
		};

		presets.unshift(newPreset);
		writePresets(presets);
		return newPreset;
	},

	updatePreset: async (
		id: string,
		payload: {
			title?: string;
			country?: string;
			university?: string;
			degree?: string;
			description?: string;
			category?: string;
			items?: Array<{ id?: string; title: string; instruction?: string; isRequired?: boolean; category?: string }>;
		},
	) => {
		const presets = readPresets();
		const idx = presets.findIndex((p) => p.id === id);
		if (idx === -1) {
			throw new AppError(httpStatus.NOT_FOUND, "Checklist group not found!");
		}

		const existing = presets[idx];
		const updated: IChecklistPreset = {
			...existing,
			title: payload.title ? payload.title.trim() : existing.title,
			country: payload.country !== undefined ? payload.country.trim() : existing.country,
			university: payload.university !== undefined ? payload.university.trim() : existing.university,
			degree: payload.degree !== undefined ? payload.degree.trim() : existing.degree,
			description: payload.description !== undefined ? payload.description.trim() : existing.description,
			category: payload.category ? payload.category.trim() : (payload.country?.trim() || existing.category),
			updatedAt: new Date().toISOString(),
			items: payload.items
				? payload.items.map((item, i) => ({
						id: item.id || `item_${randomUUID().slice(0, 8)}_${i}`,
						title: item.title.trim(),
						instruction: item.instruction?.trim() || "Upload requested official document.",
						isRequired: item.isRequired !== false,
						category: item.category?.trim() || "General",
				  }))
				: existing.items,
		};

		presets[idx] = updated;
		writePresets(presets);
		return updated;
	},

	deletePreset: async (id: string) => {
		const presets = readPresets();
		const existing = presets.find((p) => p.id === id);
		if (!existing) {
			throw new AppError(httpStatus.NOT_FOUND, "Checklist group not found!");
		}

		const filtered = presets.filter((p) => p.id !== id);
		writePresets(filtered);
		return { message: "Checklist group deleted successfully!" };
	},
};
