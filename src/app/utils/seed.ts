import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../lib/prisma";

export const seedInitialData = async () => {
	try {
		// 1. Seed Super Admin
		const isSuperAdminExist = await prisma.user.findFirst({
			where: { email: config.super_admin_email },
		});

		let superAdminUser: any = isSuperAdminExist;
		if (!isSuperAdminExist) {
			const hashedPassword = await bcrypt.hash(
				config.super_admin_password,
				config.bcrypt_salt_rounds,
			);

			superAdminUser = await prisma.user.create({
				data: {
					name: config.super_admin_name,
					email: config.super_admin_email,
					password: hashedPassword,
					role: "SUPER_ADMIN",
					status: "ACTIVE",
					isEmailVerified: true,
				},
			});
			console.log(`[Seed] Super Admin Verified: ${config.super_admin_email}`);
		}

		// 2. Seed Demo Counselor
		const counselorEmail = "counselor@university.com";
		const isCounselorExist = await prisma.user.findFirst({
			where: { email: counselorEmail },
		});

		if (!isCounselorExist) {
			const hashedPassword = await bcrypt.hash(
				"Counselor123!",
				config.bcrypt_salt_rounds,
			);
			const user = await prisma.user.create({
				data: {
					name: "Sarah Jenkins",
					email: counselorEmail,
					password: hashedPassword,
					role: "COUNSELOR",
					status: "ACTIVE",
					isEmailVerified: true,
				},
			});
			await prisma.counselor.create({
				data: {
					userId: user.id,
					counselorId: "CNS-1001",
					designation: "Senior Admissions Officer",
					contactNumber: "+8801711223344",
					specialization: "European & UK Higher Education",
				},
			});
			console.log(`[Seed] Demo Counselor Verified: ${counselorEmail}`);
		}

		// 3. Seed Demo Student
		const studentEmail = "arafat.student@gmail.com";
		const isStudentExist = await prisma.user.findFirst({
			where: { email: studentEmail },
		});

		if (!isStudentExist) {
			const hashedPassword = await bcrypt.hash(
				"Student123!",
				config.bcrypt_salt_rounds,
			);
			const user = await prisma.user.create({
				data: {
					name: "Arafat Hussen",
					email: studentEmail,
					password: hashedPassword,
					role: "STUDENT",
					status: "ACTIVE",
					isEmailVerified: true,
				},
			});
			await prisma.student.create({
				data: {
					userId: user.id,
					studentId: "STU-0059",
					contactNumber: "+8801700000000",
					address: "Dhaka, Bangladesh",
					gender: "MALE",
					accessScope: "BOTH",
				},
			});
			console.log(`[Seed] Demo Student Verified: ${studentEmail}`);
		}

		// 4. Seed Higher Study Country (Cyprus)
		const cyprus = await prisma.country.upsert({
			where: { code: "CY" },
			update: {},
			create: {
				name: "Cyprus",
				code: "CY",
				currency: "EUR",
				description:
					"Study in Cyprus - European Quality Education with Affordable Tuition Fees.",
				flagUrl: "https://flagcdn.com/w320/cy.png",
			},
		});

		// 5. Seed American University of Cyprus (AUCY)
		const aucy = await prisma.globalUniversity.upsert({
			where: { id: "00000000-0000-0000-0000-000000000001" },
			update: {
				paymentType: "OFFER_DEPOSIT",
				offerDepositFee: 500.0,
			},
			create: {
				id: "00000000-0000-0000-0000-000000000001",
				name: "American University of Cyprus",
				city: "Larnaca",
				countryId: cyprus.id,
				website: "https://aucy.ac.cy",
				description:
					"Premier American curriculum institution located in Larnaca, Cyprus.",
				paymentType: "OFFER_DEPOSIT",
				applicationFee: 0.0,
				offerDepositFee: 500.0,
			},
		});

		// Dynamic doc requirements for AUCY
		const aucyDocs = [
			{
				title: "Passport Information Page",
				description: "Clear scanned color copy of passport (Min 2 years validity)",
				isRequired: true,
			},
			{
				title: "HSC & SSC Marksheets and Certificates",
				description: "Verified educational board transcripts",
				isRequired: true,
			},
			{
				title: "English Proficiency Score (IELTS 5.0+ or MOI)",
				description: "Language test certificate or Medium of Instruction letter",
				isRequired: true,
			},
			{
				title: "Statement of Purpose (SOP)",
				description: "1-page motivational essay explaining reasons for studying in Cyprus",
				isRequired: false,
			},
		];

		for (const doc of aucyDocs) {
			const isReqExist = await prisma.universityDocRequirement.findFirst({
				where: { universityId: aucy.id, title: doc.title },
			});
			if (!isReqExist) {
				await prisma.universityDocRequirement.create({
					data: {
						universityId: aucy.id,
						title: doc.title,
						description: doc.description,
						isRequired: doc.isRequired,
						docType: "PDF",
					},
				});
			}
		}

		// Program under AUCY
		const isProgramExist = await prisma.globalProgram.findFirst({
			where: { universityId: aucy.id, name: "BSc in Computer Science" },
		});

		if (!isProgramExist) {
			await prisma.globalProgram.create({
				data: {
					name: "BSc in Computer Science",
					degreeLevel: "BACHELOR",
					durationYears: 4.0,
					tuitionFee: 6650.0,
					initialDeposit: 4000.0,
					intakeSeason: "Fall 2026",
					ieltsRequirement: 5.0,
					academicRequirement: "Minimum 60% in HSC / A Level",
					universityId: aucy.id,
				},
			});
		}

		// 6. Seed Educational Blog Post
		const isBlogExist = await prisma.blogPost.findFirst({
			where: { slug: "complete-study-in-cyprus-guide-2026" },
		});

		if (!isBlogExist && superAdminUser) {
			await prisma.blogPost.create({
				data: {
					title: "Complete Study in Cyprus Guide 2026 for Bangladeshi Students",
					slug: "complete-study-in-cyprus-guide-2026",
					content:
						"Cyprus offers European standard degrees taught in English with 50% scholarship opportunities, low tuition fees, and high visa success ratio for South Asian students.",
					category: "Visa & Destination Guide",
					tags: ["Cyprus", "Higher Study", "Scholarships", "Europe"],
					authorId: superAdminUser.id,
					bannerUrl:
						"https://images.unsplash.com/photo-1544717305-2782549b5136",
				},
			});
		}

		// 7. Seed Student Success Stories
		const isStoryExist = await prisma.studentSuccessStory.findFirst();
		if (!isStoryExist && superAdminUser) {
			const successStories = [
				{
					studentName: "Arafat Hussen",
					photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
					homeInstitution: "Dhaka College, Dhaka, Bangladesh",
					country: "Cyprus",
					universityName: "American University of Cyprus (AUCY)",
					degreeName: "BSc in Computer Science",
					intake: "Fall 2026 Intake",
					visaDate: "July 2026",
					youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
					scholarshipNote: "50% Merit Scholarship Awarded",
					storyContent:
						"From Dhaka College to Larnaca, Cyprus! Rise Abroad Education guided me through every step from document apostille to visa interview preparation. With their expert counseling, I secured a 50% tuition scholarship and my European student visa within just 3 weeks.",
					isPublished: true,
					createdBy: superAdminUser.id,
				},
				{
					studentName: "Tanvir Ahmed",
					photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
					homeInstitution: "Notre Dame College, Dhaka, Bangladesh",
					country: "United Kingdom",
					universityName: "University of Hertfordshire",
					degreeName: "MSc in Data Science & AI",
					intake: "Spring 2026 Intake",
					visaDate: "January 2026",
					youtubeUrl: "https://www.youtube.com/watch?v=7wtfhZwyrcc",
					scholarshipNote: "£3,000 Dean's Excellence Scholarship",
					storyContent:
						"Securing my UK visa with zero hassle was made possible by Rise Abroad Education. Their dedicated counselor reviewed my SOP five times and conducted rigorous mock interviews that made the real embassy interview feel effortless.",
					isPublished: true,
					createdBy: superAdminUser.id,
				},
				{
					studentName: "Sadia Rahman",
					photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
					homeInstitution: "Viqarunnisa Noon College, Dhaka",
					country: "Canada",
					universityName: "University of Windsor",
					degreeName: "BBA in International Business",
					intake: "Fall 2026 Intake",
					visaDate: "August 2026",
					youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
					scholarshipNote: "$5,000 CAD Entrance Award",
					storyContent:
						"My dream of studying in Canada became a reality through Rise Abroad Education. They provided completely transparent guidelines on the SDS stream, GIC account creation, and financial proof documentation.",
					isPublished: true,
					createdBy: superAdminUser.id,
				},
			];

			for (const story of successStories) {
				await prisma.studentSuccessStory.create({
					data: story,
				});
			}
			console.log("[Seed] Demo Student Success Stories Seeded Successfully.");
		}

		console.log("[Seed] Initial Demo Data & Seed Verified Successfully.");
	} catch (error) {
		console.log(
			"Seed Warning (Ignored if database is not yet migrated):",
			error,
		);
	}
};
