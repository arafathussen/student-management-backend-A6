
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus31 from "http-status";

// src/app/middleware/globalErrorHandler.ts
import httpStatus from "http-status";
import { ZodError } from "zod";

// src/app/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5e3,
  database_url: process.env.DATABASE_URL,
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || "dev-jwt-access-secret",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "dev-jwt-refresh-secret",
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  super_admin_name: process.env.SUPER_ADMIN_NAME || "System Super Admin",
  super_admin_email: process.env.SUPER_ADMIN_EMAIL || "admin@university.com",
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD || "AdminPassword123!",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || "sk_test_mock_stripe_key",
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_stripe_webhook",
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY || "",
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || "",
  google_client_id: process.env.GOOGLE_CLIENT_ID || "",
  smtp_user: process.env.SMTP_USER || "",
  smtp_password: process.env.SMTP_PASSWORD || "",
  email_sender: process.env.EMAIL_SENDER || "Rise Abroad Education <no-reply@riseabroad.com>",
  redis_url: process.env.REDIS_URL,
  redis_host: process.env.REDIS_HOST || "127.0.0.1",
  redis_port: Number(process.env.REDIS_PORT) || 6379,
  redis_user: process.env.REDIS_USER || "default",
  redis_password: process.env.REDIS_PASSWORD || ""
};

// src/app/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = (error, req, res, next) => {
  let statusCode = Number(error.statusCode) || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || "Something went wrong!";
  let errorDetails = null;
  if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorDetails = error.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message
    }));
  } else if (error?.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    message = "A record with this unique field already exists!";
    errorDetails = error.meta;
  } else if (error?.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
    message = "Requested record not found in database!";
    errorDetails = error.meta;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    errors: errorDetails || (error.message ? [{ message: error.message }] : []),
    stack: config_default.node_env === "development" ? error?.stack : void 0
  });
};

// src/app/middleware/notFound.ts
import httpStatus2 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus2.NOT_FOUND).json({
    success: false,
    message: `API Route Not Found: [${req.method}] ${req.originalUrl}`,
    errors: [
      {
        path: req.originalUrl,
        message: "Invalid API endpoint"
      }
    ]
  });
};

// src/app/module/academic/academic.route.ts
import { Router } from "express";

// src/app/middleware/checkAuth.ts
import httpStatus3 from "http-status";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Department {\n  id          String    @id @default(uuid(7))\n  name        String    @unique\n  code        String    @unique\n  description String?\n  isDeleted   Boolean   @default(false)\n  deletedAt   DateTime?\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n\n  students  Student[]\n  faculties Faculty[]\n  courses   Course[]\n\n  @@map("departments")\n}\n\nmodel Semester {\n  id        String    @id @default(uuid(7))\n  name      String\n  code      String    @unique\n  startDate DateTime\n  endDate   DateTime\n  isCurrent Boolean   @default(false)\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  sections Section[]\n  payments Payment[]\n  grades   CourseResult[]\n\n  @@map("semesters")\n}\n\nmodel Course {\n  id          String  @id @default(uuid(7))\n  title       String\n  code        String  @unique\n  credits     Int     @default(3)\n  tuitionFee  Decimal @default(15000.00) @db.Decimal(10, 2)\n  description String?\n\n  prerequisiteId   String?\n  prerequisite     Course?  @relation("Prerequisites", fields: [prerequisiteId], references: [id])\n  dependentCourses Course[] @relation("Prerequisites")\n\n  departmentId String\n  department   Department @relation(fields: [departmentId], references: [id])\n\n  sections Section[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@index([code], name: "idx_course_code")\n  @@map("courses")\n}\n\nmodel Section {\n  id             String  @id @default(uuid(7))\n  sectionName    String\n  maxCapacity    Int     @default(40)\n  availableSeats Int     @default(40)\n  roomNumber     String?\n  scheduleTime   String?\n\n  courseId String\n  course   Course @relation(fields: [courseId], references: [id])\n\n  semesterId String\n  semester   Semester @relation(fields: [semesterId], references: [id])\n\n  facultyId String?\n  faculty   Faculty? @relation(fields: [facultyId], references: [id])\n\n  enrollments Enrollment[]\n  attendances CourseAttendance[]\n  grades      CourseResult[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@unique([courseId, semesterId, sectionName], name: "unique_section_per_semester")\n  @@map("sections")\n}\n\nmodel Enrollment {\n  id        String  @id @default(uuid(7))\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  sectionId String\n  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)\n\n  status     EnrollmentStatus @default(ENROLLED)\n  enrolledAt DateTime         @default(now())\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  @@unique([studentId, sectionId], name: "unique_student_section_enrollment")\n  @@map("enrollments")\n}\n\nmodel CourseAttendance {\n  id      String           @id @default(uuid(7))\n  date    DateTime\n  status  AttendanceStatus @default(PRESENT)\n  remarks String?\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  sectionId String\n  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([studentId, sectionId, date], name: "unique_student_daily_attendance")\n  @@map("course_attendances")\n}\n\nmodel ChatRoom {\n  id                String   @id @default(uuid(7))\n  applicationId     String?  @unique\n  studentUserId     String\n  mode              ChatMode @default(COLLABORATIVE_GROUP)\n  isLocked          Boolean  @default(false)\n  lockedByAgentId   String?\n  lockedByAgentName String?\n\n  messages ChatMessage[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("chat_rooms")\n}\n\nmodel ChatMessage {\n  id     String    @id @default(uuid(7))\n  roomId String?\n  room   ChatRoom? @relation(fields: [roomId], references: [id], onDelete: Cascade)\n\n  message           String\n  attachmentUrl     String?\n  senderDisplayName String?\n  senderRoleBadge   String\n  isRead            Boolean @default(false)\n\n  senderId String\n  sender   User   @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)\n\n  receiverId String?\n  receiver   User?   @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([senderId, receiverId], name: "idx_chat_participants")\n  @@map("chat_messages")\n}\n\nmodel Notification {\n  id        String               @id @default(uuid(7))\n  title     String\n  body      String\n  audience  NotificationAudience @default(ALL)\n  priority  NotificationPriority @default(INFO)\n  actionUrl String?\n  isRead    Boolean              @default(false)\n\n  userId String?\n  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId, isRead], name: "idx_notification_user")\n  @@map("notifications")\n}\n\nmodel ContactPageSetting {\n  id                          String   @id @default(uuid(7))\n  headquartersTitle           String   @default("Dhaka Headquarters")\n  headquartersAddress         String   @default("Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh.")\n  headquartersNote            String   @default("Direct access via Gulshan Circle 1")\n  officeHoursTitle            String   @default("Office Hours & Counseling")\n  officeHoursSchedule         String   @default("Saturday \u2013 Thursday: 10:00 AM \u2013 7:00 PM")\n  officeHoursNote             String   @default("Friday: Closed (Hotline & WhatsApp Active)")\n  // Auto-Responder Email Template Settings\n  autoResponderSubject        String   @default("We Have Received Your Inquiry \u2014 Rise Abroad Education")\n  autoResponderSenderName     String   @default("Rise Abroad Admissions Desk")\n  autoResponderSenderEmail    String   @default("admissions@riseabroad.com")\n  autoResponderWhatsAppText   String   @default("\u099C\u09B0\u09C1\u09B0\u09BF \u0995\u09CB\u09A8\u09CB \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09B9\u09B2\u09C7 \u0985\u09A5\u09AC\u09BE \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u09AA\u09C7\u09A4\u09C7 \u09AC\u09BF\u09B2\u09AE\u09CD\u09AC \u09B9\u09B2\u09C7, \u0986\u09AA\u09A8\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09A8\u0995 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8:")\n  autoResponderWhatsAppNumber String   @default("+880 1712-345678")\n  autoResponderOfficeAddress  String   @default("Rise Abroad Education \u2022 Level 6, Navana Tower, Gulshan-1, Dhaka")\n  autoResponderHotline        String   @default("+880 1712-345678")\n  autoResponderEmail          String   @default("admissions@riseabroad.com")\n  autoResponderHours          String   @default("Counseling Desk: Sat \u2013 Thu (10AM \u2013 7PM)")\n  autoResponderLogoUrl        String?  @default("")\n  // Password Reset OTP Email Template Settings\n  otpEmailSubject             String   @default("Your Password Reset Code \u2014 Rise Abroad Education")\n  otpEmailHeading             String   @default("Password Reset Verification Code")\n  otpEmailBodyMessage         String   @default("We received a request to reset the password for your Rise Abroad Education account. Use the verification code below to proceed with resetting your password:")\n  otpEmailExpiryNote          String   @default("This code expires in 10 minutes. For your security, do not share this code with anyone.")\n  // New Registration Account Verification OTP Email Settings\n  regOtpEmailSubject          String   @default("Account Verification Code \u2014 Rise Abroad Education")\n  regOtpEmailHeading          String   @default("Verify Your Student Account")\n  regOtpEmailBodyMessage      String   @default("Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:")\n  regOtpEmailExpiryNote       String   @default("This code is valid for 10 minutes. For your security, do not share this code with anyone.")\n  // Welcome Registration Email Template Settings\n  welcomeEmailSubject         String   @default("Welcome to Rise Abroad Education \u2014 Your Journey Begins!")\n  welcomeEmailHeading         String   @default("Welcome to Rise Abroad Education")\n  welcomeEmailMessage         String   @default("Thank you for registering with Rise Abroad Education. Your global higher education journey starts here! Our certified counselors and admissions desk are here to guide you to your dream university.")\n  welcomeEmailBtnText         String   @default("Access Student Portal")\n  welcomeEmailBtnUrl          String   @default("https://riseabroad.com/dashboard")\n  createdAt                   DateTime @default(now())\n  updatedAt                   DateTime @updatedAt\n\n  @@map("contact_page_settings")\n}\n\nmodel SupportTeamMember {\n  id         String   @id @default(uuid(7))\n  name       String\n  role       String\n  badge      String   @default("SUPPORT")\n  badgeColor String   @default("bg-blue-500/10 text-blue-400 border-blue-500/30")\n  department String\n  avatar     String\n  avatarAlt  String?\n  phone      String\n  email      String\n  whatsapp   String\n  facebook   String\n  order      Int      @default(0)\n  isActive   Boolean  @default(true)\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@map("support_team_members")\n}\n\nmodel ContactInquiry {\n  id        String    @id @default(uuid(7))\n  name      String\n  email     String\n  phone     String?\n  subject   String\n  message   String    @db.Text\n  country   String?   @default("Bangladesh")\n  isRead    Boolean   @default(false)\n  status    String    @default("UNREAD")\n  reply     String?   @db.Text\n  repliedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("contact_inquiries")\n}\n\nenum Role {\n  SUPER_ADMIN\n  ADMIN\n  COUNSELOR\n  STUDENT\n}\n\nenum UniversityPaymentType {\n  FREE\n  UPFRONT_FEE\n  OFFER_DEPOSIT\n}\n\nenum StudentAccessScope {\n  ACADEMIC_ONLY\n  HIGHER_STUDY_ONLY\n  BOTH\n}\n\nenum AuthProvider {\n  CREDENTIAL\n  GOOGLE\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum ChatMode {\n  EXCLUSIVE_LOCK\n  COLLABORATIVE_GROUP\n}\n\nenum CommissionStatus {\n  PENDING\n  APPROVED\n  WITHDRAWN\n}\n\nenum CommissionVisibilityMode {\n  FULL_BREAKDOWN\n  NET_ONLY\n  HIDDEN\n}\n\nenum OtpType {\n  EMAIL_VERIFICATION\n  PASSWORD_RESET\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum DegreeLevel {\n  FOUNDATION\n  BACHELOR\n  MASTER\n  PHD\n}\n\nenum EnrollmentStatus {\n  ENROLLED\n  DROPPED\n  COMPLETED\n}\n\nenum AttendanceStatus {\n  PRESENT\n  ABSENT\n  LATE\n  EXCUSED\n}\n\nenum PaymentStatus {\n  UNPAID\n  PENDING\n  PAID\n  FAILED\n  REFUNDED\n}\n\nenum PaymentType {\n  TUITION_FEE\n  SEMESTER_FEE\n  EXAM_FEE\n  APPLICATION_FEE\n  OFFER_DEPOSIT\n  OTHER\n}\n\nenum ApplicationStatus {\n  DRAFT\n  SUBMITTED\n  DOCS_PENDING\n  UNDER_REVIEW\n  OFFER_ISSUED\n  VISA_PROCESSING\n  ENROLLED\n  REJECTED\n}\n\nenum DocumentStatus {\n  REQUIRED\n  UPLOADED\n  VERIFIED\n  REJECTED\n}\n\nenum NotificationAudience {\n  ACADEMIC\n  HIGHER_STUDY\n  ALL\n}\n\nenum NotificationPriority {\n  INFO\n  WARNING\n  CRITICAL_ALERT\n  ACTION_REQUIRED\n}\n\nmodel CourseResult {\n  id          String  @id @default(uuid(7))\n  marks       Float\n  gradePoint  Float\n  letterGrade String\n  remarks     String?\n  isPublished Boolean @default(false)\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  sectionId String\n  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)\n\n  semesterId String\n  semester   Semester @relation(fields: [semesterId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([studentId, sectionId], name: "unique_student_course_grade")\n  @@map("course_results")\n}\n\nmodel Country {\n  id          String  @id @default(uuid(7))\n  name        String  @unique\n  code        String  @unique\n  currency    String  @default("EUR")\n  description String?\n  flagUrl     String?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  universities GlobalUniversity[]\n\n  @@map("countries")\n}\n\nmodel GlobalUniversity {\n  id              String                @id @default(uuid(7))\n  name            String\n  city            String\n  website         String?\n  logoUrl         String?\n  coverImageUrl   String?\n  description     String?\n  paymentType     UniversityPaymentType @default(FREE)\n  applicationFee  Decimal               @default(0.0) @db.Decimal(10, 2)\n  offerDepositFee Decimal               @default(0.0) @db.Decimal(10, 2)\n\n  countryId String\n  country   Country @relation(fields: [countryId], references: [id])\n\n  programs        GlobalProgram[]\n  docRequirements UniversityDocRequirement[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("global_universities")\n}\n\nmodel UniversityDocRequirement {\n  id          String  @id @default(uuid(7))\n  title       String\n  description String?\n  isRequired  Boolean @default(true)\n  docType     String  @default("PDF")\n\n  universityId String\n  university   GlobalUniversity @relation(fields: [universityId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("university_doc_requirements")\n}\n\nmodel GlobalProgram {\n  id                  String      @id @default(uuid(7))\n  name                String\n  degreeLevel         DegreeLevel @default(BACHELOR)\n  durationYears       Float       @default(4.0)\n  tuitionFee          Decimal     @db.Decimal(10, 2)\n  initialDeposit      Decimal     @db.Decimal(10, 2)\n  intakeSeason        String?\n  applicationDeadline DateTime?\n  ieltsRequirement    Float?\n  academicRequirement String?\n\n  universityId String\n  university   GlobalUniversity @relation(fields: [universityId], references: [id])\n\n  applications HigherStudyApplication[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("global_programs")\n}\n\nmodel HigherStudyApplication {\n  id                  String            @id @default(uuid(7))\n  applicationNumber   String            @unique\n  status              ApplicationStatus @default(DRAFT)\n  isFeePaid           Boolean           @default(false)\n  isOfferUnlocked     Boolean           @default(false)\n  offerLetterUrl      String?\n  offerLetterPublicId String?\n  offerIssuedAt       DateTime?\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  counselorId String?\n  counselor   Counselor? @relation(fields: [counselorId], references: [id])\n\n  programId String\n  program   GlobalProgram @relation(fields: [programId], references: [id])\n\n  documents     ApplicationDocument[]\n  payments      Payment[]\n  notes         CounselorNote[]\n  internalNotes ApplicationInternalNote[]\n\n  appliedUniversities Json?\n  customInformation   Json?\n  trackingMilestones  Json?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("higher_study_applications")\n}\n\nmodel ApplicationInternalNote {\n  id           String  @id @default(uuid(7))\n  note         String  @db.Text\n  authorId     String\n  authorName   String\n  authorRole   String  @default("ADMIN")\n  authorAvatar String?\n\n  applicationId String\n  application   HigherStudyApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([applicationId])\n  @@map("application_internal_notes")\n}\n\nmodel CounselorNote {\n  id        String  @id @default(uuid(7))\n  note      String\n  isPrivate Boolean @default(false)\n\n  applicationId String\n  application   HigherStudyApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n\n  counselorId String\n  counselor   Counselor @relation(fields: [counselorId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("counselor_notes")\n}\n\nmodel ApplicationDocument {\n  id            String         @id @default(uuid(7))\n  title         String\n  instruction   String?\n  status        DocumentStatus @default(REQUIRED)\n  fileUrl       String?\n  filePublicId  String?\n  fileType      String?\n  isCustom      Boolean        @default(false)\n  adminFeedback String?\n  uploadedAt    DateTime?\n\n  applicationId String\n  application   HigherStudyApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("application_documents")\n}\n\nmodel BlogPost {\n  id          String   @id @default(uuid(7))\n  title       String\n  slug        String   @unique\n  content     String\n  bannerUrl   String?\n  category    String   @default("Study Abroad Guide")\n  tags        String[] @default([])\n  isPublished Boolean  @default(true)\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  authorId String\n  author   User   @relation(fields: [authorId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("blog_posts")\n}\n\nmodel StudentSuccessStory {\n  id              String    @id @default(uuid(7))\n  slug            String?\n  studentName     String\n  photoUrl        String?\n  thumbnailUrl    String?\n  homeInstitution String\n  hometown        String?\n  country         String\n  universityName  String\n  degreeName      String\n  intake          String?\n  visaDate        String?\n  youtubeUrl      String?\n  testimonial     String?   @db.Text\n  storyContent    String    @db.Text\n  scholarshipNote String?\n  viewsCount      Int       @default(0)\n  isPublished     Boolean   @default(true)\n  isDeleted       Boolean   @default(false)\n  deletedAt       DateTime?\n  createdBy       String?\n  createdAt       DateTime  @default(now())\n  updatedAt       DateTime  @updatedAt\n\n  @@index([slug])\n  @@map("student_success_stories")\n}\n\nmodel SuccessPageSetting {\n  id          String   @id @default(uuid(7))\n  badgeText   String   @default("Real Students \u2022 Real Visas \u2022 Proven Results")\n  titlePart1  String   @default("Student")\n  titlePart2  String   @default("Success Stories")\n  description String   @default("Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education.")\n  stat1Value  String   @default("98.4%")\n  stat1Label  String   @default("Visa Success Rate")\n  stat2Value  String   @default("1,250+")\n  stat2Label  String   @default("Visas Approved")\n  stat3Value  String   @default("50%+")\n  stat3Label  String   @default("Average Scholarship")\n  stat4Value  String   @default("15+")\n  stat4Label  String   @default("Study Destinations")\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  @@map("success_page_settings")\n}\n\nmodel ActivityLog {\n  id          String   @id @default(uuid(7))\n  action      String\n  module      String\n  targetId    String\n  targetTitle String?\n  performedBy String\n  userName    String?\n  userEmail   String?\n  details     String?  @db.Text\n  createdAt   DateTime @default(now())\n\n  @@map("activity_logs")\n}\n\nmodel AgencyCommission {\n  id               String  @id @default(uuid(7))\n  applicationId    String?\n  studentId        String\n  referredByUserId String\n  referredByUser   User    @relation(fields: [referredByUserId], references: [id])\n\n  universityName         String\n  grossAmount            Decimal @db.Decimal(10, 2)\n  currency               String  @default("EUR")\n  vatPercentage          Decimal @default(10.0) @db.Decimal(5, 2)\n  vatAmount              Decimal @db.Decimal(10, 2)\n  companySharePercentage Decimal @default(10.0) @db.Decimal(5, 2)\n  companyShareAmount     Decimal @default(0.0) @db.Decimal(10, 2)\n  companyShareAmountBDT  Decimal @default(0.0) @db.Decimal(12, 2)\n  netAmount              Decimal @db.Decimal(10, 2)\n  exchangeRateToBDT      Decimal @db.Decimal(10, 2)\n  netAmountBDT           Decimal @db.Decimal(12, 2)\n  grossAmountBDT         Decimal @db.Decimal(12, 2)\n\n  status      CommissionStatus @default(PENDING)\n  withdrawnAt DateTime?\n  notes       String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([referredByUserId, status], name: "idx_commission_agent")\n  @@map("agency_commissions")\n}\n\nmodel Payment {\n  id          String        @id @default(uuid(7))\n  amount      Decimal       @db.Decimal(10, 2)\n  currency    String        @default("USD")\n  paymentType PaymentType   @default(TUITION_FEE)\n  status      PaymentStatus @default(PENDING)\n\n  stripeSessionId       String?   @unique\n  stripePaymentIntentId String?   @unique\n  stripeReceiptUrl      String?\n  paidAt                DateTime?\n  description           String?\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  semesterId String?\n  semester   Semester? @relation(fields: [semesterId], references: [id])\n\n  higherStudyApplicationId String?\n  higherStudyApplication   HigherStudyApplication? @relation(fields: [higherStudyApplicationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([stripeSessionId], name: "idx_payment_stripe_session")\n  @@map("payments")\n}\n\n// Prisma 7.9.1 Schema Configuration\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id              String       @id @default(uuid(7))\n  name            String\n  email           String       @unique\n  password        String?\n  googleId        String?      @unique\n  authProvider    AuthProvider @default(CREDENTIAL)\n  role            Role         @default(STUDENT)\n  status          UserStatus   @default(ACTIVE)\n  isEmailVerified Boolean      @default(false)\n  otpCode         String?\n  otpExpiresAt    DateTime?\n  otpType         OtpType?\n  contactNumber   String?\n  imageUrl        String       @default("")\n  imagePublicId   String       @default("")\n  isDeleted       Boolean      @default(false)\n  deletedAt       DateTime?\n  createdAt       DateTime     @default(now())\n  updatedAt       DateTime     @updatedAt\n\n  student   Student?   @relation("UserStudentProfile")\n  faculty   Faculty?\n  counselor Counselor?\n  blogPosts BlogPost[]\n\n  referredStudents Student[]          @relation("ReferredStudents")\n  commissions      AgencyCommission[]\n\n  sentMessages     ChatMessage[]  @relation("SentMessages")\n  receivedMessages ChatMessage[]  @relation("ReceivedMessages")\n  notifications    Notification[]\n\n  @@index([email], name: "idx_user_email")\n  @@map("users")\n}\n\nmodel Student {\n  id            String             @id @default(uuid(7))\n  studentId     String             @unique\n  contactNumber String?\n  address       String?\n  gender        Gender?\n  dateOfBirth   DateTime?\n  accessScope   StudentAccessScope @default(BOTH)\n\n  targetBudget      Decimal? @db.Decimal(10, 2)\n  preferredCurrency String?  @default("USD")\n  preferredCountry  String?\n\n  referredByUserId String?\n  referredByUser   User?   @relation("ReferredStudents", fields: [referredByUserId], references: [id])\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  userId String @unique\n  user   User   @relation("UserStudentProfile", fields: [userId], references: [id], onDelete: Cascade)\n\n  departmentId String?\n  department   Department? @relation(fields: [departmentId], references: [id])\n\n  enrollments     Enrollment[]\n  attendances     CourseAttendance[]\n  grades          CourseResult[]\n  payments        Payment[]\n  higherStudyApps HigherStudyApplication[]\n\n  @@index([studentId], name: "idx_student_studentId")\n  @@map("students")\n}\n\nmodel Faculty {\n  id            String  @id @default(uuid(7))\n  facultyId     String  @unique\n  designation   String\n  contactNumber String?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  departmentId String?\n  department   Department? @relation(fields: [departmentId], references: [id])\n\n  sections Section[]\n\n  @@index([facultyId], name: "idx_faculty_facultyId")\n  @@map("faculties")\n}\n\nmodel Counselor {\n  id                            String                   @id @default(uuid(7))\n  counselorId                   String                   @unique\n  designation                   String                   @default("Study Abroad Counselor")\n  contactNumber                 String?\n  specialization                String?\n  commissionVisibilityMode      CommissionVisibilityMode @default(HIDDEN)\n  defaultVatPercentage          Decimal                  @default(10.0) @db.Decimal(5, 2)\n  defaultCompanySharePercentage Decimal                  @default(10.0) @db.Decimal(5, 2)\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  assignedApplications HigherStudyApplication[]\n  counselorNotes       CounselorNote[]\n\n  @@index([counselorId], name: "idx_counselor_counselorId")\n  @@map("counselors")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Department":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"students","kind":"object","type":"Student","relationName":"DepartmentToStudent"},{"name":"faculties","kind":"object","type":"Faculty","relationName":"DepartmentToFaculty"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToDepartment"}],"dbName":"departments","schema":null},"Semester":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"isCurrent","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sections","kind":"object","type":"Section","relationName":"SectionToSemester"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToSemester"},{"name":"grades","kind":"object","type":"CourseResult","relationName":"CourseResultToSemester"}],"dbName":"semesters","schema":null},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"credits","kind":"scalar","type":"Int"},{"name":"tuitionFee","kind":"scalar","type":"Decimal"},{"name":"description","kind":"scalar","type":"String"},{"name":"prerequisiteId","kind":"scalar","type":"String"},{"name":"prerequisite","kind":"object","type":"Course","relationName":"Prerequisites"},{"name":"dependentCourses","kind":"object","type":"Course","relationName":"Prerequisites"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"department","kind":"object","type":"Department","relationName":"CourseToDepartment"},{"name":"sections","kind":"object","type":"Section","relationName":"CourseToSection"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"courses","schema":null},"Section":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sectionName","kind":"scalar","type":"String"},{"name":"maxCapacity","kind":"scalar","type":"Int"},{"name":"availableSeats","kind":"scalar","type":"Int"},{"name":"roomNumber","kind":"scalar","type":"String"},{"name":"scheduleTime","kind":"scalar","type":"String"},{"name":"courseId","kind":"scalar","type":"String"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToSection"},{"name":"semesterId","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"SectionToSemester"},{"name":"facultyId","kind":"scalar","type":"String"},{"name":"faculty","kind":"object","type":"Faculty","relationName":"FacultyToSection"},{"name":"enrollments","kind":"object","type":"Enrollment","relationName":"EnrollmentToSection"},{"name":"attendances","kind":"object","type":"CourseAttendance","relationName":"CourseAttendanceToSection"},{"name":"grades","kind":"object","type":"CourseResult","relationName":"CourseResultToSection"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"sections","schema":null},"Enrollment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"EnrollmentToStudent"},{"name":"sectionId","kind":"scalar","type":"String"},{"name":"section","kind":"object","type":"Section","relationName":"EnrollmentToSection"},{"name":"status","kind":"enum","type":"EnrollmentStatus"},{"name":"enrolledAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"enrollments","schema":null},"CourseAttendance":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"AttendanceStatus"},{"name":"remarks","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"CourseAttendanceToStudent"},{"name":"sectionId","kind":"scalar","type":"String"},{"name":"section","kind":"object","type":"Section","relationName":"CourseAttendanceToSection"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"course_attendances","schema":null},"ChatRoom":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"studentUserId","kind":"scalar","type":"String"},{"name":"mode","kind":"enum","type":"ChatMode"},{"name":"isLocked","kind":"scalar","type":"Boolean"},{"name":"lockedByAgentId","kind":"scalar","type":"String"},{"name":"lockedByAgentName","kind":"scalar","type":"String"},{"name":"messages","kind":"object","type":"ChatMessage","relationName":"ChatMessageToChatRoom"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"chat_rooms","schema":null},"ChatMessage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"room","kind":"object","type":"ChatRoom","relationName":"ChatMessageToChatRoom"},{"name":"message","kind":"scalar","type":"String"},{"name":"attachmentUrl","kind":"scalar","type":"String"},{"name":"senderDisplayName","kind":"scalar","type":"String"},{"name":"senderRoleBadge","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"sender","kind":"object","type":"User","relationName":"SentMessages"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"receiver","kind":"object","type":"User","relationName":"ReceivedMessages"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"chat_messages","schema":null},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"body","kind":"scalar","type":"String"},{"name":"audience","kind":"enum","type":"NotificationAudience"},{"name":"priority","kind":"enum","type":"NotificationPriority"},{"name":"actionUrl","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"notifications","schema":null},"ContactPageSetting":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"headquartersTitle","kind":"scalar","type":"String"},{"name":"headquartersAddress","kind":"scalar","type":"String"},{"name":"headquartersNote","kind":"scalar","type":"String"},{"name":"officeHoursTitle","kind":"scalar","type":"String"},{"name":"officeHoursSchedule","kind":"scalar","type":"String"},{"name":"officeHoursNote","kind":"scalar","type":"String"},{"name":"autoResponderSubject","kind":"scalar","type":"String"},{"name":"autoResponderSenderName","kind":"scalar","type":"String"},{"name":"autoResponderSenderEmail","kind":"scalar","type":"String"},{"name":"autoResponderWhatsAppText","kind":"scalar","type":"String"},{"name":"autoResponderWhatsAppNumber","kind":"scalar","type":"String"},{"name":"autoResponderOfficeAddress","kind":"scalar","type":"String"},{"name":"autoResponderHotline","kind":"scalar","type":"String"},{"name":"autoResponderEmail","kind":"scalar","type":"String"},{"name":"autoResponderHours","kind":"scalar","type":"String"},{"name":"autoResponderLogoUrl","kind":"scalar","type":"String"},{"name":"otpEmailSubject","kind":"scalar","type":"String"},{"name":"otpEmailHeading","kind":"scalar","type":"String"},{"name":"otpEmailBodyMessage","kind":"scalar","type":"String"},{"name":"otpEmailExpiryNote","kind":"scalar","type":"String"},{"name":"regOtpEmailSubject","kind":"scalar","type":"String"},{"name":"regOtpEmailHeading","kind":"scalar","type":"String"},{"name":"regOtpEmailBodyMessage","kind":"scalar","type":"String"},{"name":"regOtpEmailExpiryNote","kind":"scalar","type":"String"},{"name":"welcomeEmailSubject","kind":"scalar","type":"String"},{"name":"welcomeEmailHeading","kind":"scalar","type":"String"},{"name":"welcomeEmailMessage","kind":"scalar","type":"String"},{"name":"welcomeEmailBtnText","kind":"scalar","type":"String"},{"name":"welcomeEmailBtnUrl","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"contact_page_settings","schema":null},"SupportTeamMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"role","kind":"scalar","type":"String"},{"name":"badge","kind":"scalar","type":"String"},{"name":"badgeColor","kind":"scalar","type":"String"},{"name":"department","kind":"scalar","type":"String"},{"name":"avatar","kind":"scalar","type":"String"},{"name":"avatarAlt","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"whatsapp","kind":"scalar","type":"String"},{"name":"facebook","kind":"scalar","type":"String"},{"name":"order","kind":"scalar","type":"Int"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"support_team_members","schema":null},"ContactInquiry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"status","kind":"scalar","type":"String"},{"name":"reply","kind":"scalar","type":"String"},{"name":"repliedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"contact_inquiries","schema":null},"CourseResult":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"marks","kind":"scalar","type":"Float"},{"name":"gradePoint","kind":"scalar","type":"Float"},{"name":"letterGrade","kind":"scalar","type":"String"},{"name":"remarks","kind":"scalar","type":"String"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"CourseResultToStudent"},{"name":"sectionId","kind":"scalar","type":"String"},{"name":"section","kind":"object","type":"Section","relationName":"CourseResultToSection"},{"name":"semesterId","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"CourseResultToSemester"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"course_results","schema":null},"Country":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"currency","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"flagUrl","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"universities","kind":"object","type":"GlobalUniversity","relationName":"CountryToGlobalUniversity"}],"dbName":"countries","schema":null},"GlobalUniversity":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"website","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"coverImageUrl","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"paymentType","kind":"enum","type":"UniversityPaymentType"},{"name":"applicationFee","kind":"scalar","type":"Decimal"},{"name":"offerDepositFee","kind":"scalar","type":"Decimal"},{"name":"countryId","kind":"scalar","type":"String"},{"name":"country","kind":"object","type":"Country","relationName":"CountryToGlobalUniversity"},{"name":"programs","kind":"object","type":"GlobalProgram","relationName":"GlobalProgramToGlobalUniversity"},{"name":"docRequirements","kind":"object","type":"UniversityDocRequirement","relationName":"GlobalUniversityToUniversityDocRequirement"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"global_universities","schema":null},"UniversityDocRequirement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isRequired","kind":"scalar","type":"Boolean"},{"name":"docType","kind":"scalar","type":"String"},{"name":"universityId","kind":"scalar","type":"String"},{"name":"university","kind":"object","type":"GlobalUniversity","relationName":"GlobalUniversityToUniversityDocRequirement"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"university_doc_requirements","schema":null},"GlobalProgram":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"degreeLevel","kind":"enum","type":"DegreeLevel"},{"name":"durationYears","kind":"scalar","type":"Float"},{"name":"tuitionFee","kind":"scalar","type":"Decimal"},{"name":"initialDeposit","kind":"scalar","type":"Decimal"},{"name":"intakeSeason","kind":"scalar","type":"String"},{"name":"applicationDeadline","kind":"scalar","type":"DateTime"},{"name":"ieltsRequirement","kind":"scalar","type":"Float"},{"name":"academicRequirement","kind":"scalar","type":"String"},{"name":"universityId","kind":"scalar","type":"String"},{"name":"university","kind":"object","type":"GlobalUniversity","relationName":"GlobalProgramToGlobalUniversity"},{"name":"applications","kind":"object","type":"HigherStudyApplication","relationName":"GlobalProgramToHigherStudyApplication"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"global_programs","schema":null},"HigherStudyApplication":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"applicationNumber","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ApplicationStatus"},{"name":"isFeePaid","kind":"scalar","type":"Boolean"},{"name":"isOfferUnlocked","kind":"scalar","type":"Boolean"},{"name":"offerLetterUrl","kind":"scalar","type":"String"},{"name":"offerLetterPublicId","kind":"scalar","type":"String"},{"name":"offerIssuedAt","kind":"scalar","type":"DateTime"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"HigherStudyApplicationToStudent"},{"name":"counselorId","kind":"scalar","type":"String"},{"name":"counselor","kind":"object","type":"Counselor","relationName":"CounselorToHigherStudyApplication"},{"name":"programId","kind":"scalar","type":"String"},{"name":"program","kind":"object","type":"GlobalProgram","relationName":"GlobalProgramToHigherStudyApplication"},{"name":"documents","kind":"object","type":"ApplicationDocument","relationName":"ApplicationDocumentToHigherStudyApplication"},{"name":"payments","kind":"object","type":"Payment","relationName":"HigherStudyApplicationToPayment"},{"name":"notes","kind":"object","type":"CounselorNote","relationName":"CounselorNoteToHigherStudyApplication"},{"name":"internalNotes","kind":"object","type":"ApplicationInternalNote","relationName":"ApplicationInternalNoteToHigherStudyApplication"},{"name":"appliedUniversities","kind":"scalar","type":"Json"},{"name":"customInformation","kind":"scalar","type":"Json"},{"name":"trackingMilestones","kind":"scalar","type":"Json"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"higher_study_applications","schema":null},"ApplicationInternalNote":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"authorName","kind":"scalar","type":"String"},{"name":"authorRole","kind":"scalar","type":"String"},{"name":"authorAvatar","kind":"scalar","type":"String"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"application","kind":"object","type":"HigherStudyApplication","relationName":"ApplicationInternalNoteToHigherStudyApplication"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"application_internal_notes","schema":null},"CounselorNote":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"isPrivate","kind":"scalar","type":"Boolean"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"application","kind":"object","type":"HigherStudyApplication","relationName":"CounselorNoteToHigherStudyApplication"},{"name":"counselorId","kind":"scalar","type":"String"},{"name":"counselor","kind":"object","type":"Counselor","relationName":"CounselorToCounselorNote"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"counselor_notes","schema":null},"ApplicationDocument":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"instruction","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"DocumentStatus"},{"name":"fileUrl","kind":"scalar","type":"String"},{"name":"filePublicId","kind":"scalar","type":"String"},{"name":"fileType","kind":"scalar","type":"String"},{"name":"isCustom","kind":"scalar","type":"Boolean"},{"name":"adminFeedback","kind":"scalar","type":"String"},{"name":"uploadedAt","kind":"scalar","type":"DateTime"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"application","kind":"object","type":"HigherStudyApplication","relationName":"ApplicationDocumentToHigherStudyApplication"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"application_documents","schema":null},"BlogPost":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"bannerUrl","kind":"scalar","type":"String"},{"name":"category","kind":"scalar","type":"String"},{"name":"tags","kind":"scalar","type":"String"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"author","kind":"object","type":"User","relationName":"BlogPostToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"blog_posts","schema":null},"StudentSuccessStory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"studentName","kind":"scalar","type":"String"},{"name":"photoUrl","kind":"scalar","type":"String"},{"name":"thumbnailUrl","kind":"scalar","type":"String"},{"name":"homeInstitution","kind":"scalar","type":"String"},{"name":"hometown","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"universityName","kind":"scalar","type":"String"},{"name":"degreeName","kind":"scalar","type":"String"},{"name":"intake","kind":"scalar","type":"String"},{"name":"visaDate","kind":"scalar","type":"String"},{"name":"youtubeUrl","kind":"scalar","type":"String"},{"name":"testimonial","kind":"scalar","type":"String"},{"name":"storyContent","kind":"scalar","type":"String"},{"name":"scholarshipNote","kind":"scalar","type":"String"},{"name":"viewsCount","kind":"scalar","type":"Int"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdBy","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"student_success_stories","schema":null},"SuccessPageSetting":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"badgeText","kind":"scalar","type":"String"},{"name":"titlePart1","kind":"scalar","type":"String"},{"name":"titlePart2","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"stat1Value","kind":"scalar","type":"String"},{"name":"stat1Label","kind":"scalar","type":"String"},{"name":"stat2Value","kind":"scalar","type":"String"},{"name":"stat2Label","kind":"scalar","type":"String"},{"name":"stat3Value","kind":"scalar","type":"String"},{"name":"stat3Label","kind":"scalar","type":"String"},{"name":"stat4Value","kind":"scalar","type":"String"},{"name":"stat4Label","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"success_page_settings","schema":null},"ActivityLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"module","kind":"scalar","type":"String"},{"name":"targetId","kind":"scalar","type":"String"},{"name":"targetTitle","kind":"scalar","type":"String"},{"name":"performedBy","kind":"scalar","type":"String"},{"name":"userName","kind":"scalar","type":"String"},{"name":"userEmail","kind":"scalar","type":"String"},{"name":"details","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"activity_logs","schema":null},"AgencyCommission":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"referredByUserId","kind":"scalar","type":"String"},{"name":"referredByUser","kind":"object","type":"User","relationName":"AgencyCommissionToUser"},{"name":"universityName","kind":"scalar","type":"String"},{"name":"grossAmount","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"vatPercentage","kind":"scalar","type":"Decimal"},{"name":"vatAmount","kind":"scalar","type":"Decimal"},{"name":"companySharePercentage","kind":"scalar","type":"Decimal"},{"name":"companyShareAmount","kind":"scalar","type":"Decimal"},{"name":"companyShareAmountBDT","kind":"scalar","type":"Decimal"},{"name":"netAmount","kind":"scalar","type":"Decimal"},{"name":"exchangeRateToBDT","kind":"scalar","type":"Decimal"},{"name":"netAmountBDT","kind":"scalar","type":"Decimal"},{"name":"grossAmountBDT","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"CommissionStatus"},{"name":"withdrawnAt","kind":"scalar","type":"DateTime"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"agency_commissions","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"paymentType","kind":"enum","type":"PaymentType"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"stripePaymentIntentId","kind":"scalar","type":"String"},{"name":"stripeReceiptUrl","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"description","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"PaymentToStudent"},{"name":"semesterId","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"PaymentToSemester"},{"name":"higherStudyApplicationId","kind":"scalar","type":"String"},{"name":"higherStudyApplication","kind":"object","type":"HigherStudyApplication","relationName":"HigherStudyApplicationToPayment"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payments","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"authProvider","kind":"enum","type":"AuthProvider"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"isEmailVerified","kind":"scalar","type":"Boolean"},{"name":"otpCode","kind":"scalar","type":"String"},{"name":"otpExpiresAt","kind":"scalar","type":"DateTime"},{"name":"otpType","kind":"enum","type":"OtpType"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"imagePublicId","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"Student","relationName":"UserStudentProfile"},{"name":"faculty","kind":"object","type":"Faculty","relationName":"FacultyToUser"},{"name":"counselor","kind":"object","type":"Counselor","relationName":"CounselorToUser"},{"name":"blogPosts","kind":"object","type":"BlogPost","relationName":"BlogPostToUser"},{"name":"referredStudents","kind":"object","type":"Student","relationName":"ReferredStudents"},{"name":"commissions","kind":"object","type":"AgencyCommission","relationName":"AgencyCommissionToUser"},{"name":"sentMessages","kind":"object","type":"ChatMessage","relationName":"SentMessages"},{"name":"receivedMessages","kind":"object","type":"ChatMessage","relationName":"ReceivedMessages"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"}],"dbName":"users","schema":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"dateOfBirth","kind":"scalar","type":"DateTime"},{"name":"accessScope","kind":"enum","type":"StudentAccessScope"},{"name":"targetBudget","kind":"scalar","type":"Decimal"},{"name":"preferredCurrency","kind":"scalar","type":"String"},{"name":"preferredCountry","kind":"scalar","type":"String"},{"name":"referredByUserId","kind":"scalar","type":"String"},{"name":"referredByUser","kind":"object","type":"User","relationName":"ReferredStudents"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserStudentProfile"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"department","kind":"object","type":"Department","relationName":"DepartmentToStudent"},{"name":"enrollments","kind":"object","type":"Enrollment","relationName":"EnrollmentToStudent"},{"name":"attendances","kind":"object","type":"CourseAttendance","relationName":"CourseAttendanceToStudent"},{"name":"grades","kind":"object","type":"CourseResult","relationName":"CourseResultToStudent"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToStudent"},{"name":"higherStudyApps","kind":"object","type":"HigherStudyApplication","relationName":"HigherStudyApplicationToStudent"}],"dbName":"students","schema":null},"Faculty":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"facultyId","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"FacultyToUser"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"department","kind":"object","type":"Department","relationName":"DepartmentToFaculty"},{"name":"sections","kind":"object","type":"Section","relationName":"FacultyToSection"}],"dbName":"faculties","schema":null},"Counselor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"counselorId","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"specialization","kind":"scalar","type":"String"},{"name":"commissionVisibilityMode","kind":"enum","type":"CommissionVisibilityMode"},{"name":"defaultVatPercentage","kind":"scalar","type":"Decimal"},{"name":"defaultCompanySharePercentage","kind":"scalar","type":"Decimal"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CounselorToUser"},{"name":"assignedApplications","kind":"object","type":"HigherStudyApplication","relationName":"CounselorToHigherStudyApplication"},{"name":"counselorNotes","kind":"object","type":"CounselorNote","relationName":"CounselorToCounselorNote"}],"dbName":"counselors","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","student","user","department","prerequisite","dependentCourses","sections","_count","course","semester","assignedApplications","application","counselor","counselorNotes","universities","country","programs","university","docRequirements","applications","program","documents","payments","notes","internalNotes","higherStudyApplication","section","grades","faculty","enrollments","attendances","author","blogPosts","referredStudents","referredByUser","commissions","messages","room","sender","receiver","sentMessages","receivedMessages","notifications","higherStudyApps","students","faculties","courses","Department.findUnique","Department.findUniqueOrThrow","Department.findFirst","Department.findFirstOrThrow","Department.findMany","data","Department.createOne","Department.createMany","Department.createManyAndReturn","Department.updateOne","Department.updateMany","Department.updateManyAndReturn","create","update","Department.upsertOne","Department.deleteOne","Department.deleteMany","having","_min","_max","Department.groupBy","Department.aggregate","Semester.findUnique","Semester.findUniqueOrThrow","Semester.findFirst","Semester.findFirstOrThrow","Semester.findMany","Semester.createOne","Semester.createMany","Semester.createManyAndReturn","Semester.updateOne","Semester.updateMany","Semester.updateManyAndReturn","Semester.upsertOne","Semester.deleteOne","Semester.deleteMany","Semester.groupBy","Semester.aggregate","Course.findUnique","Course.findUniqueOrThrow","Course.findFirst","Course.findFirstOrThrow","Course.findMany","Course.createOne","Course.createMany","Course.createManyAndReturn","Course.updateOne","Course.updateMany","Course.updateManyAndReturn","Course.upsertOne","Course.deleteOne","Course.deleteMany","_avg","_sum","Course.groupBy","Course.aggregate","Section.findUnique","Section.findUniqueOrThrow","Section.findFirst","Section.findFirstOrThrow","Section.findMany","Section.createOne","Section.createMany","Section.createManyAndReturn","Section.updateOne","Section.updateMany","Section.updateManyAndReturn","Section.upsertOne","Section.deleteOne","Section.deleteMany","Section.groupBy","Section.aggregate","Enrollment.findUnique","Enrollment.findUniqueOrThrow","Enrollment.findFirst","Enrollment.findFirstOrThrow","Enrollment.findMany","Enrollment.createOne","Enrollment.createMany","Enrollment.createManyAndReturn","Enrollment.updateOne","Enrollment.updateMany","Enrollment.updateManyAndReturn","Enrollment.upsertOne","Enrollment.deleteOne","Enrollment.deleteMany","Enrollment.groupBy","Enrollment.aggregate","CourseAttendance.findUnique","CourseAttendance.findUniqueOrThrow","CourseAttendance.findFirst","CourseAttendance.findFirstOrThrow","CourseAttendance.findMany","CourseAttendance.createOne","CourseAttendance.createMany","CourseAttendance.createManyAndReturn","CourseAttendance.updateOne","CourseAttendance.updateMany","CourseAttendance.updateManyAndReturn","CourseAttendance.upsertOne","CourseAttendance.deleteOne","CourseAttendance.deleteMany","CourseAttendance.groupBy","CourseAttendance.aggregate","ChatRoom.findUnique","ChatRoom.findUniqueOrThrow","ChatRoom.findFirst","ChatRoom.findFirstOrThrow","ChatRoom.findMany","ChatRoom.createOne","ChatRoom.createMany","ChatRoom.createManyAndReturn","ChatRoom.updateOne","ChatRoom.updateMany","ChatRoom.updateManyAndReturn","ChatRoom.upsertOne","ChatRoom.deleteOne","ChatRoom.deleteMany","ChatRoom.groupBy","ChatRoom.aggregate","ChatMessage.findUnique","ChatMessage.findUniqueOrThrow","ChatMessage.findFirst","ChatMessage.findFirstOrThrow","ChatMessage.findMany","ChatMessage.createOne","ChatMessage.createMany","ChatMessage.createManyAndReturn","ChatMessage.updateOne","ChatMessage.updateMany","ChatMessage.updateManyAndReturn","ChatMessage.upsertOne","ChatMessage.deleteOne","ChatMessage.deleteMany","ChatMessage.groupBy","ChatMessage.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","ContactPageSetting.findUnique","ContactPageSetting.findUniqueOrThrow","ContactPageSetting.findFirst","ContactPageSetting.findFirstOrThrow","ContactPageSetting.findMany","ContactPageSetting.createOne","ContactPageSetting.createMany","ContactPageSetting.createManyAndReturn","ContactPageSetting.updateOne","ContactPageSetting.updateMany","ContactPageSetting.updateManyAndReturn","ContactPageSetting.upsertOne","ContactPageSetting.deleteOne","ContactPageSetting.deleteMany","ContactPageSetting.groupBy","ContactPageSetting.aggregate","SupportTeamMember.findUnique","SupportTeamMember.findUniqueOrThrow","SupportTeamMember.findFirst","SupportTeamMember.findFirstOrThrow","SupportTeamMember.findMany","SupportTeamMember.createOne","SupportTeamMember.createMany","SupportTeamMember.createManyAndReturn","SupportTeamMember.updateOne","SupportTeamMember.updateMany","SupportTeamMember.updateManyAndReturn","SupportTeamMember.upsertOne","SupportTeamMember.deleteOne","SupportTeamMember.deleteMany","SupportTeamMember.groupBy","SupportTeamMember.aggregate","ContactInquiry.findUnique","ContactInquiry.findUniqueOrThrow","ContactInquiry.findFirst","ContactInquiry.findFirstOrThrow","ContactInquiry.findMany","ContactInquiry.createOne","ContactInquiry.createMany","ContactInquiry.createManyAndReturn","ContactInquiry.updateOne","ContactInquiry.updateMany","ContactInquiry.updateManyAndReturn","ContactInquiry.upsertOne","ContactInquiry.deleteOne","ContactInquiry.deleteMany","ContactInquiry.groupBy","ContactInquiry.aggregate","CourseResult.findUnique","CourseResult.findUniqueOrThrow","CourseResult.findFirst","CourseResult.findFirstOrThrow","CourseResult.findMany","CourseResult.createOne","CourseResult.createMany","CourseResult.createManyAndReturn","CourseResult.updateOne","CourseResult.updateMany","CourseResult.updateManyAndReturn","CourseResult.upsertOne","CourseResult.deleteOne","CourseResult.deleteMany","CourseResult.groupBy","CourseResult.aggregate","Country.findUnique","Country.findUniqueOrThrow","Country.findFirst","Country.findFirstOrThrow","Country.findMany","Country.createOne","Country.createMany","Country.createManyAndReturn","Country.updateOne","Country.updateMany","Country.updateManyAndReturn","Country.upsertOne","Country.deleteOne","Country.deleteMany","Country.groupBy","Country.aggregate","GlobalUniversity.findUnique","GlobalUniversity.findUniqueOrThrow","GlobalUniversity.findFirst","GlobalUniversity.findFirstOrThrow","GlobalUniversity.findMany","GlobalUniversity.createOne","GlobalUniversity.createMany","GlobalUniversity.createManyAndReturn","GlobalUniversity.updateOne","GlobalUniversity.updateMany","GlobalUniversity.updateManyAndReturn","GlobalUniversity.upsertOne","GlobalUniversity.deleteOne","GlobalUniversity.deleteMany","GlobalUniversity.groupBy","GlobalUniversity.aggregate","UniversityDocRequirement.findUnique","UniversityDocRequirement.findUniqueOrThrow","UniversityDocRequirement.findFirst","UniversityDocRequirement.findFirstOrThrow","UniversityDocRequirement.findMany","UniversityDocRequirement.createOne","UniversityDocRequirement.createMany","UniversityDocRequirement.createManyAndReturn","UniversityDocRequirement.updateOne","UniversityDocRequirement.updateMany","UniversityDocRequirement.updateManyAndReturn","UniversityDocRequirement.upsertOne","UniversityDocRequirement.deleteOne","UniversityDocRequirement.deleteMany","UniversityDocRequirement.groupBy","UniversityDocRequirement.aggregate","GlobalProgram.findUnique","GlobalProgram.findUniqueOrThrow","GlobalProgram.findFirst","GlobalProgram.findFirstOrThrow","GlobalProgram.findMany","GlobalProgram.createOne","GlobalProgram.createMany","GlobalProgram.createManyAndReturn","GlobalProgram.updateOne","GlobalProgram.updateMany","GlobalProgram.updateManyAndReturn","GlobalProgram.upsertOne","GlobalProgram.deleteOne","GlobalProgram.deleteMany","GlobalProgram.groupBy","GlobalProgram.aggregate","HigherStudyApplication.findUnique","HigherStudyApplication.findUniqueOrThrow","HigherStudyApplication.findFirst","HigherStudyApplication.findFirstOrThrow","HigherStudyApplication.findMany","HigherStudyApplication.createOne","HigherStudyApplication.createMany","HigherStudyApplication.createManyAndReturn","HigherStudyApplication.updateOne","HigherStudyApplication.updateMany","HigherStudyApplication.updateManyAndReturn","HigherStudyApplication.upsertOne","HigherStudyApplication.deleteOne","HigherStudyApplication.deleteMany","HigherStudyApplication.groupBy","HigherStudyApplication.aggregate","ApplicationInternalNote.findUnique","ApplicationInternalNote.findUniqueOrThrow","ApplicationInternalNote.findFirst","ApplicationInternalNote.findFirstOrThrow","ApplicationInternalNote.findMany","ApplicationInternalNote.createOne","ApplicationInternalNote.createMany","ApplicationInternalNote.createManyAndReturn","ApplicationInternalNote.updateOne","ApplicationInternalNote.updateMany","ApplicationInternalNote.updateManyAndReturn","ApplicationInternalNote.upsertOne","ApplicationInternalNote.deleteOne","ApplicationInternalNote.deleteMany","ApplicationInternalNote.groupBy","ApplicationInternalNote.aggregate","CounselorNote.findUnique","CounselorNote.findUniqueOrThrow","CounselorNote.findFirst","CounselorNote.findFirstOrThrow","CounselorNote.findMany","CounselorNote.createOne","CounselorNote.createMany","CounselorNote.createManyAndReturn","CounselorNote.updateOne","CounselorNote.updateMany","CounselorNote.updateManyAndReturn","CounselorNote.upsertOne","CounselorNote.deleteOne","CounselorNote.deleteMany","CounselorNote.groupBy","CounselorNote.aggregate","ApplicationDocument.findUnique","ApplicationDocument.findUniqueOrThrow","ApplicationDocument.findFirst","ApplicationDocument.findFirstOrThrow","ApplicationDocument.findMany","ApplicationDocument.createOne","ApplicationDocument.createMany","ApplicationDocument.createManyAndReturn","ApplicationDocument.updateOne","ApplicationDocument.updateMany","ApplicationDocument.updateManyAndReturn","ApplicationDocument.upsertOne","ApplicationDocument.deleteOne","ApplicationDocument.deleteMany","ApplicationDocument.groupBy","ApplicationDocument.aggregate","BlogPost.findUnique","BlogPost.findUniqueOrThrow","BlogPost.findFirst","BlogPost.findFirstOrThrow","BlogPost.findMany","BlogPost.createOne","BlogPost.createMany","BlogPost.createManyAndReturn","BlogPost.updateOne","BlogPost.updateMany","BlogPost.updateManyAndReturn","BlogPost.upsertOne","BlogPost.deleteOne","BlogPost.deleteMany","BlogPost.groupBy","BlogPost.aggregate","StudentSuccessStory.findUnique","StudentSuccessStory.findUniqueOrThrow","StudentSuccessStory.findFirst","StudentSuccessStory.findFirstOrThrow","StudentSuccessStory.findMany","StudentSuccessStory.createOne","StudentSuccessStory.createMany","StudentSuccessStory.createManyAndReturn","StudentSuccessStory.updateOne","StudentSuccessStory.updateMany","StudentSuccessStory.updateManyAndReturn","StudentSuccessStory.upsertOne","StudentSuccessStory.deleteOne","StudentSuccessStory.deleteMany","StudentSuccessStory.groupBy","StudentSuccessStory.aggregate","SuccessPageSetting.findUnique","SuccessPageSetting.findUniqueOrThrow","SuccessPageSetting.findFirst","SuccessPageSetting.findFirstOrThrow","SuccessPageSetting.findMany","SuccessPageSetting.createOne","SuccessPageSetting.createMany","SuccessPageSetting.createManyAndReturn","SuccessPageSetting.updateOne","SuccessPageSetting.updateMany","SuccessPageSetting.updateManyAndReturn","SuccessPageSetting.upsertOne","SuccessPageSetting.deleteOne","SuccessPageSetting.deleteMany","SuccessPageSetting.groupBy","SuccessPageSetting.aggregate","ActivityLog.findUnique","ActivityLog.findUniqueOrThrow","ActivityLog.findFirst","ActivityLog.findFirstOrThrow","ActivityLog.findMany","ActivityLog.createOne","ActivityLog.createMany","ActivityLog.createManyAndReturn","ActivityLog.updateOne","ActivityLog.updateMany","ActivityLog.updateManyAndReturn","ActivityLog.upsertOne","ActivityLog.deleteOne","ActivityLog.deleteMany","ActivityLog.groupBy","ActivityLog.aggregate","AgencyCommission.findUnique","AgencyCommission.findUniqueOrThrow","AgencyCommission.findFirst","AgencyCommission.findFirstOrThrow","AgencyCommission.findMany","AgencyCommission.createOne","AgencyCommission.createMany","AgencyCommission.createManyAndReturn","AgencyCommission.updateOne","AgencyCommission.updateMany","AgencyCommission.updateManyAndReturn","AgencyCommission.upsertOne","AgencyCommission.deleteOne","AgencyCommission.deleteMany","AgencyCommission.groupBy","AgencyCommission.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","Faculty.findUnique","Faculty.findUniqueOrThrow","Faculty.findFirst","Faculty.findFirstOrThrow","Faculty.findMany","Faculty.createOne","Faculty.createMany","Faculty.createManyAndReturn","Faculty.updateOne","Faculty.updateMany","Faculty.updateManyAndReturn","Faculty.upsertOne","Faculty.deleteOne","Faculty.deleteMany","Faculty.groupBy","Faculty.aggregate","Counselor.findUnique","Counselor.findUniqueOrThrow","Counselor.findFirst","Counselor.findFirstOrThrow","Counselor.findMany","Counselor.createOne","Counselor.createMany","Counselor.createManyAndReturn","Counselor.updateOne","Counselor.updateMany","Counselor.updateManyAndReturn","Counselor.upsertOne","Counselor.deleteOne","Counselor.deleteMany","Counselor.groupBy","Counselor.aggregate","AND","OR","NOT","id","counselorId","designation","contactNumber","specialization","CommissionVisibilityMode","commissionVisibilityMode","defaultVatPercentage","defaultCompanySharePercentage","isDeleted","deletedAt","createdAt","updatedAt","userId","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","facultyId","departmentId","studentId","address","Gender","gender","dateOfBirth","StudentAccessScope","accessScope","targetBudget","preferredCurrency","preferredCountry","referredByUserId","name","email","password","googleId","AuthProvider","authProvider","Role","role","UserStatus","status","isEmailVerified","otpCode","otpExpiresAt","OtpType","otpType","imageUrl","imagePublicId","amount","currency","PaymentType","paymentType","PaymentStatus","stripeSessionId","stripePaymentIntentId","stripeReceiptUrl","paidAt","description","semesterId","higherStudyApplicationId","applicationId","universityName","grossAmount","vatPercentage","vatAmount","companySharePercentage","companyShareAmount","companyShareAmountBDT","netAmount","exchangeRateToBDT","netAmountBDT","grossAmountBDT","CommissionStatus","withdrawnAt","action","module","targetId","targetTitle","performedBy","userName","userEmail","details","badgeText","titlePart1","titlePart2","stat1Value","stat1Label","stat2Value","stat2Label","stat3Value","stat3Label","stat4Value","stat4Label","slug","studentName","photoUrl","thumbnailUrl","homeInstitution","hometown","degreeName","intake","visaDate","youtubeUrl","testimonial","storyContent","scholarshipNote","viewsCount","isPublished","createdBy","title","content","bannerUrl","category","tags","authorId","has","hasEvery","hasSome","instruction","DocumentStatus","fileUrl","filePublicId","fileType","isCustom","adminFeedback","uploadedAt","note","isPrivate","authorName","authorRole","authorAvatar","applicationNumber","ApplicationStatus","isFeePaid","isOfferUnlocked","offerLetterUrl","offerLetterPublicId","offerIssuedAt","programId","appliedUniversities","customInformation","trackingMilestones","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","DegreeLevel","degreeLevel","durationYears","tuitionFee","initialDeposit","intakeSeason","applicationDeadline","ieltsRequirement","academicRequirement","universityId","isRequired","docType","city","website","logoUrl","coverImageUrl","UniversityPaymentType","applicationFee","offerDepositFee","countryId","code","flagUrl","marks","gradePoint","letterGrade","remarks","sectionId","phone","subject","message","isRead","reply","repliedAt","badge","badgeColor","avatar","avatarAlt","whatsapp","facebook","order","isActive","headquartersTitle","headquartersAddress","headquartersNote","officeHoursTitle","officeHoursSchedule","officeHoursNote","autoResponderSubject","autoResponderSenderName","autoResponderSenderEmail","autoResponderWhatsAppText","autoResponderWhatsAppNumber","autoResponderOfficeAddress","autoResponderHotline","autoResponderEmail","autoResponderHours","autoResponderLogoUrl","otpEmailSubject","otpEmailHeading","otpEmailBodyMessage","otpEmailExpiryNote","regOtpEmailSubject","regOtpEmailHeading","regOtpEmailBodyMessage","regOtpEmailExpiryNote","welcomeEmailSubject","welcomeEmailHeading","welcomeEmailMessage","welcomeEmailBtnText","welcomeEmailBtnUrl","body","NotificationAudience","audience","NotificationPriority","priority","actionUrl","roomId","attachmentUrl","senderDisplayName","senderRoleBadge","senderId","receiverId","studentUserId","ChatMode","mode","isLocked","lockedByAgentId","lockedByAgentName","date","AttendanceStatus","EnrollmentStatus","enrolledAt","sectionName","maxCapacity","availableSeats","roomNumber","scheduleTime","courseId","credits","prerequisiteId","startDate","endDate","isCurrent","unique_student_daily_attendance","unique_student_section_enrollment","unique_student_course_grade","unique_section_per_semester","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "7Q-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-CAAwqgQAABsAEKsEAAC-CAAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAhygQBAIkHACHeBAAAwAjrBCLmBBAAjAcAIecEAQCJBwAh6QQAAL8I6QQi6wQBAIoHACHsBAEAigcAIe0EAQCKBwAh7gRAAI4HACHvBAEAigcAIfAEAQCKBwAh8QQBAIoHACEKAwAA2wsAIAsAAIcOACAbAACIDgAg6wQAANIIACDsBAAA0ggAIO0EAADSCAAg7gQAANIIACDvBAAA0ggAIPAEAADSCAAg8QQAANIIACAVAwAAnwgAIAsAAMEIACAbAADCCAAgqQQAAL4IADCqBAAAGwAQqwQAAL4IADCsBAEAAAABtwRAAI8HACG4BEAAjwcAIcoEAQCJBwAh3gQAAMAI6wQi5gQQAIwHACHnBAEAiQcAIekEAAC_COkEIusEAQAAAAHsBAEAAAAB7QQBAIoHACHuBEAAjgcAIe8EAQCKBwAh8AQBAIoHACHxBAEAigcAIQMAAAAbACABAAAcADACAAAdACAQCAAAjQgAIBgAAI4IACAdAACPCAAgqQQAAIwIADCqBAAAHwAQqwQAAIwIADCsBAEAiQcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAh1QQBAIkHACHeBQEAiQcAIa4GQACPBwAhrwZAAI8HACGwBiAAjQcAIQEAAAAfACAcAwAAnwgAIA4AALIHACAWAAC7CAAgFwAAvAgAIBgAAI4IACAZAACSBwAgGgAAvQgAIKkEAAC4CAAwqgQAACEAEKsEAAC4CAAwrAQBAIkHACGtBAEAigcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhygQBAIkHACHeBAAAuQi7BSK5BQEAiQcAIbsFIACNBwAhvAUgAI0HACG9BQEAigcAIb4FAQCKBwAhvwVAAI4HACHABQEAiQcAIcEFAAC6CAAgwgUAALoIACDDBQAAuggAIAEAAAAhACATBAAAkAcAIAwAAJEHACAPAACSBwAgqQQAAIgHADCqBAAAIwAQqwQAAIgHADCsBAEAiQcAIa0EAQCJBwAhrgQBAIkHACGvBAEAigcAIbAEAQCKBwAhsgQAAIsHsgQiswQQAIwHACG0BBAAjAcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhuQQBAIkHACEBAAAAIwAgDwMAANsLACAOAADdCwAgFgAAjQ4AIBcAAI4OACAYAADZDQAgGQAAxAkAIBoAAI8OACCtBAAA0ggAILYEAADSCAAgvQUAANIIACC-BQAA0ggAIL8FAADSCAAgwQUAANIIACDCBQAA0ggAIMMFAADSCAAgHAMAAJ8IACAOAACyBwAgFgAAuwgAIBcAALwIACAYAACOCAAgGQAAkgcAIBoAAL0IACCpBAAAuAgAMKoEAAAhABCrBAAAuAgAMKwEAQAAAAGtBAEAigcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhygQBAIkHACHeBAAAuQi7BSK5BQEAAAABuwUgAI0HACG8BSAAjQcAIb0FAQCKBwAhvgUBAIoHACG_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-AQQAIwHACH5BBAAjAcAIfoEEACMBwAh-wQQAIwHACH8BBAAjAcAIf0EEACMBwAh_wRAAI4HACEEGQAA0ggAICQAAMIJACDyBAAA0ggAIP8EAADSCAAgGRkBAIoHACEkAACQBwAgqQQAAJkIADCqBAAAaAAQqwQAAJkIADCsBAEAAAABtwRAAI8HACG4BEAAjwcAIcoEAQCJBwAh1AQBAIkHACHeBAAAmgj_BCLnBAEAiQcAIfIEAQCKBwAh8wQBAIkHACH0BBAAjAcAIfUEEACMBwAh9gQQAIwHACH3BBAAjAcAIfgEEACMBwAh-QQQAIwHACH6BBAAjAcAIfsEEACMBwAh_AQQAIwHACH9BBAAjAcAIf8EQACOBwAhAwAAAGgAIAEAAGkAMAIAAGoAIBEnAACYCAAgKAAAkAcAICkAAJYIACCpBAAAlwgAMKoEAABsABCrBAAAlwgAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIecFAQCJBwAh6AUgAI0HACGWBgEAigcAIZcGAQCKBwAhmAYBAIoHACGZBgEAiQcAIZoGAQCJBwAhmwYBAIoHACEHJwAAhQ4AICgAAMIJACApAADCCQAglgYAANIIACCXBgAA0ggAIJgGAADSCAAgmwYAANIIACARJwAAmAgAICgAAJAHACApAACWCAAgqQQAAJcIADCqBAAAbAAQqwQAAJcIADCsBAEAAAABtwRAAI8HACG4BEAAjwcAIecFAQCJBwAh6AUgAI0HACGWBgEAigcAIZcGAQCKBwAhmAYBAIoHACGZBgEAiQcAIZoGAQCJBwAhmwYBAIoHACEDAAAAbAAgAQAAbQAwAgAAbgAgDSYAALYHACCpBAAA_wcAMKoEAABwABCrBAAA_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_QEAIAIAAABVACA2AAD9AQAgAwAAAFcAID0AAPYBACA-AAD7AQAgAQAAAFcAIAEAAABVACAECQAAiA0AIEMAAIoNACBEAACJDQAgtgQAANIIACAKqQQAAIUIADCqBAAAhAIAEKsEAACFCAAwrAQBAPEGACG1BCAA9QYAIbYEQAD2BgAhygQBAPEGACHeBAAAhgilBiLkBQEA8QYAIaUGQAD3BgAhAwAAAFUAIAEAAIMCADBCAACEAgAgAwAAAFUAIAEAAFYAMAIAAFcAIAEAAABbACABAAAAWwAgAwAAAFkAIAEAAFoAMAIAAFsAIAMAAABZACABAABaADACAABbACADAAAAWQAgAQAAWgAwAgAAWwAgCgMAAPsJACAcAADPCgAgrAQBAAAAAbcEQAAAAAG4BEAAAAABygQBAAAAAd4EAAAApAYC4wUBAAAAAeQFAQAAAAGiBkAAAAABATYAAIwCACAIrAQBAAAAAbcEQAAAAAG4BEAAAAABygQBAAAAAd4EAAAApAYC4wUBAAAAAeQFAQAAAAGiBkAAAAABATYAAI4CADABNgAAjgIAMAoDAAD5CQAgHAAAzQoAIKwEAQDYCAAhtwRAAN4IACG4BEAA3ggAIcoEAQDYCAAh3gQAAPcJpAYi4wUBANkIACHkBQEA2AgAIaIGQADeCAAhAgAAAFsAIDYAAJECACAIrAQBANgIACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHeBAAA9wmkBiLjBQEA2QgAIeQFAQDYCAAhogZAAN4IACECAAAAWQAgNgAAkwIAIAIAAABZACA2AACTAgAgAwAAAFsAID0AAIwCACA-AACRAgAgAQAAAFsAIAEAAABZACAECQAAhQ0AIEMAAIcNACBEAACGDQAg4wUAANIIACALqQQAAIEIADCqBAAAmgIAEKsEAACBCAAwrAQBAPEGACG3BEAA9wYAIbgEQAD3BgAhygQBAPEGACHeBAAAggikBiLjBQEA8gYAIeQFAQDxBgAhogZAAPcGACEDAAAAWQAgAQAAmQIAMEIAAJoCACADAAAAWQAgAQAAWgAwAgAAWwAgDSYAALYHACCpBAAA_wcAMKoEAABwABCrBAAA_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_QqSBiKUBgAA_gqUBiKVBgEA2QgAIQIAAAB2ACA2AADcAgAgAgAAAHYAIDYAANwCACABAAAABwAgAwAAAHgAID0AANQCACA-AADaAgAgAQAAAHgAIAEAAAB2ACAFCQAA7gwAIEMAAPAMACBEAADvDAAguQQAANIIACCVBgAA0ggAIA2pBAAA8wcAMKoEAADkAgAQqwQAAPMHADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACG5BAEA8gYAIaMFAQDxBgAh6AUgAPUGACGQBgEA8QYAIZIGAAD0B5IGIpQGAAD1B5QGIpUGAQDyBgAhAwAAAHYAIAEAAOMCADBCAADkAgAgAwAAAHYAIAEAAHcAMAIAAHgAICOpBAAA8gcAMKoEAADqAgAQqwQAAPIHADCsBAEAAAABtwRAAI8HACG4BEAAjwcAIfMFAQCJBwAh9AUBAIkHACH1BQEAiQcAIfYFAQCJBwAh9wUBAIkHACH4BQEAiQcAIfkFAQCJBwAh-gUBAIkHACH7BQEAiQcAIfwFAQCJBwAh_QUBAIkHACH-BQEAiQcAIf8FAQCJBwAhgAYBAIkHACGBBgEAiQcAIYIGAQCKBwAhgwYBAIkHACGEBgEAiQcAIYUGAQCJBwAhhgYBAIkHACGHBgEAiQcAIYgGAQCJBwAhiQYBAIkHACGKBgEAiQcAIYsGAQCJBwAhjAYBAIkHACGNBgEAiQcAIY4GAQCJBwAhjwYBAIkHACEBAAAA5wIAIAEAAADnAgAgI6kEAADyBwAwqgQAAOoCABCrBAAA8gcAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIfMFAQCJBwAh9AUBAIkHACH1BQEAiQcAIfYFAQCJBwAh9wUBAIkHACH4BQEAiQcAIfkFAQCJBwAh-gUBAIkHACH7BQEAiQcAIfwFAQCJBwAh_QUBAIkHACH-BQEAiQcAIf8FAQCJBwAhgAYBAIkHACGBBgEAiQcAIYIGAQCKBwAhgwYBAIkHACGEBgEAiQcAIYUGAQCJBwAhhgYBAIkHACGHBgEAiQcAIYgGAQCJBwAhiQYBAIkHACGKBgEAiQcAIYsGAQCJBwAhjAYBAIkHACGNBgEAiQcAIY4GAQCJBwAhjwYBAIkHACEBggYAANIIACADAAAA6gIAIAEAAOsCADACAADnAgAgAwAAAOoCACABAADrAgAwAgAA5wIAIAMAAADqAgAgAQAA6wIAMAIAAOcCACAgrAQBAAAAAbcEQAAAAAG4BEAAAAAB8wUBAAAAAfQFAQAAAAH1BQEAAAAB9gUBAAAAAfcFAQAAAAH4BQEAAAAB-QUBAAAAAfoFAQAAAAH7BQEAAAAB_AUBAAAAAf0FAQAAAAH-BQEAAAAB_wUBAAAAAYAGAQAAAAGBBgEAAAABggYBAAAAAYMGAQAAAAGEBgEAAAABhQYBAAAAAYYGAQAAAAGHBgEAAAABiAYBAAAAAYkGAQAAAAGKBgEAAAABiwYBAAAAAYwGAQAAAAGNBgEAAAABjgYBAAAAAY8GAQAAAAEBNgAA7wIAICCsBAEAAAABtwRAAAAAAbgEQAAAAAHzBQEAAAAB9AUBAAAAAfUFAQAAAAH2BQEAAAAB9wUBAAAAAfgFAQAAAAH5BQEAAAAB-gUBAAAAAfsFAQAAAAH8BQEAAAAB_QUBAAAAAf4FAQAAAAH_BQEAAAABgAYBAAAAAYEGAQAAAAGCBgEAAAABgwYBAAAAAYQGAQAAAAGFBgEAAAABhgYBAAAAAYcGAQAAAAGIBgEAAAABiQYBAAAAAYoGAQAAAAGLBgEAAAABjAYBAAAAAY0GAQAAAAGOBgEAAAABjwYBAAAAAQE2AADxAgAwATYAAPECADAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAh8wUBANgIACH0BQEA2AgAIfUFAQDYCAAh9gUBANgIACH3BQEA2AgAIfgFAQDYCAAh-QUBANgIACH6BQEA2AgAIfsFAQDYCAAh_AUBANgIACH9BQEA2AgAIf4FAQDYCAAh_wUBANgIACGABgEA2AgAIYEGAQDYCAAhggYBANkIACGDBgEA2AgAIYQGAQDYCAAhhQYBANgIACGGBgEA2AgAIYcGAQDYCAAhiAYBANgIACGJBgEA2AgAIYoGAQDYCAAhiwYBANgIACGMBgEA2AgAIY0GAQDYCAAhjgYBANgIACGPBgEA2AgAIQIAAADnAgAgNgAA9AIAICCsBAEA2AgAIbcEQADeCAAhuARAAN4IACHzBQEA2AgAIfQFAQDYCAAh9QUBANgIACH2BQEA2AgAIfcFAQDYCAAh-AUBANgIACH5BQEA2AgAIfoFAQDYCAAh-wUBANgIACH8BQEA2AgAIf0FAQDYCAAh_gUBANgIACH_BQEA2AgAIYAGAQDYCAAhgQYBANgIACGCBgEA2QgAIYMGAQDYCAAhhAYBANgIACGFBgEA2AgAIYYGAQDYCAAhhwYBANgIACGIBgEA2AgAIYkGAQDYCAAhigYBANgIACGLBgEA2AgAIYwGAQDYCAAhjQYBANgIACGOBgEA2AgAIY8GAQDYCAAhAgAAAOoCACA2AAD2AgAgAgAAAOoCACA2AAD2AgAgAwAAAOcCACA9AADvAgAgPgAA9AIAIAEAAADnAgAgAQAAAOoCACAECQAA6wwAIEMAAO0MACBEAADsDAAgggYAANIIACAjqQQAAPEHADCqBAAA_QIAEKsEAADxBwAwrAQBAPEGACG3BEAA9wYAIbgEQAD3BgAh8wUBAPEGACH0BQEA8QYAIfUFAQDxBgAh9gUBAPEGACH3BQEA8QYAIfgFAQDxBgAh-QUBAPEGACH6BQEA8QYAIfsFAQDxBgAh_AUBAPEGACH9BQEA8QYAIf4FAQDxBgAh_wUBAPEGACGABgEA8QYAIYEGAQDxBgAhggYBAPIGACGDBgEA8QYAIYQGAQDxBgAhhQYBAPEGACGGBgEA8QYAIYcGAQDxBgAhiAYBAPEGACGJBgEA8QYAIYoGAQDxBgAhiwYBAPEGACGMBgEA8QYAIY0GAQDxBgAhjgYBAPEGACGPBgEA8QYAIQMAAADqAgAgAQAA_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_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_BUAAAAABwAUBAAAAAcEFgAAAAAHCBYAAAAABwwWAAAAAAQE2AACoBAAgEqwEAQAAAAGtBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAcoEAQAAAAHeBAAAALsFArkFAQAAAAG7BSAAAAABvAUgAAAAAb0FAQAAAAG-BQEAAAABvwVAAAAAAcAFAQAAAAHBBYAAAAABwgWAAAAAAcMFgAAAAAEBNgAAqgQAMAE2AACqBAAwAQAAACMAIBkDAAD8CAAgDgAArAoAIBYAAP0IACAXAAD-CAAgGAAA_wgAIBkAAIAJACAaAACBCQAgrAQBANgIACGtBAEA2QgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHeBAAA-gi7BSK5BQEA2AgAIbsFIADcCAAhvAUgANwIACG9BQEA2QgAIb4FAQDZCAAhvwVAAN0IACHABQEA2AgAIcEFgAAAAAHCBYAAAAABwwWAAAAAAQIAAAAmACA2AACuBAAgEqwEAQDYCAAhrQQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIcoEAQDYCAAh3gQAAPoIuwUiuQUBANgIACG7BSAA3AgAIbwFIADcCAAhvQUBANkIACG-BQEA2QgAIb8FQADdCAAhwAUBANgIACHBBYAAAAABwgWAAAAAAcMFgAAAAAECAAAAIQAgNgAAsAQAIAIAAAAhACA2AACwBAAgAQAAACMAIAMAAAAmACA9AACoBAAgPgAArgQAIAEAAAAmACABAAAAIQAgCwkAAIwMACBDAACODAAgRAAAjQwAIK0EAADSCAAgtgQAANIIACC9BQAA0ggAIL4FAADSCAAgvwUAANIIACDBBQAA0ggAIMIFAADSCAAgwwUAANIIACAVqQQAANUHADCqBAAAuAQAEKsEAADVBwAwrAQBAPEGACGtBAEA8gYAIbUEIAD1BgAhtgRAAPYGACG3BEAA9wYAIbgEQAD3BgAhygQBAPEGACHeBAAA1ge7BSK5BQEA8QYAIbsFIAD1BgAhvAUgAPUGACG9BQEA8gYAIb4FAQDyBgAhvwVAAPYGACHABQEA8QYAIcEFAADXBwAgwgUAANcHACDDBQAA1wcAIAMAAAAhACABAAC3BAAwQgAAuAQAIAMAAAAhACABAAAlADACAAAmACABAAAARwAgAQAAAEcAIAMAAABFACABAABGADACAABHACADAAAARQAgAQAARgAwAgAARwAgAwAAAEUAIAEAAEYAMAIAAEcAIAoNAACLDAAgrAQBAAAAAbcEQAAAAAG4BEAAAAAB8gQBAAAAAagFAQAAAAG0BQEAAAABtgUBAAAAAbcFAQAAAAG4BQEAAAABATYAAMAEACAJrAQBAAAAAbcEQAAAAAG4BEAAAAAB8gQBAAAAAagFAQAAAAG0BQEAAAABtgUBAAAAAbcFAQAAAAG4BQEAAAABATYAAMIEADABNgAAwgQAMAoNAACKDAAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAh8gQBANgIACGoBQEA2AgAIbQFAQDYCAAhtgUBANgIACG3BQEA2AgAIbgFAQDZCAAhAgAAAEcAIDYAAMUEACAJrAQBANgIACG3BEAA3ggAIbgEQADeCAAh8gQBANgIACGoBQEA2AgAIbQFAQDYCAAhtgUBANgIACG3BQEA2AgAIbgFAQDZCAAhAgAAAEUAIDYAAMcEACACAAAARQAgNgAAxwQAIAMAAABHACA9AADABAAgPgAAxQQAIAEAAABHACABAAAARQAgBAkAAIcMACBDAACJDAAgRAAAiAwAILgFAADSCAAgDKkEAADUBwAwqgQAAM4EABCrBAAA1AcAMKwEAQDxBgAhtwRAAPcGACG4BEAA9wYAIfIEAQDxBgAhqAUBAPEGACG0BQEA8QYAIbYFAQDxBgAhtwUBAPEGACG4BQEA8gYAIQMAAABFACABAADNBAAwQgAAzgQAIAMAAABFACABAABGADACAABHACABAAAAKgAgAQAAACoAIAMAAAAoACABAAApADACAAAqACADAAAAKAAgAQAAKQAwAgAAKgAgAwAAACgAIAEAACkAMAIAACoAIAkNAADvCAAgDgAAmAkAIKwEAQAAAAGtBAEAAAABtwRAAAAAAbgEQAAAAAHyBAEAAAABtAUBAAAAAbUFIAAAAAEBNgAA1gQAIAesBAEAAAABrQQBAAAAAbcEQAAAAAG4BEAAAAAB8gQBAAAAAbQFAQAAAAG1BSAAAAABATYAANgEADABNgAA2AQAMAkNAADtCAAgDgAAlgkAIKwEAQDYCAAhrQQBANgIACG3BEAA3ggAIbgEQADeCAAh8gQBANgIACG0BQEA2AgAIbUFIADcCAAhAgAAACoAIDYAANsEACAHrAQBANgIACGtBAEA2AgAIbcEQADeCAAhuARAAN4IACHyBAEA2AgAIbQFAQDYCAAhtQUgANwIACECAAAAKAAgNgAA3QQAIAIAAAAoACA2AADdBAAgAwAAACoAID0AANYEACA-AADbBAAgAQAAACoAIAEAAAAoACADCQAAhAwAIEMAAIYMACBEAACFDAAgCqkEAADTBwAwqgQAAOQEABCrBAAA0wcAMKwEAQDxBgAhrQQBAPEGACG3BEAA9wYAIbgEQAD3BgAh8gQBAPEGACG0BQEA8QYAIbUFIAD1BgAhAwAAACgAIAEAAOMEADBCAADkBAAgAwAAACgAIAEAACkAMAIAACoAIAEAAABBACABAAAAQQAgAwAAAD8AIAEAAEAAMAIAAEEAIAMAAAA_ACABAABAADACAABBACADAAAAPwAgAQAAQAAwAgAAQQAgDg0AAIMMACCsBAEAAAABtwRAAAAAAbgEQAAAAAHeBAAAAK4FAvIEAQAAAAGjBQEAAAABrAUBAAAAAa4FAQAAAAGvBQEAAAABsAUBAAAAAbEFIAAAAAGyBQEAAAABswVAAAAAAQE2AADsBAAgDawEAQAAAAG3BEAAAAABuARAAAAAAd4EAAAArgUC8gQBAAAAAaMFAQAAAAGsBQEAAAABrgUBAAAAAa8FAQAAAAGwBQEAAAABsQUgAAAAAbIFAQAAAAGzBUAAAAABATYAAO4EADABNgAA7gQAMA4NAACCDAAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAh3gQAALUJrgUi8gQBANgIACGjBQEA2AgAIawFAQDZCAAhrgUBANkIACGvBQEA2QgAIbAFAQDZCAAhsQUgANwIACGyBQEA2QgAIbMFQADdCAAhAgAAAEEAIDYAAPEEACANrAQBANgIACG3BEAA3ggAIbgEQADeCAAh3gQAALUJrgUi8gQBANgIACGjBQEA2AgAIawFAQDZCAAhrgUBANkIACGvBQEA2QgAIbAFAQDZCAAhsQUgANwIACGyBQEA2QgAIbMFQADdCAAhAgAAAD8AIDYAAPMEACACAAAAPwAgNgAA8wQAIAMAAABBACA9AADsBAAgPgAA8QQAIAEAAABBACABAAAAPwAgCQkAAP8LACBDAACBDAAgRAAAgAwAIKwFAADSCAAgrgUAANIIACCvBQAA0ggAILAFAADSCAAgsgUAANIIACCzBQAA0ggAIBCpBAAAzwcAMKoEAAD6BAAQqwQAAM8HADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACHeBAAA0AeuBSLyBAEA8QYAIaMFAQDxBgAhrAUBAPIGACGuBQEA8gYAIa8FAQDyBgAhsAUBAPIGACGxBSAA9QYAIbIFAQDyBgAhswVAAPYGACEDAAAAPwAgAQAA-QQAMEIAAPoEACADAAAAPwAgAQAAQAAwAgAAQQAgAQAAAGUAIAEAAABlACADAAAAYwAgAQAAZAAwAgAAZQAgAwAAAGMAIAEAAGQAMAIAAGUAIAMAAABjACABAABkADACAABlACAOIQAA_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_wQC5wQBAAAAAfIEAQAAAAHzBAEAAAAB9AQQAAAAAfUEEAAAAAH2BBAAAAAB9wQQAAAAAfgEEAAAAAH5BBAAAAAB-gQQAAAAAfsEEAAAAAH8BBAAAAAB_QQQAAAAAf8EQAAAAAEBNgAA4wUAIBUZAQAAAAGsBAEAAAABtwRAAAAAAbgEQAAAAAHKBAEAAAAB1AQBAAAAAd4EAAAA_wQC5wQBAAAAAfIEAQAAAAHzBAEAAAAB9AQQAAAAAfUEEAAAAAH2BBAAAAAB9wQQAAAAAfgEEAAAAAH5BBAAAAAB-gQQAAAAAfsEEAAAAAH8BBAAAAAB_QQQAAAAAf8EQAAAAAEBNgAA5QUAMAE2AADlBQAwFhkBANkIACEkAADtCwAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHUBAEA2AgAId4EAACmC_8EIucEAQDYCAAh8gQBANkIACHzBAEA2AgAIfQEEADbCAAh9QQQANsIACH2BBAA2wgAIfcEEADbCAAh-AQQANsIACH5BBAA2wgAIfoEEADbCAAh-wQQANsIACH8BBAA2wgAIf0EEADbCAAh_wRAAN0IACECAAAAagAgNgAA6AUAIBUZAQDZCAAhrAQBANgIACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHUBAEA2AgAId4EAACmC_8EIucEAQDYCAAh8gQBANkIACHzBAEA2AgAIfQEEADbCAAh9QQQANsIACH2BBAA2wgAIfcEEADbCAAh-AQQANsIACH5BBAA2wgAIfoEEADbCAAh-wQQANsIACH8BBAA2wgAIf0EEADbCAAh_wRAAN0IACECAAAAaAAgNgAA6gUAIAIAAABoACA2AADqBQAgAwAAAGoAID0AAOMFACA-AADoBQAgAQAAAGoAIAEAAABoACAICQAA6AsAIBkAANIIACBDAADrCwAgRAAA6gsAIGUAAOkLACBmAADsCwAg8gQAANIIACD_BAAA0ggAIBgZAQDyBgAhqQQAAL8HADCqBAAA8QUAEKsEAAC_BwAwrAQBAPEGACG3BEAA9wYAIbgEQAD3BgAhygQBAPEGACHUBAEA8QYAId4EAADAB_8EIucEAQDxBgAh8gQBAPIGACHzBAEA8QYAIfQEEAD0BgAh9QQQAPQGACH2BBAA9AYAIfcEEAD0BgAh-AQQAPQGACH5BBAA9AYAIfoEEAD0BgAh-wQQAPQGACH8BBAA9AYAIf0EEAD0BgAh_wRAAPYGACEDAAAAaAAgAQAA8AUAMEIAAPEFACADAAAAaAAgAQAAaQAwAgAAagAgAQAAAB0AIAEAAAAdACADAAAAGwAgAQAAHAAwAgAAHQAgAwAAABsAIAEAABwAMAIAAB0AIAMAAAAbACABAAAcADACAAAdACASAwAAqQkAIAsAAKoJACAbAAC5CgAgrAQBAAAAAbcEQAAAAAG4BEAAAAABygQBAAAAAd4EAAAA6wQC5gQQAAAAAecEAQAAAAHpBAAAAOkEAusEAQAAAAHsBAEAAAAB7QQBAAAAAe4EQAAAAAHvBAEAAAAB8AQBAAAAAfEEAQAAAAEBNgAA-QUAIA-sBAEAAAABtwRAAAAAAbgEQAAAAAHKBAEAAAAB3gQAAADrBALmBBAAAAAB5wQBAAAAAekEAAAA6QQC6wQBAAAAAewEAQAAAAHtBAEAAAAB7gRAAAAAAe8EAQAAAAHwBAEAAAAB8QQBAAAAAQE2AAD7BQAwATYAAPsFADABAAAAHwAgAQAAACEAIBIDAACmCQAgCwAApwkAIBsAALcKACCsBAEA2AgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAACkCesEIuYEEADbCAAh5wQBANgIACHpBAAAownpBCLrBAEA2QgAIewEAQDZCAAh7QQBANkIACHuBEAA3QgAIe8EAQDZCAAh8AQBANkIACHxBAEA2QgAIQIAAAAdACA2AACABgAgD6wEAQDYCAAhtwRAAN4IACG4BEAA3ggAIcoEAQDYCAAh3gQAAKQJ6wQi5gQQANsIACHnBAEA2AgAIekEAACjCekEIusEAQDZCAAh7AQBANkIACHtBAEA2QgAIe4EQADdCAAh7wQBANkIACHwBAEA2QgAIfEEAQDZCAAhAgAAABsAIDYAAIIGACACAAAAGwAgNgAAggYAIAEAAAAfACABAAAAIQAgAwAAAB0AID0AAPkFACA-AACABgAgAQAAAB0AIAEAAAAbACAMCQAA4wsAIEMAAOYLACBEAADlCwAgZQAA5AsAIGYAAOcLACDrBAAA0ggAIOwEAADSCAAg7QQAANIIACDuBAAA0ggAIO8EAADSCAAg8AQAANIIACDxBAAA0ggAIBKpBAAAuAcAMKoEAACLBgAQqwQAALgHADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACHKBAEA8QYAId4EAAC6B-sEIuYEEAD0BgAh5wQBAPEGACHpBAAAuQfpBCLrBAEA8gYAIewEAQDyBgAh7QQBAPIGACHuBEAA9gYAIe8EAQDyBgAh8AQBAPIGACHxBAEA8gYAIQMAAAAbACABAACKBgAwQgAAiwYAIAMAAAAbACABAAAcADACAAAdACAfAwAAsAcAIA4AALIHACAeAACxBwAgIgAAswcAICMAALQHACAlAAC1BwAgKgAAtgcAICsAALYHACAsAAC3BwAgqQQAAKsHADCqBAAABwAQqwQAAKsHADCsBAEAAAABrwQBAIoHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh1gQBAAAAAdcEAQCKBwAh2AQBAAAAAdoEAACsB9oEItwEAACtB9wEIt4EAACuB94EIt8EIACNBwAh4AQBAIoHACHhBEAAjgcAIeMEAACvB-MEI-QEAQCJBwAh5QQBAIkHACEBAAAAjgYAIAEAAACOBgAgEAMAANsLACAOAADdCwAgHgAA3AsAICIAAN4LACAjAADfCwAgJQAA4AsAICoAAOELACArAADhCwAgLAAA4gsAIK8EAADSCAAgtgQAANIIACDXBAAA0ggAINgEAADSCAAg4AQAANIIACDhBAAA0ggAIOMEAADSCAAgAwAAAAcAIAEAAJEGADACAACOBgAgAwAAAAcAIAEAAJEGADACAACOBgAgAwAAAAcAIAEAAJEGADACAACOBgAgHAMAANILACAOAADUCwAgHgAA0wsAICIAANULACAjAADWCwAgJQAA1wsAICoAANgLACArAADZCwAgLAAA2gsAIKwEAQAAAAGvBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAdUEAQAAAAHWBAEAAAAB1wQBAAAAAdgEAQAAAAHaBAAAANoEAtwEAAAA3AQC3gQAAADeBALfBCAAAAAB4AQBAAAAAeEEQAAAAAHjBAAAAOMEA-QEAQAAAAHlBAEAAAABATYAAJUGACATrAQBAAAAAa8EAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAB1QQBAAAAAdYEAQAAAAHXBAEAAAAB2AQBAAAAAdoEAAAA2gQC3AQAAADcBALeBAAAAN4EAt8EIAAAAAHgBAEAAAAB4QRAAAAAAeMEAAAA4wQD5AQBAAAAAeUEAQAAAAEBNgAAlwYAMAE2AACXBgAwHAMAAOoKACAOAADsCgAgHgAA6woAICIAAO0KACAjAADuCgAgJQAA7woAICoAAPAKACArAADxCgAgLAAA8goAIKwEAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIdUEAQDYCAAh1gQBANgIACHXBAEA2QgAIdgEAQDZCAAh2gQAAOYK2gQi3AQAAOcK3AQi3gQAAOgK3gQi3wQgANwIACHgBAEA2QgAIeEEQADdCAAh4wQAAOkK4wQj5AQBANgIACHlBAEA2AgAIQIAAACOBgAgNgAAmgYAIBOsBAEA2AgAIa8EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHVBAEA2AgAIdYEAQDYCAAh1wQBANkIACHYBAEA2QgAIdoEAADmCtoEItwEAADnCtwEIt4EAADoCt4EIt8EIADcCAAh4AQBANkIACHhBEAA3QgAIeMEAADpCuMEI-QEAQDYCAAh5QQBANgIACECAAAABwAgNgAAnAYAIAIAAAAHACA2AACcBgAgAwAAAI4GACA9AACVBgAgPgAAmgYAIAEAAACOBgAgAQAAAAcAIAoJAADjCgAgQwAA5QoAIEQAAOQKACCvBAAA0ggAILYEAADSCAAg1wQAANIIACDYBAAA0ggAIOAEAADSCAAg4QQAANIIACDjBAAA0ggAIBapBAAAngcAMKoEAACjBgAQqwQAAJ4HADCsBAEA8QYAIa8EAQDyBgAhtQQgAPUGACG2BEAA9gYAIbcEQAD3BgAhuARAAPcGACHVBAEA8QYAIdYEAQDxBgAh1wQBAPIGACHYBAEA8gYAIdoEAACfB9oEItwEAACgB9wEIt4EAAChB94EIt8EIAD1BgAh4AQBAPIGACHhBEAA9gYAIeMEAACiB-MEI-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_BBAAAAABwAQQAAAAAcEEEACABwAhBQkAAPkGACBDAAD_BgAgRAAA_wYAILoEIAAAAAHBBCAA_gYAIQsJAAD8BgAgQwAA_QYAIEQAAP0GACC6BEAAAAABuwRAAAAABbwEQAAAAAW9BEAAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQRAAPsGACELCQAA-QYAIEMAAPoGACBEAAD6BgAgugRAAAAAAbsEQAAAAAS8BEAAAAAEvQRAAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEQAD4BgAhCwkAAPkGACBDAAD6BgAgRAAA-gYAILoEQAAAAAG7BEAAAAAEvARAAAAABL0EQAAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBEAA-AYAIQi6BAIAAAABuwQCAAAABLwEAgAAAAS9BAIAAAABvgQCAAAAAb8EAgAAAAHABAIAAAABwQQCAPkGACEIugRAAAAAAbsEQAAAAAS8BEAAAAAEvQRAAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEQAD6BgAhCwkAAPwGACBDAAD9BgAgRAAA_QYAILoEQAAAAAG7BEAAAAAFvARAAAAABb0EQAAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBEAA-wYAIQi6BAIAAAABuwQCAAAABbwEAgAAAAW9BAIAAAABvgQCAAAAAb8EAgAAAAHABAIAAAABwQQCAPwGACEIugRAAAAAAbsEQAAAAAW8BEAAAAAFvQRAAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEQAD9BgAhBQkAAPkGACBDAAD_BgAgRAAA_wYAILoEIAAAAAHBBCAA_gYAIQK6BCAAAAABwQQgAP8GACENCQAA-QYAIEMAAIEHACBEAACBBwAgZQAAgQcAIGYAAIEHACC6BBAAAAABuwQQAAAABLwEEAAAAAS9BBAAAAABvgQQAAAAAb8EEAAAAAHABBAAAAABwQQQAIAHACEIugQQAAAAAbsEEAAAAAS8BBAAAAAEvQQQAAAAAb4EEAAAAAG_BBAAAAABwAQQAAAAAcEEEACBBwAhBwkAAPkGACBDAACDBwAgRAAAgwcAILoEAAAAsgQCuwQAAACyBAi8BAAAALIECMEEAACCB7IEIgS6BAAAALIEArsEAAAAsgQIvAQAAACyBAjBBAAAgweyBCIOCQAA_AYAIEMAAIUHACBEAACFBwAgugQBAAAAAbsEAQAAAAW8BAEAAAAFvQQBAAAAAb4EAQAAAAG_BAEAAAABwAQBAAAAAcEEAQCEBwAhwgQBAAAAAcMEAQAAAAHEBAEAAAABC7oEAQAAAAG7BAEAAAAFvAQBAAAABb0EAQAAAAG-BAEAAAABvwQBAAAAAcAEAQAAAAHBBAEAhQcAIcIEAQAAAAHDBAEAAAABxAQBAAAAAQ4JAAD5BgAgQwAAhwcAIEQAAIcHACC6BAEAAAABuwQBAAAABLwEAQAAAAS9BAEAAAABvgQBAAAAAb8EAQAAAAHABAEAAAABwQQBAIYHACHCBAEAAAABwwQBAAAAAcQEAQAAAAELugQBAAAAAbsEAQAAAAS8BAEAAAAEvQQBAAAAAb4EAQAAAAG_BAEAAAABwAQBAAAAAcEEAQCHBwAhwgQBAAAAAcMEAQAAAAHEBAEAAAABEwQAAJAHACAMAACRBwAgDwAAkgcAIKkEAACIBwAwqgQAACMAEKsEAACIBwAwrAQBAIkHACGtBAEAiQcAIa4EAQCJBwAhrwQBAIoHACGwBAEAigcAIbIEAACLB7IEIrMEEACMBwAhtAQQAIwHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIbkEAQCJBwAhC7oEAQAAAAG7BAEAAAAEvAQBAAAABL0EAQAAAAG-BAEAAAABvwQBAAAAAcAEAQAAAAHBBAEAhwcAIcIEAQAAAAHDBAEAAAABxAQBAAAAAQu6BAEAAAABuwQBAAAABbwEAQAAAAW9BAEAAAABvgQBAAAAAb8EAQAAAAHABAEAAAABwQQBAIUHACHCBAEAAAABwwQBAAAAAcQEAQAAAAEEugQAAACyBAK7BAAAALIECLwEAAAAsgQIwQQAAIMHsgQiCLoEEAAAAAG7BBAAAAAEvAQQAAAABL0EEAAAAAG-BBAAAAABvwQQAAAAAcAEEAAAAAHBBBAAgQcAIQK6BCAAAAABwQQgAP8GACEIugRAAAAAAbsEQAAAAAW8BEAAAAAFvQRAAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEQAD9BgAhCLoEQAAAAAG7BEAAAAAEvARAAAAABL0EQAAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBEAA-gYAISEDAACwBwAgDgAAsgcAIB4AALEHACAiAACzBwAgIwAAtAcAICUAALUHACAqAAC2BwAgKwAAtgcAICwAALcHACCpBAAAqwcAMKoEAAAHABCrBAAAqwcAMKwEAQCJBwAhrwQBAIoHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh1gQBAIkHACHXBAEAigcAIdgEAQCKBwAh2gQAAKwH2gQi3AQAAK0H3AQi3gQAAK4H3gQi3wQgAI0HACHgBAEAigcAIeEEQACOBwAh4wQAAK8H4wQj5AQBAIkHACHlBAEAiQcAIbUGAAAHACC2BgAABwAgA8UEAAAhACDGBAAAIQAgxwQAACEAIAPFBAAAKAAgxgQAACgAIMcEAAAoACANqQQAAJMHADCqBAAA1QYAEKsEAACTBwAwrAQBAPEGACGuBAEA8QYAIa8EAQDyBgAhtQQgAPUGACG2BEAA9gYAIbcEQAD3BgAhuARAAPcGACG5BAEA8QYAIcgEAQDxBgAhyQQBAPIGACEUqQQAAJQHADCqBAAAvQYAEKsEAACUBwAwrAQBAPEGACGvBAEA8gYAIbUEIAD1BgAhtgRAAPYGACG3BEAA9wYAIbgEQAD3BgAhuQQBAPEGACHJBAEA8gYAIcoEAQDxBgAhywQBAPIGACHNBAAAlQfNBCPOBEAA9gYAIdAEAACWB9AEItEEEACXBwAh0gQBAPIGACHTBAEA8gYAIdQEAQDyBgAhBwkAAPwGACBDAACdBwAgRAAAnQcAILoEAAAAzQQDuwQAAADNBAm8BAAAAM0ECcEEAACcB80EIwcJAAD5BgAgQwAAmwcAIEQAAJsHACC6BAAAANAEArsEAAAA0AQIvAQAAADQBAjBBAAAmgfQBCINCQAA_AYAIEMAAJkHACBEAACZBwAgZQAAmQcAIGYAAJkHACC6BBAAAAABuwQQAAAABbwEEAAAAAW9BBAAAAABvgQQAAAAAb8EEAAAAAHABBAAAAABwQQQAJgHACENCQAA_AYAIEMAAJkHACBEAACZBwAgZQAAmQcAIGYAAJkHACC6BBAAAAABuwQQAAAABbwEEAAAAAW9BBAAAAABvgQQAAAAAb8EEAAAAAHABBAAAAABwQQQAJgHACEIugQQAAAAAbsEEAAAAAW8BBAAAAAFvQQQAAAAAb4EEAAAAAG_BBAAAAABwAQQAAAAAcEEEACZBwAhBwkAAPkGACBDAACbBwAgRAAAmwcAILoEAAAA0AQCuwQAAADQBAi8BAAAANAECMEEAACaB9AEIgS6BAAAANAEArsEAAAA0AQIvAQAAADQBAjBBAAAmwfQBCIHCQAA_AYAIEMAAJ0HACBEAACdBwAgugQAAADNBAO7BAAAAM0ECbwEAAAAzQQJwQQAAJwHzQQjBLoEAAAAzQQDuwQAAADNBAm8BAAAAM0ECcEEAACdB80EIxapBAAAngcAMKoEAACjBgAQqwQAAJ4HADCsBAEA8QYAIa8EAQDyBgAhtQQgAPUGACG2BEAA9gYAIbcEQAD3BgAhuARAAPcGACHVBAEA8QYAIdYEAQDxBgAh1wQBAPIGACHYBAEA8gYAIdoEAACfB9oEItwEAACgB9wEIt4EAAChB94EIt8EIAD1BgAh4AQBAPIGACHhBEAA9gYAIeMEAACiB-MEI-QEAQDxBgAh5QQBAPEGACEHCQAA-QYAIEMAAKoHACBEAACqBwAgugQAAADaBAK7BAAAANoECLwEAAAA2gQIwQQAAKkH2gQiBwkAAPkGACBDAACoBwAgRAAAqAcAILoEAAAA3AQCuwQAAADcBAi8BAAAANwECMEEAACnB9wEIgcJAAD5BgAgQwAApgcAIEQAAKYHACC6BAAAAN4EArsEAAAA3gQIvAQAAADeBAjBBAAApQfeBCIHCQAA_AYAIEMAAKQHACBEAACkBwAgugQAAADjBAO7BAAAAOMECbwEAAAA4wQJwQQAAKMH4wQjBwkAAPwGACBDAACkBwAgRAAApAcAILoEAAAA4wQDuwQAAADjBAm8BAAAAOMECcEEAACjB-MEIwS6BAAAAOMEA7sEAAAA4wQJvAQAAADjBAnBBAAApAfjBCMHCQAA-QYAIEMAAKYHACBEAACmBwAgugQAAADeBAK7BAAAAN4ECLwEAAAA3gQIwQQAAKUH3gQiBLoEAAAA3gQCuwQAAADeBAi8BAAAAN4ECMEEAACmB94EIgcJAAD5BgAgQwAAqAcAIEQAAKgHACC6BAAAANwEArsEAAAA3AQIvAQAAADcBAjBBAAApwfcBCIEugQAAADcBAK7BAAAANwECLwEAAAA3AQIwQQAAKgH3AQiBwkAAPkGACBDAACqBwAgRAAAqgcAILoEAAAA2gQCuwQAAADaBAi8BAAAANoECMEEAACpB9oEIgS6BAAAANoEArsEAAAA2gQIvAQAAADaBAjBBAAAqgfaBCIfAwAAsAcAIA4AALIHACAeAACxBwAgIgAAswcAICMAALQHACAlAAC1BwAgKgAAtgcAICsAALYHACAsAAC3BwAgqQQAAKsHADCqBAAABwAQqwQAAKsHADCsBAEAiQcAIa8EAQCKBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHVBAEAiQcAIdYEAQCJBwAh1wQBAIoHACHYBAEAigcAIdoEAACsB9oEItwEAACtB9wEIt4EAACuB94EIt8EIACNBwAh4AQBAIoHACHhBEAAjgcAIeMEAACvB-MEI-QEAQCJBwAh5QQBAIkHACEEugQAAADaBAK7BAAAANoECLwEAAAA2gQIwQQAAKoH2gQiBLoEAAAA3AQCuwQAAADcBAi8BAAAANwECMEEAACoB9wEIgS6BAAAAN4EArsEAAAA3gQIvAQAAADeBAjBBAAApgfeBCIEugQAAADjBAO7BAAAAOMECbwEAAAA4wQJwQQAAKQH4wQjHgQAAJAHACAFAACSCAAgGAAAjggAIB0AAI8IACAfAADKCAAgIAAAywgAICQAAJYIACAtAACRBwAgqQQAAM4IADCqBAAAAwAQqwQAAM4IADCsBAEAiQcAIa8EAQCKBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACG5BAEAiQcAIckEAQCKBwAhygQBAIkHACHLBAEAigcAIc0EAADPCM0EI84EQACOBwAh0AQAANAI0AQi0QQQANEIACHSBAEAigcAIdMEAQCKBwAh1AQBAIoHACG1BgAAAwAgtgYAAAMAIBIEAACQBwAgBQAAkggAIAgAAI0IACCpBAAAkQgAMKoEAAAKABCrBAAAkQgAMKwEAQCJBwAhrgQBAIkHACGvBAEAigcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhuQQBAIkHACHIBAEAiQcAIckEAQCKBwAhtQYAAAoAILYGAAAKACAVBAAAkAcAIAwAAJEHACAPAACSBwAgqQQAAIgHADCqBAAAIwAQqwQAAIgHADCsBAEAiQcAIa0EAQCJBwAhrgQBAIkHACGvBAEAigcAIbAEAQCKBwAhsgQAAIsHsgQiswQQAIwHACG0BBAAjAcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhuQQBAIkHACG1BgAAIwAgtgYAACMAIAPFBAAAYwAgxgQAAGMAIMcEAABjACADxQQAAAMAIMYEAAADACDHBAAAAwAgA8UEAABoACDGBAAAaAAgxwQAAGgAIAPFBAAAbAAgxgQAAGwAIMcEAABsACADxQQAAHYAIMYEAAB2ACDHBAAAdgAgEqkEAAC4BwAwqgQAAIsGABCrBAAAuAcAMKwEAQDxBgAhtwRAAPcGACG4BEAA9wYAIcoEAQDxBgAh3gQAALoH6wQi5gQQAPQGACHnBAEA8QYAIekEAAC5B-kEIusEAQDyBgAh7AQBAPIGACHtBAEA8gYAIe4EQAD2BgAh7wQBAPIGACHwBAEA8gYAIfEEAQDyBgAhBwkAAPkGACBDAAC-BwAgRAAAvgcAILoEAAAA6QQCuwQAAADpBAi8BAAAAOkECMEEAAC9B-kEIgcJAAD5BgAgQwAAvAcAIEQAALwHACC6BAAAAOsEArsEAAAA6wQIvAQAAADrBAjBBAAAuwfrBCIHCQAA-QYAIEMAALwHACBEAAC8BwAgugQAAADrBAK7BAAAAOsECLwEAAAA6wQIwQQAALsH6wQiBLoEAAAA6wQCuwQAAADrBAi8BAAAAOsECMEEAAC8B-sEIgcJAAD5BgAgQwAAvgcAIEQAAL4HACC6BAAAAOkEArsEAAAA6QQIvAQAAADpBAjBBAAAvQfpBCIEugQAAADpBAK7BAAAAOkECLwEAAAA6QQIwQQAAL4H6QQiGBkBAPIGACGpBAAAvwcAMKoEAADxBQAQqwQAAL8HADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACHKBAEA8QYAIdQEAQDxBgAh3gQAAMAH_wQi5wQBAPEGACHyBAEA8gYAIfMEAQDxBgAh9AQQAPQGACH1BBAA9AYAIfYEEAD0BgAh9wQQAPQGACH4BBAA9AYAIfkEEAD0BgAh-gQQAPQGACH7BBAA9AYAIfwEEAD0BgAh_QQQAPQGACH_BEAA9gYAIQcJAAD5BgAgQwAAwgcAIEQAAMIHACC6BAAAAP8EArsEAAAA_wQIvAQAAAD_BAjBBAAAwQf_BCIHCQAA-QYAIEMAAMIHACBEAADCBwAgugQAAAD_BAK7BAAAAP8ECLwEAAAA_wQIwQQAAMEH_wQiBLoEAAAA_wQCuwQAAAD_BAi8BAAAAP8ECMEEAADCB_8EIg2pBAAAwwcAMKoEAADbBQAQqwQAAMMHADCsBAEA8QYAIbcEQAD3BgAhgAUBAPEGACGBBQEA8QYAIYIFAQDxBgAhgwUBAPIGACGEBQEA8QYAIYUFAQDyBgAhhgUBAPIGACGHBQEA8gYAIQ2pBAAAxAcAMKoEAADIBQAQqwQAAMQHADCsBAEAiQcAIbcEQACPBwAhgAUBAIkHACGBBQEAiQcAIYIFAQCJBwAhgwUBAIoHACGEBQEAiQcAIYUFAQCKBwAhhgUBAIoHACGHBQEAigcAIRKpBAAAxQcAMKoEAADCBQAQqwQAAMUHADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACHvBAEA8QYAIYgFAQDxBgAhiQUBAPEGACGKBQEA8QYAIYsFAQDxBgAhjAUBAPEGACGNBQEA8QYAIY4FAQDxBgAhjwUBAPEGACGQBQEA8QYAIZEFAQDxBgAhkgUBAPEGACESqQQAAMYHADCqBAAArwUAEKsEAADGBwAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAh7wQBAIkHACGIBQEAiQcAIYkFAQCJBwAhigUBAIkHACGLBQEAiQcAIYwFAQCJBwAhjQUBAIkHACGOBQEAiQcAIY8FAQCJBwAhkAUBAIkHACGRBQEAiQcAIZIFAQCJBwAhGhEBAPEGACGpBAAAxwcAMKoEAACpBQAQqwQAAMcHADCsBAEA8QYAIbUEIAD1BgAhtgRAAPYGACG3BEAA9wYAIbgEQAD3BgAh8wQBAPEGACGTBQEA8gYAIZQFAQDxBgAhlQUBAPIGACGWBQEA8gYAIZcFAQDxBgAhmAUBAPIGACGZBQEA8QYAIZoFAQDyBgAhmwUBAPIGACGcBQEA8gYAIZ0FAQDyBgAhngUBAPEGACGfBQEA8gYAIaAFAgDIBwAhoQUgAPUGACGiBQEA8gYAIQ0JAAD5BgAgQwAA-QYAIEQAAPkGACBlAADKBwAgZgAA-QYAILoEAgAAAAG7BAIAAAAEvAQCAAAABL0EAgAAAAG-BAIAAAABvwQCAAAAAcAEAgAAAAHBBAIAyQcAIQ0JAAD5BgAgQwAA-QYAIEQAAPkGACBlAADKBwAgZgAA-QYAILoEAgAAAAG7BAIAAAAEvAQCAAAABL0EAgAAAAG-BAIAAAABvwQCAAAAAcAEAgAAAAHBBAIAyQcAIQi6BAgAAAABuwQIAAAABLwECAAAAAS9BAgAAAABvgQIAAAAAb8ECAAAAAHABAgAAAABwQQIAMoHACEaEQEAiQcAIakEAADLBwAwqgQAAJYFABCrBAAAywcAMKwEAQCJBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHzBAEAiQcAIZMFAQCKBwAhlAUBAIkHACGVBQEAigcAIZYFAQCKBwAhlwUBAIkHACGYBQEAigcAIZkFAQCJBwAhmgUBAIoHACGbBQEAigcAIZwFAQCKBwAhnQUBAIoHACGeBQEAiQcAIZ8FAQCKBwAhoAUCAMwHACGhBSAAjQcAIaIFAQCKBwAhCLoEAgAAAAG7BAIAAAAEvAQCAAAABL0EAgAAAAG-BAIAAAABvwQCAAAAAcAEAgAAAAHBBAIA-QYAIRCpBAAAzQcAMKoEAACQBQAQqwQAAM0HADCsBAEA8QYAIbUEIAD1BgAhtgRAAPYGACG3BEAA9wYAIbgEQAD3BgAhkwUBAPEGACGhBSAA9QYAIaMFAQDxBgAhpAUBAPEGACGlBQEA8gYAIaYFAQDxBgAhpwUAAM4HACCoBQEA8QYAIQS6BAEAAAAFqQUBAAAAAaoFAQAAAASrBQEAAAAEEKkEAADPBwAwqgQAAPoEABCrBAAAzwcAMKwEAQDxBgAhtwRAAPcGACG4BEAA9wYAId4EAADQB64FIvIEAQDxBgAhowUBAPEGACGsBQEA8gYAIa4FAQDyBgAhrwUBAPIGACGwBQEA8gYAIbEFIAD1BgAhsgUBAPIGACGzBUAA9gYAIQcJAAD5BgAgQwAA0gcAIEQAANIHACC6BAAAAK4FArsEAAAArgUIvAQAAACuBQjBBAAA0QeuBSIHCQAA-QYAIEMAANIHACBEAADSBwAgugQAAACuBQK7BAAAAK4FCLwEAAAArgUIwQQAANEHrgUiBLoEAAAArgUCuwQAAACuBQi8BAAAAK4FCMEEAADSB64FIgqpBAAA0wcAMKoEAADkBAAQqwQAANMHADCsBAEA8QYAIa0EAQDxBgAhtwRAAPcGACG4BEAA9wYAIfIEAQDxBgAhtAUBAPEGACG1BSAA9QYAIQypBAAA1AcAMKoEAADOBAAQqwQAANQHADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACHyBAEA8QYAIagFAQDxBgAhtAUBAPEGACG2BQEA8QYAIbcFAQDxBgAhuAUBAPIGACEVqQQAANUHADCqBAAAuAQAEKsEAADVBwAwrAQBAPEGACGtBAEA8gYAIbUEIAD1BgAhtgRAAPYGACG3BEAA9wYAIbgEQAD3BgAhygQBAPEGACHeBAAA1ge7BSK5BQEA8QYAIbsFIAD1BgAhvAUgAPUGACG9BQEA8gYAIb4FAQDyBgAhvwVAAPYGACHABQEA8QYAIcEFAADXBwAgwgUAANcHACDDBQAA1wcAIAcJAAD5BgAgQwAA2gcAIEQAANoHACC6BAAAALsFArsEAAAAuwUIvAQAAAC7BQjBBAAA2Qe7BSIPCQAA_AYAIEMAANgHACBEAADYBwAgugSAAAAAAb0EgAAAAAG-BIAAAAABvwSAAAAAAcAEgAAAAAHBBIAAAAABxAUBAAAAAcUFAQAAAAHGBQEAAAABxwWAAAAAAcgFgAAAAAHJBYAAAAABDLoEgAAAAAG9BIAAAAABvgSAAAAAAb8EgAAAAAHABIAAAAABwQSAAAAAAcQFAQAAAAHFBQEAAAABxgUBAAAAAccFgAAAAAHIBYAAAAAByQWAAAAAAQcJAAD5BgAgQwAA2gcAIEQAANoHACC6BAAAALsFArsEAAAAuwUIvAQAAAC7BQjBBAAA2Qe7BSIEugQAAAC7BQK7BAAAALsFCLwEAAAAuwUIwQQAANoHuwUiEqkEAADbBwAwqgQAAKAEABCrBAAA2wcAMKwEAQDxBgAhtQQgAPUGACG2BEAA9gYAIbcEQAD3BgAhuARAAPcGACHVBAEA8QYAIcsFAADcB8sFIswFCADdBwAhzQUQAPQGACHOBRAA9AYAIc8FAQDyBgAh0AVAAPYGACHRBQgA3gcAIdIFAQDyBgAh0wUBAPEGACEHCQAA-QYAIEMAAOMHACBEAADjBwAgugQAAADLBQK7BAAAAMsFCLwEAAAAywUIwQQAAOIHywUiDQkAAPkGACBDAADKBwAgRAAAygcAIGUAAMoHACBmAADKBwAgugQIAAAAAbsECAAAAAS8BAgAAAAEvQQIAAAAAb4ECAAAAAG_BAgAAAABwAQIAAAAAcEECADhBwAhDQkAAPwGACBDAADgBwAgRAAA4AcAIGUAAOAHACBmAADgBwAgugQIAAAAAbsECAAAAAW8BAgAAAAFvQQIAAAAAb4ECAAAAAG_BAgAAAABwAQIAAAAAcEECADfBwAhDQkAAPwGACBDAADgBwAgRAAA4AcAIGUAAOAHACBmAADgBwAgugQIAAAAAbsECAAAAAW8BAgAAAAFvQQIAAAAAb4ECAAAAAG_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-AUBAPEGACH5BQEA8QYAIfoFAQDxBgAh-wUBAPEGACH8BQEA8QYAIf0FAQDxBgAh_gUBAPEGACH_BQEA8QYAIYAGAQDxBgAhgQYBAPEGACGCBgEA8gYAIYMGAQDxBgAhhAYBAPEGACGFBgEA8QYAIYYGAQDxBgAhhwYBAPEGACGIBgEA8QYAIYkGAQDxBgAhigYBAPEGACGLBgEA8QYAIYwGAQDxBgAhjQYBAPEGACGOBgEA8QYAIY8GAQDxBgAhI6kEAADyBwAwqgQAAOoCABCrBAAA8gcAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIfMFAQCJBwAh9AUBAIkHACH1BQEAiQcAIfYFAQCJBwAh9wUBAIkHACH4BQEAiQcAIfkFAQCJBwAh-gUBAIkHACH7BQEAiQcAIfwFAQCJBwAh_QUBAIkHACH-BQEAiQcAIf8FAQCJBwAhgAYBAIkHACGBBgEAiQcAIYIGAQCKBwAhgwYBAIkHACGEBgEAiQcAIYUGAQCJBwAhhgYBAIkHACGHBgEAiQcAIYgGAQCJBwAhiQYBAIkHACGKBgEAiQcAIYsGAQCJBwAhjAYBAIkHACGNBgEAiQcAIY4GAQCJBwAhjwYBAIkHACENqQQAAPMHADCqBAAA5AIAEKsEAADzBwAwrAQBAPEGACG3BEAA9wYAIbgEQAD3BgAhuQQBAPIGACGjBQEA8QYAIegFIAD1BgAhkAYBAPEGACGSBgAA9AeSBiKUBgAA9QeUBiKVBgEA8gYAIQcJAAD5BgAgQwAA-QcAIEQAAPkHACC6BAAAAJIGArsEAAAAkgYIvAQAAACSBgjBBAAA-AeSBiIHCQAA-QYAIEMAAPcHACBEAAD3BwAgugQAAACUBgK7BAAAAJQGCLwEAAAAlAYIwQQAAPYHlAYiBwkAAPkGACBDAAD3BwAgRAAA9wcAILoEAAAAlAYCuwQAAACUBgi8BAAAAJQGCMEEAAD2B5QGIgS6BAAAAJQGArsEAAAAlAYIvAQAAACUBgjBBAAA9weUBiIHCQAA-QYAIEMAAPkHACBEAAD5BwAgugQAAACSBgK7BAAAAJIGCLwEAAAAkgYIwQQAAPgHkgYiBLoEAAAAkgYCuwQAAACSBgi8BAAAAJIGCMEEAAD5B5IGIg6pBAAA-gcAMKoEAADMAgAQqwQAAPoHADCsBAEA8QYAIbcEQAD3BgAhuARAAPcGACHnBQEA8QYAIegFIAD1BgAhlgYBAPIGACGXBgEA8gYAIZgGAQDyBgAhmQYBAPEGACGaBgEA8QYAIZsGAQDyBgAhDKkEAAD7BwAwqgQAALICABCrBAAA-wcAMKwEAQDxBgAhtwRAAPcGACG4BEAA9wYAIfIEAQDyBgAhnAYBAPEGACGeBgAA_AeeBiKfBiAA9QYAIaAGAQDyBgAhoQYBAPIGACEHCQAA-QYAIEMAAP4HACBEAAD-BwAgugQAAACeBgK7BAAAAJ4GCLwEAAAAngYIwQQAAP0HngYiBwkAAPkGACBDAAD-BwAgRAAA_gcAILoEAAAAngYCuwQAAACeBgi8BAAAAJ4GCMEEAAD9B54GIgS6BAAAAJ4GArsEAAAAngYIvAQAAACeBgjBBAAA_geeBiINJgAAtgcAIKkEAAD_BwAwqgQAAHAAEKsEAAD_BwAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAh8gQBAIoHACGcBgEAiQcAIZ4GAACACJ4GIp8GIACNBwAhoAYBAIoHACGhBgEAigcAIQS6BAAAAJ4GArsEAAAAngYIvAQAAACeBgjBBAAA_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-MEI-QEAQCJBwAh5QQBAIkHACG1BgAABwAgtgYAAAcAIBEnAACYCAAgKAAAkAcAICkAAJYIACCpBAAAlwgAMKoEAABsABCrBAAAlwgAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIecFAQCJBwAh6AUgAI0HACGWBgEAigcAIZcGAQCKBwAhmAYBAIoHACGZBgEAiQcAIZoGAQCJBwAhmwYBAIoHACEPJgAAtgcAIKkEAAD_BwAwqgQAAHAAEKsEAAD_BwAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAh8gQBAIoHACGcBgEAiQcAIZ4GAACACJ4GIp8GIACNBwAhoAYBAIoHACGhBgEAigcAIbUGAABwACC2BgAAcAAgGRkBAIoHACEkAACQBwAgqQQAAJkIADCqBAAAaAAQqwQAAJkIADCsBAEAiQcAIbcEQACPBwAhuARAAI8HACHKBAEAiQcAIdQEAQCJBwAh3gQAAJoI_wQi5wQBAIkHACHyBAEAigcAIfMEAQCJBwAh9AQQAIwHACH1BBAAjAcAIfYEEACMBwAh9wQQAIwHACH4BBAAjAcAIfkEEACMBwAh-gQQAIwHACH7BBAAjAcAIfwEEACMBwAh_QQQAIwHACH_BEAAjgcAIQS6BAAAAP8EArsEAAAA_wQIvAQAAAD_BAjBBAAAwgf_BCIRIQAAkAcAIKkEAACbCAAwqgQAAGMAEKsEAACbCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIZMFAQCJBwAhoQUgAI0HACGjBQEAiQcAIaQFAQCJBwAhpQUBAIoHACGmBQEAiQcAIacFAADOBwAgqAUBAIkHACEDygQBAAAAAeQFAQAAAAGiBkAAAAABDQMAAJ8IACAcAACgCAAgqQQAAJ0IADCqBAAAWQAQqwQAAJ0IADCsBAEAiQcAIbcEQACPBwAhuARAAI8HACHKBAEAiQcAId4EAACeCKQGIuMFAQCKBwAh5AUBAIkHACGiBkAAjwcAIQS6BAAAAKQGArsEAAAApAYIvAQAAACkBgjBBAAAhAikBiIeBAAAkAcAIAUAAJIIACAYAACOCAAgHQAAjwgAIB8AAMoIACAgAADLCAAgJAAAlggAIC0AAJEHACCpBAAAzggAMKoEAAADABCrBAAAzggAMKwEAQCJBwAhrwQBAIoHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIbkEAQCJBwAhyQQBAIoHACHKBAEAiQcAIcsEAQCKBwAhzQQAAM8IzQQjzgRAAI4HACHQBAAA0AjQBCLRBBAA0QgAIdIEAQCKBwAh0wQBAIoHACHUBAEAigcAIbUGAAADACC2BgAAAwAgGAoAAMkIACALAACnCAAgHQAAjwgAIB4AALEHACAfAADKCAAgIAAAywgAIKkEAADICAAwqgQAAA4AEKsEAADICAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIcgEAQCKBwAh8AQBAIkHACGmBgEAiQcAIacGAgDMBwAhqAYCAMwHACGpBgEAigcAIaoGAQCKBwAhqwYBAIkHACG1BgAADgAgtgYAAA4AIALKBAEAAAAB5AUBAAAAAQwDAACfCAAgHAAAoAgAIKkEAACiCAAwqgQAAFUAEKsEAACiCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhygQBAIkHACHeBAAAowilBiLkBQEAiQcAIaUGQACPBwAhBLoEAAAApQYCuwQAAAClBgi8BAAAAKUGCMEEAACICKUGIgLKBAEAAAAB5AUBAAAAAREDAACfCAAgCwAApwgAIBwAAKAIACCpBAAApQgAMKoEAABNABCrBAAApQgAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIcoEAQCJBwAh8AQBAIkHACGhBSAAjQcAIeAFCACmCAAh4QUIAKYIACHiBQEAiQcAIeMFAQCKBwAh5AUBAIkHACEIugQIAAAAAbsECAAAAAS8BAgAAAAEvQQIAAAAAb4ECAAAAAG_BAgAAAABwAQIAAAAAcEECADKBwAhEggAAI0IACAYAACOCAAgHQAAjwgAIKkEAACMCAAwqgQAAB8AEKsEAACMCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh3gUBAIkHACGuBkAAjwcAIa8GQACPBwAhsAYgAI0HACG1BgAAHwAgtgYAAB8AIA0NAACpCAAgqQQAAKgIADCqBAAARQAQqwQAAKgIADCsBAEAiQcAIbcEQACPBwAhuARAAI8HACHyBAEAiQcAIagFAQCJBwAhtAUBAIkHACG2BQEAiQcAIbcFAQCJBwAhuAUBAIoHACEeAwAAnwgAIA4AALIHACAWAAC7CAAgFwAAvAgAIBgAAI4IACAZAACSBwAgGgAAvQgAIKkEAAC4CAAwqgQAACEAEKsEAAC4CAAwrAQBAIkHACGtBAEAigcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhygQBAIkHACHeBAAAuQi7BSK5BQEAiQcAIbsFIACNBwAhvAUgAI0HACG9BQEAigcAIb4FAQCKBwAhvwVAAI4HACHABQEAiQcAIcEFAAC6CAAgwgUAALoIACDDBQAAuggAILUGAAAhACC2BgAAIQAgEQ0AAKkIACCpBAAAqggAMKoEAAA_ABCrBAAAqggAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAId4EAACrCK4FIvIEAQCJBwAhowUBAIkHACGsBQEAigcAIa4FAQCKBwAhrwUBAIoHACGwBQEAigcAIbEFIACNBwAhsgUBAIoHACGzBUAAjgcAIQS6BAAAAK4FArsEAAAArgUIvAQAAACuBQjBBAAA0geuBSIMEwAArQgAIKkEAACsCAAwqgQAADcAEKsEAACsCAAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAh7wQBAIoHACGjBQEAiQcAIdMFAQCJBwAh1AUgAI0HACHVBQEAiQcAIRcRAACzCAAgEgAAtAgAIBQAALUIACCpBAAAsQgAMKoEAAAuABCrBAAAsQgAMKwEAQCJBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHVBAEAiQcAIekEAACyCNsFIu8EAQCKBwAh1gUBAIkHACHXBQEAigcAIdgFAQCKBwAh2QUBAIoHACHbBRAAjAcAIdwFEACMBwAh3QUBAIkHACG1BgAALgAgtgYAAC4AIBQTAACtCAAgFQAAkQcAIKkEAACuCAAwqgQAADMAEKsEAACuCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAhywUAAK8IywUizAUIAKYIACHNBRAAjAcAIc4FEACMBwAhzwUBAIoHACHQBUAAjgcAIdEFCACwCAAh0gUBAIoHACHTBQEAiQcAIQS6BAAAAMsFArsEAAAAywUIvAQAAADLBQjBBAAA4wfLBSIIugQIAAAAAbsECAAAAAW8BAgAAAAFvQQIAAAAAb4ECAAAAAG_BAgAAAABwAQIAAAAAcEECADgBwAhFREAALMIACASAAC0CAAgFAAAtQgAIKkEAACxCAAwqgQAAC4AEKsEAACxCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh6QQAALII2wUi7wQBAIoHACHWBQEAiQcAIdcFAQCKBwAh2AUBAIoHACHZBQEAigcAIdsFEACMBwAh3AUQAIwHACHdBQEAiQcAIQS6BAAAANsFArsEAAAA2wUIvAQAAADbBQjBBAAA6AfbBSIQEAAA6wcAIKkEAADqBwAwqgQAAMsDABCrBAAA6gcAMKwEAQCJBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHVBAEAiQcAIecEAQCJBwAh7wQBAIoHACHeBQEAiQcAId8FAQCKBwAhtQYAAMsDACC2BgAAywMAIAPFBAAAMwAgxgQAADMAIMcEAAAzACADxQQAADcAIMYEAAA3ACDHBAAANwAgDA0AAKkIACAOAAC3CAAgqQQAALYIADCqBAAAKAAQqwQAALYIADCsBAEAiQcAIa0EAQCJBwAhtwRAAI8HACG4BEAAjwcAIfIEAQCJBwAhtAUBAIkHACG1BSAAjQcAIRUEAACQBwAgDAAAkQcAIA8AAJIHACCpBAAAiAcAMKoEAAAjABCrBAAAiAcAMKwEAQCJBwAhrQQBAIkHACGuBAEAiQcAIa8EAQCKBwAhsAQBAIoHACGyBAAAiweyBCKzBBAAjAcAIbQEEACMBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACG5BAEAiQcAIbUGAAAjACC2BgAAIwAgHAMAAJ8IACAOAACyBwAgFgAAuwgAIBcAALwIACAYAACOCAAgGQAAkgcAIBoAAL0IACCpBAAAuAgAMKoEAAAhABCrBAAAuAgAMKwEAQCJBwAhrQQBAIoHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIcoEAQCJBwAh3gQAALkIuwUiuQUBAIkHACG7BSAAjQcAIbwFIACNBwAhvQUBAIoHACG-BQEAigcAIb8FQACOBwAhwAUBAIkHACHBBQAAuggAIMIFAAC6CAAgwwUAALoIACAEugQAAAC7BQK7BAAAALsFCLwEAAAAuwUIwQQAANoHuwUiDLoEgAAAAAG9BIAAAAABvgSAAAAAAb8EgAAAAAHABIAAAAABwQSAAAAAAcQFAQAAAAHFBQEAAAABxgUBAAAAAccFgAAAAAHIBYAAAAAByQWAAAAAARYTAACtCAAgFQAAkQcAIKkEAACuCAAwqgQAADMAEKsEAACuCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAhywUAAK8IywUizAUIAKYIACHNBRAAjAcAIc4FEACMBwAhzwUBAIoHACHQBUAAjgcAIdEFCACwCAAh0gUBAIoHACHTBQEAiQcAIbUGAAAzACC2BgAAMwAgA8UEAAA_ACDGBAAAPwAgxwQAAD8AIAPFBAAARQAgxgQAAEUAIMcEAABFACAVAwAAnwgAIAsAAMEIACAbAADCCAAgqQQAAL4IADCqBAAAGwAQqwQAAL4IADCsBAEAiQcAIbcEQACPBwAhuARAAI8HACHKBAEAiQcAId4EAADACOsEIuYEEACMBwAh5wQBAIkHACHpBAAAvwjpBCLrBAEAigcAIewEAQCKBwAh7QQBAIoHACHuBEAAjgcAIe8EAQCKBwAh8AQBAIoHACHxBAEAigcAIQS6BAAAAOkEArsEAAAA6QQIvAQAAADpBAjBBAAAvgfpBCIEugQAAADrBAK7BAAAAOsECLwEAAAA6wQIwQQAALwH6wQiEggAAI0IACAYAACOCAAgHQAAjwgAIKkEAACMCAAwqgQAAB8AEKsEAACMCAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh3gUBAIkHACGuBkAAjwcAIa8GQACPBwAhsAYgAI0HACG1BgAAHwAgtgYAAB8AIB4DAACfCAAgDgAAsgcAIBYAALsIACAXAAC8CAAgGAAAjggAIBkAAJIHACAaAAC9CAAgqQQAALgIADCqBAAAIQAQqwQAALgIADCsBAEAiQcAIa0EAQCKBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHKBAEAiQcAId4EAAC5CLsFIrkFAQCJBwAhuwUgAI0HACG8BSAAjQcAIb0FAQCKBwAhvgUBAIoHACG_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_BUAAjgcAIcAFAQCJBwAhwQUAALoIACDCBQAAuggAIMMFAAC6CAAgAgAAACYAIDYAAPsIACACAAAA-AgAIDYAAPkIACAVqQQAAPcIADCqBAAA-AgAEKsEAAD3CAAwrAQBAIkHACGtBAEAigcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhygQBAIkHACHeBAAAuQi7BSK5BQEAiQcAIbsFIACNBwAhvAUgAI0HACG9BQEAigcAIb4FAQCKBwAhvwVAAI4HACHABQEAiQcAIcEFAAC6CAAgwgUAALoIACDDBQAAuggAIBWpBAAA9wgAMKoEAAD4CAAQqwQAAPcIADCsBAEAiQcAIa0EAQCKBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHKBAEAiQcAId4EAAC5CLsFIrkFAQCJBwAhuwUgAI0HACG8BSAAjQcAIb0FAQCKBwAhvgUBAIoHACG_BUAAjgcAIcAFAQCJBwAhwQUAALoIACDCBQAAuggAIMMFAAC6CAAgEawEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcAFAQDYCAAhwQWAAAAAAcIFgAAAAAHDBYAAAAABAboGAAAAuwUCFwMAAPwIACAWAAD9CAAgFwAA_ggAIBgAAP8IACAZAACACQAgGgAAgQkAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcAFAQDYCAAhwQWAAAAAAcIFgAAAAAHDBYAAAAABBT0AAMkPACA-AADiDwAgtwYAAMoPACC4BgAA4Q8AIL0GAAAFACAFPQAAxw8AID4AAN8PACC3BgAAyA8AILgGAADeDwAgvQYAADUAIAs9AACrCQAwPgAAsAkAMLcGAACsCQAwuAYAAK0JADC5BgAArgkAILoGAACvCQAwuwYAAK8JADC8BgAArwkAML0GAACvCQAwvgYAALEJADC_BgAAsgkAMAs9AACZCQAwPgAAngkAMLcGAACaCQAwuAYAAJsJADC5BgAAnAkAILoGAACdCQAwuwYAAJ0JADC8BgAAnQkAML0GAACdCQAwvgYAAJ8JADC_BgAAoAkAMAs9AACOCQAwPgAAkgkAMLcGAACPCQAwuAYAAJAJADC5BgAAkQkAILoGAADmCAAwuwYAAOYIADC8BgAA5ggAML0GAADmCAAwvgYAAJMJADC_BgAA6QgAMAs9AACCCQAwPgAAhwkAMLcGAACDCQAwuAYAAIQJADC5BgAAhQkAILoGAACGCQAwuwYAAIYJADC8BgAAhgkAML0GAACGCQAwvgYAAIgJADC_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_BgAA0gkAMBEKAACMCgAgCwAAjQoAIB0AAJAKACAfAACOCgAgIAAAjwoAIKwEAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAB8AQBAAAAAaYGAQAAAAGnBgIAAAABqAYCAAAAAakGAQAAAAGqBgEAAAABqwYBAAAAAQIAAAAQACA9AACLCgAgAwAAABAAID0AAIsKACA-AADWCQAgATYAAL4PADAXCgAAyQgAIAsAAKcIACAdAACPCAAgHgAAsQcAIB8AAMoIACAgAADLCAAgqQQAAMgIADCqBAAADgAQqwQAAMgIADCsBAEAAAABtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHIBAEAigcAIfAEAQCJBwAhpgYBAIkHACGnBgIAzAcAIagGAgDMBwAhqQYBAIoHACGqBgEAigcAIasGAQCJBwAhtAYAAMcIACACAAAAEAAgNgAA1gkAIAIAAADTCQAgNgAA1AkAIBCpBAAA0gkAMKoEAADTCQAQqwQAANIJADCsBAEAiQcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhyAQBAIoHACHwBAEAiQcAIaYGAQCJBwAhpwYCAMwHACGoBgIAzAcAIakGAQCKBwAhqgYBAIoHACGrBgEAiQcAIRCpBAAA0gkAMKoEAADTCQAQqwQAANIJADCsBAEAiQcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhyAQBAIoHACHwBAEAiQcAIaYGAQCJBwAhpwYCAMwHACGoBgIAzAcAIakGAQCKBwAhqgYBAIoHACGrBgEAiQcAIQysBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh8AQBANgIACGmBgEA2AgAIacGAgDVCQAhqAYCANUJACGpBgEA2QgAIaoGAQDZCAAhqwYBANgIACEFugYCAAAAAcAGAgAAAAHBBgIAAAABwgYCAAAAAcMGAgAAAAERCgAA1wkAIAsAANgJACAdAADbCQAgHwAA2QkAICAAANoJACCsBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh8AQBANgIACGmBgEA2AgAIacGAgDVCQAhqAYCANUJACGpBgEA2QgAIaoGAQDZCAAhqwYBANgIACEFPQAAnw8AID4AALwPACC3BgAAoA8AILgGAAC7DwAgvQYAABUAIAU9AACdDwAgPgAAuQ8AILcGAACeDwAguAYAALgPACC9BgAAqQEAIAs9AAD8CQAwPgAAgQoAMLcGAAD9CQAwuAYAAP4JADC5BgAA_wkAILoGAACACgAwuwYAAIAKADC8BgAAgAoAML0GAACACgAwvgYAAIIKADC_BgAAgwoAMAs9AADtCQAwPgAA8gkAMLcGAADuCQAwuAYAAO8JADC5BgAA8AkAILoGAADxCQAwuwYAAPEJADC8BgAA8QkAML0GAADxCQAwvgYAAPMJADC_BgAA9AkAMAs9AADcCQAwPgAA4QkAMLcGAADdCQAwuAYAAN4JADC5BgAA3wkAILoGAADgCQAwuwYAAOAJADC8BgAA4AkAML0GAADgCQAwvgYAAOIJADC_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_QkAMLkGAAD_CQAgvQYAAIAKADAEPQAA7QkAMLcGAADuCQAwuQYAAPAJACC9BgAA8QkAMAQ9AADcCQAwtwYAAN0JADC5BgAA3wkAIL0GAADgCQAwAz0AAJsPACC3BgAAnA8AIL0GAACOBgAgAz0AAJkPACC3BgAAmg8AIL0GAAABACAEPQAAywkAMLcGAADMCQAwuQYAAM4JACC9BgAAzwkAMAAAAAAAAboGAAAAzQQDAboGAAAA0AQCBboGEAAAAAHABhAAAAABwQYQAAAAAcIGEAAAAAHDBhAAAAABBz0AAPAOACA-AACXDwAgtwYAAPEOACC4BgAAlg8AILsGAAAHACC8BgAABwAgvQYAAI4GACAFPQAA7g4AID4AAJQPACC3BgAA7w4AILgGAACTDwAgvQYAAI4GACAHPQAA7A4AID4AAJEPACC3BgAA7Q4AILgGAACQDwAguwYAAAwAILwGAAAMACC9BgAAAQAgCz0AANAKADA-AADUCgAwtwYAANEKADC4BgAA0goAMLkGAADTCgAgugYAAIAKADC7BgAAgAoAMLwGAACACgAwvQYAAIAKADC-BgAA1QoAML8GAACDCgAwCz0AAMUKADA-AADJCgAwtwYAAMYKADC4BgAAxwoAMLkGAADICgAgugYAAPEJADC7BgAA8QkAMLwGAADxCQAwvQYAAPEJADC-BgAAygoAML8GAAD0CQAwCz0AALoKADA-AAC-CgAwtwYAALsKADC4BgAAvAoAMLkGAAC9CgAgugYAAOAJADC7BgAA4AkAMLwGAADgCQAwvQYAAOAJADC-BgAAvwoAML8GAADjCQAwCz0AAK8KADA-AACzCgAwtwYAALAKADC4BgAAsQoAMLkGAACyCgAgugYAAJ0JADC7BgAAnQkAMLwGAACdCQAwvQYAAJ0JADC-BgAAtAoAML8GAACgCQAwCz0AAKQKADA-AACoCgAwtwYAAKUKADC4BgAApgoAMLkGAACnCgAgugYAAPQIADC7BgAA9AgAMLwGAAD0CAAwvQYAAPQIADC-BgAAqQoAML8GAAD3CAAwFw4AAK4KACAWAAC6CQAgFwAAuwkAIBgAALwJACAZAAC9CQAgGgAAvgkAIKwEAQAAAAGtBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAd4EAAAAuwUCuQUBAAAAAbsFIAAAAAG8BSAAAAABvQUBAAAAAb4FAQAAAAG_BUAAAAABwAUBAAAAAcEFgAAAAAHCBYAAAAABwwWAAAAAAQIAAAAmACA9AACtCgAgAwAAACYAID0AAK0KACA-AACrCgAgATYAAI8PADACAAAAJgAgNgAAqwoAIAIAAAD4CAAgNgAAqgoAIBGsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHeBAAA-gi7BSK5BQEA2AgAIbsFIADcCAAhvAUgANwIACG9BQEA2QgAIb4FAQDZCAAhvwVAAN0IACHABQEA2AgAIcEFgAAAAAHCBYAAAAABwwWAAAAAARcOAACsCgAgFgAA_QgAIBcAAP4IACAYAAD_CAAgGQAAgAkAIBoAAIEJACCsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHeBAAA-gi7BSK5BQEA2AgAIbsFIADcCAAhvAUgANwIACG9BQEA2QgAIb4FAQDZCAAhvwVAAN0IACHABQEA2AgAIcEFgAAAAAHCBYAAAAABwwWAAAAAAQc9AACKDwAgPgAAjQ8AILcGAACLDwAguAYAAIwPACC7BgAAIwAgvAYAACMAIL0GAADYBgAgFw4AAK4KACAWAAC6CQAgFwAAuwkAIBgAALwJACAZAAC9CQAgGgAAvgkAIKwEAQAAAAGtBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAd4EAAAAuwUCuQUBAAAAAbsFIAAAAAG8BSAAAAABvQUBAAAAAb4FAQAAAAG_BUAAAAABwAUBAAAAAcEFgAAAAAHCBYAAAAABwwWAAAAAAQM9AACKDwAgtwYAAIsPACC9BgAA2AYAIBALAACqCQAgGwAAuQoAIKwEAQAAAAG3BEAAAAABuARAAAAAAd4EAAAA6wQC5gQQAAAAAecEAQAAAAHpBAAAAOkEAusEAQAAAAHsBAEAAAAB7QQBAAAAAe4EQAAAAAHvBAEAAAAB8AQBAAAAAfEEAQAAAAECAAAAHQAgPQAAuAoAIAMAAAAdACA9AAC4CgAgPgAAtgoAIAE2AACJDwAwAgAAAB0AIDYAALYKACACAAAAoQkAIDYAALUKACAOrAQBANgIACG3BEAA3ggAIbgEQADeCAAh3gQAAKQJ6wQi5gQQANsIACHnBAEA2AgAIekEAACjCekEIusEAQDZCAAh7AQBANkIACHtBAEA2QgAIe4EQADdCAAh7wQBANkIACHwBAEA2QgAIfEEAQDZCAAhEAsAAKcJACAbAAC3CgAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAh3gQAAKQJ6wQi5gQQANsIACHnBAEA2AgAIekEAACjCekEIusEAQDZCAAh7AQBANkIACHtBAEA2QgAIe4EQADdCAAh7wQBANkIACHwBAEA2QgAIfEEAQDZCAAhBz0AAIQPACA-AACHDwAgtwYAAIUPACC4BgAAhg8AILsGAAAhACC8BgAAIQAgvQYAACYAIBALAACqCQAgGwAAuQoAIKwEAQAAAAG3BEAAAAABuARAAAAAAd4EAAAA6wQC5gQQAAAAAecEAQAAAAHpBAAAAOkEAusEAQAAAAHsBAEAAAAB7QQBAAAAAe4EQAAAAAHvBAEAAAAB8AQBAAAAAfEEAQAAAAEDPQAAhA8AILcGAACFDwAgvQYAACYAIAwLAADsCQAgHAAAxAoAIKwEAQAAAAG3BEAAAAABuARAAAAAAfAEAQAAAAGhBSAAAAAB4AUIAAAAAeEFCAAAAAHiBQEAAAAB4wUBAAAAAeQFAQAAAAECAAAATwAgPQAAwwoAIAMAAABPACA9AADDCgAgPgAAwQoAIAE2AACDDwAwAgAAAE8AIDYAAMEKACACAAAA5AkAIDYAAMAKACAKrAQBANgIACG3BEAA3ggAIbgEQADeCAAh8AQBANgIACGhBSAA3AgAIeAFCADmCQAh4QUIAOYJACHiBQEA2AgAIeMFAQDZCAAh5AUBANgIACEMCwAA6QkAIBwAAMIKACCsBAEA2AgAIbcEQADeCAAhuARAAN4IACHwBAEA2AgAIaEFIADcCAAh4AUIAOYJACHhBQgA5gkAIeIFAQDYCAAh4wUBANkIACHkBQEA2AgAIQU9AAD-DgAgPgAAgQ8AILcGAAD_DgAguAYAAIAPACC9BgAAEAAgDAsAAOwJACAcAADECgAgrAQBAAAAAbcEQAAAAAG4BEAAAAAB8AQBAAAAAaEFIAAAAAHgBQgAAAAB4QUIAAAAAeIFAQAAAAHjBQEAAAAB5AUBAAAAAQM9AAD-DgAgtwYAAP8OACC9BgAAEAAgCBwAAM8KACCsBAEAAAABtwRAAAAAAbgEQAAAAAHeBAAAAKQGAuMFAQAAAAHkBQEAAAABogZAAAAAAQIAAABbACA9AADOCgAgAwAAAFsAID0AAM4KACA-AADMCgAgATYAAP0OADACAAAAWwAgNgAAzAoAIAIAAAD1CQAgNgAAywoAIAesBAEA2AgAIbcEQADeCAAhuARAAN4IACHeBAAA9wmkBiLjBQEA2QgAIeQFAQDYCAAhogZAAN4IACEIHAAAzQoAIKwEAQDYCAAhtwRAAN4IACG4BEAA3ggAId4EAAD3CaQGIuMFAQDZCAAh5AUBANgIACGiBkAA3ggAIQU9AAD4DgAgPgAA-w4AILcGAAD5DgAguAYAAPoOACC9BgAAEAAgCBwAAM8KACCsBAEAAAABtwRAAAAAAbgEQAAAAAHeBAAAAKQGAuMFAQAAAAHkBQEAAAABogZAAAAAAQM9AAD4DgAgtwYAAPkOACC9BgAAEAAgBxwAANoKACCsBAEAAAABtQQgAAAAAbYEQAAAAAHeBAAAAKUGAuQFAQAAAAGlBkAAAAABAgAAAFcAID0AANkKACADAAAAVwAgPQAA2QoAID4AANcKACABNgAA9w4AMAIAAABXACA2AADXCgAgAgAAAIQKACA2AADWCgAgBqwEAQDYCAAhtQQgANwIACG2BEAA3QgAId4EAACGCqUGIuQFAQDYCAAhpQZAAN4IACEHHAAA2AoAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAId4EAACGCqUGIuQFAQDYCAAhpQZAAN4IACEFPQAA8g4AID4AAPUOACC3BgAA8w4AILgGAAD0DgAgvQYAABAAIAccAADaCgAgrAQBAAAAAbUEIAAAAAG2BEAAAAAB3gQAAAClBgLkBQEAAAABpQZAAAAAAQM9AADyDgAgtwYAAPMOACC9BgAAEAAgAz0AAPAOACC3BgAA8Q4AIL0GAACOBgAgAz0AAO4OACC3BgAA7w4AIL0GAACOBgAgAz0AAOwOACC3BgAA7Q4AIL0GAAABACAEPQAA0AoAMLcGAADRCgAwuQYAANMKACC9BgAAgAoAMAQ9AADFCgAwtwYAAMYKADC5BgAAyAoAIL0GAADxCQAwBD0AALoKADC3BgAAuwoAMLkGAAC9CgAgvQYAAOAJADAEPQAArwoAMLcGAACwCgAwuQYAALIKACC9BgAAnQkAMAQ9AACkCgAwtwYAAKUKADC5BgAApwoAIL0GAAD0CAAwAAAAAboGAAAA2gQCAboGAAAA3AQCAboGAAAA3gQCAboGAAAA4wQDBz0AAM0LACA-AADQCwAgtwYAAM4LACC4BgAAzwsAILsGAAADACC8BgAAAwAgvQYAAAUAIAc9AADICwAgPgAAywsAILcGAADJCwAguAYAAMoLACC7BgAACgAgvAYAAAoAIL0GAACNAQAgBz0AAMMLACA-AADGCwAgtwYAAMQLACC4BgAAxQsAILsGAAAjACC8BgAAIwAgvQYAANgGACALPQAAtQsAMD4AALoLADC3BgAAtgsAMLgGAAC3CwAwuQYAALgLACC6BgAAuQsAMLsGAAC5CwAwvAYAALkLADC9BgAAuQsAML4GAAC7CwAwvwYAALwLADALPQAAqQsAMD4AAK4LADC3BgAAqgsAMLgGAACrCwAwuQYAAKwLACC6BgAArQsAMLsGAACtCwAwvAYAAK0LADC9BgAArQsAML4GAACvCwAwvwYAALALADALPQAAnAsAMD4AAKELADC3BgAAnQsAMLgGAACeCwAwuQYAAJ8LACC6BgAAoAsAMLsGAACgCwAwvAYAAKALADC9BgAAoAsAML4GAACiCwAwvwYAAKMLADALPQAAkQsAMD4AAJULADC3BgAAkgsAMLgGAACTCwAwuQYAAJQLACC6BgAAhQsAMLsGAACFCwAwvAYAAIULADC9BgAAhQsAML4GAACWCwAwvwYAAIgLADALPQAAgQsAMD4AAIYLADC3BgAAggsAMLgGAACDCwAwuQYAAIQLACC6BgAAhQsAMLsGAACFCwAwvAYAAIULADC9BgAAhQsAML4GAACHCwAwvwYAAIgLADALPQAA8woAMD4AAPgKADC3BgAA9AoAMLgGAAD1CgAwuQYAAPYKACC6BgAA9woAMLsGAAD3CgAwvAYAAPcKADC9BgAA9woAML4GAAD5CgAwvwYAAPoKADAJrAQBAAAAAbcEQAAAAAG4BEAAAAABowUBAAAAAegFIAAAAAGQBgEAAAABkgYAAACSBgKUBgAAAJQGApUGAQAAAAECAAAAeAAgPQAAgAsAIAMAAAB4ACA9AACACwAgPgAA_woAIAE2AADrDgAwDgQAAJYIACCpBAAAkwgAMKoEAAB2ABCrBAAAkwgAMKwEAQAAAAG3BEAAjwcAIbgEQACPBwAhuQQBAIoHACGjBQEAiQcAIegFIACNBwAhkAYBAIkHACGSBgAAlAiSBiKUBgAAlQiUBiKVBgEAigcAIQIAAAB4ACA2AAD_CgAgAgAAAPsKACA2AAD8CgAgDakEAAD6CgAwqgQAAPsKABCrBAAA-goAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIbkEAQCKBwAhowUBAIkHACHoBSAAjQcAIZAGAQCJBwAhkgYAAJQIkgYilAYAAJUIlAYilQYBAIoHACENqQQAAPoKADCqBAAA-woAEKsEAAD6CgAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAhuQQBAIoHACGjBQEAiQcAIegFIACNBwAhkAYBAIkHACGSBgAAlAiSBiKUBgAAlQiUBiKVBgEAigcAIQmsBAEA2AgAIbcEQADeCAAhuARAAN4IACGjBQEA2AgAIegFIADcCAAhkAYBANgIACGSBgAA_QqSBiKUBgAA_gqUBiKVBgEA2QgAIQG6BgAAAJIGAgG6BgAAAJQGAgmsBAEA2AgAIbcEQADeCAAhuARAAN4IACGjBQEA2AgAIegFIADcCAAhkAYBANgIACGSBgAA_QqSBiKUBgAA_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_wQC5wQBAAAAAfIEAQAAAAHzBAEAAAAB9AQQAAAAAfUEEAAAAAH2BBAAAAAB9wQQAAAAAfgEEAAAAAH5BBAAAAAB-gQQAAAAAfsEEAAAAAH8BBAAAAAB_QQQAAAAAf8EQAAAAAECAAAAagAgPQAAqAsAIAMAAABqACA9AACoCwAgPgAApwsAIAE2AADZDgAwGRkBAIoHACEkAACQBwAgqQQAAJkIADCqBAAAaAAQqwQAAJkIADCsBAEAAAABtwRAAI8HACG4BEAAjwcAIcoEAQCJBwAh1AQBAIkHACHeBAAAmgj_BCLnBAEAiQcAIfIEAQCKBwAh8wQBAIkHACH0BBAAjAcAIfUEEACMBwAh9gQQAIwHACH3BBAAjAcAIfgEEACMBwAh-QQQAIwHACH6BBAAjAcAIfsEEACMBwAh_AQQAIwHACH9BBAAjAcAIf8EQACOBwAhAgAAAGoAIDYAAKcLACACAAAApAsAIDYAAKULACAYGQEAigcAIakEAACjCwAwqgQAAKQLABCrBAAAowsAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIcoEAQCJBwAh1AQBAIkHACHeBAAAmgj_BCLnBAEAiQcAIfIEAQCKBwAh8wQBAIkHACH0BBAAjAcAIfUEEACMBwAh9gQQAIwHACH3BBAAjAcAIfgEEACMBwAh-QQQAIwHACH6BBAAjAcAIfsEEACMBwAh_AQQAIwHACH9BBAAjAcAIf8EQACOBwAhGBkBAIoHACGpBAAAowsAMKoEAACkCwAQqwQAAKMLADCsBAEAiQcAIbcEQACPBwAhuARAAI8HACHKBAEAiQcAIdQEAQCJBwAh3gQAAJoI_wQi5wQBAIkHACHyBAEAigcAIfMEAQCJBwAh9AQQAIwHACH1BBAAjAcAIfYEEACMBwAh9wQQAIwHACH4BBAAjAcAIfkEEACMBwAh-gQQAIwHACH7BBAAjAcAIfwEEACMBwAh_QQQAIwHACH_BEAAjgcAIRQZAQDZCAAhrAQBANgIACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHeBAAApgv_BCLnBAEA2AgAIfIEAQDZCAAh8wQBANgIACH0BBAA2wgAIfUEEADbCAAh9gQQANsIACH3BBAA2wgAIfgEEADbCAAh-QQQANsIACH6BBAA2wgAIfsEEADbCAAh_AQQANsIACH9BBAA2wgAIf8EQADdCAAhAboGAAAA_wQCFBkBANkIACGsBAEA2AgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAACmC_8EIucEAQDYCAAh8gQBANkIACHzBAEA2AgAIfQEEADbCAAh9QQQANsIACH2BBAA2wgAIfcEEADbCAAh-AQQANsIACH5BBAA2wgAIfoEEADbCAAh-wQQANsIACH8BBAA2wgAIf0EEADbCAAh_wRAAN0IACEUGQEAAAABrAQBAAAAAbcEQAAAAAG4BEAAAAABygQBAAAAAd4EAAAA_wQC5wQBAAAAAfIEAQAAAAHzBAEAAAAB9AQQAAAAAfUEEAAAAAH2BBAAAAAB9wQQAAAAAfgEEAAAAAH5BBAAAAAB-gQQAAAAAfsEEAAAAAH8BBAAAAAB_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-DgAguAYAAMAOACC9BgAAMAAgCz0AAJgMADA-AACcDAAwtwYAAJkMADC4BgAAmgwAMLkGAACbDAAgugYAAPQIADC7BgAA9AgAMLwGAAD0CAAwvQYAAPQIADC-BgAAnQwAML8GAAD3CAAwFwMAALkJACAOAACuCgAgFwAAuwkAIBgAALwJACAZAAC9CQAgGgAAvgkAIKwEAQAAAAGtBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAcoEAQAAAAHeBAAAALsFArkFAQAAAAG7BSAAAAABvAUgAAAAAb0FAQAAAAG-BQEAAAABvwVAAAAAAcEFgAAAAAHCBYAAAAABwwWAAAAAAQIAAAAmACA9AACgDAAgAwAAACYAID0AAKAMACA-AACfDAAgATYAAL8OADACAAAAJgAgNgAAnwwAIAIAAAD4CAAgNgAAngwAIBGsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcEFgAAAAAHCBYAAAAABwwWAAAAAARcDAAD8CAAgDgAArAoAIBcAAP4IACAYAAD_CAAgGQAAgAkAIBoAAIEJACCsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcEFgAAAAAHCBYAAAAABwwWAAAAAARcDAAC5CQAgDgAArgoAIBcAALsJACAYAAC8CQAgGQAAvQkAIBoAAL4JACCsBAEAAAABrQQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHKBAEAAAAB3gQAAAC7BQK5BQEAAAABuwUgAAAAAbwFIAAAAAG9BQEAAAABvgUBAAAAAb8FQAAAAAHBBYAAAAABwgWAAAAAAcMFgAAAAAEDPQAAvQ4AILcGAAC-DgAgvQYAADAAIAQ9AACYDAAwtwYAAJkMADC5BgAAmwwAIL0GAAD0CAAwAAAABT0AALgOACA-AAC7DgAgtwYAALkOACC4BgAAug4AIL0GAAAwACADPQAAuA4AILcGAAC5DgAgvQYAADAAIAAAAAAAAboGAAAA2wUCBT0AALEOACA-AAC2DgAgtwYAALIOACC4BgAAtQ4AIL0GAADIAwAgCz0AAL0MADA-AADCDAAwtwYAAL4MADC4BgAAvwwAMLkGAADADAAgugYAAMEMADC7BgAAwQwAMLwGAADBDAAwvQYAAMEMADC-BgAAwwwAML8GAADEDAAwCz0AALEMADA-AAC2DAAwtwYAALIMADC4BgAAswwAMLkGAAC0DAAgugYAALUMADC7BgAAtQwAMLwGAAC1DAAwvQYAALUMADC-BgAAtwwAML8GAAC4DAAwB6wEAQAAAAG3BEAAAAABuARAAAAAAe8EAQAAAAGjBQEAAAAB1AUgAAAAAdUFAQAAAAECAAAAOQAgPQAAvAwAIAMAAAA5ACA9AAC8DAAgPgAAuwwAIAE2AAC0DgAwDBMAAK0IACCpBAAArAgAMKoEAAA3ABCrBAAArAgAMKwEAQAAAAG3BEAAjwcAIbgEQACPBwAh7wQBAIoHACGjBQEAiQcAIdMFAQCJBwAh1AUgAI0HACHVBQEAiQcAIQIAAAA5ACA2AAC7DAAgAgAAALkMACA2AAC6DAAgC6kEAAC4DAAwqgQAALkMABCrBAAAuAwAMKwEAQCJBwAhtwRAAI8HACG4BEAAjwcAIe8EAQCKBwAhowUBAIkHACHTBQEAiQcAIdQFIACNBwAh1QUBAIkHACELqQQAALgMADCqBAAAuQwAEKsEAAC4DAAwrAQBAIkHACG3BEAAjwcAIbgEQACPBwAh7wQBAIoHACGjBQEAiQcAIdMFAQCJBwAh1AUgAI0HACHVBQEAiQcAIQesBAEA2AgAIbcEQADeCAAhuARAAN4IACHvBAEA2QgAIaMFAQDYCAAh1AUgANwIACHVBQEA2AgAIQesBAEA2AgAIbcEQADeCAAhuARAAN4IACHvBAEA2QgAIaMFAQDYCAAh1AUgANwIACHVBQEA2AgAIQesBAEAAAABtwRAAAAAAbgEQAAAAAHvBAEAAAABowUBAAAAAdQFIAAAAAHVBQEAAAABDxUAAKIMACCsBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAdUEAQAAAAHLBQAAAMsFAswFCAAAAAHNBRAAAAABzgUQAAAAAc8FAQAAAAHQBUAAAAAB0QUIAAAAAdIFAQAAAAECAAAANQAgPQAAyAwAIAMAAAA1ACA9AADIDAAgPgAAxwwAIAE2AACzDgAwFBMAAK0IACAVAACRBwAgqQQAAK4IADCqBAAAMwAQqwQAAK4IADCsBAEAAAABtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHVBAEAiQcAIcsFAACvCMsFIswFCACmCAAhzQUQAIwHACHOBRAAjAcAIc8FAQCKBwAh0AVAAI4HACHRBQgAsAgAIdIFAQCKBwAh0wUBAIkHACECAAAANQAgNgAAxwwAIAIAAADFDAAgNgAAxgwAIBKpBAAAxAwAMKoEAADFDAAQqwQAAMQMADCsBAEAiQcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAh1QQBAIkHACHLBQAArwjLBSLMBQgApggAIc0FEACMBwAhzgUQAIwHACHPBQEAigcAIdAFQACOBwAh0QUIALAIACHSBQEAigcAIdMFAQCJBwAhEqkEAADEDAAwqgQAAMUMABCrBAAAxAwAMKwEAQCJBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHVBAEAiQcAIcsFAACvCMsFIswFCACmCAAhzQUQAIwHACHOBRAAjAcAIc8FAQCKBwAh0AVAAI4HACHRBQgAsAgAIdIFAQCKBwAh0wUBAIkHACEOrAQBANgIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIdUEAQDYCAAhywUAAJQMywUizAUIAOYJACHNBRAA2wgAIc4FEADbCAAhzwUBANkIACHQBUAA3QgAIdEFCACVDAAh0gUBANkIACEPFQAAlwwAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHVBAEA2AgAIcsFAACUDMsFIswFCADmCQAhzQUQANsIACHOBRAA2wgAIc8FAQDZCAAh0AVAAN0IACHRBQgAlQwAIdIFAQDZCAAhDxUAAKIMACCsBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAdUEAQAAAAHLBQAAAMsFAswFCAAAAAHNBRAAAAABzgUQAAAAAc8FAQAAAAHQBUAAAAAB0QUIAAAAAdIFAQAAAAEDPQAAsQ4AILcGAACyDgAgvQYAAMgDACAEPQAAvQwAMLcGAAC-DAAwuQYAAMAMACC9BgAAwQwAMAQ9AACxDAAwtwYAALIMADC5BgAAtAwAIL0GAAC1DAAwAAAACz0AANAMADA-AADVDAAwtwYAANEMADC4BgAA0gwAMLkGAADTDAAgugYAANQMADC7BgAA1AwAMLwGAADUDAAwvQYAANQMADC-BgAA1gwAML8GAADXDAAwEBIAAMoMACAUAADLDAAgrAQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHVBAEAAAAB6QQAAADbBQLvBAEAAAAB1gUBAAAAAdcFAQAAAAHYBQEAAAAB2QUBAAAAAdsFEAAAAAHcBRAAAAABAgAAADAAID0AANsMACADAAAAMAAgPQAA2wwAID4AANoMACABNgAAsA4AMBURAACzCAAgEgAAtAgAIBQAALUIACCpBAAAsQgAMKoEAAAuABCrBAAAsQgAMKwEAQAAAAG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh6QQAALII2wUi7wQBAIoHACHWBQEAiQcAIdcFAQCKBwAh2AUBAIoHACHZBQEAigcAIdsFEACMBwAh3AUQAIwHACHdBQEAiQcAIQIAAAAwACA2AADaDAAgAgAAANgMACA2AADZDAAgEqkEAADXDAAwqgQAANgMABCrBAAA1wwAMKwEAQCJBwAhtQQgAI0HACG2BEAAjgcAIbcEQACPBwAhuARAAI8HACHVBAEAiQcAIekEAACyCNsFIu8EAQCKBwAh1gUBAIkHACHXBQEAigcAIdgFAQCKBwAh2QUBAIoHACHbBRAAjAcAIdwFEACMBwAh3QUBAIkHACESqQQAANcMADCqBAAA2AwAEKsEAADXDAAwrAQBAIkHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIdUEAQCJBwAh6QQAALII2wUi7wQBAIoHACHWBQEAiQcAIdcFAQCKBwAh2AUBAIoHACHZBQEAigcAIdsFEACMBwAh3AUQAIwHACHdBQEAiQcAIQ6sBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh1QQBANgIACHpBAAArQzbBSLvBAEA2QgAIdYFAQDYCAAh1wUBANkIACHYBQEA2QgAIdkFAQDZCAAh2wUQANsIACHcBRAA2wgAIRASAACvDAAgFAAAsAwAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHVBAEA2AgAIekEAACtDNsFIu8EAQDZCAAh1gUBANgIACHXBQEA2QgAIdgFAQDZCAAh2QUBANkIACHbBRAA2wgAIdwFEADbCAAhEBIAAMoMACAUAADLDAAgrAQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHVBAEAAAAB6QQAAADbBQLvBAEAAAAB1gUBAAAAAdcFAQAAAAHYBQEAAAAB2QUBAAAAAdsFEAAAAAHcBRAAAAABBD0AANAMADC3BgAA0QwAMLkGAADTDAAgvQYAANQMADAAAAAAAAAAAAAAAAAAAAAAAAAAAAc9AACrDgAgPgAArg4AILcGAACsDgAguAYAAK0OACC7BgAABwAgvAYAAAcAIL0GAACOBgAgAz0AAKsOACC3BgAArA4AIL0GAACOBgAgAAAAAAAAAboGAAAAngYCCz0AAPsMADA-AAD_DAAwtwYAAPwMADC4BgAA_QwAMLkGAAD-DAAgugYAAIULADC7BgAAhQsAMLwGAACFCwAwvQYAAIULADC-BgAAgA0AML8GAACICwAwDCgAAJALACApAACbCwAgrAQBAAAAAbcEQAAAAAG4BEAAAAAB5wUBAAAAAegFIAAAAAGXBgEAAAABmAYBAAAAAZkGAQAAAAGaBgEAAAABmwYBAAAAAQIAAABuACA9AACDDQAgAwAAAG4AID0AAIMNACA-AACCDQAgATYAAKoOADACAAAAbgAgNgAAgg0AIAIAAACJCwAgNgAAgQ0AIAqsBAEA2AgAIbcEQADeCAAhuARAAN4IACHnBQEA2AgAIegFIADcCAAhlwYBANkIACGYBgEA2QgAIZkGAQDYCAAhmgYBANgIACGbBgEA2QgAIQwoAACNCwAgKQAAmQsAIKwEAQDYCAAhtwRAAN4IACG4BEAA3ggAIecFAQDYCAAh6AUgANwIACGXBgEA2QgAIZgGAQDZCAAhmQYBANgIACGaBgEA2AgAIZsGAQDZCAAhDCgAAJALACApAACbCwAgrAQBAAAAAbcEQAAAAAG4BEAAAAAB5wUBAAAAAegFIAAAAAGXBgEAAAABmAYBAAAAAZkGAQAAAAGaBgEAAAABmwYBAAAAAQQ9AAD7DAAwtwYAAPwMADC5BgAA_gwAIL0GAACFCwAwAAAAAAAAAAAAAAAHPQAApQ4AID4AAKgOACC3BgAApg4AILgGAACnDgAguwYAAAoAILwGAAAKACC9BgAAjQEAIAM9AAClDgAgtwYAAKYOACC9BgAAjQEAIAAAAAAABz0AAJkOACA-AACjDgAgtwYAAJoOACC4BgAAog4AILsGAAASACC8BgAAEgAgvQYAABUAIAs9AACkDQAwPgAAqQ0AMLcGAAClDQAwuAYAAKYNADC5BgAApw0AILoGAACoDQAwuwYAAKgNADC8BgAAqA0AML0GAACoDQAwvgYAAKoNADC_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_DQAwvwYAAOMJADAMAwAA6wkAIBwAAMQKACCsBAEAAAABtwRAAAAAAbgEQAAAAAHKBAEAAAABoQUgAAAAAeAFCAAAAAHhBQgAAAAB4gUBAAAAAeMFAQAAAAHkBQEAAAABAgAAAE8AID0AAMINACADAAAATwAgPQAAwg0AID4AAMENACABNgAAmA4AMAIAAABPACA2AADBDQAgAgAAAOQJACA2AADADQAgCqwEAQDYCAAhtwRAAN4IACG4BEAA3ggAIcoEAQDYCAAhoQUgANwIACHgBQgA5gkAIeEFCADmCQAh4gUBANgIACHjBQEA2QgAIeQFAQDYCAAhDAMAAOgJACAcAADCCgAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAhygQBANgIACGhBSAA3AgAIeAFCADmCQAh4QUIAOYJACHiBQEA2AgAIeMFAQDZCAAh5AUBANgIACEMAwAA6wkAIBwAAMQKACCsBAEAAAABtwRAAAAAAbgEQAAAAAHKBAEAAAABoQUgAAAAAeAFCAAAAAHhBQgAAAAB4gUBAAAAAeMFAQAAAAHkBQEAAAABEAMAAKkJACAbAAC5CgAgrAQBAAAAAbcEQAAAAAG4BEAAAAABygQBAAAAAd4EAAAA6wQC5gQQAAAAAecEAQAAAAHpBAAAAOkEAusEAQAAAAHsBAEAAAAB7QQBAAAAAe4EQAAAAAHvBAEAAAAB8QQBAAAAAQIAAAAdACA9AADLDQAgAwAAAB0AID0AAMsNACA-AADKDQAgATYAAJcOADACAAAAHQAgNgAAyg0AIAIAAAChCQAgNgAAyQ0AIA6sBAEA2AgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAACkCesEIuYEEADbCAAh5wQBANgIACHpBAAAownpBCLrBAEA2QgAIewEAQDZCAAh7QQBANkIACHuBEAA3QgAIe8EAQDZCAAh8QQBANkIACEQAwAApgkAIBsAALcKACCsBAEA2AgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAACkCesEIuYEEADbCAAh5wQBANgIACHpBAAAownpBCLrBAEA2QgAIewEAQDZCAAh7QQBANkIACHuBEAA3QgAIe8EAQDZCAAh8QQBANkIACEQAwAAqQkAIBsAALkKACCsBAEAAAABtwRAAAAAAbgEQAAAAAHKBAEAAAAB3gQAAADrBALmBBAAAAAB5wQBAAAAAekEAAAA6QQC6wQBAAAAAewEAQAAAAHtBAEAAAAB7gRAAAAAAe8EAQAAAAHxBAEAAAABEQoAAIwKACAdAACQCgAgHgAAkQ0AIB8AAI4KACAgAACPCgAgrAQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHIBAEAAAABpgYBAAAAAacGAgAAAAGoBgIAAAABqQYBAAAAAaoGAQAAAAGrBgEAAAABAgAAABAAID0AANQNACADAAAAEAAgPQAA1A0AID4AANMNACABNgAAlg4AMAIAAAAQACA2AADTDQAgAgAAANMJACA2AADSDQAgDKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHIBAEA2QgAIaYGAQDYCAAhpwYCANUJACGoBgIA1QkAIakGAQDZCAAhqgYBANkIACGrBgEA2AgAIREKAADXCQAgHQAA2wkAIB4AAJANACAfAADZCQAgIAAA2gkAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHIBAEA2QgAIaYGAQDYCAAhpwYCANUJACGoBgIA1QkAIakGAQDZCAAhqgYBANkIACGrBgEA2AgAIREKAACMCgAgHQAAkAoAIB4AAJENACAfAACOCgAgIAAAjwoAIKwEAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAByAQBAAAAAaYGAQAAAAGnBgIAAAABqAYCAAAAAakGAQAAAAGqBgEAAAABqwYBAAAAAQQ9AADMDQAwtwYAAM0NADC5BgAAzw0AIL0GAADPCQAwBD0AAMMNADC3BgAAxA0AMLkGAADGDQAgvQYAAJ0JADAEPQAAug0AMLcGAAC7DQAwuQYAAL0NACC9BgAA4AkAMAAAAAAAAAs9AAD2DQAwPgAA-g0AMLcGAAD3DQAwuAYAAPgNADC5BgAA-Q0AILoGAACtCwAwuwYAAK0LADC8BgAArQsAML0GAACtCwAwvgYAAPsNADC_BgAAsAsAMAs9AADqDQAwPgAA7w0AMLcGAADrDQAwuAYAAOwNADC5BgAA7Q0AILoGAADuDQAwuwYAAO4NADC8BgAA7g0AML0GAADuDQAwvgYAAPANADC_BgAA8Q0AMAs9AADhDQAwPgAA5Q0AMLcGAADiDQAwuAYAAOMNADC5BgAA5A0AILoGAACoDQAwuwYAAKgNADC8BgAAqA0AML0GAACoDQAwvgYAAOYNADC_BgAAqw0AMA4GAACzDQAgBwAAsA0AIAgAALINACCsBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAe8EAQAAAAGjBQEAAAABzQUQAAAAAd4FAQAAAAGsBgIAAAABrQYBAAAAAQIAAAAVACA9AADpDQAgAwAAABUAID0AAOkNACA-AADoDQAgATYAAJUOADACAAAAFQAgNgAA6A0AIAIAAACsDQAgNgAA5w0AIAusBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh7wQBANkIACGjBQEA2AgAIc0FEADbCAAh3gUBANgIACGsBgIA1QkAIa0GAQDZCAAhDgYAAJcNACAHAACYDQAgCAAAmg0AIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHvBAEA2QgAIaMFAQDYCAAhzQUQANsIACHeBQEA2AgAIawGAgDVCQAhrQYBANkIACEOBgAAsw0AIAcAALANACAIAACyDQAgrAQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHvBAEAAAABowUBAAAAAc0FEAAAAAHeBQEAAAABrAYCAAAAAa0GAQAAAAELBAAAkQoAIAgAAJMKACCsBAEAAAABrgQBAAAAAa8EAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAABuQQBAAAAAcgEAQAAAAECAAAAjQEAID0AAPUNACADAAAAjQEAID0AAPUNACA-AAD0DQAgATYAAJQOADAQBAAAkAcAIAUAAJIIACAIAACNCAAgqQQAAJEIADCqBAAACgAQqwQAAJEIADCsBAEAAAABrgQBAIkHACGvBAEAigcAIbUEIACNBwAhtgRAAI4HACG3BEAAjwcAIbgEQACPBwAhuQQBAAAAAcgEAQAAAAHJBAEAigcAIQIAAACNAQAgNgAA9A0AIAIAAADyDQAgNgAA8w0AIA2pBAAA8Q0AMKoEAADyDQAQqwQAAPENADCsBAEAiQcAIa4EAQCJBwAhrwQBAIoHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIbkEAQCJBwAhyAQBAIkHACHJBAEAigcAIQ2pBAAA8Q0AMKoEAADyDQAQqwQAAPENADCsBAEAiQcAIa4EAQCJBwAhrwQBAIoHACG1BCAAjQcAIbYEQACOBwAhtwRAAI8HACG4BEAAjwcAIbkEAQCJBwAhyAQBAIkHACHJBAEAigcAIQmsBAEA2AgAIa4EAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIbkEAQDYCAAhyAQBANgIACELBAAAyAkAIAgAAMoJACCsBAEA2AgAIa4EAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIbkEAQDYCAAhyAQBANgIACELBAAAkQoAIAgAAJMKACCsBAEAAAABrgQBAAAAAa8EAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAABuQQBAAAAAcgEAQAAAAEXBAAA3AoAIBgAAOEKACAdAADgCgAgHwAA3goAICAAAN8KACAkAADbCgAgLQAA4goAIKwEAQAAAAGvBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAbkEAQAAAAHKBAEAAAABywQBAAAAAc0EAAAAzQQDzgRAAAAAAdAEAAAA0AQC0QQQAAAAAdIEAQAAAAHTBAEAAAAB1AQBAAAAAQIAAAAFACA9AAD-DQAgAwAAAAUAID0AAP4NACA-AAD9DQAgATYAAJMOADACAAAABQAgNgAA_Q0AIAIAAACxCwAgNgAA_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_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_BUAAAAABwQWAAAAAAcIFgAAAAAHDBYAAAAABAwAAAC4AID0AAL0OACA-AADCDgAgEwAAAC4AIBEAAK4MACAUAACwDAAgNgAAwg4AIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHVBAEA2AgAIekEAACtDNsFIu8EAQDZCAAh1gUBANgIACHXBQEA2QgAIdgFAQDZCAAh2QUBANkIACHbBRAA2wgAIdwFEADbCAAh3QUBANgIACEREQAArgwAIBQAALAMACCsBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh1QQBANgIACHpBAAArQzbBSLvBAEA2QgAIdYFAQDYCAAh1wUBANkIACHYBQEA2QgAIdkFAQDZCAAh2wUQANsIACHcBRAA2wgAId0FAQDYCAAhGAMAALkJACAOAACuCgAgFgAAugkAIBcAALsJACAYAAC8CQAgGQAAvQkAIKwEAQAAAAGtBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAcoEAQAAAAHeBAAAALsFArkFAQAAAAG7BSAAAAABvAUgAAAAAb0FAQAAAAG-BQEAAAABvwVAAAAAAcAFAQAAAAHBBYAAAAABwgWAAAAAAcMFgAAAAAECAAAAJgAgPQAAww4AIAMAAAAhACA9AADDDgAgPgAAxw4AIBoAAAAhACADAAD8CAAgDgAArAoAIBYAAP0IACAXAAD-CAAgGAAA_wgAIBkAAIAJACA2AADHDgAgrAQBANgIACGtBAEA2QgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHeBAAA-gi7BSK5BQEA2AgAIbsFIADcCAAhvAUgANwIACG9BQEA2QgAIb4FAQDZCAAhvwVAAN0IACHABQEA2AgAIcEFgAAAAAHCBYAAAAABwwWAAAAAARgDAAD8CAAgDgAArAoAIBYAAP0IACAXAAD-CAAgGAAA_wgAIBkAAIAJACCsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcAFAQDYCAAhwQWAAAAAAcIFgAAAAAHDBYAAAAABGAMAALkJACAOAACuCgAgFgAAugkAIBgAALwJACAZAAC9CQAgGgAAvgkAIKwEAQAAAAGtBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAcoEAQAAAAHeBAAAALsFArkFAQAAAAG7BSAAAAABvAUgAAAAAb0FAQAAAAG-BQEAAAABvwVAAAAAAcAFAQAAAAHBBYAAAAABwgWAAAAAAcMFgAAAAAECAAAAJgAgPQAAyA4AIAMAAAAhACA9AADIDgAgPgAAzA4AIBoAAAAhACADAAD8CAAgDgAArAoAIBYAAP0IACAYAAD_CAAgGQAAgAkAIBoAAIEJACA2AADMDgAgrAQBANgIACGtBAEA2QgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAhygQBANgIACHeBAAA-gi7BSK5BQEA2AgAIbsFIADcCAAhvAUgANwIACG9BQEA2QgAIb4FAQDZCAAhvwVAAN0IACHABQEA2AgAIcEFgAAAAAHCBYAAAAABwwWAAAAAARgDAAD8CAAgDgAArAoAIBYAAP0IACAYAAD_CAAgGQAAgAkAIBoAAIEJACCsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_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-QQQAAAAAfoEEAAAAAH7BBAAAAAB_AQQAAAAAf0EEAAAAAH_BEAAAAABGwMAANILACAOAADUCwAgHgAA0wsAICIAANULACAjAADWCwAgJQAA1wsAICoAANgLACAsAADaCwAgrAQBAAAAAa8EAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAB1QQBAAAAAdYEAQAAAAHXBAEAAAAB2AQBAAAAAdoEAAAA2gQC3AQAAADcBALeBAAAAN4EAt8EIAAAAAHgBAEAAAAB4QRAAAAAAeMEAAAA4wQD5AQBAAAAAeUEAQAAAAECAAAAjgYAID0AANoOACADAAAABwAgPQAA2g4AID4AAN4OACAdAAAABwAgAwAA6goAIA4AAOwKACAeAADrCgAgIgAA7QoAICMAAO4KACAlAADvCgAgKgAA8AoAICwAAPIKACA2AADeDgAgrAQBANgIACGvBAEA2QgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh1QQBANgIACHWBAEA2AgAIdcEAQDZCAAh2AQBANkIACHaBAAA5graBCLcBAAA5wrcBCLeBAAA6AreBCLfBCAA3AgAIeAEAQDZCAAh4QRAAN0IACHjBAAA6QrjBCPkBAEA2AgAIeUEAQDYCAAhGwMAAOoKACAOAADsCgAgHgAA6woAICIAAO0KACAjAADuCgAgJQAA7woAICoAAPAKACAsAADyCgAgrAQBANgIACGvBAEA2QgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAh1QQBANgIACHWBAEA2AgAIdcEAQDZCAAh2AQBANkIACHaBAAA5graBCLcBAAA5wrcBCLeBAAA6AreBCLfBCAA3AgAIeAEAQDZCAAh4QRAAN0IACHjBAAA6QrjBCPkBAEA2AgAIeUEAQDYCAAhCqwEAQAAAAG3BEAAAAABuARAAAAAAecFAQAAAAHoBSAAAAABlgYBAAAAAZcGAQAAAAGYBgEAAAABmQYBAAAAAZsGAQAAAAEbAwAA0gsAIA4AANQLACAeAADTCwAgIgAA1QsAICMAANYLACAlAADXCwAgKwAA2QsAICwAANoLACCsBAEAAAABrwQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHVBAEAAAAB1gQBAAAAAdcEAQAAAAHYBAEAAAAB2gQAAADaBALcBAAAANwEAt4EAAAA3gQC3wQgAAAAAeAEAQAAAAHhBEAAAAAB4wQAAADjBAPkBAEAAAAB5QQBAAAAAQIAAACOBgAgPQAA4A4AIAmsBAEAAAABtwRAAAAAAbgEQAAAAAHyBAEAAAABnAYBAAAAAZ4GAAAAngYCnwYgAAAAAaAGAQAAAAGhBgEAAAABAgAAAJ0CACA9AADiDgAgAwAAAAcAID0AAOAOACA-AADmDgAgHQAAAAcAIAMAAOoKACAOAADsCgAgHgAA6woAICIAAO0KACAjAADuCgAgJQAA7woAICsAAPEKACAsAADyCgAgNgAA5g4AIKwEAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIdUEAQDYCAAh1gQBANgIACHXBAEA2QgAIdgEAQDZCAAh2gQAAOYK2gQi3AQAAOcK3AQi3gQAAOgK3gQi3wQgANwIACHgBAEA2QgAIeEEQADdCAAh4wQAAOkK4wQj5AQBANgIACHlBAEA2AgAIRsDAADqCgAgDgAA7AoAIB4AAOsKACAiAADtCgAgIwAA7goAICUAAO8KACArAADxCgAgLAAA8goAIKwEAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIdUEAQDYCAAh1gQBANgIACHXBAEA2QgAIdgEAQDZCAAh2gQAAOYK2gQi3AQAAOcK3AQi3gQAAOgK3gQi3wQgANwIACHgBAEA2QgAIeEEQADdCAAh4wQAAOkK4wQj5AQBANgIACHlBAEA2AgAIQMAAABwACA9AADiDgAgPgAA6Q4AIAsAAABwACA2AADpDgAgrAQBANgIACG3BEAA3ggAIbgEQADeCAAh8gQBANkIACGcBgEA2AgAIZ4GAAD5DJ4GIp8GIADcCAAhoAYBANkIACGhBgEA2QgAIQmsBAEA2AgAIbcEQADeCAAhuARAAN4IACHyBAEA2QgAIZwGAQDYCAAhngYAAPkMngYinwYgANwIACGgBgEA2QgAIaEGAQDZCAAhCqwEAQAAAAG3BEAAAAABuARAAAAAAecFAQAAAAHoBSAAAAABlgYBAAAAAZcGAQAAAAGYBgEAAAABmQYBAAAAAZoGAQAAAAEJrAQBAAAAAbcEQAAAAAG4BEAAAAABowUBAAAAAegFIAAAAAGQBgEAAAABkgYAAACSBgKUBgAAAJQGApUGAQAAAAEKLwAAgA4AIDAAAIEOACCsBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAdUEAQAAAAHvBAEAAAAB3gUBAAAAAQIAAAABACA9AADsDgAgGw4AANQLACAeAADTCwAgIgAA1QsAICMAANYLACAlAADXCwAgKgAA2AsAICsAANkLACAsAADaCwAgrAQBAAAAAa8EAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAB1QQBAAAAAdYEAQAAAAHXBAEAAAAB2AQBAAAAAdoEAAAA2gQC3AQAAADcBALeBAAAAN4EAt8EIAAAAAHgBAEAAAAB4QRAAAAAAeMEAAAA4wQD5AQBAAAAAeUEAQAAAAECAAAAjgYAID0AAO4OACAbAwAA0gsAIA4AANQLACAeAADTCwAgIgAA1QsAICUAANcLACAqAADYCwAgKwAA2QsAICwAANoLACCsBAEAAAABrwQBAAAAAbUEIAAAAAG2BEAAAAABtwRAAAAAAbgEQAAAAAHVBAEAAAAB1gQBAAAAAdcEAQAAAAHYBAEAAAAB2gQAAADaBALcBAAAANwEAt4EAAAA3gQC3wQgAAAAAeAEAQAAAAHhBEAAAAAB4wQAAADjBAPkBAEAAAAB5QQBAAAAAQIAAACOBgAgPQAA8A4AIBIKAACMCgAgCwAAjQoAIB0AAJAKACAeAACRDQAgIAAAjwoAIKwEAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAByAQBAAAAAfAEAQAAAAGmBgEAAAABpwYCAAAAAagGAgAAAAGpBgEAAAABqgYBAAAAAasGAQAAAAECAAAAEAAgPQAA8g4AIAMAAAAOACA9AADyDgAgPgAA9g4AIBQAAAAOACAKAADXCQAgCwAA2AkAIB0AANsJACAeAACQDQAgIAAA2gkAIDYAAPYOACCsBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAhyAQBANkIACHwBAEA2AgAIaYGAQDYCAAhpwYCANUJACGoBgIA1QkAIakGAQDZCAAhqgYBANkIACGrBgEA2AgAIRIKAADXCQAgCwAA2AkAIB0AANsJACAeAACQDQAgIAAA2gkAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHIBAEA2QgAIfAEAQDYCAAhpgYBANgIACGnBgIA1QkAIagGAgDVCQAhqQYBANkIACGqBgEA2QgAIasGAQDYCAAhBqwEAQAAAAG1BCAAAAABtgRAAAAAAd4EAAAApQYC5AUBAAAAAaUGQAAAAAESCgAAjAoAIAsAAI0KACAdAACQCgAgHgAAkQ0AIB8AAI4KACCsBAEAAAABtQQgAAAAAbYEQAAAAAG3BEAAAAABuARAAAAAAcgEAQAAAAHwBAEAAAABpgYBAAAAAacGAgAAAAGoBgIAAAABqQYBAAAAAaoGAQAAAAGrBgEAAAABAgAAABAAID0AAPgOACADAAAADgAgPQAA-A4AID4AAPwOACAUAAAADgAgCgAA1wkAIAsAANgJACAdAADbCQAgHgAAkA0AIB8AANkJACA2AAD8DgAgrAQBANgIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIcgEAQDZCAAh8AQBANgIACGmBgEA2AgAIacGAgDVCQAhqAYCANUJACGpBgEA2QgAIaoGAQDZCAAhqwYBANgIACESCgAA1wkAIAsAANgJACAdAADbCQAgHgAAkA0AIB8AANkJACCsBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAhyAQBANkIACHwBAEA2AgAIaYGAQDYCAAhpwYCANUJACGoBgIA1QkAIakGAQDZCAAhqgYBANkIACGrBgEA2AgAIQesBAEAAAABtwRAAAAAAbgEQAAAAAHeBAAAAKQGAuMFAQAAAAHkBQEAAAABogZAAAAAARIKAACMCgAgCwAAjQoAIB4AAJENACAfAACOCgAgIAAAjwoAIKwEAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAAByAQBAAAAAfAEAQAAAAGmBgEAAAABpwYCAAAAAagGAgAAAAGpBgEAAAABqgYBAAAAAasGAQAAAAECAAAAEAAgPQAA_g4AIAMAAAAOACA9AAD-DgAgPgAAgg8AIBQAAAAOACAKAADXCQAgCwAA2AkAIB4AAJANACAfAADZCQAgIAAA2gkAIDYAAIIPACCsBAEA2AgAIbUEIADcCAAhtgRAAN0IACG3BEAA3ggAIbgEQADeCAAhyAQBANkIACHwBAEA2AgAIaYGAQDYCAAhpwYCANUJACGoBgIA1QkAIakGAQDZCAAhqgYBANkIACGrBgEA2AgAIRIKAADXCQAgCwAA2AkAIB4AAJANACAfAADZCQAgIAAA2gkAIKwEAQDYCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHIBAEA2QgAIfAEAQDYCAAhpgYBANgIACGnBgIA1QkAIagGAgDVCQAhqQYBANkIACGqBgEA2QgAIasGAQDYCAAhCqwEAQAAAAG3BEAAAAABuARAAAAAAfAEAQAAAAGhBSAAAAAB4AUIAAAAAeEFCAAAAAHiBQEAAAAB4wUBAAAAAeQFAQAAAAEYAwAAuQkAIA4AAK4KACAWAAC6CQAgFwAAuwkAIBkAAL0JACAaAAC-CQAgrAQBAAAAAa0EAQAAAAG1BCAAAAABtgRAAAAAAbcEQAAAAAG4BEAAAAABygQBAAAAAd4EAAAAuwUCuQUBAAAAAbsFIAAAAAG8BSAAAAABvQUBAAAAAb4FAQAAAAG_BUAAAAABwAUBAAAAAcEFgAAAAAHCBYAAAAABwwWAAAAAAQIAAAAmACA9AACEDwAgAwAAACEAID0AAIQPACA-AACIDwAgGgAAACEAIAMAAPwIACAOAACsCgAgFgAA_QgAIBcAAP4IACAZAACACQAgGgAAgQkAIDYAAIgPACCsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcAFAQDYCAAhwQWAAAAAAcIFgAAAAAHDBYAAAAABGAMAAPwIACAOAACsCgAgFgAA_QgAIBcAAP4IACAZAACACQAgGgAAgQkAIKwEAQDYCAAhrQQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIcoEAQDYCAAh3gQAAPoIuwUiuQUBANgIACG7BSAA3AgAIbwFIADcCAAhvQUBANkIACG-BQEA2QgAIb8FQADdCAAhwAUBANgIACHBBYAAAAABwgWAAAAAAcMFgAAAAAEOrAQBAAAAAbcEQAAAAAG4BEAAAAAB3gQAAADrBALmBBAAAAAB5wQBAAAAAekEAAAA6QQC6wQBAAAAAewEAQAAAAHtBAEAAAAB7gRAAAAAAe8EAQAAAAHwBAEAAAAB8QQBAAAAAQ8EAAC_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_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_BUAAAAABwAUBAAAAAcEFgAAAAAHCBYAAAAABwwWAAAAAAQIAAAAmACA9AADlDwAgAwAAACEAID0AAOUPACA-AADpDwAgGgAAACEAIAMAAPwIACAOAACsCgAgFgAA_QgAIBcAAP4IACAYAAD_CAAgGgAAgQkAIDYAAOkPACCsBAEA2AgAIa0EAQDZCAAhtQQgANwIACG2BEAA3QgAIbcEQADeCAAhuARAAN4IACHKBAEA2AgAId4EAAD6CLsFIrkFAQDYCAAhuwUgANwIACG8BSAA3AgAIb0FAQDZCAAhvgUBANkIACG_BUAA3QgAIcAFAQDYCAAhwQWAAAAAAcIFgAAAAAHDBYAAAAABGAMAAPwIACAOAACsCgAgFgAA_QgAIBcAAP4IACAYAAD_CAAgGgAAgQkAIKwEAQDYCAAhrQQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIcoEAQDYCAAh3gQAAPoIuwUiuQUBANgIACG7BSAA3AgAIbwFIADcCAAhvQUBANkIACG-BQEA2QgAIb8FQADdCAAhwAUBANgIACHBBYAAAAABwgWAAAAAAcMFgAAAAAEGrAQBAAAAAbcEQAAAAAG4BEAAAAAB8gQBAAAAAbQFAQAAAAG1BSAAAAABAwAAAAcAID0AAMUPACA-AADtDwAgHQAAAAcAIAMAAOoKACAeAADrCgAgIgAA7QoAICMAAO4KACAlAADvCgAgKgAA8AoAICsAAPEKACAsAADyCgAgNgAA7Q8AIKwEAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIdUEAQDYCAAh1gQBANgIACHXBAEA2QgAIdgEAQDZCAAh2gQAAOYK2gQi3AQAAOcK3AQi3gQAAOgK3gQi3wQgANwIACHgBAEA2QgAIeEEQADdCAAh4wQAAOkK4wQj5AQBANgIACHlBAEA2AgAIRsDAADqCgAgHgAA6woAICIAAO0KACAjAADuCgAgJQAA7woAICoAAPAKACArAADxCgAgLAAA8goAIKwEAQDYCAAhrwQBANkIACG1BCAA3AgAIbYEQADdCAAhtwRAAN4IACG4BEAA3ggAIdUEAQDYCAAh1gQBANgIACHXBAEA2QgAIdgEAQDZCAAh2gQAAOYK2gQi3AQAAOcK3AQi3gQAAOgK3gQi3wQgANwIACHgBAEA2QgAIeEEQADdCAAh4wQAAOkK4wQj5AQBANgIACHlBAEA2AgAIQQJACYuBgIvjgEEMI8BBgkEAAMFgQEBCQAlGIUBCR2EARgfggEaIIMBGyQIAy2GAQoKAwkCCQAkDmILHgsEImYeI2cCJWsfKm8gK3UgLHkjBAQAAwUNAQgRBQkAHQcJABwKAAYLAAgdXRgeVAQfWBogXBsFBQABBhMGBxYGCBcFCQAHAgcYAAgZAAQIGgUJABkYHgkdUBgDAwACCyAIGyIKCAMAAgkAFw4kCxYADhdCFRhDCRlEDBpIFgQEAAMJAA0MJwoPKwwCDQAKDgALAgwsAA8tAAMJABQTAA8VPQoECQATEQAQEjYOFDoSAgkAERAxDwEQMgABEwAPAhI7ABQ8AAEVPgABDQAKAQ0ACgQXSQAYSgAZSwAaTAADAwACCwAIHAAFAwhRABhSAB1TAAIDAAIcAAUCAwACHAAFAx1gAB9eACBfAAEIYQABIQADASQAAwMncSEoAAMpdAMCCQAiJnIgASZzAAEEegMGInsAI3wAJX0AKn4AK38ALIABAAUYigEAHYkBAB-HAQAgiAEALYsBAAMukAEAL5EBADCSAQAAAAADCQArQwAsRAAtAAAAAwkAK0MALEQALQAAAwkAMkMAM0QANAAAAAMJADJDADNEADQCBQABBssBBgIFAAEG0QEGBQkAOUMAPEQAPWUAOmYAOwAAAAAABQkAOUMAPEQAPWUAOmYAOwMKAAYLAAge4wEEAwoABgsACB7pAQQFCQBCQwBFRABGZQBDZgBEAAAAAAAFCQBCQwBFRABGZQBDZgBEAgMAAhwABQIDAAIcAAUDCQBLQwBMRABNAAAAAwkAS0MATEQATQIDAAIcAAUCAwACHAAFAwkAUkMAU0QAVAAAAAMJAFJDAFNEAFQAAAMJAFlDAFpEAFsAAAADCQBZQwBaRABbAye_AiEoAAMpwAIDAyfGAiEoAAMpxwIDAwkAYEMAYUQAYgAAAAMJAGBDAGFEAGIBBNkCAwEE3wIDAwkAZ0MAaEQAaQAAAAMJAGdDAGhEAGkAAAADCQBvQwBwRABxAAAAAwkAb0MAcEQAcQAAAAUJAHdDAHpEAHtlAHhmAHkAAAAAAAUJAHdDAHpEAHtlAHhmAHkAAAADCQCBAUMAggFEAIMBAAAAAwkAgQFDAIIBRACDAQMDAAILAAgcAAUDAwACCwAIHAAFBQkAiAFDAIsBRACMAWUAiQFmAIoBAAAAAAAFCQCIAUMAiwFEAIwBZQCJAWYAigEAAAMJAJEBQwCSAUQAkwEAAAADCQCRAUMAkgFEAJMBAREAEAERABAFCQCYAUMAmwFEAJwBZQCZAWYAmgEAAAAAAAUJAJgBQwCbAUQAnAFlAJkBZgCaAQETAA8BEwAPAwkAoQFDAKIBRACjAQAAAAMJAKEBQwCiAUQAowEBEwAPARMADwUJAKgBQwCrAUQArAFlAKkBZgCqAQAAAAAABQkAqAFDAKsBRACsAWUAqQFmAKoBAwMAAg6tBAsWAA4DAwACDrMECxYADgMJALEBQwCyAUQAswEAAAADCQCxAUMAsgFEALMBAQ0ACgENAAoDCQC4AUMAuQFEALoBAAAAAwkAuAFDALkBRAC6AQINAAoOAAsCDQAKDgALAwkAvwFDAMABRADBAQAAAAMJAL8BQwDAAUQAwQEBDQAKAQ0ACgMJAMYBQwDHAUQAyAEAAAADCQDGAUMAxwFEAMgBASEAAwEhAAMDCQDNAUMAzgFEAM8BAAAAAwkAzQFDAM4BRADPAQAAAAUJANUBQwDYAUQA2QFlANYBZgDXAQAAAAAABQkA1QFDANgBRADZAWUA1gFmANcBAAAAAwkA3wFDAOABRADhAQAAAAMJAN8BQwDgAUQA4QEAAAADCQDnAUMA6AFEAOkBAAAAAwkA5wFDAOgBRADpAQEkAAMBJAADBQkA7gFDAPEBRADyAWUA7wFmAPABAAAAAAAFCQDuAUMA8QFEAPIBZQDvAWYA8AEDAwACC_4FCBv_BQoDAwACC4UGCBuGBgoFCQD3AUMA-gFEAPsBZQD4AWYA-QEAAAAAAAUJAPcBQwD6AUQA-wFlAPgBZgD5AQAAAwkAgAJDAIECRACCAgAAAAMJAIACQwCBAkQAggIDBAADBbEGASSwBgMDBAADBbgGASS3BgMFCQCHAkMAigJEAIsCZQCIAmYAiQIAAAAAAAUJAIcCQwCKAkQAiwJlAIgCZgCJAgIEAAMFygYBAgQAAwXQBgEDCQCQAkMAkQJEAJICAAAAAwkAkAJDAJECRACSAgEEAAMBBAADBQkAlwJDAJoCRACbAmUAmAJmAJkCAAAAAAAFCQCXAkMAmgJEAJsCZQCYAmYAmQIxAgEykwEBM5UBATSWAQE1lwEBN5kBATibASc5nAEoOp4BATugASc8oQEpP6IBAUCjAQFBpAEnRacBKkaoAS5HqgEISKsBCEmtAQhKrgEIS68BCEyxAQhNswEnTrQBL0-2AQhQuAEnUbkBMFK6AQhTuwEIVLwBJ1W_ATFWwAE1V8EBBljCAQZZwwEGWsQBBlvFAQZcxwEGXckBJ17KATZfzQEGYM8BJ2HQATdi0gEGY9MBBmTUASdn1wE4aNgBPmnZAQVq2gEFa9sBBWzcAQVt3QEFbt8BBW_hASdw4gE_ceUBBXLnASdz6AFAdOoBBXXrAQV27AEnd-8BQXjwAUd58QEaevIBGnvzARp89AEaffUBGn73ARp_-QEngAH6AUiBAfwBGoIB_gEngwH_AUmEAYACGoUBgQIahgGCAieHAYUCSogBhgJOiQGHAhuKAYgCG4sBiQIbjAGKAhuNAYsCG44BjQIbjwGPAieQAZACT5EBkgIbkgGUAieTAZUCUJQBlgIblQGXAhuWAZgCJ5cBmwJRmAGcAlWZAZ4CIZoBnwIhmwGhAiGcAaICIZ0BowIhngGlAiGfAacCJ6ABqAJWoQGqAiGiAawCJ6MBrQJXpAGuAiGlAa8CIaYBsAInpwGzAlioAbQCXKkBtQIgqgG2AiCrAbcCIKwBuAIgrQG5AiCuAbsCIK8BvQInsAG-Al2xAcICILIBxAInswHFAl60AcgCILUByQIgtgHKAie3Ac0CX7gBzgJjuQHPAiO6AdACI7sB0QIjvAHSAiO9AdMCI74B1QIjvwHXAifAAdgCZMEB2wIjwgHdAifDAd4CZcQB4AIjxQHhAiPGAeICJ8cB5QJmyAHmAmrJAegCa8oB6QJrywHsAmvMAe0Ca80B7gJrzgHwAmvPAfICJ9AB8wJs0QH1AmvSAfcCJ9MB-AJt1AH5AmvVAfoCa9YB-wIn1wH-Am7YAf8CctkBgQNz2gGCA3PbAYUDc9wBhgNz3QGHA3PeAYkDc98BiwMn4AGMA3ThAY4Dc-IBkAMn4wGRA3XkAZIDc-UBkwNz5gGUAyfnAZcDdugBmAN86QGaA33qAZsDfesBngN97AGfA33tAaADfe4BogN97wGkAyfwAaUDfvEBpwN98gGpAyfzAaoDf_QBqwN99QGsA332Aa0DJ_cBsAOAAfgBsQOEAfkBsgMY-gGzAxj7AbQDGPwBtQMY_QG2Axj-AbgDGP8BugMngAK7A4UBgQK9AxiCAr8DJ4MCwAOGAYQCwQMYhQLCAxiGAsMDJ4cCxgOHAYgCxwONAYkCyQMQigLKAxCLAs0DEIwCzgMQjQLPAxCOAtEDEI8C0wMnkALUA44BkQLWAxCSAtgDJ5MC2QOPAZQC2gMQlQLbAxCWAtwDJ5cC3wOQAZgC4AOUAZkC4QMPmgLiAw-bAuMDD5wC5AMPnQLlAw-eAucDD58C6QMnoALqA5UBoQLsAw-iAu4DJ6MC7wOWAaQC8AMPpQLxAw-mAvIDJ6cC9QOXAagC9gOdAakC9wMSqgL4AxKrAvkDEqwC-gMSrQL7AxKuAv0DEq8C_wMnsAKABJ4BsQKCBBKyAoQEJ7MChQSfAbQChgQStQKHBBK2AogEJ7cCiwSgAbgCjASkAbkCjQQOugKOBA67Ao8EDrwCkAQOvQKRBA6-ApMEDr8ClQQnwAKWBKUBwQKYBA7CApoEJ8MCmwSmAcQCnAQOxQKdBA7GAp4EJ8cCoQSnAcgCogStAckCowQKygKkBArLAqUECswCpgQKzQKnBArOAqkECs8CqwQn0AKsBK4B0QKvBArSArEEJ9MCsgSvAdQCtAQK1QK1BArWArYEJ9cCuQSwAdgCugS0AdkCuwQW2gK8BBbbAr0EFtwCvgQW3QK_BBbeAsEEFt8CwwQn4ALEBLUB4QLGBBbiAsgEJ-MCyQS2AeQCygQW5QLLBBbmAswEJ-cCzwS3AegC0AS7AekC0QQM6gLSBAzrAtMEDOwC1AQM7QLVBAzuAtcEDO8C2QQn8ALaBLwB8QLcBAzyAt4EJ_MC3wS9AfQC4AQM9QLhBAz2AuIEJ_cC5QS-AfgC5gTCAfkC5wQV-gLoBBX7AukEFfwC6gQV_QLrBBX-Au0EFf8C7wQngAPwBMMBgQPyBBWCA_QEJ4MD9QTEAYQD9gQVhQP3BBWGA_gEJ4cD-wTFAYgD_ATJAYkD_QQeigP-BB6LA_8EHowDgAUejQOBBR6OA4MFHo8DhQUnkAOGBcoBkQOIBR6SA4oFJ5MDiwXLAZQDjAUelQONBR6WA44FJ5cDkQXMAZgDkgXQAZkDlAXRAZoDlQXRAZsDmAXRAZwDmQXRAZ0DmgXRAZ4DnAXRAZ8DngUnoAOfBdIBoQOhBdEBogOjBSejA6QF0wGkA6UF0QGlA6YF0QGmA6cFJ6cDqgXUAagDqwXaAakDrQXbAaoDrgXbAasDsQXbAawDsgXbAa0DswXbAa4DtQXbAa8DtwUnsAO4BdwBsQO6BdsBsgO8BSezA70F3QG0A74F2wG1A78F2wG2A8AFJ7cDwwXeAbgDxAXiAbkDxgXjAboDxwXjAbsDygXjAbwDywXjAb0DzAXjAb4DzgXjAb8D0AUnwAPRBeQBwQPTBeMBwgPVBSfDA9YF5QHEA9cF4wHFA9gF4wHGA9kFJ8cD3AXmAcgD3QXqAckD3gUfygPfBR_LA-AFH8wD4QUfzQPiBR_OA-QFH88D5gUn0APnBesB0QPpBR_SA-sFJ9MD7AXsAdQD7QUf1QPuBR_WA-8FJ9cD8gXtAdgD8wXzAdkD9AUJ2gP1BQnbA_YFCdwD9wUJ3QP4BQneA_oFCd8D_AUn4AP9BfQB4QOBBgniA4MGJ-MDhAb1AeQDhwYJ5QOIBgnmA4kGJ-cDjAb2AegDjQb8AekDjwYD6gOQBgPrA5IGA-wDkwYD7QOUBgPuA5YGA-8DmAYn8AOZBv0B8QObBgPyA50GJ_MDngb-AfQDnwYD9QOgBgP2A6EGJ_cDpAb_AfgDpQaDAvkDpgYC-gOnBgL7A6gGAvwDqQYC_QOqBgL-A6wGAv8DrgYngASvBoQCgQSzBgKCBLUGJ4MEtgaFAoQEuQYChQS6BgKGBLsGJ4cEvgaGAogEvwaMAokEwAYEigTBBgSLBMIGBIwEwwYEjQTEBgSOBMYGBI8EyAYnkATJBo0CkQTMBgSSBM4GJ5MEzwaOApQE0QYElQTSBgSWBNMGJ5cE1gaPApgE1waTApkE2QYLmgTaBgubBNwGC5wE3QYLnQTeBgueBOAGC58E4gYnoATjBpQCoQTlBguiBOcGJ6ME6AaVAqQE6QYLpQTqBgumBOsGJ6cE7gaWAqgE7wacAg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres?schema=public";
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(payload, secret, {
    expiresIn
  });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
var jwtUtils = {
  createToken,
  verifyToken
};

// src/app/middleware/checkAuth.ts
var checkAuth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      let token;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }
      if (!token) {
        throw new AppError(
          httpStatus3.UNAUTHORIZED,
          "You are not authorized. Token missing!"
        );
      }
      const verifyResult = jwtUtils.verifyToken(
        token,
        config_default.jwt_access_secret
      );
      if (!verifyResult.success || !verifyResult.data) {
        throw new AppError(
          httpStatus3.UNAUTHORIZED,
          "Invalid or expired token!"
        );
      }
      const payload = verifyResult.data;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          student: true,
          faculty: true,
          counselor: true
        }
      });
      if (!user || user.isDeleted) {
        throw new AppError(
          httpStatus3.UNAUTHORIZED,
          "User account not found or deleted!"
        );
      }
      if (user.status === "BLOCKED") {
        throw new AppError(
          httpStatus3.UNAUTHORIZED,
          "Your account has been banned by the administrator. Please contact your admin."
        );
      }
      if (payload.role && payload.role !== user.role) {
        throw new AppError(
          httpStatus3.UNAUTHORIZED,
          "Your account role has been updated by an administrator. Please log in again."
        );
      }
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(
          httpStatus3.FORBIDDEN,
          `Forbidden: Role '${user.role}' is not permitted to access this resource!`
        );
      }
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        studentId: user.student?.id,
        counselorId: user.counselor?.id,
        facultyId: user.faculty?.id,
        accessScope: user.student?.accessScope
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};
var checkStudentScope = (requiredScope) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError(httpStatus3.UNAUTHORIZED, "Unauthorized user!");
      }
      if (user.role === "STUDENT") {
        const scope = user.accessScope || "BOTH";
        if (requiredScope === "ACADEMIC" && scope === "HIGHER_STUDY_ONLY") {
          throw new AppError(
            httpStatus3.FORBIDDEN,
            "Forbidden: Your student profile has Higher Study Only access. Campus academic operations are restricted."
          );
        }
        if (requiredScope === "HIGHER_STUDY" && scope === "ACADEMIC_ONLY") {
          throw new AppError(
            httpStatus3.FORBIDDEN,
            "Forbidden: Your student profile has Academic Only access. Higher study desk operations are restricted."
          );
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/app/middleware/validateRequest.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });
      req.body = parsed.body || req.body;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/app/module/academic/academic.controller.ts
import httpStatus5 from "http-status";

// src/app/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/utils/sendResponse.ts
var sendResponse = (res, jsonData) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta || null,
    data: jsonData.data
  });
};

// src/app/module/academic/academic.service.ts
import httpStatus4 from "http-status";
var createDepartment = async (payload) => {
  const isExist = await prisma.department.findFirst({
    where: {
      OR: [{ name: payload.name }, { code: payload.code }]
    }
  });
  if (isExist) {
    throw new AppError(
      httpStatus4.CONFLICT,
      "Department with this name or code already exists!"
    );
  }
  const department = await prisma.department.create({
    data: payload
  });
  return department;
};
var getDepartments = async () => {
  const departments = await prisma.department.findMany({
    where: { isDeleted: false },
    include: {
      _count: {
        select: { courses: true, students: true, faculties: true }
      }
    }
  });
  return departments;
};
var createSemester = async (payload) => {
  const isExist = await prisma.semester.findUnique({
    where: { code: payload.code }
  });
  if (isExist) {
    throw new AppError(
      httpStatus4.CONFLICT,
      "Semester with this code already exists!"
    );
  }
  const semester = await prisma.semester.create({
    data: {
      ...payload,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate)
    }
  });
  return semester;
};
var getSemesters = async () => {
  const semesters = await prisma.semester.findMany({
    where: { isDeleted: false },
    orderBy: { startDate: "desc" }
  });
  return semesters;
};
var createCourse = async (payload) => {
  const isExist = await prisma.course.findUnique({
    where: { code: payload.code }
  });
  if (isExist) {
    throw new AppError(httpStatus4.CONFLICT, "Course code already exists!");
  }
  const course = await prisma.course.create({
    data: payload,
    include: { department: true, prerequisite: true }
  });
  return course;
};
var getCourses = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "code";
  const sortOrder = query.sortOrder || "asc";
  const whereConditions = {
    isDeleted: false
  };
  if (query.departmentId) {
    whereConditions.departmentId = query.departmentId;
  }
  if (query.searchTerm) {
    whereConditions.OR = [
      { title: { contains: query.searchTerm, mode: "insensitive" } },
      { code: { contains: query.searchTerm, mode: "insensitive" } }
    ];
  }
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        department: true,
        prerequisite: true
      }
    }),
    prisma.course.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: courses
  };
};
var createSection = async (payload) => {
  const isExist = await prisma.section.findFirst({
    where: {
      courseId: payload.courseId,
      semesterId: payload.semesterId,
      sectionName: payload.sectionName,
      isDeleted: false
    }
  });
  if (isExist) {
    throw new AppError(
      httpStatus4.CONFLICT,
      "This section name already exists for this course in this semester!"
    );
  }
  const capacity = payload.maxCapacity || 40;
  const section = await prisma.section.create({
    data: {
      ...payload,
      maxCapacity: capacity,
      availableSeats: capacity
    },
    include: {
      course: true,
      semester: true,
      faculty: { include: { user: true } }
    }
  });
  return section;
};
var getSectionsByCourse = async (courseId, semesterId) => {
  const whereConditions = {
    courseId,
    isDeleted: false
  };
  if (semesterId) {
    whereConditions.semesterId = semesterId;
  }
  const sections = await prisma.section.findMany({
    where: whereConditions,
    include: {
      course: true,
      semester: true,
      faculty: { include: { user: true } }
    }
  });
  return sections;
};
var AcademicService = {
  createDepartment,
  getDepartments,
  createSemester,
  getSemesters,
  createCourse,
  getCourses,
  createSection,
  getSectionsByCourse
};

// src/app/module/academic/academic.controller.ts
var createDepartment2 = catchAsync(async (req, res) => {
  const result = await AcademicService.createDepartment(req.body);
  sendResponse(res, {
    statusCode: httpStatus5.CREATED,
    success: true,
    message: "Department created successfully!",
    data: result
  });
});
var getDepartments2 = catchAsync(async (req, res) => {
  const result = await AcademicService.getDepartments();
  sendResponse(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Departments retrieved successfully!",
    data: result
  });
});
var createSemester2 = catchAsync(async (req, res) => {
  const result = await AcademicService.createSemester(req.body);
  sendResponse(res, {
    statusCode: httpStatus5.CREATED,
    success: true,
    message: "Semester created successfully!",
    data: result
  });
});
var getSemesters2 = catchAsync(async (req, res) => {
  const result = await AcademicService.getSemesters();
  sendResponse(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Semesters retrieved successfully!",
    data: result
  });
});
var createCourse2 = catchAsync(async (req, res) => {
  const result = await AcademicService.createCourse(req.body);
  sendResponse(res, {
    statusCode: httpStatus5.CREATED,
    success: true,
    message: "Course created successfully!",
    data: result
  });
});
var getCourses2 = catchAsync(async (req, res) => {
  const result = await AcademicService.getCourses(req.query);
  sendResponse(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Courses retrieved successfully!",
    meta: result.meta,
    data: result.data
  });
});
var createSection2 = catchAsync(async (req, res) => {
  const result = await AcademicService.createSection(req.body);
  sendResponse(res, {
    statusCode: httpStatus5.CREATED,
    success: true,
    message: "Section created successfully!",
    data: result
  });
});
var getSectionsByCourse2 = catchAsync(async (req, res) => {
  const courseId = req.params.courseId;
  const semesterId = req.query.semesterId;
  const result = await AcademicService.getSectionsByCourse(
    courseId,
    semesterId
  );
  sendResponse(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Sections retrieved successfully!",
    data: result
  });
});
var AcademicController = {
  createDepartment: createDepartment2,
  getDepartments: getDepartments2,
  createSemester: createSemester2,
  getSemesters: getSemesters2,
  createCourse: createCourse2,
  getCourses: getCourses2,
  createSection: createSection2,
  getSectionsByCourse: getSectionsByCourse2
};

// src/app/module/academic/academic.validation.ts
import { z } from "zod";
var createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Department name is required"),
    code: z.string().min(1, "Department code is required"),
    description: z.string().optional()
  })
});
var createSemesterSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Semester name is required"),
    code: z.string().min(1, "Semester code is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isCurrent: z.boolean().optional()
  })
});
var createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Course title is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.number().int().min(1).max(6).default(3),
    tuitionFee: z.number().min(0).default(15e3),
    description: z.string().optional(),
    departmentId: z.string().min(1, "Department ID is required"),
    prerequisiteId: z.string().optional()
  })
});
var createSectionSchema = z.object({
  body: z.object({
    sectionName: z.string().min(1, "Section name is required"),
    maxCapacity: z.number().int().min(1).default(40),
    roomNumber: z.string().optional(),
    scheduleTime: z.string().optional(),
    courseId: z.string().min(1, "Course ID is required"),
    semesterId: z.string().min(1, "Semester ID is required"),
    facultyId: z.string().optional()
  })
});
var AcademicValidation = {
  createDepartmentSchema,
  createSemesterSchema,
  createCourseSchema,
  createSectionSchema
};

// src/app/module/academic/academic.route.ts
var router = Router();
router.post(
  "/departments",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  validateRequest(AcademicValidation.createDepartmentSchema),
  AcademicController.createDepartment
);
router.get("/departments", AcademicController.getDepartments);
router.post(
  "/semesters",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  validateRequest(AcademicValidation.createSemesterSchema),
  AcademicController.createSemester
);
router.get("/semesters", AcademicController.getSemesters);
router.post(
  "/courses",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  validateRequest(AcademicValidation.createCourseSchema),
  AcademicController.createCourse
);
router.get("/courses", AcademicController.getCourses);
router.post(
  "/sections",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  validateRequest(AcademicValidation.createSectionSchema),
  AcademicController.createSection
);
router.get("/sections/:courseId", AcademicController.getSectionsByCourse);
var AcademicRoutes = router;

// src/app/module/admin/admin.route.ts
import { Router as Router2 } from "express";

// src/app/module/admin/admin.controller.ts
import httpStatus6 from "http-status";

// src/app/module/admin/admin.service.ts
var getDashboardStats = async () => {
  const [
    totalStudents,
    totalFaculties,
    totalCourses,
    totalSections,
    totalApplications,
    totalCountries,
    totalUniversities,
    paidPayments,
    applicationsByStatus
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
      where: { status: "PAID" }
    }),
    prisma.higherStudyApplication.groupBy({
      by: ["status"],
      _count: { id: true }
    })
  ]);
  const totalRevenue = paidPayments._sum.amount ? Number(paidPayments._sum.amount) : 0;
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
      totalSuccessfulTransactions
    },
    applicationsByStatus
  };
};
var activeGuestSessions = /* @__PURE__ */ new Map();
var uniqueVisitorIps = /* @__PURE__ */ new Set();
var lastVisitTimestamps = /* @__PURE__ */ new Map();
var totalGuestVisits = 0;
var recordVisitorPing = (sessionId, clientIp = "127.0.0.1", isPageLoad = true) => {
  const now = Date.now();
  const sid = sessionId || `guest_${Math.random().toString(36).substring(2, 9)}`;
  const rawIp = clientIp || "127.0.0.1";
  const cleanIp = rawIp.includes("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp === "::1" ? "127.0.0.1" : rawIp;
  if (isPageLoad) {
    const debounceKey = `${cleanIp}_${sid}`;
    const lastTime = lastVisitTimestamps.get(debounceKey) || 0;
    if (now - lastTime > 3e3) {
      totalGuestVisits += 1;
      lastVisitTimestamps.set(debounceKey, now);
    }
  }
  if (cleanIp) {
    uniqueVisitorIps.add(cleanIp);
  }
  activeGuestSessions.set(sid, now);
  for (const [id, time] of activeGuestSessions.entries()) {
    if (now - time > 5 * 60 * 1e3) {
      activeGuestSessions.delete(id);
    }
  }
  for (const [key, time] of lastVisitTimestamps.entries()) {
    if (now - time > 60 * 1e3) {
      lastVisitTimestamps.delete(key);
    }
  }
  return {
    liveVisitors: activeGuestSessions.size,
    totalGuestVisits,
    uniqueVisitors: Math.max(1, uniqueVisitorIps.size)
  };
};
var getVisitorStats = () => {
  const now = Date.now();
  for (const [id, time] of activeGuestSessions.entries()) {
    if (now - time > 5 * 60 * 1e3) {
      activeGuestSessions.delete(id);
    }
  }
  return {
    liveVisitors: activeGuestSessions.size,
    totalGuestVisits,
    uniqueVisitors: Math.max(uniqueVisitorIps.size, totalGuestVisits > 0 ? 1 : 0)
  };
};
var AdminService = {
  getDashboardStats,
  recordVisitorPing,
  getVisitorStats
};

// src/app/module/admin/admin.controller.ts
var getDashboardStats2 = catchAsync(async (req, res) => {
  const result = await AdminService.getDashboardStats();
  sendResponse(res, {
    statusCode: httpStatus6.OK,
    success: true,
    message: "Dashboard analytics & stats fetched successfully!",
    data: result
  });
});
var recordVisitorPing2 = catchAsync(async (req, res) => {
  const sessionId = req.body?.sessionId || req.query?.sessionId;
  const isPageLoad = req.body?.isPageLoad !== false;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || req.ip || "127.0.0.1";
  const result = AdminService.recordVisitorPing(sessionId, clientIp, isPageLoad);
  sendResponse(res, {
    statusCode: httpStatus6.OK,
    success: true,
    message: "Visitor ping recorded successfully!",
    data: result
  });
});
var getVisitorStats2 = catchAsync(async (req, res) => {
  const result = AdminService.getVisitorStats();
  sendResponse(res, {
    statusCode: httpStatus6.OK,
    success: true,
    message: "Live visitor statistics fetched successfully!",
    data: result
  });
});
var AdminController = {
  getDashboardStats: getDashboardStats2,
  recordVisitorPing: recordVisitorPing2,
  getVisitorStats: getVisitorStats2
};

// src/app/module/admin/admin.route.ts
var router2 = Router2();
router2.get(
  "/dashboard-stats",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  AdminController.getDashboardStats
);
router2.post("/visitor-ping", AdminController.recordVisitorPing);
router2.get("/visitor-stats", AdminController.getVisitorStats);
var AdminRoutes = router2;

// src/app/module/attendance/attendance.route.ts
import { Router as Router3 } from "express";

// src/app/module/attendance/attendance.controller.ts
import httpStatus8 from "http-status";

// src/app/module/attendance/attendance.service.ts
import httpStatus7 from "http-status";
var recordSectionAttendance = async (facultyId, sectionId, dateStr, records) => {
  const section = await prisma.section.findUnique({
    where: { id: sectionId }
  });
  if (!section) {
    throw new AppError(httpStatus7.NOT_FOUND, "Section not found!");
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
            date
          }
        },
        update: {
          status: record.status,
          remarks: record.remarks
        },
        create: {
          studentId: record.studentId,
          sectionId,
          date,
          status: record.status,
          remarks: record.remarks
        }
      });
      results.push(item);
    }
    return results;
  });
  return createdOrUpdated;
};
var getStudentAttendance = async (studentId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ENROLLED", isDeleted: false },
    include: {
      section: {
        include: { course: true, semester: true }
      }
    }
  });
  const attendanceSummary = await Promise.all(
    enrollments.map(async (enrollment) => {
      const attendances = await prisma.courseAttendance.findMany({
        where: {
          studentId,
          sectionId: enrollment.sectionId
        },
        orderBy: { date: "asc" }
      });
      const totalClasses = attendances.length;
      const presentCount = attendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length;
      const percentage = totalClasses > 0 ? Number((presentCount / totalClasses * 100).toFixed(1)) : 100;
      const hasWarning = percentage < 75;
      return {
        courseTitle: enrollment.section.course.title,
        courseCode: enrollment.section.course.code,
        sectionName: enrollment.section.sectionName,
        totalClasses,
        presentCount,
        percentage,
        hasWarning,
        warningMessage: hasWarning ? `Attendance is ${percentage}% (Below 75%). At risk of exam debarment!` : null,
        records: attendances
      };
    })
  );
  return attendanceSummary;
};
var getSectionAttendanceSummary = async (sectionId) => {
  const attendances = await prisma.courseAttendance.findMany({
    where: { sectionId },
    include: {
      student: {
        include: { user: true }
      }
    },
    orderBy: { date: "desc" }
  });
  return attendances;
};
var AttendanceService = {
  recordSectionAttendance,
  getStudentAttendance,
  getSectionAttendanceSummary
};

// src/app/module/attendance/attendance.controller.ts
var recordSectionAttendance2 = catchAsync(
  async (req, res) => {
    const facultyId = req.user.facultyId || req.user.userId;
    const { sectionId, date, records } = req.body;
    const result = await AttendanceService.recordSectionAttendance(
      facultyId,
      sectionId,
      date,
      records
    );
    sendResponse(res, {
      statusCode: httpStatus8.OK,
      success: true,
      message: "Attendance recorded successfully!",
      data: result
    });
  }
);
var getStudentAttendance2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await AttendanceService.getStudentAttendance(studentId);
  sendResponse(res, {
    statusCode: httpStatus8.OK,
    success: true,
    message: "Student attendance summary retrieved!",
    data: result
  });
});
var getSectionAttendanceSummary2 = catchAsync(
  async (req, res) => {
    const sectionId = req.params.sectionId;
    const result = await AttendanceService.getSectionAttendanceSummary(sectionId);
    sendResponse(res, {
      statusCode: httpStatus8.OK,
      success: true,
      message: "Section attendance records fetched!",
      data: result
    });
  }
);
var AttendanceController = {
  recordSectionAttendance: recordSectionAttendance2,
  getStudentAttendance: getStudentAttendance2,
  getSectionAttendanceSummary: getSectionAttendanceSummary2
};

// src/app/module/attendance/attendance.route.ts
var router3 = Router3();
router3.post(
  "/record",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR"),
  AttendanceController.recordSectionAttendance
);
router3.get(
  "/my",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  AttendanceController.getStudentAttendance
);
router3.get(
  "/section/:sectionId",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR"),
  AttendanceController.getSectionAttendanceSummary
);
var AttendanceRoutes = router3;

// src/app/module/auth/auth.route.ts
import { Router as Router4 } from "express";

// src/app/module/auth/auth.controller.ts
import httpStatus10 from "http-status";

// src/app/module/auth/auth.service.ts
import bcrypt from "bcryptjs";
import httpStatus9 from "http-status";

// src/app/lib/googleAuth.ts
import { OAuth2Client } from "google-auth-library";
var googleClient = new OAuth2Client(config_default.google_client_id);

// src/app/utils/emailHelper.ts
import path3 from "path";
import fs from "fs";

// src/app/lib/nodemailer.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config_default.smtp_user,
    pass: config_default.smtp_password
  }
});

// src/app/utils/emailHelper.ts
var getBrandAssetsAndHtml = (subject, recipientName, contentHtml, settings) => {
  const senderName = settings?.autoResponderSenderName || "Rise Abroad Admissions Desk";
  const senderEmail = settings?.autoResponderSenderEmail || "admissions@riseabroad.com";
  const officeAddress = settings?.autoResponderOfficeAddress || "Rise Abroad Education \u2022 Level 6, Navana Tower, Gulshan-1, Dhaka";
  const hotline = settings?.autoResponderHotline || "+880 1712-345678";
  const hours = settings?.autoResponderHours || "Counseling Desk: Sat \u2013 Thu (10AM \u2013 7PM)";
  const possiblePaths = [
    path3.join(__dirname, "../assets/logo.png"),
    path3.join(__dirname, "../../assets/logo.png"),
    path3.join(process.cwd(), "src/assets/logo.png"),
    path3.join(process.cwd(), "dist/assets/logo.png"),
    path3.join(process.cwd(), "../university-management-frontend/public/logo.png")
  ];
  const logoPath = possiblePaths.find((p) => fs.existsSync(p));
  const isHostedLogo = typeof settings?.autoResponderLogoUrl === "string" && settings.autoResponderLogoUrl.trim().startsWith("http");
  const logoSrc = isHostedLogo ? settings.autoResponderLogoUrl.trim() : "cid:brand_logo";
  const attachments = [];
  if (!isHostedLogo && logoPath) {
    attachments.push({
      filename: "logo.png",
      path: logoPath,
      cid: "brand_logo",
      contentType: "image/png",
      contentDisposition: "inline"
    });
  }
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; -webkit-font-smoothing: antialiased;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);">
              
              <!-- Brand Header Bar with Real Website Logo & Compact Gap -->
              <tr>
                <td style="padding: 18px 24px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 3px;">
                        <img src="${logoSrc}" alt="Rise Abroad Education" width="40" height="40" style="display: block; width: 40px; height: 40px; object-fit: contain;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px; line-height: 1.2;">
                          Rise Abroad Education
                        </div>
                        <div style="font-size: 10px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">
                          HIGHER STUDY &amp; ADMISSIONS
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body -->
              <tr>
                <td style="padding: 26px 24px 20px 24px;">
                  <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 14px;">
                    Dear ${recipientName},
                  </div>
                  
                  ${contentHtml}

                  <!-- Minimalist Dark Signature & Footer -->
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    <div style="font-weight: 600; color: #f1f5f9; font-size: 13px; margin-bottom: 3px;">
                      ${senderName}
                    </div>
                    <div>${officeAddress}</div>
                    <div style="margin-top: 3px;">Direct Hotline: <strong style="color: #e2e8f0; font-family: monospace;">${hotline}</strong></div>
                    <div style="margin-top: 2px;">Email: <a href="mailto:${senderEmail}" style="color: #60a5fa; text-decoration: none;">${senderEmail}</a></div>
                    <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${hours}</div>
                  </div>

                  <p style="text-align: center; color: #475569; font-size: 11px; margin: 20px 0 0 0; font-style: italic;">
                    * Note: This is an automated email. Please do not reply directly to this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return {
    html,
    attachments,
    senderName,
    senderEmail,
    officeAddress,
    hotline
  };
};
var sendVerificationOtpEmail = async (to, name, otp) => {
  const settings = await prisma.contactPageSetting.findFirst().catch(() => null);
  const subject = settings?.regOtpEmailSubject || "Account Verification Code \u2014 Rise Abroad Education";
  const heading = settings?.regOtpEmailHeading || "Verify Your Student Account";
  const bodyMessage = settings?.regOtpEmailBodyMessage || "Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:";
  const expiryNote = settings?.regOtpEmailExpiryNote || "This code is valid for 10 minutes. For your security, do not share this code with anyone.";
  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.02em;">${heading}</h2>
      <p style="color: #94a3b8; font-size: 13.5px; line-height: 1.6; margin: 0 auto; max-width: 480px;">
        ${bodyMessage}
      </p>
    </div>
    
    <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 26px 20px; text-align: center; margin: 24px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #64748b; font-weight: 700; margin-bottom: 12px;">Your Account Verification Code</div>
      <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #38bdf8; font-family: 'SF Mono', Consolas, Monaco, monospace; text-shadow: 0 0 25px rgba(56, 189, 248, 0.35);">${otp}</div>
      <div style="display: inline-block; margin-top: 14px; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; padding: 4px 14px; font-size: 11.5px; color: #7dd3fc; font-weight: 600;">
        \u23F1 Valid for 10 minutes only
      </div>
    </div>

    <div style="background-color: #0b1329; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12px; line-height: 1.6; color: #94a3b8;">
      <strong style="color: #cbd5e1; display: block; margin-bottom: 2px;">Security Notice:</strong>
      ${expiryNote}
    </div>
  `;
  const { html, attachments, senderName, officeAddress, hotline } = getBrandAssetsAndHtml(
    subject,
    name,
    contentHtml,
    settings
  );
  const plainText = `Rise Abroad Education \u2014 Account Verification Code

Dear ${name},

Your 6-digit verification code is: ${otp}

${bodyMessage}

Security Notice: ${expiryNote}

---
${senderName}
${officeAddress}
Hotline: ${hotline}`;
  try {
    if (config_default.smtp_user && config_default.smtp_password && !config_default.smtp_user.includes("demo")) {
      await transporter.sendMail({
        from: `"${senderName}" <${config_default.smtp_user}>`,
        to,
        subject,
        text: plainText,
        html,
        attachments,
        headers: {
          "X-Priority": "1",
          Importance: "high"
        }
      });
    } else {
      console.log(`
[Email Simulation] To: ${to} | Verification OTP: ${otp}
`);
    }
  } catch (error) {
    console.log(`
[Email Delivery Notice] Failed to send email to ${to}:`, error.message);
  }
};
var sendPasswordResetOtpEmail = async (to, name, otp) => {
  const settings = await prisma.contactPageSetting.findFirst().catch(() => null);
  const subject = settings?.otpEmailSubject || "Your Password Reset Code \u2014 Rise Abroad Education";
  const heading = settings?.otpEmailHeading || "Password Reset Verification Code";
  const bodyMessage = settings?.otpEmailBodyMessage || "We received a request to reset the password for your Rise Abroad Education account. Use the verification code below to proceed with resetting your password:";
  const expiryNote = settings?.otpEmailExpiryNote || "This code expires in 10 minutes. For your security, do not share this code with anyone.";
  const contentHtml = `
    <div style="font-size: 14px; font-weight: 600; color: #38bdf8; margin-bottom: 10px;">
      ${heading}
    </div>
    <div style="font-size: 13.5px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px;">
      ${bodyMessage}
    </div>
    <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
      <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace;">${otp}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">${expiryNote}</div>
    </div>
    <p style="font-size: 11.5px; color: #64748b; margin-top: 14px;">If you did not request a password reset, you can safely ignore this email or contact our counseling desk immediately.</p>
  `;
  const { html, attachments, senderName, officeAddress, hotline } = getBrandAssetsAndHtml(
    subject,
    name,
    contentHtml,
    settings
  );
  const plainText = `Rise Abroad Education \u2014 Password Reset Code

Dear ${name},

Your 6-digit password reset code is: ${otp}

${bodyMessage}

${expiryNote}

---
${senderName}
${officeAddress}
Hotline: ${hotline}`;
  try {
    if (config_default.smtp_user && config_default.smtp_password && !config_default.smtp_user.includes("demo")) {
      await transporter.sendMail({
        from: `"${senderName}" <${config_default.smtp_user}>`,
        to,
        subject,
        text: plainText,
        html,
        attachments,
        headers: {
          "X-Priority": "1",
          Importance: "high"
        }
      });
    } else {
      console.log(`
[Email Simulation] To: ${to} | Password Reset OTP: ${otp}
`);
    }
  } catch (error) {
    console.log(`
[Email Delivery Notice] Failed to send email to ${to}:`, error.message);
  }
};
var sendWelcomeRegistrationEmail = async (to, name) => {
  const settings = await prisma.contactPageSetting.findFirst().catch(() => null);
  const subject = settings?.welcomeEmailSubject || "Welcome to Rise Abroad Education \u2014 Your Journey Begins!";
  const heading = settings?.welcomeEmailHeading || "Welcome to Rise Abroad Education";
  const message = settings?.welcomeEmailMessage || "Thank you for registering with Rise Abroad Education. Your global higher education journey starts here! Our certified counselors and admissions desk are here to guide you to your dream university.";
  const btnText = settings?.welcomeEmailBtnText || "Access Student Portal";
  const btnUrl = settings?.welcomeEmailBtnUrl || "https://riseabroad.com/dashboard";
  const contentHtml = `
    <div style="font-size: 15px; font-weight: 600; color: #38bdf8; margin-bottom: 10px;">
      ${heading}
    </div>
    <div style="font-size: 13.5px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px;">
      ${message}
    </div>
    <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <div style="font-size: 12.5px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">\u{1F31F} What you can do next:</div>
      <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #94a3b8; line-height: 1.7;">
        <li>Explore 500+ world-class partner universities in UK, USA, Canada, Europe</li>
        <li>Apply online with direct guidance from senior admissions counselors</li>
        <li>Track your admission & visa application progress in real-time</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${btnUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 26px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
        ${btnText} &rarr;
      </a>
    </div>
  `;
  const { html, attachments, senderName, officeAddress, hotline } = getBrandAssetsAndHtml(
    subject,
    name,
    contentHtml,
    settings
  );
  const plainText = `Welcome to Rise Abroad Education \u2014 Higher Study & Admissions

Dear ${name},

${heading}

${message}

Access Your Student Portal: ${btnUrl}

---
${senderName}
${officeAddress}
Hotline: ${hotline}`;
  try {
    if (config_default.smtp_user && config_default.smtp_password && !config_default.smtp_user.includes("demo")) {
      await transporter.sendMail({
        from: `"${senderName}" <${config_default.smtp_user}>`,
        to,
        subject,
        text: plainText,
        html,
        attachments,
        headers: {
          "X-Priority": "2",
          Importance: "normal"
        }
      });
    } else {
      console.log(`
[Email Simulation] To: ${to} | Welcome Email dispatched
`);
    }
  } catch (error) {
    console.log(`
[Email Delivery Notice] Failed to send welcome email to ${to}:`, error.message);
  }
};
var sendContactAutoResponderEmail = async (to, studentName, settings) => {
  const subject = settings?.autoResponderSubject || "We Have Received Your Inquiry \u2014 Rise Abroad Education";
  const senderName = settings?.autoResponderSenderName || "Rise Abroad Admissions Desk";
  const senderEmail = settings?.autoResponderSenderEmail || "admissions@riseabroad.com";
  const whatsappText = settings?.autoResponderWhatsAppText || "\u099C\u09B0\u09C1\u09B0\u09BF \u0995\u09CB\u09A8\u09CB \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09B9\u09B2\u09C7 \u0985\u09A5\u09AC\u09BE \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u09AA\u09C7\u09A4\u09C7 \u09AC\u09BF\u09B2\u09AE\u09CD\u09AC \u09B9\u09B2\u09C7, \u0986\u09AA\u09A8\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09A8\u0995 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8:";
  const whatsappNumber = settings?.autoResponderWhatsAppNumber || "+880 1712-345678";
  const officeAddress = settings?.autoResponderOfficeAddress || "Rise Abroad Education \u2022 Level 6, Navana Tower, Gulshan-1, Dhaka";
  const hotline = settings?.autoResponderHotline || "+880 1712-345678";
  const hours = settings?.autoResponderHours || "Counseling Desk: Sat \u2013 Thu (10AM \u2013 7PM)";
  const waDigits = whatsappNumber.replace(/[^0-9]/g, "");
  const possiblePaths = [
    path3.join(__dirname, "../assets/logo.png"),
    path3.join(__dirname, "../../assets/logo.png"),
    path3.join(process.cwd(), "src/assets/logo.png"),
    path3.join(process.cwd(), "dist/assets/logo.png"),
    path3.join(process.cwd(), "../university-management-frontend/public/logo.png")
  ];
  const logoPath = possiblePaths.find((p) => fs.existsSync(p));
  const isHostedLogo = typeof settings?.autoResponderLogoUrl === "string" && settings.autoResponderLogoUrl.trim().startsWith("http");
  const logoSrc = isHostedLogo ? settings.autoResponderLogoUrl.trim() : "cid:brand_logo";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; -webkit-font-smoothing: antialiased;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);">
              
              <!-- Brand Header Bar with Real Website Logo & Compact Gap -->
              <tr>
                <td style="padding: 18px 24px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 3px;">
                        <img src="${logoSrc}" alt="Rise Abroad Education" width="40" height="40" style="display: block; width: 40px; height: 40px; object-fit: contain;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px; line-height: 1.2;">
                          Rise Abroad Education
                        </div>
                        <div style="font-size: 10px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">
                          HIGHER STUDY &amp; ADMISSIONS
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body: Merged Continuous Paragraph -->
              <tr>
                <td style="padding: 26px 24px 20px 24px;">
                  <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 14px;">
                    Dear ${studentName},
                  </div>
                  
                  <!-- Merged, uninterrupted text with no line break -->
                  <div style="font-size: 13.5px; line-height: 1.7; color: #cbd5e1; margin-bottom: 22px;">
                    Thank you for reaching out to <strong style="color: #ffffff;">Rise Abroad Education</strong>. We have successfully received your inquiry. Our admissions counseling desk is currently reviewing your details, and one of our senior counselors will contact you directly via phone, WhatsApp, or email <strong style="color: #ffffff;">within the next 24 hours</strong>.
                  </div>

                  <!-- 24-Hour Urgent / WhatsApp Callout Box -->
                  <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 22px;">
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 12px;">
                      ${whatsappText}
                    </div>
                    <a href="https://wa.me/${waDigits}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 12px; padding: 10px 18px; border-radius: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                      Chat Directly on WhatsApp (${whatsappNumber})
                    </a>
                  </div>

                  <!-- Minimalist Dark Signature & Footer -->
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    <div style="font-weight: 600; color: #f1f5f9; font-size: 13px; margin-bottom: 3px;">
                      ${senderName}
                    </div>
                    <div>${officeAddress}</div>
                    <div style="margin-top: 3px;">Direct Hotline: <strong style="color: #e2e8f0; font-family: monospace;">${hotline}</strong></div>
                    <div style="margin-top: 2px;">Email: <a href="mailto:${senderEmail}" style="color: #60a5fa; text-decoration: none;">${senderEmail}</a></div>
                    <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${hours}</div>
                  </div>

                  <p style="text-align: center; color: #475569; font-size: 11px; margin: 20px 0 0 0; font-style: italic;">
                    * Note: This is an automated confirmation email. Please do not reply directly to this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  const plainText = `Rise Abroad Education \u2014 Inquiry Received

Dear ${studentName},

Thank you for reaching out to Rise Abroad Education. We have successfully received your inquiry.
Our admissions counseling desk is reviewing your message and will reach out to you within 24 hours.

WhatsApp: ${whatsappNumber}

---
${senderName}
${officeAddress}
Hotline: ${hotline}`;
  const attachments = [];
  if (!isHostedLogo && logoPath) {
    attachments.push({
      filename: "logo.png",
      path: logoPath,
      cid: "brand_logo",
      contentType: "image/png",
      contentDisposition: "inline"
    });
  }
  try {
    if (config_default.smtp_user && config_default.smtp_password && !config_default.smtp_user.includes("demo")) {
      await transporter.sendMail({
        from: `"${senderName}" <${config_default.smtp_user}>`,
        to,
        subject,
        text: plainText,
        html,
        attachments
      });
    } else {
      console.log(
        `
[Auto-Responder Simulation] Sent confirmation email to ${to} (${studentName}) for inquiry.
`
      );
    }
  } catch (error) {
    console.log(
      `
[Auto-Responder Delivery Notice] Failed to send email to ${to}:`,
      error.message
    );
  }
};

// src/app/module/auth/auth.service.ts
var generateOtp = () => {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
};
var registerStudent = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({
    where: { email }
  });
  if (isUserExists) {
    if (isUserExists.status === "INACTIVE" && !isUserExists.isEmailVerified) {
      const otp2 = generateOtp();
      const otpExpiresAt2 = new Date(Date.now() + 10 * 60 * 1e3);
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp2,
          otpExpiresAt: otpExpiresAt2,
          otpType: "EMAIL_VERIFICATION"
        }
      });
      await sendVerificationOtpEmail(email, isUserExists.name, otp2);
      return {
        message: "Account already created but not verified. A new 6-digit OTP has been sent to your Gmail.",
        isEmailVerified: false
      };
    }
    throw new AppError(
      httpStatus9.CONFLICT,
      "A verified user with this email already exists!"
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config_default.bcrypt_salt_rounds
  );
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  const autoStudentId = payload.studentId || `STU-${Date.now().toString().slice(-4)}`;
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: payload.name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        status: "INACTIVE",
        isEmailVerified: false,
        otpCode: otp,
        otpExpiresAt,
        otpType: "EMAIL_VERIFICATION",
        authProvider: "CREDENTIAL"
      }
    });
    await tx.student.create({
      data: {
        userId: user.id,
        studentId: autoStudentId,
        contactNumber: payload.contactNumber,
        address: payload.address,
        gender: payload.gender,
        accessScope: payload.accessScope || "BOTH"
      }
    });
  });
  await sendVerificationOtpEmail(email, payload.name, otp);
  return {
    message: "Registration successful! Please check your Gmail for the 6-digit verification code.",
    email,
    isEmailVerified: false
  };
};
var verifyEmail = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus9.NOT_FOUND, "User account not found!");
  }
  if (user.isEmailVerified && user.status === "ACTIVE") {
    return {
      message: "Email is already verified. You can log in directly.",
      isEmailVerified: true
    };
  }
  if (user.otpCode !== payload.otpCode) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Invalid verification code! Please check your code."
    );
  }
  if (!user.otpExpiresAt || /* @__PURE__ */ new Date() > user.otpExpiresAt) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Verification code has expired. Please request a new OTP."
    );
  }
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isEmailVerified: true,
      status: "ACTIVE",
      otpCode: null,
      otpExpiresAt: null,
      otpType: null
    },
    include: { student: true }
  });
  sendWelcomeRegistrationEmail(updatedUser.email, updatedUser.name).catch(
    () => null
  );
  const accessToken = jwtUtils.createToken(
    {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    },
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    },
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    message: "Email verified successfully! Account is now active.",
    accessToken,
    refreshToken: refreshToken3,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      studentId: updatedUser.student?.studentId,
      accessScope: updatedUser.student?.accessScope
    }
  };
};
var resendOtp = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus9.NOT_FOUND, "User account not found!");
  }
  if (user.isEmailVerified && user.status === "ACTIVE") {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Email is already verified. No need to resend OTP."
    );
  }
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  await prisma.user.update({
    where: { email },
    data: {
      otpCode: otp,
      otpExpiresAt,
      otpType: "EMAIL_VERIFICATION"
    }
  });
  await sendVerificationOtpEmail(email, user.name, otp);
  return {
    message: "A new 6-digit verification code has been sent to your Gmail."
  };
};
var loginUser = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: true,
      counselor: true
    }
  });
  if (!user || user.isDeleted || user.status === "DELETED") {
    throw new AppError(
      httpStatus9.NOT_FOUND,
      "No account found with this email address. Please sign up first."
    );
  }
  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus9.FORBIDDEN,
      "Your account has been banned by the administrator. Please contact your admin."
    );
  }
  if (user.status === "INACTIVE" || !user.isEmailVerified) {
    throw new AppError(
      httpStatus9.FORBIDDEN,
      "Your email is not verified yet. Please verify your account with the OTP sent to your Gmail."
    );
  }
  if (!user.password) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Account registered via Google Social Login. Please sign in using Google."
    );
  }
  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(
      httpStatus9.UNAUTHORIZED,
      "Invalid credentials. Password incorrect!"
    );
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { updatedAt: /* @__PURE__ */ new Date() }
  });
  const accessToken = jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl || "",
      contactNumber: user.contactNumber || null,
      studentId: user.student?.studentId,
      counselorId: user.counselor?.counselorId,
      accessScope: user.student?.accessScope
    }
  };
};
var googleLogin = async (payload) => {
  let googlePayload;
  try {
    if (config_default.google_client_id && config_default.google_client_id !== "demo_client_id" && payload.idToken && payload.idToken !== "mock-google-id-token") {
      const ticket = await googleClient.verifyIdToken({
        idToken: payload.idToken,
        audience: config_default.google_client_id
      });
      googlePayload = ticket.getPayload();
    } else {
      throw new AppError(
        httpStatus9.BAD_REQUEST,
        "Valid Google authentication token is required."
      );
    }
  } catch (error) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      error?.message || "Google authentication failed!"
    );
  }
  if (!googlePayload?.email) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Failed to retrieve email from Google token"
    );
  }
  const email = googlePayload.email.trim().toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email },
    include: { student: true, counselor: true }
  });
  if (user) {
    if (user.isDeleted || user.status === "DELETED") {
      throw new AppError(
        httpStatus9.NOT_FOUND,
        "No account found with this email address. Please sign up first."
      );
    }
    if (user.status === "BLOCKED") {
      throw new AppError(
        httpStatus9.FORBIDDEN,
        "Your account has been banned by the administrator. Please contact your admin."
      );
    }
  }
  if (!user) {
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: googlePayload.name || "Student",
          email,
          googleId: googlePayload.sub,
          authProvider: "GOOGLE",
          role: "STUDENT",
          status: "ACTIVE",
          isEmailVerified: true,
          imageUrl: googlePayload.picture || ""
        }
      });
      const newStudent = await tx.student.create({
        data: {
          userId: newUser.id,
          studentId: `STU-${Date.now().toString().slice(-4)}`,
          accessScope: "BOTH"
        }
      });
      return { ...newUser, student: newStudent, counselor: null };
    });
  } else {
    user = await prisma.user.update({
      where: { email },
      data: { updatedAt: /* @__PURE__ */ new Date() },
      include: { student: true, counselor: true }
    });
  }
  const accessToken = jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl || "",
      contactNumber: user.contactNumber || null,
      studentId: user.student?.studentId,
      counselorId: user.counselor?.counselorId,
      accessScope: user.student?.accessScope
    }
  };
};
var forgotPassword = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus9.NOT_FOUND, "No account exists with this email!");
  }
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  await prisma.user.update({
    where: { email },
    data: {
      otpCode: otp,
      otpExpiresAt,
      otpType: "PASSWORD_RESET"
    }
  });
  await sendPasswordResetOtpEmail(email, user.name, otp);
  return {
    message: "Password reset code has been sent to your Gmail. Valid for 10 minutes."
  };
};
var resetPassword = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus9.NOT_FOUND, "User account not found!");
  }
  if (user.otpType !== "PASSWORD_RESET" || user.otpCode !== payload.otpCode) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Invalid password reset OTP code!"
    );
  }
  if (!user.otpExpiresAt || /* @__PURE__ */ new Date() > user.otpExpiresAt) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Password reset OTP has expired. Please request a new code."
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config_default.bcrypt_salt_rounds
  );
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      otpCode: null,
      otpExpiresAt: null,
      otpType: null
    }
  });
  return {
    message: "Password reset successfully! You can now log in with your new password."
  };
};
var refreshToken = async (token) => {
  const verifyResult = jwtUtils.verifyToken(token, config_default.jwt_refresh_secret);
  if (!verifyResult.success || !verifyResult.data) {
    throw new AppError(
      httpStatus9.UNAUTHORIZED,
      "Invalid or expired refresh token!"
    );
  }
  const payload = verifyResult.data;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });
  if (!user || user.isDeleted || user.status === "BLOCKED") {
    throw new AppError(httpStatus9.UNAUTHORIZED, "User account unavailable!");
  }
  const newAccessToken = jwtUtils.createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  return {
    accessToken: newAccessToken
  };
};
var changePassword = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user || !user.password) {
    throw new AppError(httpStatus9.NOT_FOUND, "User password record not found!");
  }
  const isMatch = await bcrypt.compare(payload.currentPassword, user.password);
  if (!isMatch) {
    throw new AppError(
      httpStatus9.BAD_REQUEST,
      "Current password does not match!"
    );
  }
  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    config_default.bcrypt_salt_rounds
  );
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });
  return {
    message: "Password changed successfully!"
  };
};
var AuthService = {
  registerStudent,
  verifyEmail,
  resendOtp,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  refreshToken,
  changePassword
};

// src/app/module/auth/auth.controller.ts
var registerStudent2 = catchAsync(async (req, res) => {
  const result = await AuthService.registerStudent(req.body);
  sendResponse(res, {
    statusCode: httpStatus10.CREATED,
    success: true,
    message: result.message,
    data: {
      email: result.email,
      isEmailVerified: result.isEmailVerified
    }
  });
});
var verifyEmail2 = catchAsync(async (req, res) => {
  const result = await AuthService.verifyEmail(req.body);
  if (result.refreshToken) {
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
  }
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: result.message,
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});
var resendOtp2 = catchAsync(async (req, res) => {
  const result = await AuthService.resendOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});
var googleLogin2 = catchAsync(async (req, res) => {
  const result = await AuthService.googleLogin(req.body);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Google Social Login successful!",
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});
var forgotPassword2 = catchAsync(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var refreshToken2 = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await AuthService.refreshToken(token);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Access token refreshed successfully!",
    data: result
  });
});
var changePassword2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await AuthService.changePassword(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var AuthController = {
  registerStudent: registerStudent2,
  verifyEmail: verifyEmail2,
  resendOtp: resendOtp2,
  loginUser: loginUser2,
  googleLogin: googleLogin2,
  forgotPassword: forgotPassword2,
  resetPassword: resetPassword2,
  refreshToken: refreshToken2,
  changePassword: changePassword2
};

// src/app/module/auth/auth.validation.ts
import { z as z2 } from "zod";
var registerStudentSchema = z2.object({
  body: z2.object({
    name: z2.string().min(2, "Name must be at least 2 characters"),
    email: z2.string().email("Invalid email format"),
    password: z2.string().min(6, "Password must be at least 6 characters"),
    studentId: z2.string().optional(),
    contactNumber: z2.string().optional(),
    address: z2.string().optional(),
    gender: z2.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    accessScope: z2.enum(["ACADEMIC_ONLY", "HIGHER_STUDY_ONLY", "BOTH"]).optional()
  })
});
var verifyEmailSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email format"),
    otpCode: z2.string().length(6, "OTP code must be exactly 6 digits")
  })
});
var resendOtpSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email format")
  })
});
var loginSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email format"),
    password: z2.string().min(1, "Password is required")
  })
});
var googleLoginSchema = z2.object({
  body: z2.object({
    idToken: z2.string().min(1, "Google idToken is required")
  })
});
var forgotPasswordSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email format")
  })
});
var resetPasswordSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email format"),
    otpCode: z2.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z2.string().min(6, "Password must be at least 6 characters")
  })
});
var changePasswordSchema = z2.object({
  body: z2.object({
    currentPassword: z2.string().min(1, "Current password is required"),
    newPassword: z2.string().min(6, "New password must be at least 6 characters")
  })
});
var AuthValidation = {
  registerStudentSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
};

// src/app/module/auth/auth.route.ts
var router4 = Router4();
router4.post(
  "/register",
  validateRequest(AuthValidation.registerStudentSchema),
  AuthController.registerStudent
);
router4.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmailSchema),
  AuthController.verifyEmail
);
router4.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpSchema),
  AuthController.resendOtp
);
router4.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.loginUser
);
router4.post(
  "/google",
  validateRequest(AuthValidation.googleLoginSchema),
  AuthController.googleLogin
);
router4.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPassword
);
router4.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword
);
router4.post("/refresh-token", AuthController.refreshToken);
router4.post(
  "/change-password",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthController.changePassword
);
var AuthRoutes = router4;

// src/app/module/chat/chat.route.ts
import { Router as Router5 } from "express";

// src/app/module/chat/chat.controller.ts
import httpStatus12 from "http-status";

// src/app/module/chat/chat.service.ts
import httpStatus11 from "http-status";
var getOrCreateRoom = async (studentUserId, applicationId) => {
  let room = await prisma.chatRoom.findFirst({
    where: {
      studentUserId,
      ...applicationId ? { applicationId } : {}
    },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, name: true, role: true, imageUrl: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });
  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        studentUserId,
        applicationId,
        mode: "COLLABORATIVE_GROUP"
      },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true, imageUrl: true } }
          }
        }
      }
    });
  }
  return room;
};
var sendMessage = async (senderId, senderName, senderRole, senderAvatar, payload) => {
  let roomId = payload.roomId;
  if (!roomId && payload.studentUserId) {
    const room = await getOrCreateRoom(payload.studentUserId, payload.applicationId);
    roomId = room.id;
  }
  if (roomId) {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new AppError(httpStatus11.NOT_FOUND, "Chat room not found!");
    }
    if (room.isLocked && senderRole !== "STUDENT" && room.lockedByAgentId && room.lockedByAgentId !== senderId) {
      throw new AppError(
        httpStatus11.FORBIDDEN,
        `Chat is currently locked exclusively by ${room.lockedByAgentName || "another agent"}. Other staff cannot send messages until released.`
      );
    }
  }
  const displayName = payload.senderDisplayName || (senderRole === "ADMIN" ? "Admissions Desk (Admin)" : senderName);
  const badge = `[${senderRole}]`;
  const chatMessage = await prisma.chatMessage.create({
    data: {
      roomId,
      senderId,
      receiverId: payload.receiverId,
      message: payload.message,
      attachmentUrl: payload.attachmentUrl,
      senderDisplayName: displayName,
      senderRoleBadge: badge
    },
    include: {
      sender: { select: { id: true, name: true, role: true, imageUrl: true } },
      receiver: { select: { id: true, name: true, role: true, imageUrl: true } }
    }
  });
  return chatMessage;
};
var toggleRoomLock = async (roomId, agentUserId, agentName, lock) => {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new AppError(httpStatus11.NOT_FOUND, "Chat room not found!");
  }
  const updated = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      isLocked: lock,
      lockedByAgentId: lock ? agentUserId : null,
      lockedByAgentName: lock ? agentName : null,
      mode: lock ? "EXCLUSIVE_LOCK" : "COLLABORATIVE_GROUP"
    }
  });
  return updated;
};
var setChatMode = async (roomId, mode) => {
  const updated = await prisma.chatRoom.update({
    where: { id: roomId },
    data: { mode }
  });
  return updated;
};
var getRoomMessages = async (roomId) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, name: true, role: true, imageUrl: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });
  if (!room) {
    throw new AppError(httpStatus11.NOT_FOUND, "Chat room not found!");
  }
  return room;
};
var updateStudentBudgetInChat = async (studentUserId, payload) => {
  const student = await prisma.student.findUnique({
    where: { userId: studentUserId }
  });
  if (!student) {
    throw new AppError(httpStatus11.NOT_FOUND, "Student not found!");
  }
  const updated = await prisma.student.update({
    where: { userId: studentUserId },
    data: {
      targetBudget: payload.targetBudget,
      preferredCurrency: payload.preferredCurrency || "USD",
      preferredCountry: payload.preferredCountry
    },
    include: { user: true }
  });
  return updated;
};
var getConversationMessages = async (userId, otherUserId) => {
  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    include: {
      sender: { select: { id: true, name: true, role: true, imageUrl: true } },
      receiver: { select: { id: true, name: true, role: true, imageUrl: true } }
    },
    orderBy: { createdAt: "asc" }
  });
  return messages;
};
var markMessagesAsRead = async (currentUserId, senderId) => {
  const updated = await prisma.chatMessage.updateMany({
    where: {
      senderId,
      receiverId: currentUserId,
      isRead: false
    },
    data: { isRead: true }
  });
  return { count: updated.count };
};
var ChatService = {
  getOrCreateRoom,
  sendMessage,
  toggleRoomLock,
  setChatMode,
  getRoomMessages,
  updateStudentBudgetInChat,
  getConversationMessages,
  markMessagesAsRead
};

// src/app/module/chat/chat.controller.ts
var sendMessage2 = catchAsync(async (req, res) => {
  const senderId = req.user.userId;
  const senderRole = req.user.role;
  const senderName = req.user.email;
  const senderAvatar = "";
  const result = await ChatService.sendMessage(
    senderId,
    senderName,
    senderRole,
    senderAvatar,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus12.CREATED,
    success: true,
    message: "Message sent successfully!",
    data: result
  });
});
var getOrCreateRoom2 = catchAsync(async (req, res) => {
  const studentUserId = req.params.studentUserId || req.user.userId;
  const applicationId = req.query.applicationId;
  const result = await ChatService.getOrCreateRoom(
    studentUserId,
    applicationId
  );
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Chat room loaded successfully!",
    data: result
  });
});
var toggleRoomLock2 = catchAsync(async (req, res) => {
  const roomId = req.params.roomId;
  const agentUserId = req.user.userId;
  const agentName = req.user.email;
  const lock = req.body.lock !== void 0 ? req.body.lock : Boolean(req.body.isLocked);
  const result = await ChatService.toggleRoomLock(
    roomId,
    agentUserId,
    agentName,
    lock
  );
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: lock ? "Chat room locked for exclusive 1-on-1 session!" : "Chat room unlocked for collaborative staff participation!",
    data: result
  });
});
var setChatMode2 = catchAsync(async (req, res) => {
  const roomId = req.params.roomId;
  const { mode } = req.body;
  const result = await ChatService.setChatMode(roomId, mode);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: `Chat mode set to ${mode}!`,
    data: result
  });
});
var getRoomMessages2 = catchAsync(async (req, res) => {
  const roomId = req.params.roomId;
  const result = await ChatService.getRoomMessages(roomId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Room messages retrieved!",
    data: result
  });
});
var updateStudentBudget = catchAsync(async (req, res) => {
  const studentUserId = req.params.studentUserId;
  const result = await ChatService.updateStudentBudgetInChat(
    studentUserId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Student target budget updated successfully!",
    data: result
  });
});
var getConversationMessages2 = catchAsync(
  async (req, res) => {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.otherUserId;
    const result = await ChatService.getConversationMessages(
      currentUserId,
      otherUserId
    );
    sendResponse(res, {
      statusCode: httpStatus12.OK,
      success: true,
      message: "Conversation messages retrieved!",
      data: result
    });
  }
);
var markMessagesAsRead2 = catchAsync(async (req, res) => {
  const currentUserId = req.user.userId;
  const senderId = req.params.senderId;
  const result = await ChatService.markMessagesAsRead(currentUserId, senderId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Messages marked as read!",
    data: result
  });
});
var ChatController = {
  sendMessage: sendMessage2,
  getOrCreateRoom: getOrCreateRoom2,
  toggleRoomLock: toggleRoomLock2,
  setChatMode: setChatMode2,
  getRoomMessages: getRoomMessages2,
  updateStudentBudget,
  getConversationMessages: getConversationMessages2,
  markMessagesAsRead: markMessagesAsRead2
};

// src/app/module/chat/chat.route.ts
var router5 = Router5();
router5.post(
  "/send",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  ChatController.sendMessage
);
router5.get(
  "/room/:studentUserId",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  ChatController.getOrCreateRoom
);
router5.get(
  "/room/messages/:roomId",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  ChatController.getRoomMessages
);
router5.patch(
  "/room/:roomId/lock",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  ChatController.toggleRoomLock
);
router5.patch(
  "/room/:roomId/mode",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ChatController.setChatMode
);
router5.patch(
  "/student/:studentUserId/budget",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  ChatController.updateStudentBudget
);
router5.get(
  "/conversation/:otherUserId",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  ChatController.getConversationMessages
);
router5.patch(
  "/read/:senderId",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  ChatController.markMessagesAsRead
);
var ChatRoutes = router5;

// src/app/module/enrollment/enrollment.route.ts
import { Router as Router6 } from "express";

// src/app/module/enrollment/enrollment.controller.ts
import httpStatus14 from "http-status";

// src/app/module/enrollment/enrollment.service.ts
import httpStatus13 from "http-status";
var registerCourseSection = async (studentId, sectionId) => {
  const result = await prisma.$transaction(async (tx) => {
    const section = await tx.section.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        semester: true
      }
    });
    if (!section || section.isDeleted) {
      throw new AppError(httpStatus13.NOT_FOUND, "Section not found!");
    }
    if (section.availableSeats <= 0) {
      throw new AppError(
        httpStatus13.BAD_REQUEST,
        "This section is fully booked! No seats available."
      );
    }
    const existingEnrollment = await tx.enrollment.findFirst({
      where: {
        studentId,
        section: {
          courseId: section.courseId,
          semesterId: section.semesterId
        },
        status: "ENROLLED",
        isDeleted: false
      }
    });
    if (existingEnrollment) {
      throw new AppError(
        httpStatus13.BAD_REQUEST,
        "You are already enrolled in this course for the current semester!"
      );
    }
    if (section.course.prerequisiteId) {
      const prerequisiteCompleted = await tx.courseResult.findFirst({
        where: {
          studentId,
          section: {
            courseId: section.course.prerequisiteId
          },
          marks: { gte: 40 }
          // passing marks
        }
      });
      if (!prerequisiteCompleted) {
        const prereqCourse = await tx.course.findUnique({
          where: { id: section.course.prerequisiteId }
        });
        throw new AppError(
          httpStatus13.BAD_REQUEST,
          `Prerequisite required: You must pass '${prereqCourse?.title || "Prerequisite course"}' before enrolling.`
        );
      }
    }
    await tx.section.update({
      where: { id: sectionId },
      data: {
        availableSeats: {
          decrement: 1
        }
      }
    });
    const enrollment = await tx.enrollment.create({
      data: {
        studentId,
        sectionId,
        status: "ENROLLED"
      },
      include: {
        section: {
          include: {
            course: true,
            semester: true
          }
        }
      }
    });
    return enrollment;
  });
  return result;
};
var getMyEnrollments = async (studentId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: "ENROLLED",
      isDeleted: false
    },
    include: {
      section: {
        include: {
          course: true,
          semester: true,
          faculty: { include: { user: true } }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  });
  return enrollments;
};
var dropCourseSection = async (studentId, enrollmentId) => {
  const result = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { section: true }
    });
    if (!enrollment || enrollment.studentId !== studentId || enrollment.isDeleted) {
      throw new AppError(httpStatus13.NOT_FOUND, "Enrollment record not found!");
    }
    if (enrollment.status !== "ENROLLED") {
      throw new AppError(
        httpStatus13.BAD_REQUEST,
        "Course is already dropped or completed!"
      );
    }
    await tx.section.update({
      where: { id: enrollment.sectionId },
      data: {
        availableSeats: {
          increment: 1
        }
      }
    });
    const dropped = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: "DROPPED",
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    return dropped;
  });
  return result;
};
var EnrollmentService = {
  registerCourseSection,
  getMyEnrollments,
  dropCourseSection
};

// src/app/module/enrollment/enrollment.controller.ts
var registerCourseSection2 = catchAsync(
  async (req, res) => {
    const studentId = req.user.studentId;
    const { sectionId } = req.body;
    const result = await EnrollmentService.registerCourseSection(
      studentId,
      sectionId
    );
    sendResponse(res, {
      statusCode: httpStatus14.CREATED,
      success: true,
      message: "Successfully enrolled in course section!",
      data: result
    });
  }
);
var getMyEnrollments2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await EnrollmentService.getMyEnrollments(studentId);
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Enrolled courses fetched successfully!",
    data: result
  });
});
var dropCourseSection2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const enrollmentId = req.params.id;
  const result = await EnrollmentService.dropCourseSection(
    studentId,
    enrollmentId
  );
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Course dropped successfully!",
    data: result
  });
});
var EnrollmentController = {
  registerCourseSection: registerCourseSection2,
  getMyEnrollments: getMyEnrollments2,
  dropCourseSection: dropCourseSection2
};

// src/app/module/enrollment/enrollment.route.ts
var router6 = Router6();
router6.post(
  "/register",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  EnrollmentController.registerCourseSection
);
router6.get(
  "/my-courses",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  EnrollmentController.getMyEnrollments
);
router6.delete(
  "/:id",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  EnrollmentController.dropCourseSection
);
var EnrollmentRoutes = router6;

// src/app/module/grading/grading.route.ts
import { Router as Router7 } from "express";

// src/app/module/grading/grading.controller.ts
import httpStatus16 from "http-status";

// src/app/module/grading/grading.service.ts
import httpStatus15 from "http-status";
import PDFDocument from "pdfkit";
var calculateGrade = (marks) => {
  if (marks >= 80) return { gradePoint: 4, letterGrade: "A+" };
  if (marks >= 75) return { gradePoint: 3.75, letterGrade: "A" };
  if (marks >= 70) return { gradePoint: 3.5, letterGrade: "A-" };
  if (marks >= 65) return { gradePoint: 3.25, letterGrade: "B+" };
  if (marks >= 60) return { gradePoint: 3, letterGrade: "B" };
  if (marks >= 55) return { gradePoint: 2.75, letterGrade: "B-" };
  if (marks >= 50) return { gradePoint: 2.5, letterGrade: "C+" };
  if (marks >= 45) return { gradePoint: 2.25, letterGrade: "C" };
  if (marks >= 40) return { gradePoint: 2, letterGrade: "D" };
  return { gradePoint: 0, letterGrade: "F" };
};
var submitCourseGrade = async (payload) => {
  const section = await prisma.section.findUnique({
    where: { id: payload.sectionId }
  });
  if (!section) {
    throw new AppError(httpStatus15.NOT_FOUND, "Section not found!");
  }
  const { gradePoint, letterGrade } = calculateGrade(payload.marks);
  const result = await prisma.courseResult.upsert({
    where: {
      unique_student_course_grade: {
        studentId: payload.studentId,
        sectionId: payload.sectionId
      }
    },
    update: {
      marks: payload.marks,
      gradePoint,
      letterGrade,
      remarks: payload.remarks,
      isPublished: true
    },
    create: {
      studentId: payload.studentId,
      sectionId: payload.sectionId,
      semesterId: section.semesterId,
      marks: payload.marks,
      gradePoint,
      letterGrade,
      remarks: payload.remarks,
      isPublished: true
    },
    include: {
      student: { include: { user: true } },
      section: { include: { course: true, semester: true } }
    }
  });
  return result;
};
var getStudentResults = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true, department: true }
  });
  if (!student) {
    throw new AppError(httpStatus15.NOT_FOUND, "Student profile not found!");
  }
  const results = await prisma.courseResult.findMany({
    where: { studentId, isPublished: true },
    include: {
      section: {
        include: { course: true, semester: true }
      },
      semester: true
    },
    orderBy: { createdAt: "asc" }
  });
  let totalCredits = 0;
  let totalGradePoints = 0;
  for (const res of results) {
    const credits = res.section.course.credits;
    totalCredits += credits;
    totalGradePoints += res.gradePoint * credits;
  }
  const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
  return {
    student: {
      name: student.user.name,
      studentId: student.studentId,
      department: student.department?.name || "N/A",
      totalCreditsCompleted: totalCredits,
      cumulativeGpa: cgpa
    },
    results
  };
};
var generateTranscriptPDF = async (studentId) => {
  const data = await getStudentResults(studentId);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
    doc.fontSize(20).text("OFFICIAL ACADEMIC TRANSCRIPT", {
      align: "center",
      underline: true
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text("Global University & Higher Study Portal", { align: "center" });
    doc.moveDown(1.5);
    doc.fontSize(11).text(`Student Name: ${data.student.name}`);
    doc.text(`Student ID: ${data.student.studentId}`);
    doc.text(`Department: ${data.student.department}`);
    doc.text(`Total Credits Completed: ${data.student.totalCreditsCompleted}`);
    doc.text(`Cumulative CGPA: ${data.student.cumulativeGpa} / 4.00`);
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Course Code", 40, doc.y, { width: 90, continued: true });
    doc.text("Course Title", 130, doc.y, { width: 200, continued: true });
    doc.text("Credits", 340, doc.y, { width: 50, continued: true });
    doc.text("Marks", 400, doc.y, { width: 50, continued: true });
    doc.text("Grade", 460, doc.y, { width: 50, continued: true });
    doc.text("Point", 520, doc.y, { width: 50 });
    doc.font("Helvetica").moveDown(0.5);
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
    doc.fontSize(9).text(`Generated automatically on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, {
      align: "center"
    });
    doc.end();
  });
};
var GradingService = {
  submitCourseGrade,
  getStudentResults,
  generateTranscriptPDF
};

// src/app/module/grading/grading.controller.ts
var submitCourseGrade2 = catchAsync(async (req, res) => {
  const result = await GradingService.submitCourseGrade(req.body);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Grade submitted and published successfully!",
    data: result
  });
});
var getStudentResults2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await GradingService.getStudentResults(studentId);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Academic results and CGPA fetched successfully!",
    data: result
  });
});
var downloadTranscriptPDF = catchAsync(
  async (req, res) => {
    const studentId = req.user.studentId;
    const pdfBuffer = await GradingService.generateTranscriptPDF(studentId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="official_transcript.pdf"'
    );
    res.send(pdfBuffer);
  }
);
var GradingController = {
  submitCourseGrade: submitCourseGrade2,
  getStudentResults: getStudentResults2,
  downloadTranscriptPDF
};

// src/app/module/grading/grading.route.ts
var router7 = Router7();
router7.post(
  "/submit",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR"),
  GradingController.submitCourseGrade
);
router7.get(
  "/my-results",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  GradingController.getStudentResults
);
router7.get(
  "/transcript-pdf",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  GradingController.downloadTranscriptPDF
);
var GradingRoutes = router7;

// src/app/module/higher-study/higher-study.route.ts
import { Router as Router8 } from "express";

// src/app/lib/multer.ts
import multer from "multer";
var storage = multer.memoryStorage();
var upload = multer({ storage });

// src/app/module/higher-study/higher-study.controller.ts
import httpStatus19 from "http-status";

// src/app/module/higher-study/checklist-preset.service.ts
import fs2 from "fs";
import path4 from "path";
import { randomUUID } from "crypto";
import httpStatus17 from "http-status";
var DATA_DIR = path4.join(process.cwd(), "src", "data");
var PRESETS_FILE = path4.join(DATA_DIR, "checklist-presets.json");
var ITEMS_FILE = path4.join(DATA_DIR, "checklist-items.json");
var DEFAULT_PRESETS = [
  {
    id: "preset_5_docs",
    title: "Core Academic & Identity Bundle (5 Docs)",
    description: "Essential foundation requirements required for initial university evaluation.",
    category: "General",
    isDefault: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items: [
      {
        id: "item_p5_1",
        title: "Passport Copy (Information Page)",
        instruction: "Upload high-quality color scanned copy of valid international Passport (Information & signature page).",
        isRequired: true,
        category: "Identity"
      },
      {
        id: "item_p5_2",
        title: "Academic Transcripts & Certificates",
        instruction: "Upload official verified scanned copies of academic degree certificates and all marksheets.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p5_3",
        title: "English Language Proficiency (IELTS / PTE / MOI)",
        instruction: "Upload valid official score report (IELTS/PTE/TOEFL) or English Medium of Instruction certificate.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p5_4",
        title: "Statement of Purpose (SOP)",
        instruction: "Upload detailed personal statement explaining academic motivation, university selection, and career goals.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p5_5",
        title: "Letters of Recommendation (LOR - 2 Copies)",
        instruction: "Upload 2 signed recommendation letters from university professors or current professional employer.",
        isRequired: true,
        category: "Academic"
      }
    ]
  },
  {
    id: "preset_7_docs",
    title: "Standard Admission & Solvency Pack (7 Docs)",
    description: "Standard comprehensive bundle with 6-month financial verification.",
    category: "General",
    isDefault: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items: [
      {
        id: "item_p7_1",
        title: "Passport Copy (Information Page)",
        instruction: "Upload high-quality color scanned copy of valid international Passport.",
        isRequired: true,
        category: "Identity"
      },
      {
        id: "item_p7_2",
        title: "Academic Transcripts & Certificates",
        instruction: "Upload official verified scanned copies of degree and transcripts.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p7_3",
        title: "English Language Proficiency (IELTS / PTE / MOI)",
        instruction: "Upload valid English language proficiency scorecard.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p7_4",
        title: "Statement of Purpose (SOP)",
        instruction: "Upload personal statement tailored for program admission.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p7_5",
        title: "Letters of Recommendation (LOR - 2 Copies)",
        instruction: "Upload 2 signed recommendation letters.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p7_6",
        title: "Bank Solvency Certificate & 6-Month Statement",
        instruction: "Upload official bank solvency certificate with minimum 6 months history showing continuous balance.",
        isRequired: true,
        category: "Financial"
      },
      {
        id: "item_p7_7",
        title: "Police Clearance Certificate (PCC)",
        instruction: "Upload government-issued official police clearance certificate (issued within last 6 months).",
        isRequired: true,
        category: "Security"
      }
    ]
  },
  {
    id: "preset_9_docs",
    title: "Complete Visa & Embassy Dossier (9 Docs)",
    description: "Full dossier containing medical, financial, identity, and background documentation.",
    category: "General",
    isDefault: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items: [
      {
        id: "item_p9_1",
        title: "Passport Copy (Information Page)",
        instruction: "Upload high-quality color scanned copy of valid international Passport.",
        isRequired: true,
        category: "Identity"
      },
      {
        id: "item_p9_2",
        title: "Academic Transcripts & Certificates",
        instruction: "Upload official verified scanned copies of degree and marksheets.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p9_3",
        title: "English Language Proficiency (IELTS / PTE / MOI)",
        instruction: "Upload valid English test scorecard (IELTS/PTE).",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p9_4",
        title: "Statement of Purpose (SOP)",
        instruction: "Upload comprehensive academic Statement of Purpose.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p9_5",
        title: "Letters of Recommendation (LOR - 2 Copies)",
        instruction: "Upload 2 signed reference letters.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_p9_6",
        title: "Bank Solvency Certificate & 6-Month Statement",
        instruction: "Upload bank solvency certificate and verified 6 months bank statement.",
        isRequired: true,
        category: "Financial"
      },
      {
        id: "item_p9_7",
        title: "Police Clearance Certificate (PCC)",
        instruction: "Upload official police verification certificate.",
        isRequired: true,
        category: "Security"
      },
      {
        id: "item_p9_8",
        title: "Medical Fitness & Vaccination Certificate",
        instruction: "Upload certified health examination report and TB/vaccine clearance certificate.",
        isRequired: true,
        category: "Medical"
      },
      {
        id: "item_p9_9",
        title: "Updated Curriculum Vitae (CV / Resume)",
        instruction: "Upload professional resume formatted for embassy and admission review.",
        isRequired: true,
        category: "Academic"
      }
    ]
  },
  {
    id: "preset_uk_tier4",
    title: "UK Student Route (CAS & Visa Pack)",
    description: "Required checklist for UK universities and UKVI visa appointment.",
    category: "United Kingdom",
    isDefault: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items: [
      {
        id: "item_uk_1",
        title: "Valid International Passport",
        instruction: "Upload color scan of passport with at least 6 months validity.",
        isRequired: true,
        category: "Identity"
      },
      {
        id: "item_uk_2",
        title: "Official CAS Statement Copy",
        instruction: "Upload formal Confirmation of Acceptance for Studies issued by UK university.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_uk_3",
        title: "UKVI Academic Transcripts & Degrees",
        instruction: "Upload all academic transcripts referenced in your CAS letter.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_uk_4",
        title: "IELTS for UKVI or SELT Scorecard",
        instruction: "Upload official SELT certificate showing CEFR B2 level proficiency.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_uk_5",
        title: "28-Day Financial Bank Statement",
        instruction: "Upload 28-day continuous funds statement covering tuition + UK maintenance.",
        isRequired: true,
        category: "Financial"
      },
      {
        id: "item_uk_6",
        title: "Tuberculosis (TB) Test Certificate (IOM)",
        instruction: "Upload TB test report issued by an approved IOM diagnostic center.",
        isRequired: true,
        category: "Medical"
      },
      {
        id: "item_uk_7",
        title: "Consent Letter & Birth Certificate (If Sponsored)",
        instruction: "If using parental funds, upload sponsor affidavit and official birth certificate.",
        isRequired: false,
        category: "Financial"
      }
    ]
  },
  {
    id: "preset_canada_sds",
    title: "Canada Study Permit (SDS & PAL Pack)",
    description: "Complete requirements for IRCC Canadian student visa filing.",
    category: "Canada",
    isDefault: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    items: [
      {
        id: "item_ca_1",
        title: "Valid International Passport",
        instruction: "Upload clear bio-data pages of international passport.",
        isRequired: true,
        category: "Identity"
      },
      {
        id: "item_ca_2",
        title: "DLI Letter of Acceptance (LOA)",
        instruction: "Upload official unconditional acceptance letter from designated learning institution.",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_ca_3",
        title: "Provincial Attestation Letter (PAL)",
        instruction: "Upload government-issued provincial attestation letter (PAL).",
        isRequired: true,
        category: "Academic"
      },
      {
        id: "item_ca_4",
        title: "Guaranteed Investment Certificate (GIC)",
        instruction: "Upload GIC proof of purchase ($20,635 CAD) from approved Canadian financial institution.",
        isRequired: true,
        category: "Financial"
      },
      {
        id: "item_ca_5",
        title: "First-Year Tuition Fee Payment Receipt",
        instruction: "Upload official wire transfer receipt confirming full 1st year tuition payment.",
        isRequired: true,
        category: "Financial"
      },
      {
        id: "item_ca_6",
        title: "Upfront eMedical Examination Sheet",
        instruction: "Upload information sheet provided by panel physician after medical exam.",
        isRequired: true,
        category: "Medical"
      },
      {
        id: "item_ca_7",
        title: "Police Clearance Certificate",
        instruction: "Upload police clearance certificate issued within the past 6 months.",
        isRequired: true,
        category: "Security"
      }
    ]
  }
];
var DEFAULT_ITEMS = [
  {
    id: "item_passport",
    title: "Upload your Passport",
    instruction: "Upload high-quality color scanned copy of first & last page of valid passport.",
    isRequired: true,
    category: "Identity",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item_transcripts",
    title: "Academic Transcripts & Certificates",
    instruction: "Upload official verified scanned copies of academic degree certificates and all marksheets.",
    isRequired: true,
    category: "Academic",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item_english",
    title: "English Language Proficiency (IELTS / PTE / MOI)",
    instruction: "Upload valid official score report (IELTS/PTE/TOEFL) or English Medium of Instruction certificate.",
    isRequired: true,
    category: "Academic",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item_sop",
    title: "Statement of Purpose (SOP)",
    instruction: "Upload detailed personal statement explaining academic motivation, university selection, and career goals.",
    isRequired: true,
    category: "Academic",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item_lor",
    title: "Letters of Recommendation (LOR - 2 Copies)",
    instruction: "Upload 2 signed recommendation letters from university professors or current employer.",
    isRequired: true,
    category: "Academic",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "item_financial",
    title: "Bank Statement & Financial Solvency",
    instruction: "Upload 6-month certified bank statement accompanied by official solvency certificate from bank.",
    isRequired: true,
    category: "Financial",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var ensureDataFileExists = () => {
  if (!fs2.existsSync(DATA_DIR)) {
    fs2.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs2.existsSync(PRESETS_FILE)) {
    fs2.writeFileSync(PRESETS_FILE, JSON.stringify(DEFAULT_PRESETS, null, 2), "utf-8");
  }
  if (!fs2.existsSync(ITEMS_FILE)) {
    fs2.writeFileSync(ITEMS_FILE, JSON.stringify(DEFAULT_ITEMS, null, 2), "utf-8");
  }
};
var readItems = () => {
  ensureDataFileExists();
  try {
    const raw2 = fs2.readFileSync(ITEMS_FILE, "utf-8");
    return JSON.parse(raw2);
  } catch {
    return DEFAULT_ITEMS;
  }
};
var writeItems = (items) => {
  ensureDataFileExists();
  fs2.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2), "utf-8");
};
var readPresets = () => {
  ensureDataFileExists();
  try {
    const raw2 = fs2.readFileSync(PRESETS_FILE, "utf-8");
    return JSON.parse(raw2);
  } catch {
    return DEFAULT_PRESETS;
  }
};
var writePresets = (presets) => {
  ensureDataFileExists();
  fs2.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2), "utf-8");
};
var ChecklistPresetService = {
  // ==================== CHECKLIST ITEMS LIBRARY ====================
  getAllItems: async () => {
    return readItems();
  },
  createItem: async (payload) => {
    if (!payload.title || !payload.title.trim()) {
      throw new AppError(httpStatus17.BAD_REQUEST, "Checklist item title is required!");
    }
    const items = readItems();
    const newItem = {
      id: `item_${randomUUID().slice(0, 8)}`,
      title: payload.title.trim(),
      instruction: payload.instruction?.trim() || "Upload requested document.",
      isRequired: payload.isRequired !== false,
      category: payload.category?.trim() || "General",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    items.unshift(newItem);
    writeItems(items);
    return newItem;
  },
  updateItem: async (id, payload) => {
    const items = readItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      throw new AppError(httpStatus17.NOT_FOUND, "Checklist item not found!");
    }
    const existing = items[idx];
    const updated = {
      ...existing,
      title: payload.title ? payload.title.trim() : existing.title,
      instruction: payload.instruction !== void 0 ? payload.instruction.trim() : existing.instruction,
      isRequired: payload.isRequired !== void 0 ? payload.isRequired : existing.isRequired,
      category: payload.category ? payload.category.trim() : existing.category
    };
    items[idx] = updated;
    writeItems(items);
    return updated;
  },
  deleteItem: async (id) => {
    const items = readItems();
    const filtered = items.filter((i) => i.id !== id);
    writeItems(filtered);
    return { message: "Checklist item deleted successfully!" };
  },
  // ==================== CHECKLIST GROUPS / PRESETS ====================
  getAllPresets: async () => {
    return readPresets();
  },
  getPresetById: async (id) => {
    const presets = readPresets();
    const found = presets.find((p) => p.id === id);
    if (!found) {
      throw new AppError(httpStatus17.NOT_FOUND, "Checklist group not found!");
    }
    return found;
  },
  createPreset: async (payload) => {
    if (!payload.title || !payload.title.trim()) {
      throw new AppError(httpStatus17.BAD_REQUEST, "Checklist group title is required!");
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new AppError(httpStatus17.BAD_REQUEST, "Please provide at least one document requirement in this group!");
    }
    const presets = readPresets();
    const newPreset = {
      id: `group_${randomUUID().slice(0, 8)}`,
      title: payload.title.trim(),
      country: payload.country?.trim() || "All Countries",
      university: payload.university?.trim() || "All Universities",
      degree: payload.degree?.trim() || "All Degrees",
      description: payload.description?.trim() || "",
      category: payload.category?.trim() || payload.country?.trim() || "General",
      isDefault: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      items: payload.items.map((item, idx) => ({
        id: item.id || `item_${randomUUID().slice(0, 8)}_${idx}`,
        title: item.title.trim(),
        instruction: item.instruction?.trim() || "Upload requested official document.",
        isRequired: item.isRequired !== false,
        category: item.category?.trim() || "General"
      }))
    };
    presets.unshift(newPreset);
    writePresets(presets);
    return newPreset;
  },
  updatePreset: async (id, payload) => {
    const presets = readPresets();
    const idx = presets.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new AppError(httpStatus17.NOT_FOUND, "Checklist group not found!");
    }
    const existing = presets[idx];
    const updated = {
      ...existing,
      title: payload.title ? payload.title.trim() : existing.title,
      country: payload.country !== void 0 ? payload.country.trim() : existing.country,
      university: payload.university !== void 0 ? payload.university.trim() : existing.university,
      degree: payload.degree !== void 0 ? payload.degree.trim() : existing.degree,
      description: payload.description !== void 0 ? payload.description.trim() : existing.description,
      category: payload.category ? payload.category.trim() : payload.country?.trim() || existing.category,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      items: payload.items ? payload.items.map((item, i) => ({
        id: item.id || `item_${randomUUID().slice(0, 8)}_${i}`,
        title: item.title.trim(),
        instruction: item.instruction?.trim() || "Upload requested official document.",
        isRequired: item.isRequired !== false,
        category: item.category?.trim() || "General"
      })) : existing.items
    };
    presets[idx] = updated;
    writePresets(presets);
    return updated;
  },
  deletePreset: async (id) => {
    const presets = readPresets();
    const existing = presets.find((p) => p.id === id);
    if (!existing) {
      throw new AppError(httpStatus17.NOT_FOUND, "Checklist group not found!");
    }
    const filtered = presets.filter((p) => p.id !== id);
    writePresets(filtered);
    return { message: "Checklist group deleted successfully!" };
  }
};

// src/app/module/higher-study/higher-study.service.ts
import httpStatus18 from "http-status";

// src/app/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: config_default.cloudinary_cloud_name,
  api_key: config_default.cloudinary_api_key,
  api_secret: config_default.cloudinary_api_secret
});

// src/app/module/higher-study/higher-study.service.ts
import { PDFDocument as PDFLibDoc } from "pdf-lib";
var createCountry = async (payload) => {
  const isExist = await prisma.country.findFirst({
    where: {
      OR: [{ name: payload.name }, { code: payload.code }]
    }
  });
  if (isExist) {
    throw new AppError(
      httpStatus18.CONFLICT,
      "Country with this name or code already exists!"
    );
  }
  const country = await prisma.country.create({
    data: payload
  });
  return country;
};
var getCountries = async () => {
  const countries = await prisma.country.findMany({
    where: { isDeleted: false },
    include: {
      _count: {
        select: { universities: true }
      }
    },
    orderBy: { name: "asc" }
  });
  return countries;
};
var createGlobalUniversity = async (payload) => {
  const university = await prisma.globalUniversity.create({
    data: {
      ...payload,
      paymentType: payload.paymentType || "FREE",
      applicationFee: payload.applicationFee || 0,
      offerDepositFee: payload.offerDepositFee || 0
    },
    include: { country: true, docRequirements: true }
  });
  return university;
};
var extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let remaining = parts[1];
    remaining = remaining.replace(/^v\d+\//, "");
    const lastDotIndex = remaining.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      remaining = remaining.substring(0, lastDotIndex);
    }
    return remaining;
  } catch {
    return null;
  }
};
var uploadUniversityCover = async (file) => {
  if (!file) {
    throw new AppError(httpStatus18.BAD_REQUEST, "Please provide an image file!");
  }
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "university/covers"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
};
var deleteUniversityImage = async (payload) => {
  const targetPublicId = payload.publicId || extractCloudinaryPublicId(payload.imageUrl);
  if (!targetPublicId) {
    return { message: "No Cloudinary asset found to remove." };
  }
  try {
    await cloudinary.uploader.destroy(targetPublicId, { resource_type: "image" });
    return { message: "Image removed from Cloudinary successfully!" };
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err);
    return { message: "Failed to delete image from Cloudinary." };
  }
};
var updateGlobalUniversity = async (id, payload) => {
  const university = await prisma.globalUniversity.findUnique({ where: { id } });
  if (!university) {
    throw new AppError(httpStatus18.NOT_FOUND, "University not found!");
  }
  if (payload.coverImageUrl !== void 0 && university.coverImageUrl && payload.coverImageUrl !== university.coverImageUrl) {
    const oldPublicId = extractCloudinaryPublicId(university.coverImageUrl);
    if (oldPublicId) {
      cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" }).catch(
        (e) => console.error("Failed to purge old university image from Cloudinary:", e)
      );
    }
  }
  const updated = await prisma.globalUniversity.update({
    where: { id },
    data: payload,
    include: { country: true, docRequirements: true }
  });
  return updated;
};
var deleteGlobalUniversity = async (id, hardDelete = false) => {
  const university = await prisma.globalUniversity.findUnique({ where: { id } });
  if (!university) {
    throw new AppError(httpStatus18.NOT_FOUND, "University not found!");
  }
  if (hardDelete) {
    if (university.coverImageUrl) {
      const oldPublicId = extractCloudinaryPublicId(university.coverImageUrl);
      if (oldPublicId) {
        cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" }).catch(
          (e) => console.error("Failed to purge university cover from Cloudinary:", e)
        );
      }
    }
    await prisma.universityDocRequirement.deleteMany({ where: { universityId: id } });
    await prisma.globalProgram.deleteMany({ where: { universityId: id } });
    await prisma.globalUniversity.delete({ where: { id } });
    return { message: "University permanently removed!" };
  }
  const updated = await prisma.globalUniversity.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
  return updated;
};
var restoreGlobalUniversity = async (id) => {
  const university = await prisma.globalUniversity.findUnique({ where: { id } });
  if (!university) {
    throw new AppError(httpStatus18.NOT_FOUND, "University not found!");
  }
  const updated = await prisma.globalUniversity.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null }
  });
  return updated;
};
var getGlobalUniversities = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
  const skip = (page - 1) * limit;
  const whereConditions = {};
  if (query.onlyDeleted === "true") {
    whereConditions.isDeleted = true;
  } else if (query.includeDeleted === "true") {
  } else {
    whereConditions.isDeleted = false;
  }
  if (query.countryId) {
    whereConditions.countryId = query.countryId;
  }
  if (query.countryName) {
    whereConditions.country = {
      name: { contains: query.countryName, mode: "insensitive" }
    };
  }
  if (query.searchTerm) {
    whereConditions.OR = [
      { name: { contains: query.searchTerm, mode: "insensitive" } },
      { city: { contains: query.searchTerm, mode: "insensitive" } }
    ];
  }
  const [universities, total] = await Promise.all([
    prisma.globalUniversity.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        country: true,
        docRequirements: true,
        programs: { where: { isDeleted: false } },
        _count: { select: { programs: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.globalUniversity.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: universities
  };
};
var getGlobalUniversityDetails = async (idOrSlug) => {
  const isUuid = /^[0-9a-fA-F-]{10,}$/.test(idOrSlug);
  let university = null;
  if (isUuid) {
    university = await prisma.globalUniversity.findUnique({
      where: { id: idOrSlug },
      include: {
        country: true,
        docRequirements: true,
        programs: { where: { isDeleted: false } }
      }
    });
  }
  if (!university) {
    const allUniversities = await prisma.globalUniversity.findMany({
      where: { isDeleted: false },
      include: {
        country: true,
        docRequirements: true,
        programs: { where: { isDeleted: false } }
      }
    });
    university = allUniversities.find((u) => {
      const slug = u.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/&/g, "-and-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
      return slug === idOrSlug.toLowerCase() || u.id === idOrSlug || u.name.toLowerCase() === idOrSlug.toLowerCase();
    });
  }
  if (!university || university.isDeleted) {
    throw new AppError(httpStatus18.NOT_FOUND, "University not found!");
  }
  return university;
};
var addUniversityDocRequirement = async (universityId, payload) => {
  const university = await prisma.globalUniversity.findUnique({
    where: { id: universityId }
  });
  if (!university) {
    throw new AppError(httpStatus18.NOT_FOUND, "University not found!");
  }
  const requirement = await prisma.universityDocRequirement.create({
    data: {
      universityId,
      title: payload.title,
      description: payload.description,
      isRequired: payload.isRequired !== void 0 ? payload.isRequired : true,
      docType: payload.docType || "PDF"
    }
  });
  return requirement;
};
var getUniversityDocRequirements = async (universityId) => {
  const requirements = await prisma.universityDocRequirement.findMany({
    where: { universityId },
    orderBy: { createdAt: "asc" }
  });
  return requirements;
};
var deleteUniversityDocRequirement = async (reqId) => {
  await prisma.universityDocRequirement.delete({
    where: { id: reqId }
  });
  return { message: "Document requirement removed successfully!" };
};
var createGlobalProgram = async (payload) => {
  const program = await prisma.globalProgram.create({
    data: {
      ...payload,
      applicationDeadline: payload.applicationDeadline ? new Date(payload.applicationDeadline) : void 0
    },
    include: { university: { include: { country: true } } }
  });
  return program;
};
var getGlobalPrograms = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereConditions = { isDeleted: false };
  if (query.universityId) {
    whereConditions.universityId = query.universityId;
  }
  if (query.degreeLevel) {
    whereConditions.degreeLevel = query.degreeLevel;
  }
  if (query.countryId) {
    whereConditions.university = {
      countryId: query.countryId
    };
  }
  if (query.searchTerm) {
    whereConditions.OR = [
      { name: { contains: query.searchTerm, mode: "insensitive" } },
      {
        university: {
          name: { contains: query.searchTerm, mode: "insensitive" }
        }
      }
    ];
  }
  const [programs, total] = await Promise.all([
    prisma.globalProgram.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        university: { include: { country: true, docRequirements: true } }
      },
      orderBy: { tuitionFee: "asc" }
    }),
    prisma.globalProgram.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: programs
  };
};
var applyForProgram = async (studentId, programId) => {
  const program = await prisma.globalProgram.findUnique({
    where: { id: programId },
    include: {
      university: {
        include: { country: true, docRequirements: true }
      }
    }
  });
  if (!program || program.isDeleted) {
    throw new AppError(
      httpStatus18.NOT_FOUND,
      "Selected program is not available!"
    );
  }
  const university = program.university;
  const applicationNumber = `HS-${Date.now().toString().slice(-6)}`;
  const isFeePaid = university.paymentType === "FREE";
  const application = await prisma.$transaction(async (tx) => {
    const app2 = await tx.higherStudyApplication.create({
      data: {
        applicationNumber,
        studentId,
        programId,
        status: "DOCS_PENDING",
        isFeePaid,
        isOfferUnlocked: false
      }
    });
    const docRequirements = university.docRequirements;
    if (docRequirements && docRequirements.length > 0) {
      for (const req of docRequirements) {
        await tx.applicationDocument.create({
          data: {
            applicationId: app2.id,
            title: req.title,
            instruction: `${req.description || "Upload document"} (${req.isRequired ? "Mandatory" : "Optional"})`,
            status: "REQUIRED"
          }
        });
      }
    } else {
      const defaultChecklists = [
        {
          title: "Passport Copy (Information Page)",
          instruction: "Upload high quality scanned copy of valid Passport (Mandatory)."
        },
        {
          title: "Academic Transcripts & Certificates",
          instruction: "Upload verified scan of educational certificates (Mandatory)."
        },
        {
          title: "English Proficiency Scorecard (IELTS / PTE / MOI)",
          instruction: `Upload official English scorecard (Required: IELTS ${program.ieltsRequirement || "5.0+"}).`
        },
        {
          title: "Statement of Purpose (SOP)",
          instruction: "Upload your Statement of Purpose (Optional)."
        }
      ];
      for (const item of defaultChecklists) {
        await tx.applicationDocument.create({
          data: {
            applicationId: app2.id,
            title: item.title,
            instruction: item.instruction,
            status: "REQUIRED"
          }
        });
      }
    }
    return tx.higherStudyApplication.findUnique({
      where: { id: app2.id },
      include: {
        program: { include: { university: { include: { country: true } } } },
        documents: true
      }
    });
  });
  return application;
};
var getMyApplications = async (studentId) => {
  const applications = await prisma.higherStudyApplication.findMany({
    where: { studentId, isDeleted: false },
    include: {
      program: {
        include: {
          university: { include: { country: true } }
        }
      },
      documents: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      counselor: { include: { user: true } },
      notes: { where: { isPrivate: false }, orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  const applicationsWithProgress = applications.map((app2) => {
    const totalDocs = app2.documents.length;
    const uploadedDocs = app2.documents.filter(
      (d) => d.status === "UPLOADED" || d.status === "VERIFIED"
    ).length;
    const verifiedDocs = app2.documents.filter(
      (d) => d.status === "VERIFIED"
    ).length;
    const completionPercentage = totalDocs > 0 ? Math.round(uploadedDocs / totalDocs * 100) : 0;
    return {
      ...app2,
      totalDocs,
      uploadedDocs,
      verifiedDocs,
      completionPercentage
    };
  });
  return applicationsWithProgress;
};
var getAllApplications = async (query, userRole, userId) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereConditions = { isDeleted: false };
  if (userRole === "COUNSELOR") {
    const counselor = await prisma.counselor.findUnique({ where: { userId } });
    if (counselor) {
      whereConditions.counselorId = counselor.id;
    }
  }
  if (query.status) {
    whereConditions.status = query.status;
  }
  const [applications, total] = await Promise.all([
    prisma.higherStudyApplication.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        student: { include: { user: true } },
        counselor: { include: { user: true } },
        program: { include: { university: { include: { country: true } } } },
        documents: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { createdAt: "desc" } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.higherStudyApplication.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: applications
  };
};
var assignCounselor = async (applicationId, counselorId) => {
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: { include: { user: true } } }
  });
  if (!application) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId },
    include: { user: true }
  });
  if (!counselor) {
    throw new AppError(httpStatus18.NOT_FOUND, "Counselor not found!");
  }
  const updated = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: { counselorId },
    include: { counselor: { include: { user: true } } }
  });
  await prisma.notification.create({
    data: {
      userId: application.student.userId,
      title: "Counselor Assigned to Your Application",
      body: `${counselor.user.name} has been assigned as your study abroad counselor.`,
      audience: "HIGHER_STUDY",
      priority: "INFO"
    }
  });
  return updated;
};
var addCounselorNote = async (applicationId, counselorUserId, payload) => {
  const counselor = await prisma.counselor.findUnique({
    where: { userId: counselorUserId }
  });
  if (!counselor) {
    throw new AppError(httpStatus18.FORBIDDEN, "Counselor profile not found!");
  }
  const note = await prisma.counselorNote.create({
    data: {
      applicationId,
      counselorId: counselor.id,
      note: payload.note,
      isPrivate: payload.isPrivate || false
    },
    include: { counselor: { include: { user: true } } }
  });
  return note;
};
var uploadApplicationDocument = async (documentId, file) => {
  if (!file) {
    throw new AppError(
      httpStatus18.BAD_REQUEST,
      "Please upload a document file (PDF/Image)!"
    );
  }
  const doc = await prisma.applicationDocument.findUnique({
    where: { id: documentId },
    include: { application: true }
  });
  if (!doc) {
    throw new AppError(httpStatus18.NOT_FOUND, "Document item not found!");
  }
  const isPdf = file.mimetype.includes("pdf");
  const resourceType = isPdf ? "raw" : "image";
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "university/higher_study_documents"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
  const docBefore = await prisma.applicationDocument.findUnique({
    where: { id: documentId },
    include: { application: { include: { student: { include: { user: true } } } } }
  });
  if (!docBefore) {
    throw new AppError(httpStatus18.NOT_FOUND, "Document item not found!");
  }
  const updated = await prisma.applicationDocument.update({
    where: { id: documentId },
    data: {
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileType: file.mimetype,
      status: "UPLOADED",
      uploadedAt: /* @__PURE__ */ new Date()
    }
  });
  try {
    const studentName = docBefore.application.student?.user?.name || "Student";
    await prisma.notification.create({
      data: {
        title: `Document Uploaded: ${docBefore.title}`,
        body: `${studentName} uploaded '${docBefore.title}' for Application #${docBefore.application.applicationNumber || docBefore.applicationId.slice(0, 8)}. Awaiting admissions review.`,
        audience: "HIGHER_STUDY",
        priority: "ACTION_REQUIRED",
        actionUrl: "/admin"
      }
    });
  } catch (notifErr) {
    console.error("Failed to create admin notification on doc upload:", notifErr?.message);
  }
  await sendChatSystemNotification(
    docBefore.application.student.userId,
    `\u{1F4C4} Document Submitted: Student uploaded '${docBefore.title}'. It is now under review by the Admissions Desk.`,
    docBefore.applicationId
  );
  return updated;
};
var sendChatSystemNotification = async (studentUserId, message, applicationId, senderId) => {
  try {
    let room = await prisma.chatRoom.findFirst({
      where: {
        studentUserId,
        ...applicationId ? { applicationId } : {}
      }
    });
    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          studentUserId,
          applicationId,
          mode: "COLLABORATIVE_GROUP"
        }
      });
    }
    await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: senderId || studentUserId,
        message,
        senderDisplayName: "System Notification",
        senderRoleBadge: "[SYSTEM]"
      }
    });
  } catch (err) {
    console.error("Failed to send chat system message:", err?.message);
  }
};
var verifyDocument = async (documentId, payload, adminUserId) => {
  const doc = await prisma.applicationDocument.findUnique({
    where: { id: documentId },
    include: {
      application: { include: { student: { include: { user: true } } } }
    }
  });
  if (!doc) {
    throw new AppError(httpStatus18.NOT_FOUND, "Document item not found!");
  }
  const updated = await prisma.applicationDocument.update({
    where: { id: documentId },
    data: {
      status: payload.status,
      adminFeedback: payload.adminFeedback
    }
  });
  if (payload.status === "VERIFIED") {
    await prisma.notification.create({
      data: {
        userId: doc.application.student.userId,
        title: "Document Verified & Approved",
        body: `Your document '${doc.title}' has been verified and cleared by the Admissions Desk.`,
        audience: "HIGHER_STUDY",
        priority: "INFO"
      }
    });
    await sendChatSystemNotification(
      doc.application.student.userId,
      `\u2714\uFE0F Document Verified: Admissions Desk has approved your '${doc.title}'.`,
      doc.applicationId,
      adminUserId
    );
  } else if (payload.status === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: doc.application.student.userId,
        title: "Document Rejected \u2014 Re-upload Needed",
        body: `Your document '${doc.title}' was rejected. Note: ${payload.adminFeedback || "Please review requirements and re-upload."}`,
        audience: "HIGHER_STUDY",
        priority: "CRITICAL_ALERT"
      }
    });
    await sendChatSystemNotification(
      doc.application.student.userId,
      `\u26A0\uFE0F Document Action Needed: Admissions Desk requested re-upload for '${doc.title}'. Note: ${payload.adminFeedback || "Please upload a clear scanned original."}`,
      doc.applicationId,
      adminUserId
    );
  }
  return updated;
};
var addCustomDocument = async (applicationId, payload, adminUserId) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: { include: { user: true } } }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const doc = await prisma.applicationDocument.create({
    data: {
      applicationId,
      title: payload.title,
      instruction: payload.instruction || "Official scanned document required for university verification.",
      status: "REQUIRED",
      isCustom: true
    }
  });
  await prisma.notification.create({
    data: {
      userId: app2.student.userId,
      title: `New Requirement: ${payload.title}`,
      body: `Admissions Desk added '${payload.title}' to your checklist. Note: ${payload.instruction || "Upload requested document."}`,
      audience: "HIGHER_STUDY",
      priority: "ACTION_REQUIRED"
    }
  });
  await sendChatSystemNotification(
    app2.student.userId,
    `\u{1F4CB} New Document Requirement: Admissions Desk has added '${payload.title}' to your application checklist. ${payload.instruction ? `Note: ${payload.instruction}` : ""}`,
    app2.id,
    adminUserId
  );
  return doc;
};
var assignPresetDocuments = async (applicationId, presetType, customTitles, adminUserId) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true } },
      documents: true
    }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const PRESET_DEFINITIONS = {
    "5_DOCS": [
      { title: "Passport Copy (Information Page)", instruction: "Upload high-quality scanned copy of valid international Passport (Mandatory)." },
      { title: "Academic Transcripts & Certificates", instruction: "Upload verified scanned copies of official degree/marksheets (Mandatory)." },
      { title: "English Language Proficiency (IELTS / PTE / MOI)", instruction: "Upload valid English language test scorecard or Medium of Instruction (MOI) certificate." },
      { title: "Statement of Purpose (SOP)", instruction: "Upload your personal statement detailing motivation and academic goals." },
      { title: "Letters of Recommendation (LOR - 2 Copies)", instruction: "Upload 2 recommendation letters from academic professors or employers." }
    ],
    "7_DOCS": [
      { title: "Passport Copy (Information Page)", instruction: "Upload high-quality scanned copy of valid international Passport (Mandatory)." },
      { title: "Academic Transcripts & Certificates", instruction: "Upload verified scanned copies of official degree/marksheets (Mandatory)." },
      { title: "English Language Proficiency (IELTS / PTE / MOI)", instruction: "Upload valid English language test scorecard or Medium of Instruction (MOI) certificate." },
      { title: "Statement of Purpose (SOP)", instruction: "Upload your personal statement detailing motivation and academic goals." },
      { title: "Letters of Recommendation (LOR - 2 Copies)", instruction: "Upload 2 recommendation letters from academic professors or employers." },
      { title: "Bank Solvency Certificate & 6-Month Statement", instruction: "Upload official bank solvency certificate with minimum 6 months transaction history." },
      { title: "Police Clearance Certificate (PCC)", instruction: "Upload official police verification certificate issued within last 6 months." }
    ],
    "9_DOCS": [
      { title: "Passport Copy (Information Page)", instruction: "Upload high-quality scanned copy of valid international Passport (Mandatory)." },
      { title: "Academic Transcripts & Certificates", instruction: "Upload verified scanned copies of official degree/marksheets (Mandatory)." },
      { title: "English Language Proficiency (IELTS / PTE / MOI)", instruction: "Upload valid English language test scorecard or Medium of Instruction (MOI) certificate." },
      { title: "Statement of Purpose (SOP)", instruction: "Upload your personal statement detailing motivation and academic goals." },
      { title: "Letters of Recommendation (LOR - 2 Copies)", instruction: "Upload 2 recommendation letters from academic professors or employers." },
      { title: "Bank Solvency Certificate & 6-Month Statement", instruction: "Upload official bank solvency certificate with minimum 6 months transaction history." },
      { title: "Police Clearance Certificate (PCC)", instruction: "Upload official police verification certificate issued within last 6 months." },
      { title: "Medical Fitness & Vaccination Certificate", instruction: "Upload certified health examination report and TB/vaccine clearance." },
      { title: "Updated Curriculum Vitae (CV / Resume)", instruction: "Upload detailed academic and professional resume formatted for embassy review." }
    ]
  };
  let targetList = PRESET_DEFINITIONS[presetType] || [];
  if (presetType === "CUSTOM" && Array.isArray(customTitles)) {
    targetList = customTitles.map((t) => ({
      title: t,
      instruction: "Upload requested document for admissions processing (Mandatory)."
    }));
  }
  const existingTitles = new Set(app2.documents.map((d) => d.title.toLowerCase().trim()));
  const createdDocs = [];
  for (const item of targetList) {
    if (!existingTitles.has(item.title.toLowerCase().trim())) {
      const newDoc = await prisma.applicationDocument.create({
        data: {
          applicationId,
          title: item.title,
          instruction: item.instruction,
          status: "REQUIRED",
          isCustom: true
        }
      });
      createdDocs.push(newDoc);
      existingTitles.add(item.title.toLowerCase().trim());
    }
  }
  const count = app2.documents.length + createdDocs.length;
  await prisma.notification.create({
    data: {
      userId: app2.student.userId,
      title: `Checklist Updated: ${count} Documents Required`,
      body: `Admissions Desk assigned the ${presetType.replace("_", " ")} checklist (${count} items total). Please review and upload required documents.`,
      audience: "HIGHER_STUDY",
      priority: "ACTION_REQUIRED"
    }
  });
  await sendChatSystemNotification(
    app2.student.userId,
    `\u{1F4CB} Checklist Assigned: Admissions Desk has assigned the ${presetType.replace("_", " ")} checklist to your file (${count} total required documents). Please review and upload remaining items.`,
    app2.id,
    adminUserId
  );
  return prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      documents: { orderBy: { createdAt: "asc" } },
      program: { include: { university: true } }
    }
  });
};
var deleteApplicationDocument = async (documentId) => {
  const doc = await prisma.applicationDocument.findUnique({
    where: { id: documentId }
  });
  if (!doc) {
    throw new AppError(httpStatus18.NOT_FOUND, "Document not found!");
  }
  await prisma.applicationDocument.delete({
    where: { id: documentId }
  });
  return { message: "Document requirement removed successfully!" };
};
var deleteApplication = async (applicationId, userRole, userId) => {
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: { include: { user: true } } }
  });
  if (!application) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const updated = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    message: "Application moved to trash successfully",
    data: updated
  };
};
var getTrashApplications = async () => {
  const applications = await prisma.higherStudyApplication.findMany({
    where: { isDeleted: true },
    include: {
      student: { include: { user: true } },
      counselor: { include: { user: true } },
      program: { include: { university: { include: { country: true } } } },
      documents: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { deletedAt: "desc" }
  });
  const enriched = applications.map((app2) => {
    const deletedDate = app2.deletedAt ? new Date(app2.deletedAt) : new Date(app2.updatedAt);
    const daysElapsed = Math.floor((Date.now() - deletedDate.getTime()) / (1e3 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysElapsed);
    return {
      ...app2,
      daysElapsed,
      daysRemaining
    };
  });
  return enriched;
};
var restoreApplication = async (applicationId) => {
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId }
  });
  if (!application) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const restored = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: {
      isDeleted: false,
      deletedAt: null
    }
  });
  return {
    message: "Application restored from trash successfully",
    data: restored
  };
};
var permanentDeleteApplication = async (applicationId) => {
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { documents: true }
  });
  if (!application) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  for (const doc of application.documents) {
    if (doc.filePublicId) {
      try {
        await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: "raw" });
      } catch (e) {
        console.warn("Could not destroy Cloudinary doc:", e);
      }
    }
  }
  if (application.offerLetterPublicId) {
    try {
      await cloudinary.uploader.destroy(application.offerLetterPublicId, { resource_type: "raw" });
    } catch (e) {
      console.warn("Could not destroy Cloudinary offer letter:", e);
    }
  }
  await prisma.applicationDocument.deleteMany({ where: { applicationId } });
  await prisma.counselorNote.deleteMany({ where: { applicationId } });
  await prisma.payment.deleteMany({ where: { higherStudyApplicationId: applicationId } });
  await prisma.higherStudyApplication.delete({ where: { id: applicationId } });
  return { message: "Application permanently purged from database." };
};
var emptyTrashApplications = async () => {
  const deletedApps = await prisma.higherStudyApplication.findMany({
    where: { isDeleted: true },
    include: { documents: true }
  });
  for (const app2 of deletedApps) {
    for (const doc of app2.documents) {
      if (doc.filePublicId) {
        try {
          await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: "raw" });
        } catch (e) {
        }
      }
    }
    if (app2.offerLetterPublicId) {
      try {
        await cloudinary.uploader.destroy(app2.offerLetterPublicId, { resource_type: "raw" });
      } catch (e) {
      }
    }
    await prisma.applicationDocument.deleteMany({ where: { applicationId: app2.id } });
    await prisma.counselorNote.deleteMany({ where: { applicationId: app2.id } });
    await prisma.payment.deleteMany({ where: { higherStudyApplicationId: app2.id } });
    await prisma.higherStudyApplication.delete({ where: { id: app2.id } });
  }
  return {
    message: `Successfully emptied trash (${deletedApps.length} applications permanently purged).`,
    count: deletedApps.length
  };
};
var applyPresetToApplication = async (applicationId, payload, adminUserId) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true } },
      documents: true
    }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  let targetItems = [];
  let presetTitle = "Checklist Bundle";
  if (payload.presetId) {
    const preset = await ChecklistPresetService.getPresetById(payload.presetId);
    targetItems = preset.items;
    presetTitle = preset.title;
  } else if (Array.isArray(payload.items) && payload.items.length > 0) {
    targetItems = payload.items;
  }
  if (targetItems.length === 0) {
    throw new AppError(httpStatus18.BAD_REQUEST, "No document checklist items provided to assign!");
  }
  const existingTitles = new Set(app2.documents.map((d) => d.title.toLowerCase().trim()));
  const createdDocs = [];
  for (const item of targetItems) {
    if (!existingTitles.has(item.title.toLowerCase().trim())) {
      const newDoc = await prisma.applicationDocument.create({
        data: {
          applicationId,
          title: item.title,
          instruction: item.instruction || "Official scanned document required for university verification.",
          status: "REQUIRED",
          isCustom: true
        }
      });
      createdDocs.push(newDoc);
      existingTitles.add(item.title.toLowerCase().trim());
    }
  }
  const totalCount = app2.documents.length + createdDocs.length;
  await prisma.notification.create({
    data: {
      userId: app2.student.userId,
      title: `Checklist Updated: ${createdDocs.length} Requirements Added`,
      body: `Admissions Desk assigned '${presetTitle}' (${totalCount} total documents). Please upload required documents.`,
      audience: "HIGHER_STUDY",
      priority: "ACTION_REQUIRED"
    }
  });
  await sendChatSystemNotification(
    app2.student.userId,
    `\u{1F4CB} Checklist Assigned: Admissions Desk has assigned '${presetTitle}' to your application (${createdDocs.length} new items added, ${totalCount} total required). Please review and upload remaining documents.`,
    app2.id,
    adminUserId
  );
  return prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      documents: { orderBy: { createdAt: "asc" } },
      program: { include: { university: true } }
    }
  });
};
var updateApplicationStage = async (applicationId, status) => {
  const updated = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: { status },
    include: {
      student: { include: { user: true } },
      program: { include: { university: true } }
    }
  });
  await prisma.notification.create({
    data: {
      userId: updated.student.userId,
      title: `Application Status Updated: ${status}`,
      body: `Your application #${updated.applicationNumber} status has progressed to ${status}.`,
      audience: "HIGHER_STUDY",
      priority: "INFO"
    }
  });
  return updated;
};
var issueOfferLetter = async (applicationId, file) => {
  if (!file) {
    throw new AppError(
      httpStatus18.BAD_REQUEST,
      "Please upload the Offer Letter file!"
    );
  }
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true } },
      program: { include: { university: true } }
    }
  });
  if (!application) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const isPdf = file.mimetype.includes("pdf");
  const resourceType = isPdf ? "raw" : "image";
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "university/offer_letters"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
  const isFree = application.program.university.paymentType === "FREE";
  const updatedApp = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: {
      offerLetterUrl: uploadResult.secure_url,
      offerLetterPublicId: uploadResult.public_id,
      offerIssuedAt: /* @__PURE__ */ new Date(),
      status: "OFFER_ISSUED",
      isOfferUnlocked: isFree
    }
  });
  const notificationBody = isFree ? "Your official offer letter is ready! You can download it now." : `Your official offer letter is ready! Please pay the deposit of $${application.program.university.offerDepositFee} USD to unlock and download your offer letter.`;
  await prisma.notification.create({
    data: {
      userId: application.student.userId,
      title: "Official Offer Letter Issued",
      body: notificationBody,
      audience: "HIGHER_STUDY",
      priority: "INFO"
    }
  });
  return updatedApp;
};
var getOfferLetterDownload = async (applicationId, studentUserId) => {
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: true,
      program: { include: { university: true } }
    }
  });
  if (!application || application.student.userId !== studentUserId) {
    throw new AppError(httpStatus18.FORBIDDEN, "Access denied to this application!");
  }
  if (!application.offerLetterUrl) {
    throw new AppError(httpStatus18.NOT_FOUND, "Offer letter has not been issued yet!");
  }
  if (!application.isOfferUnlocked) {
    throw new AppError(
      httpStatus18.PAYMENT_REQUIRED,
      `Offer Letter is locked. Please pay the deposit fee of $${application.program.university.offerDepositFee} USD to unlock.`
    );
  }
  return {
    downloadUrl: application.offerLetterUrl,
    applicationNumber: application.applicationNumber
  };
};
var toggleOfferLetterLock = async (applicationId, isOfferUnlocked) => {
  const application = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: true, program: { include: { university: true } } }
  });
  if (!application) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application not found!");
  }
  const updated = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: { isOfferUnlocked }
  });
  await prisma.notification.create({
    data: {
      userId: application.student.userId,
      title: isOfferUnlocked ? "Offer Letter Unlocked" : "Offer Letter Lock Updated",
      body: isOfferUnlocked ? `Your offer letter for ${application.program.university.name} is now unlocked for free download!` : `Your offer letter for ${application.program.university.name} is locked and requires deposit payment.`,
      audience: "HIGHER_STUDY",
      priority: "INFO"
    }
  });
  return updated;
};
var createBlogPost = async (authorId, payload) => {
  const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;
  const post = await prisma.blogPost.create({
    data: {
      title: payload.title,
      slug,
      content: payload.content,
      bannerUrl: payload.bannerUrl,
      category: payload.category || "Study Abroad Guide",
      tags: payload.tags || [],
      authorId
    },
    include: { author: { select: { id: true, name: true, imageUrl: true } } }
  });
  return post;
};
var getBlogPosts = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereConditions = { isPublished: true };
  if (query.category) {
    whereConditions.category = query.category;
  }
  if (query.searchTerm) {
    whereConditions.OR = [
      { title: { contains: query.searchTerm, mode: "insensitive" } },
      { content: { contains: query.searchTerm, mode: "insensitive" } }
    ];
  }
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, imageUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.blogPost.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: posts
  };
};
var getBlogPostBySlug = async (slug) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, imageUrl: true } }
    }
  });
  if (!post) {
    throw new AppError(httpStatus18.NOT_FOUND, "Blog post not found!");
  }
  return post;
};
var deleteBlogPost = async (id) => {
  await prisma.blogPost.delete({ where: { id } });
  return { message: "Blog post deleted successfully!" };
};
var getApplicationById = async (id) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id },
    include: {
      student: { include: { user: true } },
      counselor: { include: { user: true } },
      program: { include: { university: { include: { country: true } } } },
      documents: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
      internalNotes: { orderBy: { createdAt: "asc" } }
    }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application dossier not found!");
  }
  return app2;
};
var updateApplicationInformation = async (applicationId, payload) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: true }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application record not found!");
  }
  const updateData = {};
  if (payload.customInformation !== void 0) {
    updateData.customInformation = payload.customInformation;
  }
  if (payload.appliedUniversities !== void 0) {
    updateData.appliedUniversities = payload.appliedUniversities;
  }
  if (payload.contactNumber !== void 0 || payload.address !== void 0) {
    await prisma.student.update({
      where: { id: app2.studentId },
      data: {
        ...payload.contactNumber !== void 0 ? { contactNumber: payload.contactNumber } : {},
        ...payload.address !== void 0 ? { address: payload.address } : {}
      }
    });
    if (payload.contactNumber !== void 0) {
      await prisma.user.update({
        where: { id: app2.student.userId },
        data: { contactNumber: payload.contactNumber }
      });
    }
  }
  const updated = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: updateData,
    include: {
      student: { include: { user: true } },
      counselor: { include: { user: true } },
      program: { include: { university: { include: { country: true } } } },
      documents: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
      internalNotes: { orderBy: { createdAt: "asc" } }
    }
  });
  return updated;
};
var updateApplicationTracking = async (applicationId, payload) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: { include: { user: true } } }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application record not found!");
  }
  const updated = await prisma.higherStudyApplication.update({
    where: { id: applicationId },
    data: { trackingMilestones: payload.trackingMilestones },
    include: {
      student: { include: { user: true } },
      counselor: { include: { user: true } },
      program: { include: { university: { include: { country: true } } } },
      documents: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
      internalNotes: { orderBy: { createdAt: "asc" } }
    }
  });
  if (payload.notifyStudent && app2.student?.user?.id) {
    await prisma.notification.create({
      data: {
        userId: app2.student.user.id,
        title: "Admission Tracking Updated",
        body: payload.updateMessage || "Your higher study admission tracking has been updated.",
        audience: "HIGHER_STUDY",
        priority: "INFO"
      }
    });
  }
  return updated;
};
var addApplicationInternalNote = async (applicationId, userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError(httpStatus18.NOT_FOUND, "User profile not found!");
  }
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: { student: { include: { user: true } } }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application record not found!");
  }
  const internalNote = await prisma.applicationInternalNote.create({
    data: {
      applicationId,
      note: payload.note,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.imageUrl || null
    }
  });
  try {
    const otherAdmins = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
        id: { not: user.id },
        isDeleted: false
      },
      select: { id: true }
    });
    const studentName = app2.student?.user?.name || "Student";
    for (const admin of otherAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `Internal Note: ${studentName}`,
          body: `${user.name} posted: "${payload.note.slice(0, 80)}${payload.note.length > 80 ? "..." : ""}"`,
          audience: "HIGHER_STUDY",
          priority: "INFO"
        }
      });
    }
  } catch (nErr) {
    console.error("Failed to notify admins of internal note", nErr);
  }
  return internalNote;
};
var deleteApplicationInternalNote = async (applicationId, noteId) => {
  await prisma.applicationInternalNote.delete({
    where: { id: noteId }
  });
  return { message: "Internal note deleted successfully!" };
};
var generateApplicationDossierPDF = async (applicationId, options = {}) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true } },
      program: { include: { university: { include: { country: true } } } },
      documents: true
    }
  });
  if (!app2) {
    throw new AppError(httpStatus18.NOT_FOUND, "Application record not found!");
  }
  let docs = app2.documents;
  if (Array.isArray(options.documentIds) && options.documentIds.length > 0) {
    const orderMap = new Map(options.documentIds.map((id, idx) => [id, idx]));
    docs = [...docs].sort((a, b) => {
      const aIdx = orderMap.has(a.id) ? orderMap.get(a.id) : 999;
      const bIdx = orderMap.has(b.id) ? orderMap.get(b.id) : 999;
      return aIdx - bIdx;
    });
  }
  const uploadedDocs = docs.filter((d) => Boolean(d.fileUrl));
  const studentName = app2.student?.user?.name || app2.student?.name || "Student";
  const safeStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = options.customTitle?.trim() ? `${options.customTitle.trim().replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf` : `${safeStudentName}_All_Documents.pdf`;
  const mergedPdf = await PDFLibDoc.create();
  for (const d of uploadedDocs) {
    if (!d.fileUrl) continue;
    try {
      const res = await fetch(d.fileUrl);
      if (!res.ok) continue;
      const arrayBuffer = await res.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const isPdf = d.fileUrl.toLowerCase().endsWith(".pdf") || (res.headers.get("content-type") || "").includes("pdf") || fileBuffer.subarray(0, 4).toString() === "%PDF";
      if (isPdf) {
        try {
          const srcPdf = await PDFLibDoc.load(fileBuffer, { ignoreEncryption: true });
          const pageIndices = srcPdf.getPageIndices();
          const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
          for (const page of copiedPages) {
            mergedPdf.addPage(page);
          }
          continue;
        } catch (pdfErr) {
          console.error(`Failed to load external PDF for doc ${d.id}:`, pdfErr);
        }
      }
      let embeddedImage = null;
      const isPng = d.fileUrl.toLowerCase().includes(".png") || fileBuffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
      try {
        if (isPng) {
          embeddedImage = await mergedPdf.embedPng(fileBuffer);
        } else {
          embeddedImage = await mergedPdf.embedJpg(fileBuffer);
        }
      } catch (e1) {
        try {
          embeddedImage = await mergedPdf.embedPng(fileBuffer);
        } catch (e2) {
          try {
            embeddedImage = await mergedPdf.embedJpg(fileBuffer);
          } catch (e3) {
            console.error(`Could not embed image format for doc ${d.id}:`, e3);
          }
        }
      }
      if (embeddedImage) {
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        const margin = 24;
        const baseWidth = 595.28;
        let targetWidth = baseWidth - margin * 2;
        let targetHeight = targetWidth * (imgHeight / imgWidth);
        let finalPageWidth = baseWidth;
        let finalPageHeight = targetHeight + margin * 2;
        if (finalPageHeight > 841.89) {
          finalPageHeight = 841.89;
          const maxContentHeight = finalPageHeight - margin * 2;
          targetWidth = maxContentHeight * (imgWidth / imgHeight);
          targetHeight = maxContentHeight;
          finalPageWidth = Math.max(baseWidth, targetWidth + margin * 2);
        }
        const page = mergedPdf.addPage([finalPageWidth, finalPageHeight]);
        const x = (finalPageWidth - targetWidth) / 2;
        const y = (finalPageHeight - targetHeight) / 2;
        page.drawImage(embeddedImage, {
          x,
          y,
          width: targetWidth,
          height: targetHeight
        });
      }
    } catch (err) {
      console.error(`Failed processing document ${d.id} for dossier:`, err);
    }
  }
  if (mergedPdf.getPageCount() === 0) {
    mergedPdf.addPage([595.28, 841.89]);
  }
  const pdfBytes = await mergedPdf.save();
  const buffer = Buffer.from(pdfBytes);
  return { buffer, fileName };
};
var HigherStudyService = {
  createCountry,
  getCountries,
  createGlobalUniversity,
  updateGlobalUniversity,
  deleteGlobalUniversity,
  restoreGlobalUniversity,
  getGlobalUniversities,
  getGlobalUniversityDetails,
  addUniversityDocRequirement,
  getUniversityDocRequirements,
  deleteUniversityDocRequirement,
  createGlobalProgram,
  getGlobalPrograms,
  applyForProgram,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  assignCounselor,
  addCounselorNote,
  uploadApplicationDocument,
  verifyDocument,
  addCustomDocument,
  assignPresetDocuments,
  deleteApplicationDocument,
  updateApplicationStage,
  issueOfferLetter,
  getOfferLetterDownload,
  toggleOfferLetterLock,
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug,
  deleteBlogPost,
  uploadUniversityCover,
  deleteUniversityImage,
  deleteApplication,
  getTrashApplications,
  restoreApplication,
  permanentDeleteApplication,
  emptyTrashApplications,
  applyPresetToApplication,
  generateApplicationDossierPDF,
  updateApplicationInformation,
  updateApplicationTracking,
  addApplicationInternalNote,
  deleteApplicationInternalNote
};

// src/app/module/higher-study/higher-study.controller.ts
var createCountry2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.createCountry(req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Country created successfully!",
    data: result
  });
});
var getCountries2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getCountries();
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Countries fetched successfully!",
    data: result
  });
});
var createGlobalUniversity2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.createGlobalUniversity(req.body);
    sendResponse(res, {
      statusCode: httpStatus19.CREATED,
      success: true,
      message: "Global university added successfully!",
      data: result
    });
  }
);
var updateGlobalUniversity2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.updateGlobalUniversity(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Global university updated successfully!",
      data: result
    });
  }
);
var deleteGlobalUniversity2 = catchAsync(
  async (req, res) => {
    const hardDelete = req.query.hard === "true";
    const result = await HigherStudyService.deleteGlobalUniversity(
      req.params.id,
      hardDelete
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: hardDelete ? "University permanently deleted!" : "University moved to trash!",
      data: result
    });
  }
);
var restoreGlobalUniversity2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.restoreGlobalUniversity(
      req.params.id
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "University restored from trash successfully!",
      data: result
    });
  }
);
var uploadUniversityCover2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.uploadUniversityCover(
      req.file
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "University cover uploaded to Cloudinary successfully!",
      data: result
    });
  }
);
var deleteUniversityImage2 = catchAsync(
  async (req, res) => {
    const payload = {
      publicId: req.body?.publicId || req.query?.publicId,
      imageUrl: req.body?.imageUrl || req.query?.imageUrl
    };
    const result = await HigherStudyService.deleteUniversityImage(payload);
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: result.message,
      data: null
    });
  }
);
var getGlobalUniversities2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.getGlobalUniversities(req.query);
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Global universities retrieved!",
      meta: result.meta,
      data: result.data
    });
  }
);
var getGlobalUniversityDetails2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.getGlobalUniversityDetails(
      req.params.id
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "University details retrieved!",
      data: result
    });
  }
);
var addUniversityDocRequirement2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.addUniversityDocRequirement(
      req.params.universityId,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus19.CREATED,
      success: true,
      message: "Document requirement added to university!",
      data: result
    });
  }
);
var getUniversityDocRequirements2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.getUniversityDocRequirements(
      req.params.universityId
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Document requirements fetched!",
      data: result
    });
  }
);
var deleteUniversityDocRequirement2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.deleteUniversityDocRequirement(
      req.params.reqId
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: result.message,
      data: null
    });
  }
);
var createGlobalProgram2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.createGlobalProgram(req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Global degree program added!",
    data: result
  });
});
var getGlobalPrograms2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getGlobalPrograms(req.query);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Global degree programs fetched!",
    meta: result.meta,
    data: result.data
  });
});
var applyForProgram2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const { programId } = req.body;
  const result = await HigherStudyService.applyForProgram(studentId, programId);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Higher study application created with checklist!",
    data: result
  });
});
var getMyApplications2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await HigherStudyService.getMyApplications(studentId);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Your applications retrieved successfully!",
    data: result
  });
});
var getAllApplications2 = catchAsync(async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.userId;
  const result = await HigherStudyService.getAllApplications(
    req.query,
    userRole,
    userId
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "All applications fetched successfully!",
    meta: result.meta,
    data: result.data
  });
});
var assignCounselor2 = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const { counselorId } = req.body;
  const result = await HigherStudyService.assignCounselor(
    applicationId,
    counselorId
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Counselor assigned successfully!",
    data: result
  });
});
var addCounselorNote2 = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const counselorUserId = req.user.userId;
  const result = await HigherStudyService.addCounselorNote(
    applicationId,
    counselorUserId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Note added to application!",
    data: result
  });
});
var uploadApplicationDocument2 = catchAsync(
  async (req, res) => {
    const documentId = req.params.documentId;
    const result = await HigherStudyService.uploadApplicationDocument(
      documentId,
      req.file
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Document uploaded to Cloudinary successfully!",
      data: result
    });
  }
);
var verifyDocument2 = catchAsync(async (req, res) => {
  const documentId = req.params.documentId;
  const adminUserId = req.user?.userId;
  const result = await HigherStudyService.verifyDocument(documentId, req.body, adminUserId);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: `Document status marked as ${req.body.status}!`,
    data: result
  });
});
var addCustomDocument2 = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const adminUserId = req.user?.userId;
  const result = await HigherStudyService.addCustomDocument(
    applicationId,
    req.body,
    adminUserId
  );
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Document requirement added successfully!",
    data: result
  });
});
var assignPresetDocuments2 = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const adminUserId = req.user?.userId;
  const { presetType, customTitles } = req.body;
  const result = await HigherStudyService.assignPresetDocuments(
    applicationId,
    presetType,
    customTitles,
    adminUserId
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Document preset assigned successfully!",
    data: result
  });
});
var deleteApplicationDocument2 = catchAsync(
  async (req, res) => {
    const documentId = req.params.documentId;
    const result = await HigherStudyService.deleteApplicationDocument(documentId);
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Document requirement deleted successfully!",
      data: result
    });
  }
);
var updateApplicationStage2 = catchAsync(
  async (req, res) => {
    const applicationId = req.params.applicationId;
    const result = await HigherStudyService.updateApplicationStage(
      applicationId,
      req.body.status
    );
    sendResponse(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: `Application stage updated to ${req.body.status}!`,
      data: result
    });
  }
);
var issueOfferLetter2 = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const result = await HigherStudyService.issueOfferLetter(
    applicationId,
    req.file
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Offer letter issued and uploaded!",
    data: result
  });
});
var downloadOfferLetter = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const studentUserId = req.user.userId;
  const result = await HigherStudyService.getOfferLetterDownload(
    applicationId,
    studentUserId
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Offer letter download URL retrieved!",
    data: result
  });
});
var toggleOfferLetterLock2 = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const { isOfferUnlocked } = req.body;
  const result = await HigherStudyService.toggleOfferLetterLock(
    applicationId,
    isOfferUnlocked
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: `Offer letter ${isOfferUnlocked ? "unlocked" : "locked"} successfully!`,
    data: result
  });
});
var createBlogPost2 = catchAsync(async (req, res) => {
  const authorId = req.user.userId;
  const result = await HigherStudyService.createBlogPost(authorId, req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Blog article published successfully!",
    data: result
  });
});
var getBlogPosts2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getBlogPosts(req.query);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Blog posts fetched successfully!",
    meta: result.meta,
    data: result.data
  });
});
var getBlogPostBySlug2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getBlogPostBySlug(
    req.params.slug
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Blog article retrieved successfully!",
    data: result
  });
});
var deleteBlogPost2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.deleteBlogPost(
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var deleteApplication2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await HigherStudyService.deleteApplication(
    req.params.id,
    user.role,
    user.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Application moved to trash successfully!",
    data: result
  });
});
var getTrashApplications2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getTrashApplications();
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Trash applications retrieved successfully!",
    data: result
  });
});
var restoreApplication2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.restoreApplication(
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Application restored from trash successfully!",
    data: result
  });
});
var permanentDeleteApplication2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.permanentDeleteApplication(
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Application permanently deleted from database!",
    data: result
  });
});
var emptyTrashApplications2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.emptyTrashApplications();
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: result.message,
    data: result
  });
});
var getChecklistPresets = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.getAllPresets();
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Checklist presets retrieved successfully!",
    data: result
  });
});
var createChecklistPreset = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.createPreset(req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Checklist preset bundle created successfully!",
    data: result
  });
});
var updateChecklistPreset = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.updatePreset(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Checklist preset updated successfully!",
    data: result
  });
});
var deleteChecklistPreset = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.deletePreset(
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var getChecklistItems = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.getAllItems();
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Checklist items retrieved successfully!",
    data: result
  });
});
var createChecklistItem = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.createItem(req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Checklist item created successfully!",
    data: result
  });
});
var updateChecklistItem = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.updateItem(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Checklist item updated successfully!",
    data: result
  });
});
var deleteChecklistItem = catchAsync(async (req, res) => {
  const result = await ChecklistPresetService.deleteItem(
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var applyPresetToApplication2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await HigherStudyService.applyPresetToApplication(
    req.params.applicationId,
    req.body,
    user.id
  );
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Checklist preset bundle applied to student application successfully!",
    data: result
  });
});
var getApplicationById2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getApplicationById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Application details fetched successfully!",
    data: result
  });
});
var downloadApplicationDossierPDF = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  const { documentIds, customTitle } = req.body || {};
  const { buffer, fileName } = await HigherStudyService.generateApplicationDossierPDF(applicationId, {
    documentIds,
    customTitle
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
  res.setHeader("Content-Length", buffer.length);
  res.end(buffer);
});
var updateApplicationInformation2 = catchAsync(async (req, res) => {
  const applicationId = req.params.id || req.params.applicationId;
  const result = await HigherStudyService.updateApplicationInformation(applicationId, req.body);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Application information updated successfully!",
    data: result
  });
});
var updateApplicationTracking2 = catchAsync(async (req, res) => {
  const applicationId = req.params.id || req.params.applicationId;
  const result = await HigherStudyService.updateApplicationTracking(applicationId, req.body);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Application tracking updated successfully!",
    data: result
  });
});
var addApplicationInternalNote2 = catchAsync(async (req, res) => {
  const applicationId = req.params.id || req.params.applicationId;
  const userId = req.user.userId;
  const result = await HigherStudyService.addApplicationInternalNote(applicationId, userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
    success: true,
    message: "Internal case note added successfully!",
    data: result
  });
});
var deleteApplicationInternalNote2 = catchAsync(async (req, res) => {
  const applicationId = req.params.id || req.params.applicationId;
  const noteId = req.params.noteId;
  const result = await HigherStudyService.deleteApplicationInternalNote(applicationId, noteId);
  sendResponse(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Internal case note deleted successfully!",
    data: result
  });
});
var HigherStudyController = {
  createCountry: createCountry2,
  getCountries: getCountries2,
  createGlobalUniversity: createGlobalUniversity2,
  updateGlobalUniversity: updateGlobalUniversity2,
  deleteGlobalUniversity: deleteGlobalUniversity2,
  restoreGlobalUniversity: restoreGlobalUniversity2,
  getGlobalUniversities: getGlobalUniversities2,
  getGlobalUniversityDetails: getGlobalUniversityDetails2,
  addUniversityDocRequirement: addUniversityDocRequirement2,
  getUniversityDocRequirements: getUniversityDocRequirements2,
  deleteUniversityDocRequirement: deleteUniversityDocRequirement2,
  createGlobalProgram: createGlobalProgram2,
  getGlobalPrograms: getGlobalPrograms2,
  applyForProgram: applyForProgram2,
  getMyApplications: getMyApplications2,
  getAllApplications: getAllApplications2,
  getApplicationById: getApplicationById2,
  downloadApplicationDossierPDF,
  assignCounselor: assignCounselor2,
  addCounselorNote: addCounselorNote2,
  uploadApplicationDocument: uploadApplicationDocument2,
  verifyDocument: verifyDocument2,
  addCustomDocument: addCustomDocument2,
  assignPresetDocuments: assignPresetDocuments2,
  deleteApplicationDocument: deleteApplicationDocument2,
  updateApplicationStage: updateApplicationStage2,
  issueOfferLetter: issueOfferLetter2,
  downloadOfferLetter,
  toggleOfferLetterLock: toggleOfferLetterLock2,
  createBlogPost: createBlogPost2,
  getBlogPosts: getBlogPosts2,
  getBlogPostBySlug: getBlogPostBySlug2,
  deleteBlogPost: deleteBlogPost2,
  uploadUniversityCover: uploadUniversityCover2,
  deleteUniversityImage: deleteUniversityImage2,
  deleteApplication: deleteApplication2,
  getTrashApplications: getTrashApplications2,
  restoreApplication: restoreApplication2,
  permanentDeleteApplication: permanentDeleteApplication2,
  emptyTrashApplications: emptyTrashApplications2,
  getChecklistPresets,
  createChecklistPreset,
  updateChecklistPreset,
  deleteChecklistPreset,
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  applyPresetToApplication: applyPresetToApplication2,
  updateApplicationInformation: updateApplicationInformation2,
  updateApplicationTracking: updateApplicationTracking2,
  addApplicationInternalNote: addApplicationInternalNote2,
  deleteApplicationInternalNote: deleteApplicationInternalNote2
};

// src/app/module/higher-study/higher-study.route.ts
var router8 = Router8();
router8.post(
  "/countries",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.createCountry
);
router8.get("/countries", HigherStudyController.getCountries);
router8.post(
  "/universities",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.createGlobalUniversity
);
router8.post(
  "/universities/upload-cover",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  upload.single("image"),
  HigherStudyController.uploadUniversityCover
);
router8.delete(
  "/universities/delete-image",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteUniversityImage
);
router8.patch(
  "/universities/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.updateGlobalUniversity
);
router8.delete(
  "/universities/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteGlobalUniversity
);
router8.patch(
  "/universities/:id/restore",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.restoreGlobalUniversity
);
router8.get("/universities", HigherStudyController.getGlobalUniversities);
router8.get(
  "/universities/:id",
  HigherStudyController.getGlobalUniversityDetails
);
router8.post(
  "/universities/:universityId/doc-requirements",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.addUniversityDocRequirement
);
router8.get(
  "/universities/:universityId/doc-requirements",
  HigherStudyController.getUniversityDocRequirements
);
router8.delete(
  "/doc-requirements/:reqId",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteUniversityDocRequirement
);
router8.post(
  "/programs",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.createGlobalProgram
);
router8.get("/programs", HigherStudyController.getGlobalPrograms);
router8.post(
  "/applications/apply",
  checkAuth("STUDENT"),
  checkStudentScope("HIGHER_STUDY"),
  HigherStudyController.applyForProgram
);
router8.get(
  "/applications/my",
  checkAuth("STUDENT"),
  checkStudentScope("HIGHER_STUDY"),
  HigherStudyController.getMyApplications
);
router8.get(
  "/applications",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.getAllApplications
);
router8.get(
  "/applications/trash",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.getTrashApplications
);
router8.delete(
  "/applications/trash/empty",
  checkAuth("SUPER_ADMIN"),
  HigherStudyController.emptyTrashApplications
);
router8.patch(
  "/applications/:id/restore",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.restoreApplication
);
router8.delete(
  "/applications/:id/permanent",
  checkAuth("SUPER_ADMIN"),
  HigherStudyController.permanentDeleteApplication
);
router8.delete(
  "/applications/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteApplication
);
router8.get(
  "/applications/:id",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  HigherStudyController.getApplicationById
);
router8.post(
  "/applications/:applicationId/download-dossier-pdf",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  HigherStudyController.downloadApplicationDossierPDF
);
router8.get(
  "/applications/:applicationId/download-dossier-pdf",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  HigherStudyController.downloadApplicationDossierPDF
);
router8.get(
  "/checklist-presets",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.getChecklistPresets
);
router8.post(
  "/checklist-presets",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.createChecklistPreset
);
router8.put(
  "/checklist-presets/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.updateChecklistPreset
);
router8.delete(
  "/checklist-presets/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteChecklistPreset
);
router8.get(
  "/checklist-items",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.getChecklistItems
);
router8.post(
  "/checklist-items",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.createChecklistItem
);
router8.put(
  "/checklist-items/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.updateChecklistItem
);
router8.delete(
  "/checklist-items/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteChecklistItem
);
router8.post(
  "/applications/:applicationId/apply-preset",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.applyPresetToApplication
);
router8.patch(
  "/applications/:applicationId/assign-counselor",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.assignCounselor
);
router8.post(
  "/applications/:applicationId/notes",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.addCounselorNote
);
router8.patch(
  "/applications/:id/information",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.updateApplicationInformation
);
router8.patch(
  "/applications/:id/tracking",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.updateApplicationTracking
);
router8.post(
  "/applications/:id/internal-notes",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.addApplicationInternalNote
);
router8.delete(
  "/applications/:id/internal-notes/:noteId",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteApplicationInternalNote
);
router8.post(
  "/documents/:documentId/upload",
  checkAuth("STUDENT"),
  checkStudentScope("HIGHER_STUDY"),
  upload.single("file"),
  HigherStudyController.uploadApplicationDocument
);
router8.patch(
  "/documents/:documentId/verify",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.verifyDocument
);
router8.post(
  "/applications/:applicationId/documents",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.addCustomDocument
);
router8.post(
  "/applications/:applicationId/assign-presets",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.assignPresetDocuments
);
router8.delete(
  "/documents/:documentId",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.deleteApplicationDocument
);
router8.patch(
  "/applications/:applicationId/stage",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  HigherStudyController.updateApplicationStage
);
router8.post(
  "/applications/:applicationId/issue-offer-letter",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  upload.single("file"),
  HigherStudyController.issueOfferLetter
);
router8.get(
  "/applications/:applicationId/download-offer-letter",
  checkAuth("STUDENT"),
  HigherStudyController.downloadOfferLetter
);
router8.patch(
  "/applications/:applicationId/toggle-offer-lock",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.toggleOfferLetterLock
);
router8.post(
  "/blogs",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.createBlogPost
);
router8.get("/blogs", HigherStudyController.getBlogPosts);
router8.get("/blogs/:slug", HigherStudyController.getBlogPostBySlug);
router8.delete(
  "/blogs/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.deleteBlogPost
);
var HigherStudyRoutes = router8;

// src/app/module/notification/notification.route.ts
import { Router as Router9 } from "express";

// src/app/module/notification/notification.controller.ts
import httpStatus20 from "http-status";

// src/app/module/notification/notification.service.ts
var createNotification = async (payload) => {
  const notification = await prisma.notification.create({
    data: {
      title: payload.title,
      body: payload.body,
      audience: payload.audience,
      priority: payload.priority || "INFO",
      userId: payload.userId,
      actionUrl: payload.actionUrl
    }
  });
  return notification;
};
var getMyNotifications = async (userId, userScope) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3);
  try {
    await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: threeDaysAgo }
      }
    });
  } catch (cleanupErr) {
    console.error("Failed to auto-cleanup expired notifications:", cleanupErr?.message);
  }
  const whereConditions = {
    createdAt: { gte: threeDaysAgo },
    OR: [{ userId }, { userId: null }]
  };
  if (userScope === "ACADEMIC_ONLY") {
    whereConditions.audience = { in: ["ACADEMIC", "ALL"] };
  } else if (userScope === "HIGHER_STUDY_ONLY") {
    whereConditions.audience = { in: ["HIGHER_STUDY", "ALL"] };
  }
  const notifications = await prisma.notification.findMany({
    where: whereConditions,
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return notifications;
};
var markNotificationAsRead = async (notificationId) => {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
  return notification;
};
var markAllNotificationsAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      OR: [{ userId }, { userId: null }],
      isRead: false
    },
    data: { isRead: true }
  });
  return result;
};
var NotificationService = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};

// src/app/module/notification/notification.controller.ts
var createNotification2 = catchAsync(async (req, res) => {
  const result = await NotificationService.createNotification(req.body);
  sendResponse(res, {
    statusCode: httpStatus20.CREATED,
    success: true,
    message: "Notification created & broadcasted successfully!",
    data: result
  });
});
var getMyNotifications2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const userScope = req.user.accessScope;
  const result = await NotificationService.getMyNotifications(
    userId,
    userScope
  );
  sendResponse(res, {
    statusCode: httpStatus20.OK,
    success: true,
    message: "Targeted notifications retrieved successfully!",
    data: result
  });
});
var markNotificationAsRead2 = catchAsync(
  async (req, res) => {
    const notificationId = req.params.id;
    const result = await NotificationService.markNotificationAsRead(notificationId);
    sendResponse(res, {
      statusCode: httpStatus20.OK,
      success: true,
      message: "Notification marked as read!",
      data: result
    });
  }
);
var markAllNotificationsAsRead2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const result = await NotificationService.markAllNotificationsAsRead(userId);
    sendResponse(res, {
      statusCode: httpStatus20.OK,
      success: true,
      message: "All notifications marked as read!",
      data: result
    });
  }
);
var NotificationController = {
  createNotification: createNotification2,
  getMyNotifications: getMyNotifications2,
  markNotificationAsRead: markNotificationAsRead2,
  markAllNotificationsAsRead: markAllNotificationsAsRead2
};

// src/app/module/notification/notification.route.ts
var router9 = Router9();
router9.post(
  "/broadcast",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  NotificationController.createNotification
);
router9.get(
  "/my",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR", "STUDENT"),
  NotificationController.getMyNotifications
);
router9.patch(
  "/mark-all-read",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR", "STUDENT"),
  NotificationController.markAllNotificationsAsRead
);
router9.patch(
  "/:id/read",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR", "STUDENT"),
  NotificationController.markNotificationAsRead
);
var NotificationRoutes = router9;

// src/app/module/payment/payment.route.ts
import { Router as Router10 } from "express";

// src/app/module/payment/payment.controller.ts
import httpStatus22 from "http-status";

// src/app/module/payment/payment.service.ts
import httpStatus21 from "http-status";
import PDFDocument2 from "pdfkit";

// src/app/lib/stripe.ts
import Stripe from "stripe";
var stripe = new Stripe(config_default.stripe_secret_key, {
  apiVersion: "2025-02-24.acacia",
  typescript: true
});

// src/app/module/payment/payment.service.ts
var createCheckoutSession = async (studentId, userEmail, payload) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true }
  });
  if (!student) {
    throw new AppError(httpStatus21.NOT_FOUND, "Student profile not found!");
  }
  let payment = null;
  if (payload.paymentId) {
    payment = await prisma.payment.findUnique({
      where: { id: payload.paymentId }
    });
  }
  if (!payment && payload.higherStudyApplicationId) {
    payment = await prisma.payment.findFirst({
      where: {
        higherStudyApplicationId: payload.higherStudyApplicationId,
        status: "PENDING"
      },
      orderBy: { createdAt: "desc" }
    });
  }
  if (payment) {
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        amount: payload.amount || payment.amount,
        description: payload.description || payment.description
      }
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        studentId,
        amount: payload.amount,
        currency: "USD",
        paymentType: payload.paymentType,
        status: "PENDING",
        description: payload.description || `${payload.paymentType.replace("_", " ")} Payment`,
        semesterId: payload.semesterId,
        higherStudyApplicationId: payload.higherStudyApplicationId
      }
    });
  }
  const cleanTitle = (payment.description || "Tuition Deposit & Admission Clearance").trim();
  let sessionUrl = `https://checkout.stripe.com/pay/cs_test_${payment.id}`;
  let sessionId = `cs_test_${payment.id}`;
  try {
    if (config_default.stripe_secret_key && !config_default.stripe_secret_key.includes("placeholder")) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${cleanTitle} \u2014 Rise Abroad Education`,
                description: "Official Admission & Higher Study Processing Clearance"
              },
              unit_amount: Math.round(Number(payment.amount) * 100)
              // in cents
            },
            quantity: 1
          }
        ],
        mode: "payment",
        customer_email: userEmail,
        client_reference_id: payment.id,
        metadata: {
          paymentId: payment.id,
          higherStudyApplicationId: payload.higherStudyApplicationId || "",
          studentId: student.id
        },
        success_url: `${config_default.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
        cancel_url: `${config_default.frontend_url}/dashboard?tab=APPLICATIONS&subTab=PAYMENT`
      });
      sessionUrl = session.url || sessionUrl;
      sessionId = session.id;
    }
  } catch (err) {
    console.log(
      "Stripe Session Warning (Using mock session URL for testing):",
      err.message
    );
  }
  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: sessionId }
  });
  return {
    paymentId: payment.id,
    checkoutUrl: sessionUrl,
    amount: payload.amount,
    currency: "USD"
  };
};
var handleStripeWebhook = async (rawBody, signature) => {
  let event;
  try {
    if (signature && config_default.stripe_webhook_secret && !config_default.stripe_webhook_secret.includes("placeholder")) {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config_default.stripe_webhook_secret
      );
    } else {
      event = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString());
    }
  } catch (err) {
    throw new AppError(httpStatus21.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paymentId = session.client_reference_id;
    if (paymentId) {
      const updated = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: /* @__PURE__ */ new Date(),
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : void 0
        }
      });
      if (updated.higherStudyApplicationId) {
        await prisma.higherStudyApplication.update({
          where: { id: updated.higherStudyApplicationId },
          data: {
            isFeePaid: true,
            isOfferUnlocked: true
          }
        });
      }
    }
  }
  return { received: true };
};
var verifyCheckoutSession = async (sessionId, paymentId) => {
  let session = null;
  if (config_default.stripe_secret_key && !config_default.stripe_secret_key.includes("placeholder")) {
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.warn("Could not retrieve stripe session directly:", err.message);
    }
  }
  const targetPaymentId = paymentId || session?.client_reference_id;
  if (!targetPaymentId) {
    throw new AppError(httpStatus21.NOT_FOUND, "Payment reference not found!");
  }
  const payment = await prisma.payment.findUnique({
    where: { id: targetPaymentId },
    include: { student: { include: { user: true } } }
  });
  if (!payment) {
    throw new AppError(httpStatus21.NOT_FOUND, "Payment record not found!");
  }
  const isPaidInStripe = session ? session.payment_status === "paid" : true;
  if (isPaidInStripe) {
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: /* @__PURE__ */ new Date(),
        stripeSessionId: sessionId,
        stripePaymentIntentId: typeof session?.payment_intent === "string" ? session.payment_intent : void 0
      }
    });
    if (payment.higherStudyApplicationId) {
      await prisma.higherStudyApplication.update({
        where: { id: payment.higherStudyApplicationId },
        data: {
          isFeePaid: true,
          isOfferUnlocked: true
        }
      });
    }
    return { verified: true, payment: updated };
  }
  return { verified: false, status: payment.status };
};
var getMyPaymentHistory = async (studentId) => {
  const payments = await prisma.payment.findMany({
    where: { studentId },
    include: { semester: true },
    orderBy: { createdAt: "desc" }
  });
  return payments;
};
var generatePaymentReceiptPDF = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: { include: { user: true, department: true } },
      semester: true
    }
  });
  if (!payment) {
    throw new AppError(httpStatus21.NOT_FOUND, "Payment record not found!");
  }
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument2({ margin: 45 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
    doc.fontSize(22).text("OFFICIAL PAYMENT RECEIPT", { align: "center", underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text("Rise Abroad Education", { align: "center" });
    doc.moveDown(1.5);
    doc.fontSize(11).text(`Receipt No: ${payment.id}`);
    doc.text(
      `Payment Date: ${payment.paidAt ? payment.paidAt.toLocaleDateString() : (/* @__PURE__ */ new Date()).toLocaleDateString()}`
    );
    doc.text(`Payment Status: ${payment.status}`);
    doc.text(`Payment Type: ${payment.paymentType.replace("_", " ")}`);
    doc.moveDown(1);
    doc.moveTo(45, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(12).font("Helvetica-Bold").text("Student Information:");
    doc.font("Helvetica").fontSize(11);
    doc.text(`Name: ${payment.student.user.name}`);
    doc.text(`Student ID: ${payment.student.studentId}`);
    doc.text(`Email: ${payment.student.user.email}`);
    doc.text(`Department: ${payment.student.department?.name || "General"}`);
    doc.moveDown(1);
    doc.moveTo(45, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(12).font("Helvetica-Bold").text("Payment Breakdown:");
    doc.font("Helvetica").fontSize(11);
    doc.text(`Description: ${payment.description || "University Tuition Fee"}`);
    if (payment.semester) {
      doc.text(`Semester: ${payment.semester.name}`);
    }
    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold").text(`Total Amount Paid: $${payment.amount} ${payment.currency}`, {
      align: "right"
    });
    doc.moveDown(3);
    doc.fontSize(10).font("Helvetica-Oblique").text(
      "This is an electronically generated official receipt verified by Stripe.",
      {
        align: "center"
      }
    );
    doc.end();
  });
};
var createApplicationInvoice = async (payload, adminUserId) => {
  const app2 = await prisma.higherStudyApplication.findUnique({
    where: { id: payload.higherStudyApplicationId },
    include: { student: { include: { user: true } } }
  });
  if (!app2) {
    throw new AppError(httpStatus21.NOT_FOUND, "Application not found!");
  }
  const payment = await prisma.payment.create({
    data: {
      studentId: app2.studentId,
      higherStudyApplicationId: app2.id,
      amount: payload.amount,
      currency: payload.currency || "USD",
      paymentType: payload.paymentType || "OFFER_DEPOSIT",
      status: "PENDING",
      description: payload.description || "Tuition Deposit & Admission Clearance"
    }
  });
  await prisma.notification.create({
    data: {
      userId: app2.student.userId,
      title: `New Payment Invoice Issued: ${payment.currency} ${payment.amount}`,
      body: `Admissions Desk has issued an invoice for '${payment.description}'. You can pay online via Stripe or bank transfer.`,
      audience: "HIGHER_STUDY",
      priority: "CRITICAL_ALERT"
    }
  });
  try {
    let room = await prisma.chatRoom.findFirst({
      where: { studentUserId: app2.student.userId }
    });
    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          studentUserId: app2.student.userId,
          applicationId: app2.id,
          mode: "COLLABORATIVE_GROUP"
        }
      });
    }
    await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: adminUserId || app2.student.userId,
        message: `\u{1F4B3} Payment Invoice Issued: Admissions Desk has issued a payable invoice of ${payment.currency} ${payment.amount} for '${payment.description}'. Please visit Payment & Invoices to complete checkout.`,
        senderDisplayName: "System Notification",
        senderRoleBadge: "[SYSTEM]"
      }
    });
  } catch (err) {
    console.error("Failed to send chat invoice notification:", err?.message);
  }
  return payment;
};
var deletePendingInvoice = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  });
  if (!payment) {
    throw new AppError(httpStatus21.NOT_FOUND, "Invoice record not found!");
  }
  if (payment.status === "PAID") {
    throw new AppError(
      httpStatus21.FORBIDDEN,
      "Paid invoices cannot be deleted for audit and financial record safety!"
    );
  }
  await prisma.payment.delete({
    where: { id: paymentId }
  });
  return { message: "Pending invoice deleted successfully!" };
};
var updatePendingInvoice = async (paymentId, payload) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  });
  if (!payment) {
    throw new AppError(httpStatus21.NOT_FOUND, "Invoice record not found!");
  }
  if (payment.status === "PAID") {
    throw new AppError(
      httpStatus21.FORBIDDEN,
      "Paid invoices cannot be modified for audit and financial record safety!"
    );
  }
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...payload.description && { description: payload.description },
      ...payload.amount !== void 0 && { amount: Number(payload.amount) },
      ...payload.currency && { currency: payload.currency }
    }
  });
  return updated;
};
var PaymentService = {
  createCheckoutSession,
  handleStripeWebhook,
  verifyCheckoutSession,
  getMyPaymentHistory,
  generatePaymentReceiptPDF,
  createApplicationInvoice,
  deletePendingInvoice,
  updatePendingInvoice
};

// src/app/module/payment/payment.controller.ts
var createCheckoutSession2 = catchAsync(
  async (req, res) => {
    const studentId = req.user.studentId;
    const userEmail = req.user.email;
    const result = await PaymentService.createCheckoutSession(
      studentId,
      userEmail,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus22.OK,
      success: true,
      message: "Stripe checkout session initialized!",
      data: result
    });
  }
);
var handleStripeWebhook2 = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const result = await PaymentService.handleStripeWebhook(req.body, sig);
  res.status(httpStatus22.OK).json(result);
});
var getMyPaymentHistory2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await PaymentService.getMyPaymentHistory(studentId);
  sendResponse(res, {
    statusCode: httpStatus22.OK,
    success: true,
    message: "Payment history fetched successfully!",
    data: result
  });
});
var downloadPaymentReceiptPDF = catchAsync(
  async (req, res) => {
    const paymentId = req.params.paymentId;
    const pdfBuffer = await PaymentService.generatePaymentReceiptPDF(paymentId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="receipt_${paymentId}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  }
);
var verifyCheckoutSession2 = catchAsync(async (req, res) => {
  const { sessionId, paymentId } = req.body;
  const result = await PaymentService.verifyCheckoutSession(
    sessionId,
    paymentId
  );
  sendResponse(res, {
    statusCode: httpStatus22.OK,
    success: true,
    message: "Stripe payment verified successfully!",
    data: result
  });
});
var createApplicationInvoice2 = catchAsync(
  async (req, res) => {
    const adminUserId = req.user?.userId;
    const result = await PaymentService.createApplicationInvoice(
      req.body,
      adminUserId
    );
    sendResponse(res, {
      statusCode: httpStatus22.CREATED,
      success: true,
      message: "Invoice created and notified successfully!",
      data: result
    });
  }
);
var deletePendingInvoice2 = catchAsync(
  async (req, res) => {
    const paymentId = req.params.id;
    const result = await PaymentService.deletePendingInvoice(paymentId);
    sendResponse(res, {
      statusCode: httpStatus22.OK,
      success: true,
      message: result.message,
      data: null
    });
  }
);
var updatePendingInvoice2 = catchAsync(
  async (req, res) => {
    const paymentId = req.params.id;
    const result = await PaymentService.updatePendingInvoice(paymentId, req.body);
    sendResponse(res, {
      statusCode: httpStatus22.OK,
      success: true,
      message: "Invoice updated successfully!",
      data: result
    });
  }
);
var PaymentController = {
  createCheckoutSession: createCheckoutSession2,
  handleStripeWebhook: handleStripeWebhook2,
  verifyCheckoutSession: verifyCheckoutSession2,
  getMyPaymentHistory: getMyPaymentHistory2,
  downloadPaymentReceiptPDF,
  createApplicationInvoice: createApplicationInvoice2,
  deletePendingInvoice: deletePendingInvoice2,
  updatePendingInvoice: updatePendingInvoice2
};

// src/app/module/payment/payment.route.ts
var router10 = Router10();
router10.post(
  "/create-checkout-session",
  checkAuth("STUDENT"),
  PaymentController.createCheckoutSession
);
router10.post("/webhook", PaymentController.handleStripeWebhook);
router10.post(
  "/verify-session",
  checkAuth("STUDENT", "ADMIN", "SUPER_ADMIN"),
  PaymentController.verifyCheckoutSession
);
router10.get(
  "/my-history",
  checkAuth("STUDENT"),
  PaymentController.getMyPaymentHistory
);
router10.post(
  "/invoices",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  PaymentController.createApplicationInvoice
);
router10.delete(
  "/invoices/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  PaymentController.deletePendingInvoice
);
router10.patch(
  "/invoices/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  PaymentController.updatePendingInvoice
);
router10.get(
  "/receipt/:paymentId",
  checkAuth("STUDENT", "ADMIN", "SUPER_ADMIN"),
  PaymentController.downloadPaymentReceiptPDF
);
var PaymentRoutes = router10;

// src/app/module/user/user.route.ts
import { Router as Router11 } from "express";

// src/app/module/user/user.controller.ts
import httpStatus24 from "http-status";

// src/app/module/user/user.service.ts
import bcrypt2 from "bcryptjs";
import httpStatus23 from "http-status";
var getMe = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { updatedAt: /* @__PURE__ */ new Date() },
    include: {
      student: true,
      counselor: true
    }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus23.NOT_FOUND, "User profile not found!");
  }
  return user;
};
var updateMe = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true, counselor: true }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus23.NOT_FOUND, "User not found!");
  }
  const result = await prisma.$transaction(async (tx) => {
    const userUpdateData = {};
    if (payload.name) userUpdateData.name = payload.name;
    if (payload.contactNumber !== void 0) userUpdateData.contactNumber = payload.contactNumber;
    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }
    if (user.role === "STUDENT" && user.student) {
      await tx.student.update({
        where: { id: user.student.id },
        data: {
          contactNumber: payload.contactNumber,
          address: payload.address,
          gender: payload.gender,
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : void 0
        }
      });
    }
    if (user.role === "COUNSELOR" && user.counselor) {
      await tx.counselor.update({
        where: { id: user.counselor.id },
        data: {
          contactNumber: payload.contactNumber,
          designation: payload.designation,
          specialization: payload.specialization
        }
      });
    }
    return tx.user.findUnique({
      where: { id: userId },
      include: { student: true, counselor: true }
    });
  });
  return result;
};
var updateProfileImage = async (userId, file) => {
  if (!file) {
    throw new AppError(httpStatus23.BAD_REQUEST, "Please upload an image file!");
  }
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "university/avatars" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id
    }
  });
  return updated;
};
var createAdmin = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (isUserExists) {
    throw new AppError(httpStatus23.CONFLICT, "User with this email already exists!");
  }
  const password = payload.password || "Admin12345!";
  const hashedPassword = await bcrypt2.hash(password, config_default.bcrypt_salt_rounds);
  const admin = await prisma.user.create({
    data: {
      name: payload.name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
      authProvider: "CREDENTIAL"
    }
  });
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status
  };
};
var deleteAdmin = async (adminId) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin) {
    throw new AppError(httpStatus23.NOT_FOUND, "Admin not found!");
  }
  if (admin.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus23.FORBIDDEN,
      "Cannot delete the Super Admin account!"
    );
  }
  if (admin.role !== "ADMIN") {
    throw new AppError(httpStatus23.BAD_REQUEST, "Target user is not an Admin!");
  }
  await prisma.user.delete({ where: { id: adminId } });
  return { message: "Admin account deleted successfully!" };
};
var createCounselor = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (isUserExists) {
    throw new AppError(httpStatus23.CONFLICT, "User with this email already exists!");
  }
  const password = payload.password || "Counselor123!";
  const hashedPassword = await bcrypt2.hash(password, config_default.bcrypt_salt_rounds);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: payload.name,
        email,
        password: hashedPassword,
        role: "COUNSELOR",
        status: "ACTIVE",
        isEmailVerified: true,
        authProvider: "CREDENTIAL"
      }
    });
    const counselor = await tx.counselor.create({
      data: {
        userId: user.id,
        counselorId: `CNS-${Date.now().toString().slice(-4)}`,
        designation: payload.designation || "Study Abroad Counselor",
        contactNumber: payload.contactNumber,
        specialization: payload.specialization || "Global Admissions"
      }
    });
    return { user, counselor };
  });
  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
    counselorId: result.counselor.counselorId,
    designation: result.counselor.designation
  };
};
var customCreateUser = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (isUserExists) {
    throw new AppError(httpStatus23.CONFLICT, "User with this email already exists!");
  }
  const hashedPassword = await bcrypt2.hash(
    payload.password,
    config_default.bcrypt_salt_rounds
  );
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email,
      password: hashedPassword,
      role: payload.role,
      status: "ACTIVE",
      isEmailVerified: true,
      authProvider: "CREDENTIAL"
    }
  });
  if (payload.role === "STUDENT") {
    await prisma.student.create({
      data: {
        userId: user.id,
        studentId: `STU-${Date.now().toString().slice(-4)}`,
        accessScope: "BOTH"
      }
    });
  } else if (payload.role === "COUNSELOR") {
    await prisma.counselor.create({
      data: {
        userId: user.id,
        counselorId: `CNS-${Date.now().toString().slice(-4)}`,
        designation: "Study Abroad Counselor"
      }
    });
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
};
var adminResetUserPassword = async (requesterRole, payload) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: payload.userId }
  });
  if (!targetUser) {
    throw new AppError(httpStatus23.NOT_FOUND, "Target user not found!");
  }
  if (requesterRole === "ADMIN") {
    if (targetUser.role === "SUPER_ADMIN" || targetUser.role === "ADMIN") {
      throw new AppError(
        httpStatus23.FORBIDDEN,
        "Admins cannot reset passwords of Super Admins or peer Admins!"
      );
    }
  }
  if (payload.sendResetEmail) {
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        otpCode: otp,
        otpExpiresAt,
        otpType: "PASSWORD_RESET"
      }
    });
    await sendPasswordResetOtpEmail(targetUser.email, targetUser.name, otp);
    return {
      message: `Password reset OTP has been sent to ${targetUser.email}`
    };
  }
  if (!payload.newPassword) {
    throw new AppError(
      httpStatus23.BAD_REQUEST,
      "Please provide a newPassword or set sendResetEmail to true!"
    );
  }
  const hashedPassword = await bcrypt2.hash(
    payload.newPassword,
    config_default.bcrypt_salt_rounds
  );
  await prisma.user.update({
    where: { id: targetUser.id },
    data: {
      password: hashedPassword,
      otpCode: null,
      otpExpiresAt: null,
      otpType: null
    }
  });
  return {
    message: `Password for ${targetUser.email} has been updated successfully!`
  };
};
var deleteUser = async (requesterRole, userId) => {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new AppError(httpStatus23.NOT_FOUND, "User not found!");
  }
  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus23.FORBIDDEN,
      "Super Admin account cannot be deleted!"
    );
  }
  if (requesterRole === "ADMIN") {
    if (targetUser.role === "ADMIN") {
      throw new AppError(
        httpStatus23.FORBIDDEN,
        "Admins cannot delete other Admins!"
      );
    }
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      status: "DELETED",
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return { message: "User deleted successfully!" };
};
var updateUserStatus = async (requesterRole, userId, status) => {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new AppError(httpStatus23.NOT_FOUND, "User not found!");
  }
  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus23.FORBIDDEN,
      "Cannot modify status of Super Admin!"
    );
  }
  if (requesterRole === "ADMIN" && targetUser.role === "ADMIN") {
    throw new AppError(
      httpStatus23.FORBIDDEN,
      "Admins cannot modify status of other Admins!"
    );
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status }
  });
  return updated;
};
var updateUserRole = async (requesterRole, userId, newRole) => {
  if (requesterRole !== "SUPER_ADMIN") {
    throw new AppError(
      httpStatus23.FORBIDDEN,
      "Only Super Admin can change user roles!"
    );
  }
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true, counselor: true }
  });
  if (!targetUser) {
    throw new AppError(httpStatus23.NOT_FOUND, "User not found!");
  }
  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus23.FORBIDDEN,
      "Cannot modify role of Super Admin!"
    );
  }
  if (newRole === "STUDENT" && !targetUser.student) {
    await prisma.student.create({
      data: {
        userId: targetUser.id,
        studentId: `STU-${Date.now().toString().slice(-4)}`
      }
    });
  }
  if (newRole === "COUNSELOR" && !targetUser.counselor) {
    await prisma.counselor.create({
      data: {
        userId: targetUser.id,
        counselorId: `CNS-${Date.now().toString().slice(-4)}`
      }
    });
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    include: { student: true, counselor: true }
  });
  return updated;
};
var getAllUsers = async (query, requesterRole) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 100;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "updatedAt";
  const sortOrder = query.sortOrder || "desc";
  const whereConditions = {
    isDeleted: false
  };
  if (requesterRole === "ADMIN") {
    if (query.role && query.role !== "SUPER_ADMIN") {
      whereConditions.role = query.role;
    } else {
      whereConditions.role = {
        not: "SUPER_ADMIN"
      };
    }
  } else if (query.role) {
    whereConditions.role = query.role;
  }
  if (query.status) {
    whereConditions.status = query.status;
  }
  if (query.searchTerm) {
    whereConditions.OR = [
      { name: { contains: query.searchTerm, mode: "insensitive" } },
      { email: { contains: query.searchTerm, mode: "insensitive" } }
    ];
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { student: true, counselor: true }
    }),
    prisma.user.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: users
  };
};
var UserService = {
  getMe,
  updateMe,
  updateProfileImage,
  createAdmin,
  deleteAdmin,
  createCounselor,
  customCreateUser,
  adminResetUserPassword,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getAllUsers
};

// src/app/module/user/user.controller.ts
var getMe2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserService.getMe(userId);
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: "User profile fetched successfully!",
    data: result
  });
});
var updateMe2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserService.updateMe(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: "User profile updated successfully!",
    data: result
  });
});
var updateProfileImage2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserService.updateProfileImage(
    userId,
    req.file
  );
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: "Profile image updated successfully!",
    data: result
  });
});
var createAdmin2 = catchAsync(async (req, res) => {
  const result = await UserService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus24.CREATED,
    success: true,
    message: "Admin account created successfully!",
    data: result
  });
});
var deleteAdmin2 = catchAsync(async (req, res) => {
  const result = await UserService.deleteAdmin(req.params.adminId);
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var createCounselor2 = catchAsync(async (req, res) => {
  const result = await UserService.createCounselor(req.body);
  sendResponse(res, {
    statusCode: httpStatus24.CREATED,
    success: true,
    message: "Counselor account created successfully!",
    data: result
  });
});
var customCreateUser2 = catchAsync(async (req, res) => {
  const result = await UserService.customCreateUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus24.CREATED,
    success: true,
    message: "Custom user created successfully!",
    data: result
  });
});
var adminResetUserPassword2 = catchAsync(
  async (req, res) => {
    const requesterRole = req.user.role;
    const result = await UserService.adminResetUserPassword(
      requesterRole,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus24.OK,
      success: true,
      message: result.message,
      data: null
    });
  }
);
var deleteUser2 = catchAsync(async (req, res) => {
  const requesterRole = req.user.role;
  const result = await UserService.deleteUser(
    requesterRole,
    req.params.userId
  );
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var updateUserStatus2 = catchAsync(async (req, res) => {
  const requesterRole = req.user.role;
  const result = await UserService.updateUserStatus(
    requesterRole,
    req.params.userId,
    req.body.status
  );
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: "User status updated successfully!",
    data: result
  });
});
var updateUserRole2 = catchAsync(async (req, res) => {
  const requesterRole = req.user.role;
  const result = await UserService.updateUserRole(
    requesterRole,
    req.params.userId,
    req.body.role
  );
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: `User role updated successfully to ${req.body.role}!`,
    data: result
  });
});
var getAllUsers2 = catchAsync(async (req, res) => {
  const requesterRole = req.user.role;
  const result = await UserService.getAllUsers(req.query, requesterRole);
  sendResponse(res, {
    statusCode: httpStatus24.OK,
    success: true,
    message: "Users fetched successfully!",
    meta: result.meta,
    data: result.data
  });
});
var UserController = {
  getMe: getMe2,
  updateMe: updateMe2,
  updateProfileImage: updateProfileImage2,
  createAdmin: createAdmin2,
  deleteAdmin: deleteAdmin2,
  createCounselor: createCounselor2,
  customCreateUser: customCreateUser2,
  adminResetUserPassword: adminResetUserPassword2,
  deleteUser: deleteUser2,
  updateUserStatus: updateUserStatus2,
  updateUserRole: updateUserRole2,
  getAllUsers: getAllUsers2
};

// src/app/module/user/user.route.ts
var router11 = Router11();
router11.get(
  "/me",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  UserController.getMe
);
router11.patch(
  "/me",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  UserController.updateMe
);
router11.patch(
  "/profile-image",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"),
  upload.single("image"),
  UserController.updateProfileImage
);
router11.post("/create-admin", checkAuth("SUPER_ADMIN"), UserController.createAdmin);
router11.delete("/admin/:adminId", checkAuth("SUPER_ADMIN"), UserController.deleteAdmin);
router11.post("/custom-create", checkAuth("SUPER_ADMIN"), UserController.customCreateUser);
router11.post(
  "/create-counselor",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  UserController.createCounselor
);
router11.post(
  "/reset-user-password",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  UserController.adminResetUserPassword
);
router11.patch(
  "/:userId/status",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  UserController.updateUserStatus
);
router11.patch(
  "/:userId/role",
  checkAuth("SUPER_ADMIN"),
  UserController.updateUserRole
);
router11.delete(
  "/:userId",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  UserController.deleteUser
);
router11.get("/", checkAuth("SUPER_ADMIN", "ADMIN"), UserController.getAllUsers);
var UserRoutes = router11;

// src/app/module/commission/commission.route.ts
import { Router as Router12 } from "express";

// src/app/module/commission/commission.controller.ts
import httpStatus26 from "http-status";

// src/app/module/commission/commission.service.ts
import httpStatus25 from "http-status";
var createCommission = async (payload) => {
  const student = await prisma.student.findUnique({
    where: { id: payload.studentId },
    include: { user: true }
  });
  if (!student) {
    throw new AppError(httpStatus25.NOT_FOUND, "Student not found!");
  }
  const agentUser = await prisma.user.findUnique({
    where: { id: payload.referredByUserId },
    include: { counselor: true }
  });
  if (!agentUser) {
    throw new AppError(httpStatus25.NOT_FOUND, "Referred agent user not found!");
  }
  const gross = Number(payload.grossAmount);
  const vatPct = Number(
    payload.vatPercentage !== void 0 ? payload.vatPercentage : agentUser.counselor?.defaultVatPercentage || 10
  );
  const companyPct = Number(
    payload.companySharePercentage !== void 0 ? payload.companySharePercentage : agentUser.counselor?.defaultCompanySharePercentage || 10
  );
  const fxRate = Number(payload.exchangeRateToBDT || 135);
  const vatAmount = gross * vatPct / 100;
  const companyShareAmount = gross * companyPct / 100;
  const netAmount = Math.max(0, gross - vatAmount - companyShareAmount);
  const netAmountBDT = netAmount * fxRate;
  const grossAmountBDT = gross * fxRate;
  const companyShareAmountBDT = companyShareAmount * fxRate;
  const commission = await prisma.agencyCommission.create({
    data: {
      studentId: payload.studentId,
      referredByUserId: payload.referredByUserId,
      universityName: payload.universityName,
      grossAmount: gross,
      currency: payload.currency || "EUR",
      vatPercentage: vatPct,
      vatAmount,
      companySharePercentage: companyPct,
      companyShareAmount,
      companyShareAmountBDT,
      netAmount,
      exchangeRateToBDT: fxRate,
      netAmountBDT,
      grossAmountBDT,
      notes: payload.notes,
      applicationId: payload.applicationId,
      status: "PENDING"
    },
    include: {
      referredByUser: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  return commission;
};
var updateCommissionStatus = async (id, status, notes) => {
  const commission = await prisma.agencyCommission.findUnique({ where: { id } });
  if (!commission) {
    throw new AppError(httpStatus25.NOT_FOUND, "Commission record not found!");
  }
  const updated = await prisma.agencyCommission.update({
    where: { id },
    data: {
      status,
      withdrawnAt: status === "WITHDRAWN" ? /* @__PURE__ */ new Date() : commission.withdrawnAt,
      notes: notes || commission.notes
    },
    include: {
      referredByUser: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  return updated;
};
var assignStudentReferral = async (studentId, referredByUserId) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new AppError(httpStatus25.NOT_FOUND, "Student not found!");
  }
  const agent = await prisma.user.findUnique({ where: { id: referredByUserId } });
  if (!agent) {
    throw new AppError(httpStatus25.NOT_FOUND, "Agent/Counselor user not found!");
  }
  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { referredByUserId },
    include: { referredByUser: { select: { id: true, name: true, role: true } } }
  });
  return updated;
};
var updateCounselorVisibilityMode = async (counselorId, payload) => {
  const counselor = await prisma.counselor.findUnique({ where: { id: counselorId } });
  if (!counselor) {
    throw new AppError(httpStatus25.NOT_FOUND, "Counselor not found!");
  }
  const updated = await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      commissionVisibilityMode: payload.mode,
      defaultVatPercentage: payload.defaultVatPercentage !== void 0 ? payload.defaultVatPercentage : counselor.defaultVatPercentage,
      defaultCompanySharePercentage: payload.defaultCompanySharePercentage !== void 0 ? payload.defaultCompanySharePercentage : counselor.defaultCompanySharePercentage
    }
  });
  return updated;
};
var getMyReferralLedger = async (userRole, userId) => {
  let visibilityMode = "FULL_BREAKDOWN";
  if (userRole === "COUNSELOR") {
    const counselor = await prisma.counselor.findUnique({ where: { userId } });
    if (counselor) {
      visibilityMode = counselor.commissionVisibilityMode;
    }
  }
  const referredStudents = await prisma.student.findMany({
    where: { referredByUserId: userId, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
      higherStudyApps: {
        include: {
          program: { include: { university: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  const commissions = await prisma.agencyCommission.findMany({
    where: { referredByUserId: userId },
    orderBy: { createdAt: "desc" }
  });
  let totalEarnedBDT = 0;
  let totalWithdrawnBDT = 0;
  let pendingBalanceBDT = 0;
  for (const comm of commissions) {
    const bdt = Number(comm.netAmountBDT);
    totalEarnedBDT += bdt;
    if (comm.status === "WITHDRAWN") {
      totalWithdrawnBDT += bdt;
    } else {
      pendingBalanceBDT += bdt;
    }
  }
  let formattedCommissions = [];
  if (visibilityMode === "FULL_BREAKDOWN") {
    formattedCommissions = commissions;
  } else if (visibilityMode === "NET_ONLY") {
    formattedCommissions = commissions.map((c) => ({
      id: c.id,
      studentId: c.studentId,
      universityName: c.universityName,
      currency: c.currency,
      netAmount: c.netAmount,
      exchangeRateToBDT: c.exchangeRateToBDT,
      netAmountBDT: c.netAmountBDT,
      status: c.status,
      withdrawnAt: c.withdrawnAt,
      createdAt: c.createdAt
    }));
  } else {
    formattedCommissions = commissions.map((c) => ({
      id: c.id,
      studentId: c.studentId,
      universityName: c.universityName,
      status: c.status,
      createdAt: c.createdAt
    }));
  }
  return {
    visibilityMode,
    summary: visibilityMode !== "HIDDEN" ? {
      totalReferredStudents: referredStudents.length,
      totalEarnedBDT,
      totalWithdrawnBDT,
      pendingBalanceBDT
    } : {
      totalReferredStudents: referredStudents.length,
      notice: "Commission financial details are hidden for this counselor account."
    },
    commissions: formattedCommissions,
    students: referredStudents
  };
};
var getAllAgencyCommissions = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereConditions = {};
  if (query.status) {
    whereConditions.status = query.status;
  }
  if (query.agentUserId) {
    whereConditions.referredByUserId = query.agentUserId;
  }
  const [commissions, total, allComms] = await Promise.all([
    prisma.agencyCommission.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        referredByUser: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.agencyCommission.count({ where: whereConditions }),
    prisma.agencyCommission.findMany({
      select: {
        grossAmountBDT: true,
        vatAmount: true,
        companyShareAmountBDT: true,
        netAmountBDT: true,
        status: true
      }
    })
  ]);
  let agencyGrossBDT = 0;
  let totalVatRetainedEUR = 0;
  let totalCompanyProfitBDT = 0;
  let totalCounselorPayoutBDT = 0;
  let totalWithdrawnBDT = 0;
  for (const c of allComms) {
    agencyGrossBDT += Number(c.grossAmountBDT);
    totalVatRetainedEUR += Number(c.vatAmount);
    totalCompanyProfitBDT += Number(c.companyShareAmountBDT);
    totalCounselorPayoutBDT += Number(c.netAmountBDT);
    if (c.status === "WITHDRAWN") {
      totalWithdrawnBDT += Number(c.netAmountBDT);
    }
  }
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    masterFinancialSummary: {
      agencyGrossBDT,
      totalVatRetainedEUR,
      totalCompanyProfitBDT,
      totalCounselorPayableBDT: totalCounselorPayoutBDT,
      totalWithdrawnBDT,
      pendingPayoutBalanceBDT: totalCounselorPayoutBDT - totalWithdrawnBDT
    },
    data: commissions
  };
};
var CommissionService = {
  createCommission,
  updateCommissionStatus,
  assignStudentReferral,
  updateCounselorVisibilityMode,
  getMyReferralLedger,
  getAllAgencyCommissions
};

// src/app/module/commission/commission.controller.ts
var createCommission2 = catchAsync(async (req, res) => {
  const result = await CommissionService.createCommission(req.body);
  sendResponse(res, {
    statusCode: httpStatus26.CREATED,
    success: true,
    message: "Agency commission calculated and created successfully!",
    data: result
  });
});
var updateCommissionStatus2 = catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const { status, notes } = req.body;
    const result = await CommissionService.updateCommissionStatus(
      id,
      status,
      notes
    );
    sendResponse(res, {
      statusCode: httpStatus26.OK,
      success: true,
      message: `Commission status updated to ${status}!`,
      data: result
    });
  }
);
var assignStudentReferral2 = catchAsync(
  async (req, res) => {
    const studentId = req.params.studentId;
    const { referredByUserId } = req.body;
    const result = await CommissionService.assignStudentReferral(
      studentId,
      referredByUserId
    );
    sendResponse(res, {
      statusCode: httpStatus26.OK,
      success: true,
      message: "Student referral assigned successfully!",
      data: result
    });
  }
);
var toggleCounselorCommissionVisibility = catchAsync(
  async (req, res) => {
    const counselorId = req.params.counselorId;
    const mode = req.body.mode || req.body.visibilityMode || (req.body.canViewCommission === false ? "HIDDEN" : "FULL_BREAKDOWN");
    const result = await CommissionService.updateCounselorVisibilityMode(
      counselorId,
      {
        mode,
        defaultVatPercentage: req.body.defaultVatPercentage,
        defaultCompanySharePercentage: req.body.defaultCompanySharePercentage
      }
    );
    sendResponse(res, {
      statusCode: httpStatus26.OK,
      success: true,
      message: `Counselor commission visibility mode set to ${mode}!`,
      data: result
    });
  }
);
var getMyReferralLedger2 = catchAsync(async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.userId;
  const result = await CommissionService.getMyReferralLedger(userRole, userId);
  sendResponse(res, {
    statusCode: httpStatus26.OK,
    success: true,
    message: "Referral commission ledger retrieved!",
    data: result
  });
});
var getAllAgencyCommissions2 = catchAsync(
  async (req, res) => {
    const result = await CommissionService.getAllAgencyCommissions(req.query);
    sendResponse(res, {
      statusCode: httpStatus26.OK,
      success: true,
      message: "All agency commissions and master financial summary fetched!",
      meta: result.meta,
      data: {
        masterFinancialSummary: result.masterFinancialSummary,
        commissions: result.data
      }
    });
  }
);
var CommissionController = {
  createCommission: createCommission2,
  updateCommissionStatus: updateCommissionStatus2,
  assignStudentReferral: assignStudentReferral2,
  toggleCounselorCommissionVisibility,
  getMyReferralLedger: getMyReferralLedger2,
  getAllAgencyCommissions: getAllAgencyCommissions2
};

// src/app/module/commission/commission.route.ts
var router12 = Router12();
router12.post(
  "/",
  checkAuth("SUPER_ADMIN"),
  CommissionController.createCommission
);
router12.patch(
  "/:id/status",
  checkAuth("SUPER_ADMIN"),
  CommissionController.updateCommissionStatus
);
router12.get(
  "/all-ledger",
  checkAuth("SUPER_ADMIN"),
  CommissionController.getAllAgencyCommissions
);
router12.patch(
  "/referral/:studentId",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  CommissionController.assignStudentReferral
);
router12.patch(
  "/counselor/:counselorId/visibility",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  CommissionController.toggleCounselorCommissionVisibility
);
router12.get(
  "/my-ledger",
  checkAuth("SUPER_ADMIN", "ADMIN", "COUNSELOR"),
  CommissionController.getMyReferralLedger
);
var CommissionRoutes = router12;

// src/app/module/success-story/success-story.route.ts
import { Router as Router13 } from "express";

// src/app/module/success-story/success-story.controller.ts
import httpStatus28 from "http-status";

// src/app/module/success-story/success-story.service.ts
import httpStatus27 from "http-status";

// src/app/utils/activityLogger.ts
var logActivity = async (payload) => {
  try {
    const log = await prisma.activityLog.create({
      data: {
        action: payload.action,
        module: payload.module,
        targetId: payload.targetId,
        targetTitle: payload.targetTitle || null,
        performedBy: payload.performedBy,
        userName: payload.userName || null,
        userEmail: payload.userEmail || null,
        details: payload.details || null
      }
    });
    return log;
  } catch (error) {
    console.error("[ActivityLogger Notice]:", error);
  }
};

// src/app/module/success-story/success-story.service.ts
var toSlug = (text) => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
var generateUniqueSlug = async (studentName, excludeId) => {
  const base = toSlug(studentName) || "student";
  const totalCount = await prisma.studentSuccessStory.count({
    where: { isDeleted: false }
  });
  let seq = totalCount + 1;
  let serialStr = seq.toString().padStart(2, "0");
  let candidate = `${base}-${serialStr}`;
  while (true) {
    const existing = await prisma.studentSuccessStory.findFirst({
      where: {
        slug: candidate,
        ...excludeId ? { id: { not: excludeId } } : {}
      }
    });
    if (!existing) break;
    seq++;
    serialStr = seq.toString().padStart(2, "0");
    candidate = `${base}-${serialStr}`;
  }
  return candidate;
};
var backfillMissingSlugs = async () => {
  try {
    const missing = await prisma.studentSuccessStory.findMany({
      where: { slug: null },
      orderBy: { createdAt: "asc" }
    });
    if (missing.length === 0) return;
    for (let i = 0; i < missing.length; i++) {
      const item = missing[i];
      const serialStr = (i + 1).toString().padStart(2, "0");
      const base = toSlug(item.studentName) || "student";
      const slug = `${base}-${serialStr}`;
      await prisma.studentSuccessStory.update({
        where: { id: item.id },
        data: { slug }
      });
    }
  } catch (e) {
    console.error("Failed to backfill slugs", e);
  }
};
var createSuccessStory = async (user, payload) => {
  let slug = payload.slug?.trim() ? toSlug(payload.slug.trim()) : "";
  if (slug) {
    const conflict = await prisma.studentSuccessStory.findFirst({
      where: { slug, isDeleted: false }
    });
    if (conflict) {
      throw new AppError(
        httpStatus27.BAD_REQUEST,
        `The custom slug "${slug}" is already in use by another story! Please choose another serial or slug.`
      );
    }
  } else {
    slug = await generateUniqueSlug(payload.studentName);
  }
  const story = await prisma.studentSuccessStory.create({
    data: {
      slug,
      studentName: payload.studentName,
      photoUrl: payload.photoUrl || null,
      thumbnailUrl: payload.thumbnailUrl || null,
      homeInstitution: payload.homeInstitution,
      hometown: payload.hometown || null,
      country: payload.country,
      universityName: payload.universityName,
      degreeName: payload.degreeName,
      intake: payload.intake || null,
      visaDate: payload.visaDate || null,
      youtubeUrl: payload.youtubeUrl || null,
      testimonial: payload.testimonial || null,
      storyContent: payload.storyContent,
      scholarshipNote: payload.scholarshipNote || null,
      isPublished: payload.isPublished !== void 0 ? payload.isPublished : true,
      createdBy: user.id
    }
  });
  await logActivity({
    action: "CREATE",
    module: "SUCCESS_STORY",
    targetId: story.id,
    targetTitle: `${story.studentName} (${story.universityName})`,
    performedBy: user.id,
    userName: user.name,
    userEmail: user.email,
    details: `Created new success story for student ${story.studentName} destined for ${story.universityName}, ${story.country}.`
  });
  return story;
};
var getSuccessStories = async (query) => {
  await backfillMissingSlugs();
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const whereConditions = {
    isDeleted: false,
    isPublished: true
  };
  if (query.country && query.country.toLowerCase() !== "all") {
    whereConditions.country = {
      contains: query.country,
      mode: "insensitive"
    };
  }
  if (query.searchTerm && query.searchTerm.trim() !== "") {
    const term = query.searchTerm.trim();
    whereConditions.OR = [
      { studentName: { contains: term, mode: "insensitive" } },
      { homeInstitution: { contains: term, mode: "insensitive" } },
      { hometown: { contains: term, mode: "insensitive" } },
      { universityName: { contains: term, mode: "insensitive" } },
      { degreeName: { contains: term, mode: "insensitive" } },
      { country: { contains: term, mode: "insensitive" } },
      { intake: { contains: term, mode: "insensitive" } },
      { scholarshipNote: { contains: term, mode: "insensitive" } },
      { testimonial: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } }
    ];
  }
  const [data, total] = await Promise.all([
    prisma.studentSuccessStory.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.studentSuccessStory.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data
  };
};
var getDistinctCountries = async () => {
  const stories = await prisma.studentSuccessStory.findMany({
    where: { isDeleted: false, isPublished: true },
    select: { country: true, viewsCount: true }
  });
  const map = {};
  for (const s of stories) {
    const c = s.country?.trim();
    if (!c) continue;
    if (!map[c]) {
      map[c] = { country: c, count: 0, totalViews: 0 };
    }
    map[c].count += 1;
    map[c].totalViews += s.viewsCount || 0;
  }
  const sorted = Object.values(map).sort((a, b) => {
    if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
    return b.count - a.count;
  });
  return sorted;
};
var getSuccessStoryById = async (idOrSlug) => {
  const story = await prisma.studentSuccessStory.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug }
      ],
      isDeleted: false
    }
  });
  if (!story) {
    throw new AppError(httpStatus27.NOT_FOUND, "Success story not found!");
  }
  prisma.studentSuccessStory.update({
    where: { id: story.id },
    data: { viewsCount: { increment: 1 } }
  }).catch(() => {
  });
  return story;
};
var updateSuccessStory = async (id, user, payload) => {
  const existing = await prisma.studentSuccessStory.findUnique({
    where: { id }
  });
  if (!existing) {
    throw new AppError(httpStatus27.NOT_FOUND, "Success story not found!");
  }
  const changes = [];
  if (payload.studentName && payload.studentName !== existing.studentName) {
    changes.push(`Student name changed from "${existing.studentName}" to "${payload.studentName}"`);
  }
  if (payload.photoUrl && payload.photoUrl !== existing.photoUrl) {
    changes.push(`Photo URL updated by admin`);
  }
  if (payload.youtubeUrl && payload.youtubeUrl !== existing.youtubeUrl) {
    changes.push(`YouTube video link updated`);
  }
  if (payload.universityName && payload.universityName !== existing.universityName) {
    changes.push(`University changed to "${payload.universityName}"`);
  }
  let slug = payload.slug?.trim() ? toSlug(payload.slug.trim()) : existing.slug;
  if (payload.slug && payload.slug.trim() !== existing.slug) {
    const conflict = await prisma.studentSuccessStory.findFirst({
      where: { slug, id: { not: id }, isDeleted: false }
    });
    if (conflict) {
      throw new AppError(
        httpStatus27.BAD_REQUEST,
        `The custom slug "${slug}" is already in use by another story! Please choose another serial or slug.`
      );
    }
  } else if (!slug && (payload.studentName || existing.studentName)) {
    slug = await generateUniqueSlug(payload.studentName || existing.studentName, id);
  }
  const updated = await prisma.studentSuccessStory.update({
    where: { id },
    data: {
      ...payload,
      slug,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  await logActivity({
    action: "UPDATE",
    module: "SUCCESS_STORY",
    targetId: updated.id,
    targetTitle: `${updated.studentName} (${updated.universityName})`,
    performedBy: user.id,
    userName: user.name,
    userEmail: user.email,
    details: changes.length > 0 ? changes.join(", ") : "Updated story content and parameters."
  });
  return updated;
};
var trashSuccessStory = async (id, user) => {
  const existing = await prisma.studentSuccessStory.findUnique({
    where: { id }
  });
  if (!existing) {
    throw new AppError(httpStatus27.NOT_FOUND, "Success story not found!");
  }
  const trashed = await prisma.studentSuccessStory.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  await logActivity({
    action: "TRASH",
    module: "SUCCESS_STORY",
    targetId: existing.id,
    targetTitle: `${existing.studentName} (${existing.universityName})`,
    performedBy: user.id,
    userName: user.name,
    userEmail: user.email,
    details: `Moved success story of ${existing.studentName} to Trash.`
  });
  return {
    message: "Success story moved to Trash successfully!",
    data: trashed
  };
};
var restoreSuccessStory = async (id, user) => {
  const existing = await prisma.studentSuccessStory.findUnique({
    where: { id }
  });
  if (!existing) {
    throw new AppError(httpStatus27.NOT_FOUND, "Success story not found!");
  }
  const restored = await prisma.studentSuccessStory.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null
    }
  });
  await logActivity({
    action: "RESTORE",
    module: "SUCCESS_STORY",
    targetId: existing.id,
    targetTitle: `${existing.studentName} (${existing.universityName})`,
    performedBy: user.id,
    userName: user.name,
    userEmail: user.email,
    details: `Restored success story of ${existing.studentName} from Trash to Live.`
  });
  return {
    message: "Success story restored from Trash successfully!",
    data: restored
  };
};
var getTrashedSuccessStories = async () => {
  const trashed = await prisma.studentSuccessStory.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: "desc" }
  });
  return trashed;
};
var getActivityLogs = async (query) => {
  const limit = Number(query.limit) || 50;
  const whereConditions = {};
  if (query.module) {
    whereConditions.module = query.module;
  }
  const logs = await prisma.activityLog.findMany({
    where: whereConditions,
    take: limit,
    orderBy: { createdAt: "desc" }
  });
  return logs;
};
var DEFAULT_SUCCESS_PAGE_SETTINGS = {
  badgeText: "Real Students \u2022 Real Visas \u2022 Proven Results",
  titlePart1: "Student",
  titlePart2: "Success Stories",
  description: "Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education.",
  stat1Value: "98.4%",
  stat1Label: "Visa Success Rate",
  stat2Value: "1,250+",
  stat2Label: "Visas Approved",
  stat3Value: "50%+",
  stat3Label: "Average Scholarship",
  stat4Value: "15+",
  stat4Label: "Study Destinations"
};
var getSuccessPageSettings = async () => {
  let settings = await prisma.successPageSetting.findFirst();
  if (!settings) {
    settings = await prisma.successPageSetting.create({
      data: DEFAULT_SUCCESS_PAGE_SETTINGS
    });
  }
  return settings;
};
var updateSuccessPageSettings = async (payload) => {
  let settings = await prisma.successPageSetting.findFirst();
  if (!settings) {
    settings = await prisma.successPageSetting.create({
      data: {
        ...DEFAULT_SUCCESS_PAGE_SETTINGS,
        ...payload
      }
    });
  } else {
    settings = await prisma.successPageSetting.update({
      where: { id: settings.id },
      data: payload
    });
  }
  return settings;
};
var SuccessStoryService = {
  createSuccessStory,
  getSuccessStories,
  getSuccessStoryById,
  updateSuccessStory,
  trashSuccessStory,
  restoreSuccessStory,
  getTrashedSuccessStories,
  getActivityLogs,
  getDistinctCountries,
  getSuccessPageSettings,
  updateSuccessPageSettings
};

// src/app/module/success-story/success-story.controller.ts
var createSuccessStory2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await SuccessStoryService.createSuccessStory(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus28.CREATED,
    success: true,
    message: "Student success story published successfully!",
    data: result
  });
});
var getSuccessStories2 = catchAsync(async (req, res) => {
  const result = await SuccessStoryService.getSuccessStories(req.query);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Success stories fetched successfully!",
    data: result
  });
});
var getSuccessStoryById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SuccessStoryService.getSuccessStoryById(id);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Success story details retrieved successfully!",
    data: result
  });
});
var updateSuccessStory2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await SuccessStoryService.updateSuccessStory(id, user, req.body);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Success story updated successfully!",
    data: result
  });
});
var trashSuccessStory2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await SuccessStoryService.trashSuccessStory(id, user);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: result.message,
    data: result.data
  });
});
var restoreSuccessStory2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await SuccessStoryService.restoreSuccessStory(id, user);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: result.message,
    data: result.data
  });
});
var getTrashedSuccessStories2 = catchAsync(async (_req, res) => {
  const result = await SuccessStoryService.getTrashedSuccessStories();
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Trashed success stories retrieved!",
    data: result
  });
});
var getActivityLogs2 = catchAsync(async (req, res) => {
  const result = await SuccessStoryService.getActivityLogs(req.query);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Activity logs retrieved successfully!",
    data: result
  });
});
var getSuccessPageSettings2 = catchAsync(async (_req, res) => {
  const result = await SuccessStoryService.getSuccessPageSettings();
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Success page settings retrieved successfully!",
    data: result
  });
});
var updateSuccessPageSettings2 = catchAsync(async (req, res) => {
  const result = await SuccessStoryService.updateSuccessPageSettings(req.body);
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Success page settings updated successfully!",
    data: result
  });
});
var getDistinctCountries2 = catchAsync(async (_req, res) => {
  const result = await SuccessStoryService.getDistinctCountries();
  sendResponse(res, {
    statusCode: httpStatus28.OK,
    success: true,
    message: "Distinct story countries retrieved successfully!",
    data: result
  });
});
var SuccessStoryController = {
  createSuccessStory: createSuccessStory2,
  getSuccessStories: getSuccessStories2,
  getSuccessStoryById: getSuccessStoryById2,
  getDistinctCountries: getDistinctCountries2,
  updateSuccessStory: updateSuccessStory2,
  trashSuccessStory: trashSuccessStory2,
  restoreSuccessStory: restoreSuccessStory2,
  getTrashedSuccessStories: getTrashedSuccessStories2,
  getActivityLogs: getActivityLogs2,
  getSuccessPageSettings: getSuccessPageSettings2,
  updateSuccessPageSettings: updateSuccessPageSettings2
};

// src/app/module/success-story/success-story.route.ts
var router13 = Router13();
router13.get("/", SuccessStoryController.getSuccessStories);
router13.get("/settings", SuccessStoryController.getSuccessPageSettings);
router13.patch(
  "/settings",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.updateSuccessPageSettings
);
router13.get(
  "/admin/trash",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.getTrashedSuccessStories
);
router13.get(
  "/admin/activity-logs",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.getActivityLogs
);
router13.get("/countries", SuccessStoryController.getDistinctCountries);
router13.get("/:id", SuccessStoryController.getSuccessStoryById);
router13.post(
  "/",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.createSuccessStory
);
router13.patch(
  "/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.updateSuccessStory
);
router13.patch(
  "/:id/trash",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.trashSuccessStory
);
router13.patch(
  "/:id/restore",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  SuccessStoryController.restoreSuccessStory
);
var SuccessStoryRoutes = router13;

// src/app/module/contact/contact.route.ts
import { Router as Router14 } from "express";

// src/app/module/contact/contact.controller.ts
import httpStatus30 from "http-status";

// src/app/module/contact/contact.service.ts
import httpStatus29 from "http-status";
var DEFAULT_SETTINGS = {
  headquartersTitle: "Dhaka Headquarters",
  headquartersAddress: "Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh.",
  headquartersNote: "Direct access via Gulshan Circle 1",
  officeHoursTitle: "Office Hours & Counseling",
  officeHoursSchedule: "Saturday \u2013 Thursday: 10:00 AM \u2013 7:00 PM",
  officeHoursNote: "Friday: Closed (Hotline & WhatsApp Active)",
  autoResponderSubject: "We Have Received Your Inquiry \u2014 Rise Abroad Education",
  autoResponderSenderName: "Rise Abroad Admissions Desk",
  autoResponderSenderEmail: "admissions@riseabroad.com",
  autoResponderWhatsAppText: "\u099C\u09B0\u09C1\u09B0\u09BF \u0995\u09CB\u09A8\u09CB \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09B9\u09B2\u09C7 \u0985\u09A5\u09AC\u09BE \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u09AA\u09C7\u09A4\u09C7 \u09AC\u09BF\u09B2\u09AE\u09CD\u09AC \u09B9\u09B2\u09C7, \u0986\u09AA\u09A8\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09A8\u0995 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8:",
  autoResponderWhatsAppNumber: "+880 1712-345678",
  autoResponderOfficeAddress: "Rise Abroad Education \u2022 Level 6, Navana Tower, Gulshan-1, Dhaka",
  autoResponderHotline: "+880 1712-345678",
  autoResponderEmail: "admissions@riseabroad.com",
  autoResponderHours: "Counseling Desk: Sat \u2013 Thu (10AM \u2013 7PM)",
  autoResponderLogoUrl: "",
  otpEmailSubject: "Your Password Reset Code \u2014 Rise Abroad Education",
  otpEmailHeading: "Password Reset Verification Code",
  otpEmailBodyMessage: "We received a request to reset the password for your Rise Abroad Education account. Use the verification code below to proceed with resetting your password:",
  otpEmailExpiryNote: "This code expires in 10 minutes. For your security, do not share this code with anyone.",
  regOtpEmailSubject: "Account Verification Code \u2014 Rise Abroad Education",
  regOtpEmailHeading: "Verify Your Student Account",
  regOtpEmailBodyMessage: "Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:",
  regOtpEmailExpiryNote: "This code is valid for 10 minutes. For your security, do not share this code with anyone.",
  welcomeEmailSubject: "Welcome to Rise Abroad Education \u2014 Your Journey Begins!",
  welcomeEmailHeading: "Welcome to Rise Abroad Education",
  welcomeEmailMessage: "Thank you for registering with Rise Abroad Education. Your global higher education journey starts here! Our certified counselors and admissions desk are here to guide you to your dream university.",
  welcomeEmailBtnText: "Access Student Portal",
  welcomeEmailBtnUrl: "https://riseabroad.com/dashboard"
};
var DEFAULT_MEMBERS = [
  {
    name: "Arafat Hossain",
    role: "Founder & Chief Executive Officer",
    badge: "EXECUTIVE",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    department: "Executive Strategy & University Alliances",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "Arafat Hossain - Founder & CEO",
    phone: "+880 1712-345678",
    whatsapp: "https://wa.me/8801712345678?text=Hello%20Arafat%2C%20I%20would%20like%20to%20discuss%20higher%20study%20admissions.",
    facebook: "https://facebook.com/riseabroad",
    email: "ceo@riseabroad.com",
    order: 1,
    isActive: true
  },
  {
    name: "Dr. Tariqul Islam",
    role: "Head of Global Admissions",
    badge: "ADMISSIONS",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    department: "Direct University Offers & Partner Relations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "Dr. Tariqul Islam - Head of Global Admissions",
    phone: "+880 1823-456789",
    whatsapp: "https://wa.me/8801823456789?text=Hello%20Admissions%20Team%2C%20I%20need%20assistance%20with%20my%20university%20offer.",
    facebook: "https://facebook.com/riseabroad",
    email: "admissions@riseabroad.com",
    order: 2,
    isActive: true
  },
  {
    name: "Nusrat Jahan",
    role: "Lead Visa & Scholarship Counselor",
    badge: "VISA DESK",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    department: "Embassy Interviews, SOP Review & Visas",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "Nusrat Jahan - Lead Visa & Scholarship Counselor",
    phone: "+880 1934-567890",
    whatsapp: "https://wa.me/8801934567890?text=Hello%20Nusrat%2C%20I%20have%20questions%20about%20my%20visa%20interview.",
    facebook: "https://facebook.com/riseabroad",
    email: "counseling@riseabroad.com",
    order: 3,
    isActive: true
  },
  {
    name: "24/7 Student Hotline & Support",
    role: "Customer Care & Help Center",
    badge: "24/7 HOTLINE",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    department: "Instant Student Support & Document Guidance",
    avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
    avatarAlt: "24/7 Student Hotline & Support Desk",
    phone: "+880 9612-000000",
    whatsapp: "https://wa.me/8809612000000?text=Hello%20Support%2C%20I%20need%20urgent%20admission%20assistance.",
    facebook: "https://facebook.com/riseabroad",
    email: "support@riseabroad.com",
    order: 4,
    isActive: true
  }
];
var getContactSettings = async () => {
  let settings = await prisma.contactPageSetting.findFirst();
  if (!settings) {
    settings = await prisma.contactPageSetting.create({
      data: DEFAULT_SETTINGS
    });
  }
  return settings;
};
var updateContactSettings = async (payload) => {
  let settings = await prisma.contactPageSetting.findFirst();
  if (!settings) {
    settings = await prisma.contactPageSetting.create({
      data: {
        ...DEFAULT_SETTINGS,
        ...payload
      }
    });
  } else {
    settings = await prisma.contactPageSetting.update({
      where: { id: settings.id },
      data: payload
    });
  }
  return settings;
};
var getSupportMembers = async (includeInactive = false) => {
  const count = await prisma.supportTeamMember.count();
  if (count === 0) {
    await prisma.supportTeamMember.createMany({
      data: DEFAULT_MEMBERS
    });
  }
  const whereCondition = includeInactive ? {} : { isActive: true };
  const members = await prisma.supportTeamMember.findMany({
    where: whereCondition,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }]
  });
  return members;
};
var createSupportMember = async (payload) => {
  if (!payload.name || !payload.role || !payload.department) {
    throw new AppError(
      httpStatus29.BAD_REQUEST,
      "Name, Role, and Department are required"
    );
  }
  const newMember = await prisma.supportTeamMember.create({
    data: {
      name: payload.name,
      role: payload.role,
      badge: payload.badge || "SUPPORT",
      badgeColor: payload.badgeColor || "bg-blue-500/10 text-blue-400 border-blue-500/30",
      department: payload.department,
      avatar: payload.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      avatarAlt: payload.avatarAlt || `${payload.name} - ${payload.role}`,
      phone: payload.phone || "",
      email: payload.email || "",
      whatsapp: payload.whatsapp || "",
      facebook: payload.facebook || "https://facebook.com/riseabroad",
      order: payload.order ?? 0,
      isActive: payload.isActive ?? true
    }
  });
  return newMember;
};
var updateSupportMember = async (id, payload) => {
  const member = await prisma.supportTeamMember.findUnique({
    where: { id }
  });
  if (!member) {
    throw new AppError(httpStatus29.NOT_FOUND, "Support member not found");
  }
  const updated = await prisma.supportTeamMember.update({
    where: { id },
    data: payload
  });
  return updated;
};
var deleteSupportMember = async (id) => {
  const member = await prisma.supportTeamMember.findUnique({
    where: { id }
  });
  if (!member) {
    throw new AppError(httpStatus29.NOT_FOUND, "Support member not found");
  }
  await prisma.supportTeamMember.delete({
    where: { id }
  });
  return { id, message: "Member deleted successfully" };
};
var createInquiry = async (payload) => {
  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    throw new AppError(
      httpStatus29.BAD_REQUEST,
      "Name, email, subject, and message are required."
    );
  }
  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim() || null,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      country: payload.country?.trim() || "Bangladesh",
      status: "UNREAD",
      isRead: false
    }
  });
  try {
    const settings = await prisma.contactPageSetting.findFirst();
    sendContactAutoResponderEmail(inquiry.email, inquiry.name, settings);
  } catch (e) {
    console.log("[Auto-Responder] Email dispatch error:", e);
  }
  return inquiry;
};
var getInquiries = async () => {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" }
  });
  const unreadCount = inquiries.filter((inq) => !inq.isRead).length;
  return { inquiries, unreadCount };
};
var markInquiryRead = async (id) => {
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    throw new AppError(httpStatus29.NOT_FOUND, "Inquiry not found");
  }
  return await prisma.contactInquiry.update({
    where: { id },
    data: {
      isRead: true,
      status: inquiry.status === "UNREAD" ? "READ" : inquiry.status
    }
  });
};
var replyToInquiry = async (id, replyMessage) => {
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    throw new AppError(httpStatus29.NOT_FOUND, "Inquiry not found");
  }
  return await prisma.contactInquiry.update({
    where: { id },
    data: {
      reply: replyMessage,
      repliedAt: /* @__PURE__ */ new Date(),
      status: "REPLIED",
      isRead: true
    }
  });
};
var deleteInquiry = async (id) => {
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    throw new AppError(httpStatus29.NOT_FOUND, "Inquiry not found");
  }
  await prisma.contactInquiry.delete({ where: { id } });
  return { id, message: "Inquiry deleted successfully" };
};
var uploadLogo = async (file) => {
  if (!file) {
    throw new AppError(
      httpStatus29.BAD_REQUEST,
      "Please upload an image file (PNG/JPEG)!"
    );
  }
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "rise_abroad/brand",
        transformation: [{ quality: "auto:best" }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
  const settings = await prisma.contactPageSetting.findFirst();
  if (settings) {
    await prisma.contactPageSetting.update({
      where: { id: settings.id },
      data: { autoResponderLogoUrl: uploadResult.secure_url }
    });
  }
  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
};
var ContactService = {
  getContactSettings,
  updateContactSettings,
  getSupportMembers,
  createSupportMember,
  updateSupportMember,
  deleteSupportMember,
  createInquiry,
  getInquiries,
  markInquiryRead,
  replyToInquiry,
  deleteInquiry,
  uploadLogo
};

// src/app/module/contact/contact.controller.ts
var getSettings = catchAsync(async (req, res) => {
  const settings = await ContactService.getContactSettings();
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Contact settings retrieved successfully",
    data: settings
  });
});
var updateSettings = catchAsync(async (req, res) => {
  const updated = await ContactService.updateContactSettings(req.body);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Contact settings updated successfully",
    data: updated
  });
});
var getTeamMembers = catchAsync(async (req, res) => {
  const includeInactive = req.query.all === "true";
  const members = await ContactService.getSupportMembers(includeInactive);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Support team members retrieved successfully",
    data: members
  });
});
var createTeamMember = catchAsync(async (req, res) => {
  const newMember = await ContactService.createSupportMember(req.body);
  sendResponse(res, {
    statusCode: httpStatus30.CREATED,
    success: true,
    message: "Support team member created successfully",
    data: newMember
  });
});
var updateTeamMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await ContactService.updateSupportMember(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Support team member updated successfully",
    data: updated
  });
});
var deleteTeamMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ContactService.deleteSupportMember(id);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Support team member deleted successfully",
    data: result
  });
});
var createInquiry2 = catchAsync(async (req, res) => {
  const inquiry = await ContactService.createInquiry(req.body);
  sendResponse(res, {
    statusCode: httpStatus30.CREATED,
    success: true,
    message: "Your inquiry has been submitted successfully.",
    data: inquiry
  });
});
var getInquiries2 = catchAsync(async (req, res) => {
  const data = await ContactService.getInquiries();
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Contact inquiries retrieved successfully",
    data
  });
});
var markInquiryRead2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await ContactService.markInquiryRead(id);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Inquiry marked as read",
    data: updated
  });
});
var replyToInquiry2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  const updated = await ContactService.replyToInquiry(id, reply || "");
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Reply sent successfully",
    data: updated
  });
});
var deleteInquiry2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ContactService.deleteInquiry(id);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "Contact inquiry deleted successfully",
    data: result
  });
});
var uploadLogo2 = catchAsync(async (req, res) => {
  const result = await ContactService.uploadLogo(req.file);
  sendResponse(res, {
    statusCode: httpStatus30.OK,
    success: true,
    message: "High quality logo uploaded successfully!",
    data: result
  });
});
var ContactController = {
  getSettings,
  updateSettings,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  createInquiry: createInquiry2,
  getInquiries: getInquiries2,
  markInquiryRead: markInquiryRead2,
  replyToInquiry: replyToInquiry2,
  deleteInquiry: deleteInquiry2,
  uploadLogo: uploadLogo2
};

// src/app/module/contact/contact.route.ts
var router14 = Router14();
router14.get("/settings", ContactController.getSettings);
router14.get("/team", ContactController.getTeamMembers);
router14.patch(
  "/settings",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.updateSettings
);
router14.post(
  "/team",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.createTeamMember
);
router14.patch(
  "/team/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.updateTeamMember
);
router14.delete(
  "/team/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.deleteTeamMember
);
router14.post("/inquiries", ContactController.createInquiry);
router14.get(
  "/inquiries",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.getInquiries
);
router14.patch(
  "/inquiries/:id/read",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.markInquiryRead
);
router14.post(
  "/inquiries/:id/reply",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.replyToInquiry
);
router14.delete(
  "/inquiries/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  ContactController.deleteInquiry
);
router14.post(
  "/upload-logo",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  upload.single("image"),
  ContactController.uploadLogo
);
var ContactRoutes = router14;

// src/app.ts
var app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: process.env.NODE_ENV === "production" ? 1e3 : 5e4,
  skip: (req) => {
    const ip = req.ip || req.socket.remoteAddress || "";
    return process.env.NODE_ENV !== "production" || ip.includes("127.0.0.1") || ip.includes("::1") || ip.includes("localhost");
  },
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes!"
  }
});
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.status(httpStatus31.OK).json({
    success: true,
    message: "Rise Abroad Education Management API is operational.",
    version: "1.0.0"
  });
});
app.get("/api/v1", (req, res) => {
  res.status(httpStatus31.OK).json({
    success: true,
    message: "Rise Abroad Education API v1 service is operational.",
    version: "1.0.0"
  });
});
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/academic", AcademicRoutes);
app.use("/api/v1/enrollments", EnrollmentRoutes);
app.use("/api/v1/attendance", AttendanceRoutes);
app.use("/api/v1/grades", GradingRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/higher-study", HigherStudyRoutes);
app.use("/api/v1/chat", ChatRoutes);
app.use("/api/v1/notifications", NotificationRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/commissions", CommissionRoutes);
app.use("/api/v1/success-stories", SuccessStoryRoutes);
app.use("/api/v1/contact", ContactRoutes);
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/lib/redis.ts
import { createClient } from "redis";
var getRedisUrl = () => {
  if (config_default.redis_url) return config_default.redis_url;
  if (config_default.redis_password) {
    return `redis://${config_default.redis_user || "default"}:${config_default.redis_password}@${config_default.redis_host}:${config_default.redis_port}`;
  }
  return `redis://${config_default.redis_host}:${config_default.redis_port}`;
};
var redisClient = createClient({
  url: getRedisUrl(),
  socket: {
    connectTimeout: 5e3
  }
});
redisClient.on("connect", () => {
  console.log("[Redis] Cloud Connected Successfully.");
});
redisClient.on("error", (err) => {
  console.log(
    "[Redis] Notice (Ignored if offline/fallback):",
    err.message
  );
});

// src/app/utils/seed.ts
import bcrypt3 from "bcryptjs";
var seedInitialData = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: { email: config_default.super_admin_email }
    });
    let superAdminUser = isSuperAdminExist;
    if (!isSuperAdminExist) {
      const hashedPassword = await bcrypt3.hash(
        config_default.super_admin_password,
        config_default.bcrypt_salt_rounds
      );
      superAdminUser = await prisma.user.create({
        data: {
          name: config_default.super_admin_name,
          email: config_default.super_admin_email,
          password: hashedPassword,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          isEmailVerified: true
        }
      });
      console.log(`[Seed] Super Admin Verified: ${config_default.super_admin_email}`);
    }
    const counselorEmail = "counselor@university.com";
    const isCounselorExist = await prisma.user.findFirst({
      where: { email: counselorEmail }
    });
    if (!isCounselorExist) {
      const hashedPassword = await bcrypt3.hash(
        "Counselor123!",
        config_default.bcrypt_salt_rounds
      );
      const user = await prisma.user.create({
        data: {
          name: "Sarah Jenkins",
          email: counselorEmail,
          password: hashedPassword,
          role: "COUNSELOR",
          status: "ACTIVE",
          isEmailVerified: true
        }
      });
      await prisma.counselor.create({
        data: {
          userId: user.id,
          counselorId: "CNS-1001",
          designation: "Senior Admissions Officer",
          contactNumber: "+8801711223344",
          specialization: "European & UK Higher Education"
        }
      });
      console.log(`[Seed] Demo Counselor Verified: ${counselorEmail}`);
    }
    const studentEmail = "arafat.student@gmail.com";
    const isStudentExist = await prisma.user.findFirst({
      where: { email: studentEmail }
    });
    if (!isStudentExist) {
      const hashedPassword = await bcrypt3.hash(
        "Student123!",
        config_default.bcrypt_salt_rounds
      );
      const user = await prisma.user.create({
        data: {
          name: "Arafat Hussen",
          email: studentEmail,
          password: hashedPassword,
          role: "STUDENT",
          status: "ACTIVE",
          isEmailVerified: true
        }
      });
      await prisma.student.create({
        data: {
          userId: user.id,
          studentId: "STU-0059",
          contactNumber: "+8801700000000",
          address: "Dhaka, Bangladesh",
          gender: "MALE",
          accessScope: "BOTH"
        }
      });
      console.log(`[Seed] Demo Student Verified: ${studentEmail}`);
    }
    const cyprus = await prisma.country.upsert({
      where: { code: "CY" },
      update: {},
      create: {
        name: "Cyprus",
        code: "CY",
        currency: "EUR",
        description: "Study in Cyprus - European Quality Education with Affordable Tuition Fees.",
        flagUrl: "https://flagcdn.com/w320/cy.png"
      }
    });
    const aucy = await prisma.globalUniversity.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {
        paymentType: "OFFER_DEPOSIT",
        offerDepositFee: 500
      },
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "American University of Cyprus",
        city: "Larnaca",
        countryId: cyprus.id,
        website: "https://aucy.ac.cy",
        description: "Premier American curriculum institution located in Larnaca, Cyprus.",
        paymentType: "OFFER_DEPOSIT",
        applicationFee: 0,
        offerDepositFee: 500
      }
    });
    const aucyDocs = [
      {
        title: "Passport Information Page",
        description: "Clear scanned color copy of passport (Min 2 years validity)",
        isRequired: true
      },
      {
        title: "HSC & SSC Marksheets and Certificates",
        description: "Verified educational board transcripts",
        isRequired: true
      },
      {
        title: "English Proficiency Score (IELTS 5.0+ or MOI)",
        description: "Language test certificate or Medium of Instruction letter",
        isRequired: true
      },
      {
        title: "Statement of Purpose (SOP)",
        description: "1-page motivational essay explaining reasons for studying in Cyprus",
        isRequired: false
      }
    ];
    for (const doc of aucyDocs) {
      const isReqExist = await prisma.universityDocRequirement.findFirst({
        where: { universityId: aucy.id, title: doc.title }
      });
      if (!isReqExist) {
        await prisma.universityDocRequirement.create({
          data: {
            universityId: aucy.id,
            title: doc.title,
            description: doc.description,
            isRequired: doc.isRequired,
            docType: "PDF"
          }
        });
      }
    }
    const isProgramExist = await prisma.globalProgram.findFirst({
      where: { universityId: aucy.id, name: "BSc in Computer Science" }
    });
    if (!isProgramExist) {
      await prisma.globalProgram.create({
        data: {
          name: "BSc in Computer Science",
          degreeLevel: "BACHELOR",
          durationYears: 4,
          tuitionFee: 6650,
          initialDeposit: 4e3,
          intakeSeason: "Fall 2026",
          ieltsRequirement: 5,
          academicRequirement: "Minimum 60% in HSC / A Level",
          universityId: aucy.id
        }
      });
    }
    const isBlogExist = await prisma.blogPost.findFirst({
      where: { slug: "complete-study-in-cyprus-guide-2026" }
    });
    if (!isBlogExist && superAdminUser) {
      await prisma.blogPost.create({
        data: {
          title: "Complete Study in Cyprus Guide 2026 for Bangladeshi Students",
          slug: "complete-study-in-cyprus-guide-2026",
          content: "Cyprus offers European standard degrees taught in English with 50% scholarship opportunities, low tuition fees, and high visa success ratio for South Asian students.",
          category: "Visa & Destination Guide",
          tags: ["Cyprus", "Higher Study", "Scholarships", "Europe"],
          authorId: superAdminUser.id,
          bannerUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136"
        }
      });
    }
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
          storyContent: "From Dhaka College to Larnaca, Cyprus! Rise Abroad Education guided me through every step from document apostille to visa interview preparation. With their expert counseling, I secured a 50% tuition scholarship and my European student visa within just 3 weeks.",
          isPublished: true,
          createdBy: superAdminUser.id
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
          scholarshipNote: "\xA33,000 Dean's Excellence Scholarship",
          storyContent: "Securing my UK visa with zero hassle was made possible by Rise Abroad Education. Their dedicated counselor reviewed my SOP five times and conducted rigorous mock interviews that made the real embassy interview feel effortless.",
          isPublished: true,
          createdBy: superAdminUser.id
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
          storyContent: "My dream of studying in Canada became a reality through Rise Abroad Education. They provided completely transparent guidelines on the SDS stream, GIC account creation, and financial proof documentation.",
          isPublished: true,
          createdBy: superAdminUser.id
        }
      ];
      for (const story of successStories) {
        await prisma.studentSuccessStory.create({
          data: story
        });
      }
      console.log("[Seed] Demo Student Success Stories Seeded Successfully.");
    }
    console.log("[Seed] Initial Demo Data & Seed Verified Successfully.");
  } catch (error) {
    console.log(
      "Seed Warning (Ignored if database is not yet migrated):",
      error
    );
  }
};

// src/server.ts
var PORT = config_default.port;
var main = async () => {
  try {
    const server = app_default.listen(PORT, () => {
      console.log(
        `[Server] Running on port ${PORT} [Mode: ${config_default.node_env}]`
      );
      console.log(`[API] Base URL: http://localhost:${PORT}/api/v1`);
    });
    prisma.$connect().then(() => {
      console.log(
        "[Database] PostgreSQL Database Connected Successfully via Prisma 7."
      );
      seedInitialData().catch((seedError) => {
        console.log("[Seed] Notice:", seedError.message);
      });
    }).catch((dbError) => {
      console.log(
        "[Database] Connection Notice (Check DATABASE_URL):",
        dbError.message
      );
    });
    if (config_default.redis_url || config_default.redis_host) {
      redisClient.connect().then(() => {
        console.log("[Redis] Connected Successfully.");
      }).catch((redisError) => {
        console.log(
          "[Redis] Notice (Running in memory-fallback mode):",
          redisError.message
        );
      });
    }
  } catch (error) {
    console.error("[Fatal] Error starting the server:", error);
  }
};
main();
var server_default = app_default;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map