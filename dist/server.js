
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus26 from "http-status";

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
  email_sender: process.env.EMAIL_SENDER || "University Portal <no-reply@university.ac>",
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
  "inlineSchema": 'model Department {\n  id          String    @id @default(uuid(7))\n  name        String    @unique\n  code        String    @unique\n  description String?\n  isDeleted   Boolean   @default(false)\n  deletedAt   DateTime?\n  createdAt   DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n\n  students  Student[]\n  faculties Faculty[]\n  courses   Course[]\n\n  @@map("departments")\n}\n\nmodel Semester {\n  id        String    @id @default(uuid(7))\n  name      String\n  code      String    @unique\n  startDate DateTime\n  endDate   DateTime\n  isCurrent Boolean   @default(false)\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  sections Section[]\n  payments Payment[]\n  grades   CourseResult[]\n\n  @@map("semesters")\n}\n\nmodel Course {\n  id          String  @id @default(uuid(7))\n  title       String\n  code        String  @unique\n  credits     Int     @default(3)\n  tuitionFee  Decimal @default(15000.00) @db.Decimal(10, 2)\n  description String?\n\n  prerequisiteId   String?\n  prerequisite     Course?  @relation("Prerequisites", fields: [prerequisiteId], references: [id])\n  dependentCourses Course[] @relation("Prerequisites")\n\n  departmentId String\n  department   Department @relation(fields: [departmentId], references: [id])\n\n  sections Section[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@index([code], name: "idx_course_code")\n  @@map("courses")\n}\n\nmodel Section {\n  id             String  @id @default(uuid(7))\n  sectionName    String\n  maxCapacity    Int     @default(40)\n  availableSeats Int     @default(40)\n  roomNumber     String?\n  scheduleTime   String?\n\n  courseId String\n  course   Course @relation(fields: [courseId], references: [id])\n\n  semesterId String\n  semester   Semester @relation(fields: [semesterId], references: [id])\n\n  facultyId String?\n  faculty   Faculty? @relation(fields: [facultyId], references: [id])\n\n  enrollments Enrollment[]\n  attendances CourseAttendance[]\n  grades      CourseResult[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@unique([courseId, semesterId, sectionName], name: "unique_section_per_semester")\n  @@map("sections")\n}\n\nmodel Enrollment {\n  id        String  @id @default(uuid(7))\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  sectionId String\n  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)\n\n  status     EnrollmentStatus @default(ENROLLED)\n  enrolledAt DateTime         @default(now())\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  @@unique([studentId, sectionId], name: "unique_student_section_enrollment")\n  @@map("enrollments")\n}\n\nmodel CourseAttendance {\n  id      String           @id @default(uuid(7))\n  date    DateTime\n  status  AttendanceStatus @default(PRESENT)\n  remarks String?\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  sectionId String\n  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([studentId, sectionId, date], name: "unique_student_daily_attendance")\n  @@map("course_attendances")\n}\n\nmodel ChatRoom {\n  id                String   @id @default(uuid(7))\n  applicationId     String?  @unique\n  studentUserId     String\n  mode              ChatMode @default(COLLABORATIVE_GROUP)\n  isLocked          Boolean  @default(false)\n  lockedByAgentId   String?\n  lockedByAgentName String?\n\n  messages ChatMessage[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("chat_rooms")\n}\n\nmodel ChatMessage {\n  id     String    @id @default(uuid(7))\n  roomId String?\n  room   ChatRoom? @relation(fields: [roomId], references: [id], onDelete: Cascade)\n\n  message           String\n  attachmentUrl     String?\n  senderDisplayName String?\n  senderRoleBadge   String\n  isRead            Boolean @default(false)\n\n  senderId String\n  sender   User   @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)\n\n  receiverId String?\n  receiver   User?   @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([senderId, receiverId], name: "idx_chat_participants")\n  @@map("chat_messages")\n}\n\nmodel Notification {\n  id        String               @id @default(uuid(7))\n  title     String\n  body      String\n  audience  NotificationAudience @default(ALL)\n  priority  NotificationPriority @default(INFO)\n  actionUrl String?\n  isRead    Boolean              @default(false)\n\n  userId String?\n  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId, isRead], name: "idx_notification_user")\n  @@map("notifications")\n}\n\nenum Role {\n  SUPER_ADMIN\n  ADMIN\n  COUNSELOR\n  STUDENT\n}\n\nenum UniversityPaymentType {\n  FREE\n  UPFRONT_FEE\n  OFFER_DEPOSIT\n}\n\nenum StudentAccessScope {\n  ACADEMIC_ONLY\n  HIGHER_STUDY_ONLY\n  BOTH\n}\n\nenum AuthProvider {\n  CREDENTIAL\n  GOOGLE\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum ChatMode {\n  EXCLUSIVE_LOCK\n  COLLABORATIVE_GROUP\n}\n\nenum CommissionStatus {\n  PENDING\n  APPROVED\n  WITHDRAWN\n}\n\nenum CommissionVisibilityMode {\n  FULL_BREAKDOWN\n  NET_ONLY\n  HIDDEN\n}\n\nenum OtpType {\n  EMAIL_VERIFICATION\n  PASSWORD_RESET\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum DegreeLevel {\n  FOUNDATION\n  BACHELOR\n  MASTER\n  PHD\n}\n\nenum EnrollmentStatus {\n  ENROLLED\n  DROPPED\n  COMPLETED\n}\n\nenum AttendanceStatus {\n  PRESENT\n  ABSENT\n  LATE\n  EXCUSED\n}\n\nenum PaymentStatus {\n  UNPAID\n  PENDING\n  PAID\n  FAILED\n  REFUNDED\n}\n\nenum PaymentType {\n  TUITION_FEE\n  SEMESTER_FEE\n  EXAM_FEE\n  APPLICATION_FEE\n  OFFER_DEPOSIT\n  OTHER\n}\n\nenum ApplicationStatus {\n  DRAFT\n  SUBMITTED\n  DOCS_PENDING\n  UNDER_REVIEW\n  OFFER_ISSUED\n  VISA_PROCESSING\n  ENROLLED\n  REJECTED\n}\n\nenum DocumentStatus {\n  REQUIRED\n  UPLOADED\n  VERIFIED\n  REJECTED\n}\n\nenum NotificationAudience {\n  ACADEMIC\n  HIGHER_STUDY\n  ALL\n}\n\nenum NotificationPriority {\n  INFO\n  WARNING\n  CRITICAL_ALERT\n  ACTION_REQUIRED\n}\n\nmodel CourseResult {\n  id          String  @id @default(uuid(7))\n  marks       Float\n  gradePoint  Float\n  letterGrade String\n  remarks     String?\n  isPublished Boolean @default(false)\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  sectionId String\n  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)\n\n  semesterId String\n  semester   Semester @relation(fields: [semesterId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([studentId, sectionId], name: "unique_student_course_grade")\n  @@map("course_results")\n}\n\nmodel Country {\n  id          String  @id @default(uuid(7))\n  name        String  @unique\n  code        String  @unique\n  currency    String  @default("EUR")\n  description String?\n  flagUrl     String?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  universities GlobalUniversity[]\n\n  @@map("countries")\n}\n\nmodel GlobalUniversity {\n  id              String                @id @default(uuid(7))\n  name            String\n  city            String\n  website         String?\n  logoUrl         String?\n  coverImageUrl   String?\n  description     String?\n  paymentType     UniversityPaymentType @default(FREE)\n  applicationFee  Decimal               @default(0.0) @db.Decimal(10, 2)\n  offerDepositFee Decimal               @default(0.0) @db.Decimal(10, 2)\n\n  countryId String\n  country   Country @relation(fields: [countryId], references: [id])\n\n  programs        GlobalProgram[]\n  docRequirements UniversityDocRequirement[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("global_universities")\n}\n\nmodel UniversityDocRequirement {\n  id          String  @id @default(uuid(7))\n  title       String\n  description String?\n  isRequired  Boolean @default(true)\n  docType     String  @default("PDF")\n\n  universityId String\n  university   GlobalUniversity @relation(fields: [universityId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("university_doc_requirements")\n}\n\nmodel GlobalProgram {\n  id                  String      @id @default(uuid(7))\n  name                String\n  degreeLevel         DegreeLevel @default(BACHELOR)\n  durationYears       Float       @default(4.0)\n  tuitionFee          Decimal     @db.Decimal(10, 2)\n  initialDeposit      Decimal     @db.Decimal(10, 2)\n  intakeSeason        String?\n  applicationDeadline DateTime?\n  ieltsRequirement    Float?\n  academicRequirement String?\n\n  universityId String\n  university   GlobalUniversity @relation(fields: [universityId], references: [id])\n\n  applications HigherStudyApplication[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("global_programs")\n}\n\nmodel HigherStudyApplication {\n  id                  String            @id @default(uuid(7))\n  applicationNumber   String            @unique\n  status              ApplicationStatus @default(DRAFT)\n  isFeePaid           Boolean           @default(false)\n  isOfferUnlocked     Boolean           @default(false)\n  offerLetterUrl      String?\n  offerLetterPublicId String?\n  offerIssuedAt       DateTime?\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  counselorId String?\n  counselor   Counselor? @relation(fields: [counselorId], references: [id])\n\n  programId String\n  program   GlobalProgram @relation(fields: [programId], references: [id])\n\n  documents ApplicationDocument[]\n  payments  Payment[]\n  notes     CounselorNote[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("higher_study_applications")\n}\n\nmodel CounselorNote {\n  id        String  @id @default(uuid(7))\n  note      String\n  isPrivate Boolean @default(false)\n\n  applicationId String\n  application   HigherStudyApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n\n  counselorId String\n  counselor   Counselor @relation(fields: [counselorId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("counselor_notes")\n}\n\nmodel ApplicationDocument {\n  id            String         @id @default(uuid(7))\n  title         String\n  instruction   String?\n  status        DocumentStatus @default(REQUIRED)\n  fileUrl       String?\n  filePublicId  String?\n  fileType      String?\n  isCustom      Boolean        @default(false)\n  adminFeedback String?\n  uploadedAt    DateTime?\n\n  applicationId String\n  application   HigherStudyApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("application_documents")\n}\n\nmodel BlogPost {\n  id          String   @id @default(uuid(7))\n  title       String\n  slug        String   @unique\n  content     String\n  bannerUrl   String?\n  category    String   @default("Study Abroad Guide")\n  tags        String[] @default([])\n  isPublished Boolean  @default(true)\n\n  authorId String\n  author   User   @relation(fields: [authorId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("blog_posts")\n}\n\nmodel AgencyCommission {\n  id               String  @id @default(uuid(7))\n  applicationId    String?\n  studentId        String\n  referredByUserId String\n  referredByUser   User    @relation(fields: [referredByUserId], references: [id])\n\n  universityName         String\n  grossAmount            Decimal @db.Decimal(10, 2)\n  currency               String  @default("EUR")\n  vatPercentage          Decimal @default(10.0) @db.Decimal(5, 2)\n  vatAmount              Decimal @db.Decimal(10, 2)\n  companySharePercentage Decimal @default(10.0) @db.Decimal(5, 2)\n  companyShareAmount     Decimal @default(0.0) @db.Decimal(10, 2)\n  companyShareAmountBDT  Decimal @default(0.0) @db.Decimal(12, 2)\n  netAmount              Decimal @db.Decimal(10, 2)\n  exchangeRateToBDT      Decimal @db.Decimal(10, 2)\n  netAmountBDT           Decimal @db.Decimal(12, 2)\n  grossAmountBDT         Decimal @db.Decimal(12, 2)\n\n  status      CommissionStatus @default(PENDING)\n  withdrawnAt DateTime?\n  notes       String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([referredByUserId, status], name: "idx_commission_agent")\n  @@map("agency_commissions")\n}\n\nmodel Payment {\n  id          String        @id @default(uuid(7))\n  amount      Decimal       @db.Decimal(10, 2)\n  currency    String        @default("USD")\n  paymentType PaymentType   @default(TUITION_FEE)\n  status      PaymentStatus @default(PENDING)\n\n  stripeSessionId       String?   @unique\n  stripePaymentIntentId String?   @unique\n  stripeReceiptUrl      String?\n  paidAt                DateTime?\n  description           String?\n\n  studentId String\n  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  semesterId String?\n  semester   Semester? @relation(fields: [semesterId], references: [id])\n\n  higherStudyApplicationId String?\n  higherStudyApplication   HigherStudyApplication? @relation(fields: [higherStudyApplicationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([stripeSessionId], name: "idx_payment_stripe_session")\n  @@map("payments")\n}\n\n// Prisma 7.9.1 Schema Configuration\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id              String       @id @default(uuid(7))\n  name            String\n  email           String       @unique\n  password        String?\n  googleId        String?      @unique\n  authProvider    AuthProvider @default(CREDENTIAL)\n  role            Role         @default(STUDENT)\n  status          UserStatus   @default(ACTIVE)\n  isEmailVerified Boolean      @default(false)\n  otpCode         String?\n  otpExpiresAt    DateTime?\n  otpType         OtpType?\n  imageUrl        String       @default("")\n  imagePublicId   String       @default("")\n  isDeleted       Boolean      @default(false)\n  deletedAt       DateTime?\n  createdAt       DateTime     @default(now())\n  updatedAt       DateTime     @updatedAt\n\n  student   Student?   @relation("UserStudentProfile")\n  faculty   Faculty?\n  counselor Counselor?\n  blogPosts BlogPost[]\n\n  referredStudents Student[]          @relation("ReferredStudents")\n  commissions      AgencyCommission[]\n\n  sentMessages     ChatMessage[]  @relation("SentMessages")\n  receivedMessages ChatMessage[]  @relation("ReceivedMessages")\n  notifications    Notification[]\n\n  @@index([email], name: "idx_user_email")\n  @@map("users")\n}\n\nmodel Student {\n  id            String             @id @default(uuid(7))\n  studentId     String             @unique\n  contactNumber String?\n  address       String?\n  gender        Gender?\n  dateOfBirth   DateTime?\n  accessScope   StudentAccessScope @default(BOTH)\n\n  targetBudget      Decimal? @db.Decimal(10, 2)\n  preferredCurrency String?  @default("USD")\n  preferredCountry  String?\n\n  referredByUserId String?\n  referredByUser   User?   @relation("ReferredStudents", fields: [referredByUserId], references: [id])\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  userId String @unique\n  user   User   @relation("UserStudentProfile", fields: [userId], references: [id], onDelete: Cascade)\n\n  departmentId String?\n  department   Department? @relation(fields: [departmentId], references: [id])\n\n  enrollments     Enrollment[]\n  attendances     CourseAttendance[]\n  grades          CourseResult[]\n  payments        Payment[]\n  higherStudyApps HigherStudyApplication[]\n\n  @@index([studentId], name: "idx_student_studentId")\n  @@map("students")\n}\n\nmodel Faculty {\n  id            String  @id @default(uuid(7))\n  facultyId     String  @unique\n  designation   String\n  contactNumber String?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  departmentId String?\n  department   Department? @relation(fields: [departmentId], references: [id])\n\n  sections Section[]\n\n  @@index([facultyId], name: "idx_faculty_facultyId")\n  @@map("faculties")\n}\n\nmodel Counselor {\n  id                            String                   @id @default(uuid(7))\n  counselorId                   String                   @unique\n  designation                   String                   @default("Study Abroad Counselor")\n  contactNumber                 String?\n  specialization                String?\n  commissionVisibilityMode      CommissionVisibilityMode @default(HIDDEN)\n  defaultVatPercentage          Decimal                  @default(10.0) @db.Decimal(5, 2)\n  defaultCompanySharePercentage Decimal                  @default(10.0) @db.Decimal(5, 2)\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  assignedApplications HigherStudyApplication[]\n  counselorNotes       CounselorNote[]\n\n  @@index([counselorId], name: "idx_counselor_counselorId")\n  @@map("counselors")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"Department":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"students","kind":"object","type":"Student","relationName":"DepartmentToStudent"},{"name":"faculties","kind":"object","type":"Faculty","relationName":"DepartmentToFaculty"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToDepartment"}],"dbName":"departments","schema":null},"Semester":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"isCurrent","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sections","kind":"object","type":"Section","relationName":"SectionToSemester"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToSemester"},{"name":"grades","kind":"object","type":"CourseResult","relationName":"CourseResultToSemester"}],"dbName":"semesters","schema":null},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"credits","kind":"scalar","type":"Int"},{"name":"tuitionFee","kind":"scalar","type":"Decimal"},{"name":"description","kind":"scalar","type":"String"},{"name":"prerequisiteId","kind":"scalar","type":"String"},{"name":"prerequisite","kind":"object","type":"Course","relationName":"Prerequisites"},{"name":"dependentCourses","kind":"object","type":"Course","relationName":"Prerequisites"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"department","kind":"object","type":"Department","relationName":"CourseToDepartment"},{"name":"sections","kind":"object","type":"Section","relationName":"CourseToSection"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"courses","schema":null},"Section":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sectionName","kind":"scalar","type":"String"},{"name":"maxCapacity","kind":"scalar","type":"Int"},{"name":"availableSeats","kind":"scalar","type":"Int"},{"name":"roomNumber","kind":"scalar","type":"String"},{"name":"scheduleTime","kind":"scalar","type":"String"},{"name":"courseId","kind":"scalar","type":"String"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToSection"},{"name":"semesterId","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"SectionToSemester"},{"name":"facultyId","kind":"scalar","type":"String"},{"name":"faculty","kind":"object","type":"Faculty","relationName":"FacultyToSection"},{"name":"enrollments","kind":"object","type":"Enrollment","relationName":"EnrollmentToSection"},{"name":"attendances","kind":"object","type":"CourseAttendance","relationName":"CourseAttendanceToSection"},{"name":"grades","kind":"object","type":"CourseResult","relationName":"CourseResultToSection"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"sections","schema":null},"Enrollment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"EnrollmentToStudent"},{"name":"sectionId","kind":"scalar","type":"String"},{"name":"section","kind":"object","type":"Section","relationName":"EnrollmentToSection"},{"name":"status","kind":"enum","type":"EnrollmentStatus"},{"name":"enrolledAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"enrollments","schema":null},"CourseAttendance":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"AttendanceStatus"},{"name":"remarks","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"CourseAttendanceToStudent"},{"name":"sectionId","kind":"scalar","type":"String"},{"name":"section","kind":"object","type":"Section","relationName":"CourseAttendanceToSection"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"course_attendances","schema":null},"ChatRoom":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"studentUserId","kind":"scalar","type":"String"},{"name":"mode","kind":"enum","type":"ChatMode"},{"name":"isLocked","kind":"scalar","type":"Boolean"},{"name":"lockedByAgentId","kind":"scalar","type":"String"},{"name":"lockedByAgentName","kind":"scalar","type":"String"},{"name":"messages","kind":"object","type":"ChatMessage","relationName":"ChatMessageToChatRoom"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"chat_rooms","schema":null},"ChatMessage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"room","kind":"object","type":"ChatRoom","relationName":"ChatMessageToChatRoom"},{"name":"message","kind":"scalar","type":"String"},{"name":"attachmentUrl","kind":"scalar","type":"String"},{"name":"senderDisplayName","kind":"scalar","type":"String"},{"name":"senderRoleBadge","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"sender","kind":"object","type":"User","relationName":"SentMessages"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"receiver","kind":"object","type":"User","relationName":"ReceivedMessages"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"chat_messages","schema":null},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"body","kind":"scalar","type":"String"},{"name":"audience","kind":"enum","type":"NotificationAudience"},{"name":"priority","kind":"enum","type":"NotificationPriority"},{"name":"actionUrl","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"notifications","schema":null},"CourseResult":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"marks","kind":"scalar","type":"Float"},{"name":"gradePoint","kind":"scalar","type":"Float"},{"name":"letterGrade","kind":"scalar","type":"String"},{"name":"remarks","kind":"scalar","type":"String"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"CourseResultToStudent"},{"name":"sectionId","kind":"scalar","type":"String"},{"name":"section","kind":"object","type":"Section","relationName":"CourseResultToSection"},{"name":"semesterId","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"CourseResultToSemester"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"course_results","schema":null},"Country":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"currency","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"flagUrl","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"universities","kind":"object","type":"GlobalUniversity","relationName":"CountryToGlobalUniversity"}],"dbName":"countries","schema":null},"GlobalUniversity":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"website","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"coverImageUrl","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"paymentType","kind":"enum","type":"UniversityPaymentType"},{"name":"applicationFee","kind":"scalar","type":"Decimal"},{"name":"offerDepositFee","kind":"scalar","type":"Decimal"},{"name":"countryId","kind":"scalar","type":"String"},{"name":"country","kind":"object","type":"Country","relationName":"CountryToGlobalUniversity"},{"name":"programs","kind":"object","type":"GlobalProgram","relationName":"GlobalProgramToGlobalUniversity"},{"name":"docRequirements","kind":"object","type":"UniversityDocRequirement","relationName":"GlobalUniversityToUniversityDocRequirement"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"global_universities","schema":null},"UniversityDocRequirement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isRequired","kind":"scalar","type":"Boolean"},{"name":"docType","kind":"scalar","type":"String"},{"name":"universityId","kind":"scalar","type":"String"},{"name":"university","kind":"object","type":"GlobalUniversity","relationName":"GlobalUniversityToUniversityDocRequirement"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"university_doc_requirements","schema":null},"GlobalProgram":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"degreeLevel","kind":"enum","type":"DegreeLevel"},{"name":"durationYears","kind":"scalar","type":"Float"},{"name":"tuitionFee","kind":"scalar","type":"Decimal"},{"name":"initialDeposit","kind":"scalar","type":"Decimal"},{"name":"intakeSeason","kind":"scalar","type":"String"},{"name":"applicationDeadline","kind":"scalar","type":"DateTime"},{"name":"ieltsRequirement","kind":"scalar","type":"Float"},{"name":"academicRequirement","kind":"scalar","type":"String"},{"name":"universityId","kind":"scalar","type":"String"},{"name":"university","kind":"object","type":"GlobalUniversity","relationName":"GlobalProgramToGlobalUniversity"},{"name":"applications","kind":"object","type":"HigherStudyApplication","relationName":"GlobalProgramToHigherStudyApplication"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"global_programs","schema":null},"HigherStudyApplication":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"applicationNumber","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ApplicationStatus"},{"name":"isFeePaid","kind":"scalar","type":"Boolean"},{"name":"isOfferUnlocked","kind":"scalar","type":"Boolean"},{"name":"offerLetterUrl","kind":"scalar","type":"String"},{"name":"offerLetterPublicId","kind":"scalar","type":"String"},{"name":"offerIssuedAt","kind":"scalar","type":"DateTime"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"HigherStudyApplicationToStudent"},{"name":"counselorId","kind":"scalar","type":"String"},{"name":"counselor","kind":"object","type":"Counselor","relationName":"CounselorToHigherStudyApplication"},{"name":"programId","kind":"scalar","type":"String"},{"name":"program","kind":"object","type":"GlobalProgram","relationName":"GlobalProgramToHigherStudyApplication"},{"name":"documents","kind":"object","type":"ApplicationDocument","relationName":"ApplicationDocumentToHigherStudyApplication"},{"name":"payments","kind":"object","type":"Payment","relationName":"HigherStudyApplicationToPayment"},{"name":"notes","kind":"object","type":"CounselorNote","relationName":"CounselorNoteToHigherStudyApplication"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"higher_study_applications","schema":null},"CounselorNote":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"isPrivate","kind":"scalar","type":"Boolean"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"application","kind":"object","type":"HigherStudyApplication","relationName":"CounselorNoteToHigherStudyApplication"},{"name":"counselorId","kind":"scalar","type":"String"},{"name":"counselor","kind":"object","type":"Counselor","relationName":"CounselorToCounselorNote"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"counselor_notes","schema":null},"ApplicationDocument":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"instruction","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"DocumentStatus"},{"name":"fileUrl","kind":"scalar","type":"String"},{"name":"filePublicId","kind":"scalar","type":"String"},{"name":"fileType","kind":"scalar","type":"String"},{"name":"isCustom","kind":"scalar","type":"Boolean"},{"name":"adminFeedback","kind":"scalar","type":"String"},{"name":"uploadedAt","kind":"scalar","type":"DateTime"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"application","kind":"object","type":"HigherStudyApplication","relationName":"ApplicationDocumentToHigherStudyApplication"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"application_documents","schema":null},"BlogPost":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"bannerUrl","kind":"scalar","type":"String"},{"name":"category","kind":"scalar","type":"String"},{"name":"tags","kind":"scalar","type":"String"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"author","kind":"object","type":"User","relationName":"BlogPostToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"blog_posts","schema":null},"AgencyCommission":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"referredByUserId","kind":"scalar","type":"String"},{"name":"referredByUser","kind":"object","type":"User","relationName":"AgencyCommissionToUser"},{"name":"universityName","kind":"scalar","type":"String"},{"name":"grossAmount","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"vatPercentage","kind":"scalar","type":"Decimal"},{"name":"vatAmount","kind":"scalar","type":"Decimal"},{"name":"companySharePercentage","kind":"scalar","type":"Decimal"},{"name":"companyShareAmount","kind":"scalar","type":"Decimal"},{"name":"companyShareAmountBDT","kind":"scalar","type":"Decimal"},{"name":"netAmount","kind":"scalar","type":"Decimal"},{"name":"exchangeRateToBDT","kind":"scalar","type":"Decimal"},{"name":"netAmountBDT","kind":"scalar","type":"Decimal"},{"name":"grossAmountBDT","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"CommissionStatus"},{"name":"withdrawnAt","kind":"scalar","type":"DateTime"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"agency_commissions","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"paymentType","kind":"enum","type":"PaymentType"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"stripePaymentIntentId","kind":"scalar","type":"String"},{"name":"stripeReceiptUrl","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"description","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"PaymentToStudent"},{"name":"semesterId","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"PaymentToSemester"},{"name":"higherStudyApplicationId","kind":"scalar","type":"String"},{"name":"higherStudyApplication","kind":"object","type":"HigherStudyApplication","relationName":"HigherStudyApplicationToPayment"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payments","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"authProvider","kind":"enum","type":"AuthProvider"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"isEmailVerified","kind":"scalar","type":"Boolean"},{"name":"otpCode","kind":"scalar","type":"String"},{"name":"otpExpiresAt","kind":"scalar","type":"DateTime"},{"name":"otpType","kind":"enum","type":"OtpType"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"imagePublicId","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"Student","relationName":"UserStudentProfile"},{"name":"faculty","kind":"object","type":"Faculty","relationName":"FacultyToUser"},{"name":"counselor","kind":"object","type":"Counselor","relationName":"CounselorToUser"},{"name":"blogPosts","kind":"object","type":"BlogPost","relationName":"BlogPostToUser"},{"name":"referredStudents","kind":"object","type":"Student","relationName":"ReferredStudents"},{"name":"commissions","kind":"object","type":"AgencyCommission","relationName":"AgencyCommissionToUser"},{"name":"sentMessages","kind":"object","type":"ChatMessage","relationName":"SentMessages"},{"name":"receivedMessages","kind":"object","type":"ChatMessage","relationName":"ReceivedMessages"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"}],"dbName":"users","schema":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"dateOfBirth","kind":"scalar","type":"DateTime"},{"name":"accessScope","kind":"enum","type":"StudentAccessScope"},{"name":"targetBudget","kind":"scalar","type":"Decimal"},{"name":"preferredCurrency","kind":"scalar","type":"String"},{"name":"preferredCountry","kind":"scalar","type":"String"},{"name":"referredByUserId","kind":"scalar","type":"String"},{"name":"referredByUser","kind":"object","type":"User","relationName":"ReferredStudents"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserStudentProfile"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"department","kind":"object","type":"Department","relationName":"DepartmentToStudent"},{"name":"enrollments","kind":"object","type":"Enrollment","relationName":"EnrollmentToStudent"},{"name":"attendances","kind":"object","type":"CourseAttendance","relationName":"CourseAttendanceToStudent"},{"name":"grades","kind":"object","type":"CourseResult","relationName":"CourseResultToStudent"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToStudent"},{"name":"higherStudyApps","kind":"object","type":"HigherStudyApplication","relationName":"HigherStudyApplicationToStudent"}],"dbName":"students","schema":null},"Faculty":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"facultyId","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"FacultyToUser"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"department","kind":"object","type":"Department","relationName":"DepartmentToFaculty"},{"name":"sections","kind":"object","type":"Section","relationName":"FacultyToSection"}],"dbName":"faculties","schema":null},"Counselor":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"counselorId","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"specialization","kind":"scalar","type":"String"},{"name":"commissionVisibilityMode","kind":"enum","type":"CommissionVisibilityMode"},{"name":"defaultVatPercentage","kind":"scalar","type":"Decimal"},{"name":"defaultCompanySharePercentage","kind":"scalar","type":"Decimal"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CounselorToUser"},{"name":"assignedApplications","kind":"object","type":"HigherStudyApplication","relationName":"CounselorToHigherStudyApplication"},{"name":"counselorNotes","kind":"object","type":"CounselorNote","relationName":"CounselorToCounselorNote"}],"dbName":"counselors","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","student","user","department","prerequisite","dependentCourses","sections","_count","course","semester","assignedApplications","application","counselor","counselorNotes","universities","country","programs","university","docRequirements","applications","program","documents","payments","notes","higherStudyApplication","section","grades","faculty","enrollments","attendances","author","blogPosts","referredStudents","referredByUser","commissions","messages","room","sender","receiver","sentMessages","receivedMessages","notifications","higherStudyApps","students","faculties","courses","Department.findUnique","Department.findUniqueOrThrow","Department.findFirst","Department.findFirstOrThrow","Department.findMany","data","Department.createOne","Department.createMany","Department.createManyAndReturn","Department.updateOne","Department.updateMany","Department.updateManyAndReturn","create","update","Department.upsertOne","Department.deleteOne","Department.deleteMany","having","_min","_max","Department.groupBy","Department.aggregate","Semester.findUnique","Semester.findUniqueOrThrow","Semester.findFirst","Semester.findFirstOrThrow","Semester.findMany","Semester.createOne","Semester.createMany","Semester.createManyAndReturn","Semester.updateOne","Semester.updateMany","Semester.updateManyAndReturn","Semester.upsertOne","Semester.deleteOne","Semester.deleteMany","Semester.groupBy","Semester.aggregate","Course.findUnique","Course.findUniqueOrThrow","Course.findFirst","Course.findFirstOrThrow","Course.findMany","Course.createOne","Course.createMany","Course.createManyAndReturn","Course.updateOne","Course.updateMany","Course.updateManyAndReturn","Course.upsertOne","Course.deleteOne","Course.deleteMany","_avg","_sum","Course.groupBy","Course.aggregate","Section.findUnique","Section.findUniqueOrThrow","Section.findFirst","Section.findFirstOrThrow","Section.findMany","Section.createOne","Section.createMany","Section.createManyAndReturn","Section.updateOne","Section.updateMany","Section.updateManyAndReturn","Section.upsertOne","Section.deleteOne","Section.deleteMany","Section.groupBy","Section.aggregate","Enrollment.findUnique","Enrollment.findUniqueOrThrow","Enrollment.findFirst","Enrollment.findFirstOrThrow","Enrollment.findMany","Enrollment.createOne","Enrollment.createMany","Enrollment.createManyAndReturn","Enrollment.updateOne","Enrollment.updateMany","Enrollment.updateManyAndReturn","Enrollment.upsertOne","Enrollment.deleteOne","Enrollment.deleteMany","Enrollment.groupBy","Enrollment.aggregate","CourseAttendance.findUnique","CourseAttendance.findUniqueOrThrow","CourseAttendance.findFirst","CourseAttendance.findFirstOrThrow","CourseAttendance.findMany","CourseAttendance.createOne","CourseAttendance.createMany","CourseAttendance.createManyAndReturn","CourseAttendance.updateOne","CourseAttendance.updateMany","CourseAttendance.updateManyAndReturn","CourseAttendance.upsertOne","CourseAttendance.deleteOne","CourseAttendance.deleteMany","CourseAttendance.groupBy","CourseAttendance.aggregate","ChatRoom.findUnique","ChatRoom.findUniqueOrThrow","ChatRoom.findFirst","ChatRoom.findFirstOrThrow","ChatRoom.findMany","ChatRoom.createOne","ChatRoom.createMany","ChatRoom.createManyAndReturn","ChatRoom.updateOne","ChatRoom.updateMany","ChatRoom.updateManyAndReturn","ChatRoom.upsertOne","ChatRoom.deleteOne","ChatRoom.deleteMany","ChatRoom.groupBy","ChatRoom.aggregate","ChatMessage.findUnique","ChatMessage.findUniqueOrThrow","ChatMessage.findFirst","ChatMessage.findFirstOrThrow","ChatMessage.findMany","ChatMessage.createOne","ChatMessage.createMany","ChatMessage.createManyAndReturn","ChatMessage.updateOne","ChatMessage.updateMany","ChatMessage.updateManyAndReturn","ChatMessage.upsertOne","ChatMessage.deleteOne","ChatMessage.deleteMany","ChatMessage.groupBy","ChatMessage.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","CourseResult.findUnique","CourseResult.findUniqueOrThrow","CourseResult.findFirst","CourseResult.findFirstOrThrow","CourseResult.findMany","CourseResult.createOne","CourseResult.createMany","CourseResult.createManyAndReturn","CourseResult.updateOne","CourseResult.updateMany","CourseResult.updateManyAndReturn","CourseResult.upsertOne","CourseResult.deleteOne","CourseResult.deleteMany","CourseResult.groupBy","CourseResult.aggregate","Country.findUnique","Country.findUniqueOrThrow","Country.findFirst","Country.findFirstOrThrow","Country.findMany","Country.createOne","Country.createMany","Country.createManyAndReturn","Country.updateOne","Country.updateMany","Country.updateManyAndReturn","Country.upsertOne","Country.deleteOne","Country.deleteMany","Country.groupBy","Country.aggregate","GlobalUniversity.findUnique","GlobalUniversity.findUniqueOrThrow","GlobalUniversity.findFirst","GlobalUniversity.findFirstOrThrow","GlobalUniversity.findMany","GlobalUniversity.createOne","GlobalUniversity.createMany","GlobalUniversity.createManyAndReturn","GlobalUniversity.updateOne","GlobalUniversity.updateMany","GlobalUniversity.updateManyAndReturn","GlobalUniversity.upsertOne","GlobalUniversity.deleteOne","GlobalUniversity.deleteMany","GlobalUniversity.groupBy","GlobalUniversity.aggregate","UniversityDocRequirement.findUnique","UniversityDocRequirement.findUniqueOrThrow","UniversityDocRequirement.findFirst","UniversityDocRequirement.findFirstOrThrow","UniversityDocRequirement.findMany","UniversityDocRequirement.createOne","UniversityDocRequirement.createMany","UniversityDocRequirement.createManyAndReturn","UniversityDocRequirement.updateOne","UniversityDocRequirement.updateMany","UniversityDocRequirement.updateManyAndReturn","UniversityDocRequirement.upsertOne","UniversityDocRequirement.deleteOne","UniversityDocRequirement.deleteMany","UniversityDocRequirement.groupBy","UniversityDocRequirement.aggregate","GlobalProgram.findUnique","GlobalProgram.findUniqueOrThrow","GlobalProgram.findFirst","GlobalProgram.findFirstOrThrow","GlobalProgram.findMany","GlobalProgram.createOne","GlobalProgram.createMany","GlobalProgram.createManyAndReturn","GlobalProgram.updateOne","GlobalProgram.updateMany","GlobalProgram.updateManyAndReturn","GlobalProgram.upsertOne","GlobalProgram.deleteOne","GlobalProgram.deleteMany","GlobalProgram.groupBy","GlobalProgram.aggregate","HigherStudyApplication.findUnique","HigherStudyApplication.findUniqueOrThrow","HigherStudyApplication.findFirst","HigherStudyApplication.findFirstOrThrow","HigherStudyApplication.findMany","HigherStudyApplication.createOne","HigherStudyApplication.createMany","HigherStudyApplication.createManyAndReturn","HigherStudyApplication.updateOne","HigherStudyApplication.updateMany","HigherStudyApplication.updateManyAndReturn","HigherStudyApplication.upsertOne","HigherStudyApplication.deleteOne","HigherStudyApplication.deleteMany","HigherStudyApplication.groupBy","HigherStudyApplication.aggregate","CounselorNote.findUnique","CounselorNote.findUniqueOrThrow","CounselorNote.findFirst","CounselorNote.findFirstOrThrow","CounselorNote.findMany","CounselorNote.createOne","CounselorNote.createMany","CounselorNote.createManyAndReturn","CounselorNote.updateOne","CounselorNote.updateMany","CounselorNote.updateManyAndReturn","CounselorNote.upsertOne","CounselorNote.deleteOne","CounselorNote.deleteMany","CounselorNote.groupBy","CounselorNote.aggregate","ApplicationDocument.findUnique","ApplicationDocument.findUniqueOrThrow","ApplicationDocument.findFirst","ApplicationDocument.findFirstOrThrow","ApplicationDocument.findMany","ApplicationDocument.createOne","ApplicationDocument.createMany","ApplicationDocument.createManyAndReturn","ApplicationDocument.updateOne","ApplicationDocument.updateMany","ApplicationDocument.updateManyAndReturn","ApplicationDocument.upsertOne","ApplicationDocument.deleteOne","ApplicationDocument.deleteMany","ApplicationDocument.groupBy","ApplicationDocument.aggregate","BlogPost.findUnique","BlogPost.findUniqueOrThrow","BlogPost.findFirst","BlogPost.findFirstOrThrow","BlogPost.findMany","BlogPost.createOne","BlogPost.createMany","BlogPost.createManyAndReturn","BlogPost.updateOne","BlogPost.updateMany","BlogPost.updateManyAndReturn","BlogPost.upsertOne","BlogPost.deleteOne","BlogPost.deleteMany","BlogPost.groupBy","BlogPost.aggregate","AgencyCommission.findUnique","AgencyCommission.findUniqueOrThrow","AgencyCommission.findFirst","AgencyCommission.findFirstOrThrow","AgencyCommission.findMany","AgencyCommission.createOne","AgencyCommission.createMany","AgencyCommission.createManyAndReturn","AgencyCommission.updateOne","AgencyCommission.updateMany","AgencyCommission.updateManyAndReturn","AgencyCommission.upsertOne","AgencyCommission.deleteOne","AgencyCommission.deleteMany","AgencyCommission.groupBy","AgencyCommission.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","Faculty.findUnique","Faculty.findUniqueOrThrow","Faculty.findFirst","Faculty.findFirstOrThrow","Faculty.findMany","Faculty.createOne","Faculty.createMany","Faculty.createManyAndReturn","Faculty.updateOne","Faculty.updateMany","Faculty.updateManyAndReturn","Faculty.upsertOne","Faculty.deleteOne","Faculty.deleteMany","Faculty.groupBy","Faculty.aggregate","Counselor.findUnique","Counselor.findUniqueOrThrow","Counselor.findFirst","Counselor.findFirstOrThrow","Counselor.findMany","Counselor.createOne","Counselor.createMany","Counselor.createManyAndReturn","Counselor.updateOne","Counselor.updateMany","Counselor.updateManyAndReturn","Counselor.upsertOne","Counselor.deleteOne","Counselor.deleteMany","Counselor.groupBy","Counselor.aggregate","AND","OR","NOT","id","counselorId","designation","contactNumber","specialization","CommissionVisibilityMode","commissionVisibilityMode","defaultVatPercentage","defaultCompanySharePercentage","isDeleted","deletedAt","createdAt","updatedAt","userId","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","facultyId","departmentId","studentId","address","Gender","gender","dateOfBirth","StudentAccessScope","accessScope","targetBudget","preferredCurrency","preferredCountry","referredByUserId","name","email","password","googleId","AuthProvider","authProvider","Role","role","UserStatus","status","isEmailVerified","otpCode","otpExpiresAt","OtpType","otpType","imageUrl","imagePublicId","amount","currency","PaymentType","paymentType","PaymentStatus","stripeSessionId","stripePaymentIntentId","stripeReceiptUrl","paidAt","description","semesterId","higherStudyApplicationId","applicationId","universityName","grossAmount","vatPercentage","vatAmount","companySharePercentage","companyShareAmount","companyShareAmountBDT","netAmount","exchangeRateToBDT","netAmountBDT","grossAmountBDT","CommissionStatus","withdrawnAt","title","slug","content","bannerUrl","category","tags","isPublished","authorId","has","hasEvery","hasSome","instruction","DocumentStatus","fileUrl","filePublicId","fileType","isCustom","adminFeedback","uploadedAt","note","isPrivate","applicationNumber","ApplicationStatus","isFeePaid","isOfferUnlocked","offerLetterUrl","offerLetterPublicId","offerIssuedAt","programId","DegreeLevel","degreeLevel","durationYears","tuitionFee","initialDeposit","intakeSeason","applicationDeadline","ieltsRequirement","academicRequirement","universityId","isRequired","docType","city","website","logoUrl","coverImageUrl","UniversityPaymentType","applicationFee","offerDepositFee","countryId","code","flagUrl","marks","gradePoint","letterGrade","remarks","sectionId","body","NotificationAudience","audience","NotificationPriority","priority","actionUrl","isRead","roomId","message","attachmentUrl","senderDisplayName","senderRoleBadge","senderId","receiverId","studentUserId","ChatMode","mode","isLocked","lockedByAgentId","lockedByAgentName","date","AttendanceStatus","EnrollmentStatus","enrolledAt","sectionName","maxCapacity","availableSeats","roomNumber","scheduleTime","courseId","credits","prerequisiteId","startDate","endDate","isCurrent","unique_student_daily_attendance","unique_student_section_enrollment","unique_student_course_grade","unique_section_per_semester","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "-g3gAYADDi0AAIMGACAuAACKBwAgLwAAggcAILgDAACJBwAwuQMAAAwAELoDAACJBwAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBAAAAAf4DAQDZBQAhwAQBAAAAAQEAAAABACAcBAAA3wUAIAUAANEGACAYAADNBgAgHAAAzgYAIB4AAIcHACAfAACIBwAgIwAA1QYAICwAAOAFACC4AwAAiwcAMLkDAAADABC6AwAAiwcAMLsDAQDYBQAhvgMBANkFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIcgDAQDYBQAh2AMBANkFACHZAwEA2AUAIdoDAQDZBQAh3AMAAIwH3AMj3QNAAN0FACHfAwAAjQffAyLgAxAAjgcAIeEDAQDZBQAh4gMBANkFACHjAwEA2QUAIRIEAADxBwAgBQAAmAwAIBgAAO0LACAcAADuCwAgHgAApAwAIB8AAKUMACAjAADxBwAgLAAA8gcAIL4DAACPBwAgxQMAAI8HACDYAwAAjwcAINoDAACPBwAg3AMAAI8HACDdAwAAjwcAIOADAACPBwAg4QMAAI8HACDiAwAAjwcAIOMDAACPBwAgHAQAAN8FACAFAADRBgAgGAAAzQYAIBwAAM4GACAeAACHBwAgHwAAiAcAICMAANUGACAsAADgBQAguAMAAIsHADC5AwAAAwAQugMAAIsHADC7AwEAAAABvgMBANkFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIcgDAQAAAAHYAwEA2QUAIdkDAQAAAAHaAwEA2QUAIdwDAACMB9wDI90DQADdBQAh3wMAAI0H3wMi4AMQAI4HACHhAwEA2QUAIeIDAQDZBQAh4wMBANkFACEDAAAAAwAgAQAABAAwAgAABQAgHgMAAP8FACAOAACBBgAgHQAAgAYAICEAAIIGACAiAACDBgAgJAAAhAYAICkAAIUGACAqAACFBgAgKwAAhgYAILgDAAD6BQAwuQMAAAcAELoDAAD6BQAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAh5QMBANgFACHmAwEA2QUAIecDAQDZBQAh6QMAAPsF6QMi6wMAAPwF6wMi7QMAAP0F7QMi7gMgANwFACHvAwEA2QUAIfADQADdBQAh8gMAAP4F8gMj8wMBANgFACH0AwEA2AUAIQEAAAAHACABAAAAAwAgEAQAAN8FACAFAADRBgAgCAAAzAYAILgDAADQBgAwuQMAAAoAELoDAADQBgAwuwMBANgFACG9AwEA2AUAIb4DAQDZBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHIAwEA2AUAIdcDAQDYBQAh2AMBANkFACEBAAAACgAgDi0AAIMGACAuAACKBwAgLwAAggcAILgDAACJBwAwuQMAAAwAELoDAACJBwAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAh_gMBANkFACHABAEA2AUAIQEAAAAMACAWCgAAhgcAIAsAAOYGACAcAADOBgAgHQAAgAYAIB4AAIcHACAfAACIBwAguAMAAIUHADC5AwAADgAQugMAAIUHADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh1wMBANkFACH_AwEA2AUAId8EAQDYBQAh4AQCAIAHACHhBAIAgAcAIeIEAQDZBQAh4wQBANkFACHkBAEA2AUAIQoKAACjDAAgCwAAmwwAIBwAAO4LACAdAACLCgAgHgAApAwAIB8AAKUMACDFAwAAjwcAINcDAACPBwAg4gQAAI8HACDjBAAAjwcAIBcKAACGBwAgCwAA5gYAIBwAAM4GACAdAACABgAgHgAAhwcAIB8AAIgHACC4AwAAhQcAMLkDAAAOABC6AwAAhQcAMLsDAQAAAAHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdcDAQDZBQAh_wMBANgFACHfBAEA2AUAIeAEAgCABwAh4QQCAIAHACHiBAEA2QUAIeMEAQDZBQAh5AQBANgFACHtBAAAhAcAIAMAAAAOACABAAAPADACAAAQACATBQAAgwcAIAYAAIEHACAHAACCBwAgCAAAzAYAILgDAAD_BgAwuQMAABIAELoDAAD_BgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdgDAQDYBQAh_gMBANkFACGPBAEA2AUAIa8EEADbBQAhwAQBANgFACHlBAIAgAcAIeYEAQDZBQAhAQAAABIAIAcFAACYDAAgBgAAowwAIAcAAJcMACAIAADsCwAgxQMAAI8HACD-AwAAjwcAIOYEAACPBwAgEwUAAIMHACAGAACBBwAgBwAAggcAIAgAAMwGACC4AwAA_wYAMLkDAAASABC6AwAA_wYAMLsDAQAAAAHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdgDAQDYBQAh_gMBANkFACGPBAEA2AUAIa8EEADbBQAhwAQBAAAAAeUEAgCABwAh5gQBANkFACEDAAAAEgAgAQAAFAAwAgAAFQAgAwAAAA4AIAEAAA8AMAIAABAAIAEAAAASACABAAAADgAgAwAAAA4AIAEAAA8AMAIAABAAIBUDAADeBgAgCwAA_QYAIBoAAP4GACC4AwAA-gYAMLkDAAAbABC6AwAA-gYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIdkDAQDYBQAh7QMAAPwG-gMi9QMQANsFACH2AwEA2AUAIfgDAAD7BvgDIvoDAQDZBQAh-wMBANkFACH8AwEA2QUAIf0DQADdBQAh_gMBANkFACH_AwEA2QUAIYAEAQDZBQAhCgMAAIoKACALAACbDAAgGgAAnAwAIPoDAACPBwAg-wMAAI8HACD8AwAAjwcAIP0DAACPBwAg_gMAAI8HACD_AwAAjwcAIIAEAACPBwAgFQMAAN4GACALAAD9BgAgGgAA_gYAILgDAAD6BgAwuQMAABsAELoDAAD6BgAwuwMBAAAAAcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIe0DAAD8BvoDIvUDEADbBQAh9gMBANgFACH4AwAA-wb4AyL6AwEAAAAB-wMBAAAAAfwDAQDZBQAh_QNAAN0FACH-AwEA2QUAIf8DAQDZBQAhgAQBANkFACEDAAAAGwAgAQAAHAAwAgAAHQAgEAgAAMwGACAYAADNBgAgHAAAzgYAILgDAADLBgAwuQMAAB8AELoDAADLBgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAhwAQBANgFACHnBEAA3gUAIegEQADeBQAh6QQgANwFACEBAAAAHwAgGAMAAN4GACAOAACBBgAgFgAA-AYAIBcAAPkGACAYAADNBgAgGQAA4QUAILgDAAD2BgAwuQMAACEAELoDAAD2BgAwuwMBANgFACG8AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh2QMBANgFACHtAwAA9wamBCKkBAEA2AUAIaYEIADcBQAhpwQgANwFACGoBAEA2QUAIakEAQDZBQAhqgRAAN0FACGrBAEA2AUAIQEAAAAhACATBAAA3wUAIAwAAOAFACAPAADhBQAguAMAANcFADC5AwAAIwAQugMAANcFADC7AwEA2AUAIbwDAQDYBQAhvQMBANgFACG-AwEA2QUAIb8DAQDZBQAhwQMAANoFwQMiwgMQANsFACHDAxAA2wUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAhyAMBANgFACEBAAAAIwAgCwMAAIoKACAOAACMCgAgFgAAoQwAIBcAAKIMACAYAADtCwAgGQAA8wcAILwDAACPBwAgxQMAAI8HACCoBAAAjwcAIKkEAACPBwAgqgQAAI8HACAYAwAA3gYAIA4AAIEGACAWAAD4BgAgFwAA-QYAIBgAAM0GACAZAADhBQAguAMAAPYGADC5AwAAIQAQugMAAPYGADC7AwEAAAABvAMBANkFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdkDAQDYBQAh7QMAAPcGpgQipAQBAAAAAaYEIADcBQAhpwQgANwFACGoBAEA2QUAIakEAQDZBQAhqgRAAN0FACGrBAEA2AUAIQMAAAAhACABAAAlADACAAAmACAMDQAA6QYAIA4AAPUGACC4AwAA9AYAMLkDAAAoABC6AwAA9AYAMLsDAQDYBQAhvAMBANgFACHGA0AA3gUAIccDQADeBQAhgQQBANgFACGiBAEA2AUAIaMEIADcBQAhAg0AAJwMACAOAACMCgAgDA0AAOkGACAOAAD1BgAguAMAAPQGADC5AwAAKAAQugMAAPQGADC7AwEAAAABvAMBANgFACHGA0AA3gUAIccDQADeBQAhgQQBANgFACGiBAEA2AUAIaMEIADcBQAhAwAAACgAIAEAACkAMAIAACoAIAEAAAAhACABAAAAKAAgFREAAPEGACASAADyBgAgFAAA8wYAILgDAADvBgAwuQMAAC4AELoDAADvBgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAh-AMAAPAGvQQi_gMBANkFACG4BAEA2AUAIbkEAQDZBQAhugQBANkFACG7BAEA2QUAIb0EEADbBQAhvgQQANsFACG_BAEA2AUAIQgRAACeDAAgEgAAnwwAIBQAAKAMACDFAwAAjwcAIP4DAACPBwAguQQAAI8HACC6BAAAjwcAILsEAACPBwAgFREAAPEGACASAADyBgAgFAAA8wYAILgDAADvBgAwuQMAAC4AELoDAADvBgAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACH4AwAA8Aa9BCL-AwEA2QUAIbgEAQDYBQAhuQQBANkFACG6BAEA2QUAIbsEAQDZBQAhvQQQANsFACG-BBAA2wUAIb8EAQDYBQAhAwAAAC4AIAEAAC8AMAIAADAAIAEAAAAuACAUEwAA6wYAIBUAAOAFACC4AwAA7AYAMLkDAAAzABC6AwAA7AYAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIa0EAADtBq0EIq4ECADlBgAhrwQQANsFACGwBBAA2wUAIbEEAQDZBQAhsgRAAN0FACGzBAgA7gYAIbQEAQDZBQAhtQQBANgFACEHEwAAnQwAIBUAAPIHACDFAwAAjwcAILEEAACPBwAgsgQAAI8HACCzBAAAjwcAILQEAACPBwAgFBMAAOsGACAVAADgBQAguAMAAOwGADC5AwAAMwAQugMAAOwGADC7AwEAAAABxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIa0EAADtBq0EIq4ECADlBgAhrwQQANsFACGwBBAA2wUAIbEEAQDZBQAhsgRAAN0FACGzBAgA7gYAIbQEAQDZBQAhtQQBANgFACEDAAAAMwAgAQAANAAwAgAANQAgDBMAAOsGACC4AwAA6gYAMLkDAAA3ABC6AwAA6gYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIf4DAQDZBQAhjwQBANgFACG1BAEA2AUAIbYEIADcBQAhtwQBANgFACECEwAAnQwAIP4DAACPBwAgDBMAAOsGACC4AwAA6gYAMLkDAAA3ABC6AwAA6gYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAh_gMBANkFACGPBAEA2AUAIbUEAQDYBQAhtgQgANwFACG3BAEA2AUAIQMAAAA3ACABAAA4ADACAAA5ACABAAAAMwAgAQAAADcAIAMAAAAhACABAAAlADACAAAmACABAAAAIQAgEQ0AAOkGACC4AwAA5wYAMLkDAAA_ABC6AwAA5wYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIe0DAADoBpwEIoEEAQDYBQAhjwQBANgFACGaBAEA2QUAIZwEAQDZBQAhnQQBANkFACGeBAEA2QUAIZ8EIADcBQAhoAQBANkFACGhBEAA3QUAIQcNAACcDAAgmgQAAI8HACCcBAAAjwcAIJ0EAACPBwAgngQAAI8HACCgBAAAjwcAIKEEAACPBwAgEQ0AAOkGACC4AwAA5wYAMLkDAAA_ABC6AwAA5wYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAh7QMAAOgGnAQigQQBANgFACGPBAEA2AUAIZoEAQDZBQAhnAQBANkFACGdBAEA2QUAIZ4EAQDZBQAhnwQgANwFACGgBAEA2QUAIaEEQADdBQAhAwAAAD8AIAEAAEAAMAIAAEEAIAMAAAAbACABAAAcADACAAAdACADAAAAKAAgAQAAKQAwAgAAKgAgAQAAAD8AIAEAAAAbACABAAAAKAAgEQMAAN4GACALAADmBgAgGwAA3wYAILgDAADkBgAwuQMAAEgAELoDAADkBgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh2QMBANgFACH_AwEA2AUAIZUEIADcBQAhwgQIAOUGACHDBAgA5QYAIcQEAQDYBQAhxQQBANkFACHGBAEA2AUAIQQDAACKCgAgCwAAmwwAIBsAAJoMACDFBAAAjwcAIBIDAADeBgAgCwAA5gYAIBsAAN8GACC4AwAA5AYAMLkDAABIABC6AwAA5AYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAh2QMBANgFACH_AwEA2AUAIZUEIADcBQAhwgQIAOUGACHDBAgA5QYAIcQEAQDYBQAhxQQBANkFACHGBAEA2AUAIewEAADjBgAgAwAAAEgAIAEAAEkAMAIAAEoAIAEAAAAOACABAAAAGwAgAQAAAEgAIAEAAAAKACAMAwAA3gYAIBsAAN8GACC4AwAA4QYAMLkDAABQABC6AwAA4QYAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIdkDAQDYBQAh7QMAAOIG3gQixgQBANgFACHeBEAA3gUAIQMDAACKCgAgGwAAmgwAIMUDAACPBwAgDQMAAN4GACAbAADfBgAguAMAAOEGADC5AwAAUAAQugMAAOEGADC7AwEAAAABxAMgANwFACHFA0AA3QUAIdkDAQDYBQAh7QMAAOIG3gQixgQBANgFACHeBEAA3gUAIesEAADgBgAgAwAAAFAAIAEAAFEAMAIAAFIAIA0DAADeBgAgGwAA3wYAILgDAADcBgAwuQMAAFQAELoDAADcBgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh2QMBANgFACHtAwAA3QbdBCLFBAEA2QUAIcYEAQDYBQAh2wRAAN4FACEDAwAAigoAIBsAAJoMACDFBAAAjwcAIA4DAADeBgAgGwAA3wYAILgDAADcBgAwuQMAAFQAELoDAADcBgAwuwMBAAAAAcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIe0DAADdBt0EIsUEAQDZBQAhxgQBANgFACHbBEAA3gUAIeoEAADbBgAgAwAAAFQAIAEAAFUAMAIAAFYAIAMAAABIACABAABJADACAABKACABAAAAUAAgAQAAAFQAIAEAAABIACABAAAADgAgAQAAACMAIA8gAADfBQAguAMAANoGADC5AwAAXgAQugMAANoGADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACGPBAEA2AUAIZAEAQDYBQAhkQQBANgFACGSBAEA2QUAIZMEAQDYBQAhlAQAAJMGACCVBCAA3AUAIZYEAQDYBQAhAiAAAPEHACCSBAAAjwcAIA8gAADfBQAguAMAANoGADC5AwAAXgAQugMAANoGADC7AwEAAAABxgNAAN4FACHHA0AA3gUAIY8EAQDYBQAhkAQBAAAAAZEEAQDYBQAhkgQBANkFACGTBAEA2AUAIZQEAACTBgAglQQgANwFACGWBAEA2AUAIQMAAABeACABAABfADACAABgACADAAAAAwAgAQAABAAwAgAABQAgGRkBANkFACEjAADfBQAguAMAANgGADC5AwAAYwAQugMAANgGADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIeMDAQDYBQAh7QMAANkGjgQi9gMBANgFACGBBAEA2QUAIYIEAQDYBQAhgwQQANsFACGEBBAA2wUAIYUEEADbBQAhhgQQANsFACGHBBAA2wUAIYgEEADbBQAhiQQQANsFACGKBBAA2wUAIYsEEADbBQAhjAQQANsFACGOBEAA3QUAIQQZAACPBwAgIwAA8QcAIIEEAACPBwAgjgQAAI8HACAZGQEA2QUAISMAAN8FACC4AwAA2AYAMLkDAABjABC6AwAA2AYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAh2QMBANgFACHjAwEA2AUAIe0DAADZBo4EIvYDAQDYBQAhgQQBANkFACGCBAEA2AUAIYMEEADbBQAhhAQQANsFACGFBBAA2wUAIYYEEADbBQAhhwQQANsFACGIBBAA2wUAIYkEEADbBQAhigQQANsFACGLBBAA2wUAIYwEEADbBQAhjgRAAN0FACEDAAAAYwAgAQAAZAAwAgAAZQAgESYAANcGACAnAADfBQAgKAAA1QYAILgDAADWBgAwuQMAAGcAELoDAADWBgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAhzQQgANwFACHOBAEA2QUAIc8EAQDYBQAh0AQBANkFACHRBAEA2QUAIdIEAQDYBQAh0wQBANgFACHUBAEA2QUAIQcmAACZDAAgJwAA8QcAICgAAPEHACDOBAAAjwcAINAEAACPBwAg0QQAAI8HACDUBAAAjwcAIBEmAADXBgAgJwAA3wUAICgAANUGACC4AwAA1gYAMLkDAABnABC6AwAA1gYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAhzQQgANwFACHOBAEA2QUAIc8EAQDYBQAh0AQBANkFACHRBAEA2QUAIdIEAQDYBQAh0wQBANgFACHUBAEA2QUAIQMAAABnACABAABoADACAABpACANJQAAhQYAILgDAAC8BgAwuQMAAGsAELoDAAC8BgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAhgQQBANkFACHVBAEA2AUAIdcEAAC9BtcEItgEIADcBQAh2QQBANkFACHaBAEA2QUAIQEAAABrACADAAAAZwAgAQAAaAAwAgAAaQAgAQAAAGcAIAEAAAAHACADAAAAZwAgAQAAaAAwAgAAaQAgDgQAANUGACC4AwAA0gYAMLkDAABxABC6AwAA0gYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIcgDAQDZBQAhjwQBANgFACHHBAEA2AUAIckEAADTBskEIssEAADUBssEIswEAQDZBQAhzQQgANwFACEDBAAA8QcAIMgDAACPBwAgzAQAAI8HACAOBAAA1QYAILgDAADSBgAwuQMAAHEAELoDAADSBgAwuwMBAAAAAcYDQADeBQAhxwNAAN4FACHIAwEA2QUAIY8EAQDYBQAhxwQBANgFACHJBAAA0wbJBCLLBAAA1AbLBCLMBAEA2QUAIc0EIADcBQAhAwAAAHEAIAEAAHIAMAIAAHMAIAEAAAAHACABAAAAXgAgAQAAAAMAIAEAAABjACABAAAAZwAgAQAAAGcAIAEAAABxACABAAAADAAgAwAAAFAAIAEAAFEAMAIAAFIAIAMAAABUACABAABVADACAABWACADAAAASAAgAQAASQAwAgAASgAgAwAAABsAIAEAABwAMAIAAB0AIAMAAAAhACABAAAlADACAAAmACABAAAAUAAgAQAAAFQAIAEAAABIACABAAAAGwAgAQAAACEAIAYEAADxBwAgBQAAmAwAIAgAAOwLACC-AwAAjwcAIMUDAACPBwAg2AMAAI8HACAQBAAA3wUAIAUAANEGACAIAADMBgAguAMAANAGADC5AwAACgAQugMAANAGADC7AwEAAAABvQMBANgFACG-AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAhyAMBAAAAAdcDAQAAAAHYAwEA2QUAIQMAAAAKACABAACHAQAwAgAAiAEAIAMAAAASACABAAAUADACAAAVACABAAAAAwAgAQAAAAoAIAEAAAASACABAAAAAQAgBS0AAI4KACAuAACWDAAgLwAAlwwAIMUDAACPBwAg_gMAAI8HACADAAAADAAgAQAAjwEAMAIAAAEAIAMAAAAMACABAACPAQAwAgAAAQAgAwAAAAwAIAEAAI8BADACAAABACALLQAAkwwAIC4AAJQMACAvAACVDAAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB_gMBAAAAAcAEAQAAAAEBNQAAkwEAIAi7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAH-AwEAAAABwAQBAAAAAQE1AACVAQAwATUAAJUBADALLQAA8gsAIC4AAPMLACAvAAD0CwAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh_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_AwEAAAAB3wQBAAAAAeAEAgAAAAHhBAIAAAAB4gQBAAAAAeMEAQAAAAHkBAEAAAABATUAANkBACANuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHXAwEAAAAB_wMBAAAAAd8EAQAAAAHgBAIAAAAB4QQCAAAAAeIEAQAAAAHjBAEAAAAB5AQBAAAAAQE1AADbAQAwATUAANsBADABAAAACgAgEwoAAIYIACALAACHCAAgHAAAiggAIB0AAKQLACAeAACICAAgHwAAiQgAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHXAwEAlgcAIf8DAQCVBwAh3wQBAJUHACHgBAIAhAgAIeEEAgCECAAh4gQBAJYHACHjBAEAlgcAIeQEAQCVBwAhAgAAABAAIDUAAN8BACANuwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh_wMBAJUHACHfBAEAlQcAIeAEAgCECAAh4QQCAIQIACHiBAEAlgcAIeMEAQCWBwAh5AQBAJUHACECAAAADgAgNQAA4QEAIAIAAAAOACA1AADhAQAgAQAAAAoAIAMAAAAQACA8AADZAQAgPQAA3wEAIAEAAAAQACABAAAADgAgCQkAAJ8LACBCAACiCwAgQwAAoQsAIGQAAKALACBlAACjCwAgxQMAAI8HACDXAwAAjwcAIOIEAACPBwAg4wQAAI8HACAQuAMAAMYGADC5AwAA6QEAELoDAADGBgAwuwMBAMAFACHEAyAAxAUAIcUDQADFBQAhxgNAAMYFACHHA0AAxgUAIdcDAQDBBQAh_wMBAMAFACHfBAEAwAUAIeAEAgDHBgAh4QQCAMcGACHiBAEAwQUAIeMEAQDBBQAh5AQBAMAFACEDAAAADgAgAQAA6AEAMEEAAOkBACADAAAADgAgAQAADwAwAgAAEAAgAQAAAFIAIAEAAABSACADAAAAUAAgAQAAUQAwAgAAUgAgAwAAAFAAIAEAAFEAMAIAAFIAIAMAAABQACABAABRADACAABSACAJAwAAuQgAIBsAAIkJACC7AwEAAAABxAMgAAAAAcUDQAAAAAHZAwEAAAAB7QMAAADeBALGBAEAAAAB3gRAAAAAAQE1AADxAQAgB7sDAQAAAAHEAyAAAAABxQNAAAAAAdkDAQAAAAHtAwAAAN4EAsYEAQAAAAHeBEAAAAABATUAAPMBADABNQAA8wEAMAkDAAC3CAAgGwAAhwkAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIdkDAQCVBwAh7QMAALUI3gQixgQBAJUHACHeBEAAmwcAIQIAAABSACA1AAD2AQAgB7sDAQCVBwAhxAMgAJkHACHFA0AAmgcAIdkDAQCVBwAh7QMAALUI3gQixgQBAJUHACHeBEAAmwcAIQIAAABQACA1AAD4AQAgAgAAAFAAIDUAAPgBACADAAAAUgAgPAAA8QEAID0AAPYBACABAAAAUgAgAQAAAFAAIAQJAACcCwAgQgAAngsAIEMAAJ0LACDFAwAAjwcAIAq4AwAAwgYAMLkDAAD_AQAQugMAAMIGADC7AwEAwAUAIcQDIADEBQAhxQNAAMUFACHZAwEAwAUAIe0DAADDBt4EIsYEAQDABQAh3gRAAMYFACEDAAAAUAAgAQAA_gEAMEEAAP8BACADAAAAUAAgAQAAUQAwAgAAUgAgAQAAAFYAIAEAAABWACADAAAAVAAgAQAAVQAwAgAAVgAgAwAAAFQAIAEAAFUAMAIAAFYAIAMAAABUACABAABVADACAABWACAKAwAAqggAIBsAAP4IACC7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB7QMAAADdBALFBAEAAAABxgQBAAAAAdsEQAAAAAEBNQAAhwIAIAi7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB7QMAAADdBALFBAEAAAABxgQBAAAAAdsEQAAAAAEBNQAAiQIAMAE1AACJAgAwCgMAAKgIACAbAAD8CAAguwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACHtAwAApgjdBCLFBAEAlgcAIcYEAQCVBwAh2wRAAJsHACECAAAAVgAgNQAAjAIAIAi7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIe0DAACmCN0EIsUEAQCWBwAhxgQBAJUHACHbBEAAmwcAIQIAAABUACA1AACOAgAgAgAAAFQAIDUAAI4CACADAAAAVgAgPAAAhwIAID0AAIwCACABAAAAVgAgAQAAAFQAIAQJAACZCwAgQgAAmwsAIEMAAJoLACDFBAAAjwcAIAu4AwAAvgYAMLkDAACVAgAQugMAAL4GADC7AwEAwAUAIcYDQADGBQAhxwNAAMYFACHZAwEAwAUAIe0DAAC_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_wMBAAAAAZUEIAAAAAHCBAgAAAABwwQIAAAAAcQEAQAAAAHFBAEAAAABxgQBAAAAAQE1AADpAgAwATUAAOkCADAOAwAAlwgAIAsAAJgIACAbAADxCAAguwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACH_AwEAlQcAIZUEIACZBwAhwgQIAJUIACHDBAgAlQgAIcQEAQCVBwAhxQQBAJYHACHGBAEAlQcAIQIAAABKACA1AADsAgAgC7sDAQCVBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh_wMBAJUHACGVBCAAmQcAIcIECACVCAAhwwQIAJUIACHEBAEAlQcAIcUEAQCWBwAhxgQBAJUHACECAAAASAAgNQAA7gIAIAIAAABIACA1AADuAgAgAwAAAEoAIDwAAOcCACA9AADsAgAgAQAAAEoAIAEAAABIACAGCQAA_QoAIEIAAIALACBDAAD_CgAgZAAA_goAIGUAAIELACDFBAAAjwcAIA64AwAArwYAMLkDAAD1AgAQugMAAK8GADC7AwEAwAUAIcYDQADGBQAhxwNAAMYFACHZAwEAwAUAIf8DAQDABQAhlQQgAMQFACHCBAgAnwYAIcMECACfBgAhxAQBAMAFACHFBAEAwQUAIcYEAQDABQAhAwAAAEgAIAEAAPQCADBBAAD1AgAgAwAAAEgAIAEAAEkAMAIAAEoAIA4QAACuBgAguAMAAK0GADC5AwAA-wIAELoDAACtBgAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBAAAAAfYDAQDYBQAh_gMBANkFACHABAEAAAABwQQBANkFACEBAAAA-AIAIAEAAAD4AgAgDhAAAK4GACC4AwAArQYAMLkDAAD7AgAQugMAAK0GADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACH2AwEA2AUAIf4DAQDZBQAhwAQBANgFACHBBAEA2QUAIQQQAAD8CgAgxQMAAI8HACD-AwAAjwcAIMEEAACPBwAgAwAAAPsCACABAAD8AgAwAgAA-AIAIAMAAAD7AgAgAQAA_AIAMAIAAPgCACADAAAA-wIAIAEAAPwCADACAAD4AgAgCxAAAPsKACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAH2AwEAAAAB_gMBAAAAAcAEAQAAAAHBBAEAAAABATUAAIADACAKuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB9gMBAAAAAf4DAQAAAAHABAEAAAABwQQBAAAAAQE1AACCAwAwATUAAIIDADALEAAA7goAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIfYDAQCVBwAh_gMBAJYHACHABAEAlQcAIcEEAQCWBwAhAgAAAPgCACA1AACFAwAgCrsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIfYDAQCVBwAh_gMBAJYHACHABAEAlQcAIcEEAQCWBwAhAgAAAPsCACA1AACHAwAgAgAAAPsCACA1AACHAwAgAwAAAPgCACA8AACAAwAgPQAAhQMAIAEAAAD4AgAgAQAAAPsCACAGCQAA6woAIEIAAO0KACBDAADsCgAgxQMAAI8HACD-AwAAjwcAIMEEAACPBwAgDbgDAACsBgAwuQMAAI4DABC6AwAArAYAMLsDAQDABQAhxAMgAMQFACHFA0AAxQUAIcYDQADGBQAhxwNAAMYFACHkAwEAwAUAIfYDAQDABQAh_gMBAMEFACHABAEAwAUAIcEEAQDBBQAhAwAAAPsCACABAACNAwAwQQAAjgMAIAMAAAD7AgAgAQAA_AIAMAIAAPgCACABAAAAMAAgAQAAADAAIAMAAAAuACABAAAvADACAAAwACADAAAALgAgAQAALwAwAgAAMAAgAwAAAC4AIAEAAC8AMAIAADAAIBIRAADoCgAgEgAA6QoAIBQAAOoKACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAH4AwAAAL0EAv4DAQAAAAG4BAEAAAABuQQBAAAAAboEAQAAAAG7BAEAAAABvQQQAAAAAb4EEAAAAAG_BAEAAAABATUAAJYDACAPuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB-AMAAAC9BAL-AwEAAAABuAQBAAAAAbkEAQAAAAG6BAEAAAABuwQBAAAAAb0EEAAAAAG-BBAAAAABvwQBAAAAAQE1AACYAwAwATUAAJgDADASEQAAzQoAIBIAAM4KACAUAADPCgAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh-AMAAMwKvQQi_gMBAJYHACG4BAEAlQcAIbkEAQCWBwAhugQBAJYHACG7BAEAlgcAIb0EEACYBwAhvgQQAJgHACG_BAEAlQcAIQIAAAAwACA1AACbAwAgD7sDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIfgDAADMCr0EIv4DAQCWBwAhuAQBAJUHACG5BAEAlgcAIboEAQCWBwAhuwQBAJYHACG9BBAAmAcAIb4EEACYBwAhvwQBAJUHACECAAAALgAgNQAAnQMAIAIAAAAuACA1AACdAwAgAwAAADAAIDwAAJYDACA9AACbAwAgAQAAADAAIAEAAAAuACAKCQAAxwoAIEIAAMoKACBDAADJCgAgZAAAyAoAIGUAAMsKACDFAwAAjwcAIP4DAACPBwAguQQAAI8HACC6BAAAjwcAILsEAACPBwAgErgDAACoBgAwuQMAAKQDABC6AwAAqAYAMLsDAQDABQAhxAMgAMQFACHFA0AAxQUAIcYDQADGBQAhxwNAAMYFACHkAwEAwAUAIfgDAACpBr0EIv4DAQDBBQAhuAQBAMAFACG5BAEAwQUAIboEAQDBBQAhuwQBAMEFACG9BBAAwwUAIb4EEADDBQAhvwQBAMAFACEDAAAALgAgAQAAowMAMEEAAKQDACADAAAALgAgAQAALwAwAgAAMAAgAQAAADkAIAEAAAA5ACADAAAANwAgAQAAOAAwAgAAOQAgAwAAADcAIAEAADgAMAIAADkAIAMAAAA3ACABAAA4ADACAAA5ACAJEwAAxgoAILsDAQAAAAHGA0AAAAABxwNAAAAAAf4DAQAAAAGPBAEAAAABtQQBAAAAAbYEIAAAAAG3BAEAAAABATUAAKwDACAIuwMBAAAAAcYDQAAAAAHHA0AAAAAB_gMBAAAAAY8EAQAAAAG1BAEAAAABtgQgAAAAAbcEAQAAAAEBNQAArgMAMAE1AACuAwAwCRMAAMUKACC7AwEAlQcAIcYDQACbBwAhxwNAAJsHACH-AwEAlgcAIY8EAQCVBwAhtQQBAJUHACG2BCAAmQcAIbcEAQCVBwAhAgAAADkAIDUAALEDACAIuwMBAJUHACHGA0AAmwcAIccDQACbBwAh_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_gMAELoDAACYBgAwuwMBAMAFACG8AwEAwAUAIcYDQADGBQAhxwNAAMYFACGBBAEAwAUAIaIEAQDABQAhowQgAMQFACEDAAAAKAAgAQAA_QMAMEEAAP4DACADAAAAKAAgAQAAKQAwAgAAKgAgAQAAAEEAIAEAAABBACADAAAAPwAgAQAAQAAwAgAAQQAgAwAAAD8AIAEAAEAAMAIAAEEAIAMAAAA_ACABAABAADACAABBACAODQAApwoAILsDAQAAAAHGA0AAAAABxwNAAAAAAe0DAAAAnAQCgQQBAAAAAY8EAQAAAAGaBAEAAAABnAQBAAAAAZ0EAQAAAAGeBAEAAAABnwQgAAAAAaAEAQAAAAGhBEAAAAABATUAAIYEACANuwMBAAAAAcYDQAAAAAHHA0AAAAAB7QMAAACcBAKBBAEAAAABjwQBAAAAAZoEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBCAAAAABoAQBAAAAAaEEQAAAAAEBNQAAiAQAMAE1AACIBAAwDg0AAKYKACC7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHtAwAA5QecBCKBBAEAlQcAIY8EAQCVBwAhmgQBAJYHACGcBAEAlgcAIZ0EAQCWBwAhngQBAJYHACGfBCAAmQcAIaAEAQCWBwAhoQRAAJoHACECAAAAQQAgNQAAiwQAIA27AwEAlQcAIcYDQACbBwAhxwNAAJsHACHtAwAA5QecBCKBBAEAlQcAIY8EAQCVBwAhmgQBAJYHACGcBAEAlgcAIZ0EAQCWBwAhngQBAJYHACGfBCAAmQcAIaAEAQCWBwAhoQRAAJoHACECAAAAPwAgNQAAjQQAIAIAAAA_ACA1AACNBAAgAwAAAEEAIDwAAIYEACA9AACLBAAgAQAAAEEAIAEAAAA_ACAJCQAAowoAIEIAAKUKACBDAACkCgAgmgQAAI8HACCcBAAAjwcAIJ0EAACPBwAgngQAAI8HACCgBAAAjwcAIKEEAACPBwAgELgDAACUBgAwuQMAAJQEABC6AwAAlAYAMLsDAQDABQAhxgNAAMYFACHHA0AAxgUAIe0DAACVBpwEIoEEAQDABQAhjwQBAMAFACGaBAEAwQUAIZwEAQDBBQAhnQQBAMEFACGeBAEAwQUAIZ8EIADEBQAhoAQBAMEFACGhBEAAxQUAIQMAAAA_ACABAACTBAAwQQAAlAQAIAMAAAA_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-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_gMBAAAAAf8DAQAAAAGABAEAAAABATUAAMgEACAPuwMBAAAAAcYDQAAAAAHHA0AAAAAB2QMBAAAAAe0DAAAA-gMC9QMQAAAAAfYDAQAAAAH4AwAAAPgDAvoDAQAAAAH7AwEAAAAB_AMBAAAAAf0DQAAAAAH-AwEAAAAB_wMBAAAAAYAEAQAAAAEBNQAAygQAMAE1AADKBAAwAQAAAB8AIAEAAAAhACASAwAA1gcAIAsAANcHACAaAADmCAAguwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACHtAwAA1Af6AyL1AxAAmAcAIfYDAQCVBwAh-AMAANMH-AMi-gMBAJYHACH7AwEAlgcAIfwDAQCWBwAh_QNAAJoHACH-AwEAlgcAIf8DAQCWBwAhgAQBAJYHACECAAAAHQAgNQAAzwQAIA-7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIe0DAADUB_oDIvUDEACYBwAh9gMBAJUHACH4AwAA0wf4AyL6AwEAlgcAIfsDAQCWBwAh_AMBAJYHACH9A0AAmgcAIf4DAQCWBwAh_wMBAJYHACGABAEAlgcAIQIAAAAbACA1AADRBAAgAgAAABsAIDUAANEEACABAAAAHwAgAQAAACEAIAMAAAAdACA8AADIBAAgPQAAzwQAIAEAAAAdACABAAAAGwAgDAkAAJIKACBCAACVCgAgQwAAlAoAIGQAAJMKACBlAACWCgAg-gMAAI8HACD7AwAAjwcAIPwDAACPBwAg_QMAAI8HACD-AwAAjwcAIP8DAACPBwAggAQAAI8HACASuAMAAIcGADC5AwAA2gQAELoDAACHBgAwuwMBAMAFACHGA0AAxgUAIccDQADGBQAh2QMBAMAFACHtAwAAiQb6AyL1AxAAwwUAIfYDAQDABQAh-AMAAIgG-AMi-gMBAMEFACH7AwEAwQUAIfwDAQDBBQAh_QNAAMUFACH-AwEAwQUAIf8DAQDBBQAhgAQBAMEFACEDAAAAGwAgAQAA2QQAMEEAANoEACADAAAAGwAgAQAAHAAwAgAAHQAgHgMAAP8FACAOAACBBgAgHQAAgAYAICEAAIIGACAiAACDBgAgJAAAhAYAICkAAIUGACAqAACFBgAgKwAAhgYAILgDAAD6BQAwuQMAAAcAELoDAAD6BQAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACHlAwEAAAAB5gMBANkFACHnAwEAAAAB6QMAAPsF6QMi6wMAAPwF6wMi7QMAAP0F7QMi7gMgANwFACHvAwEA2QUAIfADQADdBQAh8gMAAP4F8gMj8wMBANgFACH0AwEA2AUAIQEAAADdBAAgAQAAAN0EACAPAwAAigoAIA4AAIwKACAdAACLCgAgIQAAjQoAICIAAI4KACAkAACPCgAgKQAAkAoAICoAAJAKACArAACRCgAgxQMAAI8HACDmAwAAjwcAIOcDAACPBwAg7wMAAI8HACDwAwAAjwcAIPIDAACPBwAgAwAAAAcAIAEAAOAEADACAADdBAAgAwAAAAcAIAEAAOAEADACAADdBAAgAwAAAAcAIAEAAOAEADACAADdBAAgGwMAAIEKACAOAACDCgAgHQAAggoAICEAAIQKACAiAACFCgAgJAAAhgoAICkAAIcKACAqAACICgAgKwAAiQoAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAekDAAAA6QMC6wMAAADrAwLtAwAAAO0DAu4DIAAAAAHvAwEAAAAB8ANAAAAAAfIDAAAA8gMD8wMBAAAAAfQDAQAAAAEBNQAA5AQAIBK7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHpAwAAAOkDAusDAAAA6wMC7QMAAADtAwLuAyAAAAAB7wMBAAAAAfADQAAAAAHyAwAAAPIDA_MDAQAAAAH0AwEAAAABATUAAOYEADABNQAA5gQAMBsDAACZCQAgDgAAmwkAIB0AAJoJACAhAACcCQAgIgAAnQkAICQAAJ4JACApAACfCQAgKgAAoAkAICsAAKEJACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACHlAwEAlQcAIeYDAQCWBwAh5wMBAJYHACHpAwAAlQnpAyLrAwAAlgnrAyLtAwAAlwntAyLuAyAAmQcAIe8DAQCWBwAh8ANAAJoHACHyAwAAmAnyAyPzAwEAlQcAIfQDAQCVBwAhAgAAAN0EACA1AADpBAAgErsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACECAAAABwAgNQAA6wQAIAIAAAAHACA1AADrBAAgAwAAAN0EACA8AADkBAAgPQAA6QQAIAEAAADdBAAgAQAAAAcAIAkJAACSCQAgQgAAlAkAIEMAAJMJACDFAwAAjwcAIOYDAACPBwAg5wMAAI8HACDvAwAAjwcAIPADAACPBwAg8gMAAI8HACAVuAMAAO0FADC5AwAA8gQAELoDAADtBQAwuwMBAMAFACHEAyAAxAUAIcUDQADFBQAhxgNAAMYFACHHA0AAxgUAIeQDAQDABQAh5QMBAMAFACHmAwEAwQUAIecDAQDBBQAh6QMAAO4F6QMi6wMAAO8F6wMi7QMAAPAF7QMi7gMgAMQFACHvAwEAwQUAIfADQADFBQAh8gMAAPEF8gMj8wMBAMAFACH0AwEAwAUAIQMAAAAHACABAADxBAAwQQAA8gQAIAMAAAAHACABAADgBAAwAgAA3QQAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgGQQAAIsJACAFAACMCQAgGAAAkAkAIBwAAI8JACAeAACNCQAgHwAAjgkAICMAAIoJACAsAACRCQAguwMBAAAAAb4DAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAByAMBAAAAAdgDAQAAAAHZAwEAAAAB2gMBAAAAAdwDAAAA3AMD3QNAAAAAAd8DAAAA3wMC4AMQAAAAAeEDAQAAAAHiAwEAAAAB4wMBAAAAAQE1AAD6BAAgEbsDAQAAAAG-AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAcgDAQAAAAHYAwEAAAAB2QMBAAAAAdoDAQAAAAHcAwAAANwDA90DQAAAAAHfAwAAAN8DAuADEAAAAAHhAwEAAAAB4gMBAAAAAeMDAQAAAAEBNQAA_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_AwEAlgcAIcEDAACXB8EDIsIDEACYBwAhwwMQAJgHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIcgDAQCVBwAhAgAAAKcFACA1AACzBQAgDbsDAQCVBwAhvAMBAJUHACG9AwEAlQcAIb4DAQCWBwAhvwMBAJYHACHBAwAAlwfBAyLCAxAAmAcAIcMDEACYBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHIAwEAlQcAIQIAAAAjACA1AAC1BQAgAgAAACMAIDUAALUFACADAAAApwUAIDwAAK4FACA9AACzBQAgAQAAAKcFACABAAAAIwAgCAkAAJAHACBCAACTBwAgQwAAkgcAIGQAAJEHACBlAACUBwAgvgMAAI8HACC_AwAAjwcAIMUDAACPBwAgELgDAAC_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-AMAAIgG-AMi-gMBAMEFACH7AwEAwQUAIfwDAQDBBQAh_QNAAMUFACH-AwEAwQUAIf8DAQDBBQAhgAQBAMEFACEHCQAAyAUAIEIAAI0GACBDAACNBgAgyQMAAAD4AwLKAwAAAPgDCMsDAAAA-AMI0AMAAIwG-AMiBwkAAMgFACBCAACLBgAgQwAAiwYAIMkDAAAA-gMCygMAAAD6AwjLAwAAAPoDCNADAACKBvoDIgcJAADIBQAgQgAAiwYAIEMAAIsGACDJAwAAAPoDAsoDAAAA-gMIywMAAAD6AwjQAwAAigb6AyIEyQMAAAD6AwLKAwAAAPoDCMsDAAAA-gMI0AMAAIsG-gMiBwkAAMgFACBCAACNBgAgQwAAjQYAIMkDAAAA-AMCygMAAAD4AwjLAwAAAPgDCNADAACMBvgDIgTJAwAAAPgDAsoDAAAA-AMIywMAAAD4AwjQAwAAjQb4AyIYGQEAwQUAIbgDAACOBgAwuQMAAMAEABC6AwAAjgYAMLsDAQDABQAhxgNAAMYFACHHA0AAxgUAIdkDAQDABQAh4wMBAMAFACHtAwAAjwaOBCL2AwEAwAUAIYEEAQDBBQAhggQBAMAFACGDBBAAwwUAIYQEEADDBQAhhQQQAMMFACGGBBAAwwUAIYcEEADDBQAhiAQQAMMFACGJBBAAwwUAIYoEEADDBQAhiwQQAMMFACGMBBAAwwUAIY4EQADFBQAhBwkAAMgFACBCAACRBgAgQwAAkQYAIMkDAAAAjgQCygMAAACOBAjLAwAAAI4ECNADAACQBo4EIgcJAADIBQAgQgAAkQYAIEMAAJEGACDJAwAAAI4EAsoDAAAAjgQIywMAAACOBAjQAwAAkAaOBCIEyQMAAACOBALKAwAAAI4ECMsDAAAAjgQI0AMAAJEGjgQiDrgDAACSBgAwuQMAAKoEABC6AwAAkgYAMLsDAQDABQAhxgNAAMYFACHHA0AAxgUAIY8EAQDABQAhkAQBAMAFACGRBAEAwAUAIZIEAQDBBQAhkwQBAMAFACGUBAAAkwYAIJUEIADEBQAhlgQBAMAFACEEyQMBAAAABZcEAQAAAAGYBAEAAAAEmQQBAAAABBC4AwAAlAYAMLkDAACUBAAQugMAAJQGADC7AwEAwAUAIcYDQADGBQAhxwNAAMYFACHtAwAAlQacBCKBBAEAwAUAIY8EAQDABQAhmgQBAMEFACGcBAEAwQUAIZ0EAQDBBQAhngQBAMEFACGfBCAAxAUAIaAEAQDBBQAhoQRAAMUFACEHCQAAyAUAIEIAAJcGACBDAACXBgAgyQMAAACcBALKAwAAAJwECMsDAAAAnAQI0AMAAJYGnAQiBwkAAMgFACBCAACXBgAgQwAAlwYAIMkDAAAAnAQCygMAAACcBAjLAwAAAJwECNADAACWBpwEIgTJAwAAAJwEAsoDAAAAnAQIywMAAACcBAjQAwAAlwacBCIKuAMAAJgGADC5AwAA_gMAELoDAACYBgAwuwMBAMAFACG8AwEAwAUAIcYDQADGBQAhxwNAAMYFACGBBAEAwAUAIaIEAQDABQAhowQgAMQFACESuAMAAJkGADC5AwAA6AMAELoDAACZBgAwuwMBAMAFACG8AwEAwQUAIcQDIADEBQAhxQNAAMUFACHGA0AAxgUAIccDQADGBQAh2QMBAMAFACHtAwAAmgamBCKkBAEAwAUAIaYEIADEBQAhpwQgAMQFACGoBAEAwQUAIakEAQDBBQAhqgRAAMUFACGrBAEAwAUAIQcJAADIBQAgQgAAnAYAIEMAAJwGACDJAwAAAKYEAsoDAAAApgQIywMAAACmBAjQAwAAmwamBCIHCQAAyAUAIEIAAJwGACBDAACcBgAgyQMAAACmBALKAwAAAKYECMsDAAAApgQI0AMAAJsGpgQiBMkDAAAApgQCygMAAACmBAjLAwAAAKYECNADAACcBqYEIhK4AwAAnQYAMLkDAADQAwAQugMAAJ0GADC7AwEAwAUAIcQDIADEBQAhxQNAAMUFACHGA0AAxgUAIccDQADGBQAh5AMBAMAFACGtBAAAngatBCKuBAgAnwYAIa8EEADDBQAhsAQQAMMFACGxBAEAwQUAIbIEQADFBQAhswQIAKAGACG0BAEAwQUAIbUEAQDABQAhBwkAAMgFACBCAACmBgAgQwAApgYAIMkDAAAArQQCygMAAACtBAjLAwAAAK0ECNADAAClBq0EIg0JAADIBQAgQgAApAYAIEMAAKQGACBkAACkBgAgZQAApAYAIMkDCAAAAAHKAwgAAAAEywMIAAAABMwDCAAAAAHNAwgAAAABzgMIAAAAAc8DCAAAAAHQAwgAowYAIQ0JAADLBQAgQgAAogYAIEMAAKIGACBkAACiBgAgZQAAogYAIMkDCAAAAAHKAwgAAAAFywMIAAAABcwDCAAAAAHNAwgAAAABzgMIAAAAAc8DCAAAAAHQAwgAoQYAIQ0JAADLBQAgQgAAogYAIEMAAKIGACBkAACiBgAgZQAAogYAIMkDCAAAAAHKAwgAAAAFywMIAAAABcwDCAAAAAHNAwgAAAABzgMIAAAAAc8DCAAAAAHQAwgAoQYAIQjJAwgAAAABygMIAAAABcsDCAAAAAXMAwgAAAABzQMIAAAAAc4DCAAAAAHPAwgAAAAB0AMIAKIGACENCQAAyAUAIEIAAKQGACBDAACkBgAgZAAApAYAIGUAAKQGACDJAwgAAAABygMIAAAABMsDCAAAAATMAwgAAAABzQMIAAAAAc4DCAAAAAHPAwgAAAAB0AMIAKMGACEIyQMIAAAAAcoDCAAAAATLAwgAAAAEzAMIAAAAAc0DCAAAAAHOAwgAAAABzwMIAAAAAdADCACkBgAhBwkAAMgFACBCAACmBgAgQwAApgYAIMkDAAAArQQCygMAAACtBAjLAwAAAK0ECNADAAClBq0EIgTJAwAAAK0EAsoDAAAArQQIywMAAACtBAjQAwAApgatBCILuAMAAKcGADC5AwAAugMAELoDAACnBgAwuwMBAMAFACHGA0AAxgUAIccDQADGBQAh_gMBAMEFACGPBAEAwAUAIbUEAQDABQAhtgQgAMQFACG3BAEAwAUAIRK4AwAAqAYAMLkDAACkAwAQugMAAKgGADC7AwEAwAUAIcQDIADEBQAhxQNAAMUFACHGA0AAxgUAIccDQADGBQAh5AMBAMAFACH4AwAAqQa9BCL-AwEAwQUAIbgEAQDABQAhuQQBAMEFACG6BAEAwQUAIbsEAQDBBQAhvQQQAMMFACG-BBAAwwUAIb8EAQDABQAhBwkAAMgFACBCAACrBgAgQwAAqwYAIMkDAAAAvQQCygMAAAC9BAjLAwAAAL0ECNADAACqBr0EIgcJAADIBQAgQgAAqwYAIEMAAKsGACDJAwAAAL0EAsoDAAAAvQQIywMAAAC9BAjQAwAAqga9BCIEyQMAAAC9BALKAwAAAL0ECMsDAAAAvQQI0AMAAKsGvQQiDbgDAACsBgAwuQMAAI4DABC6AwAArAYAMLsDAQDABQAhxAMgAMQFACHFA0AAxQUAIcYDQADGBQAhxwNAAMYFACHkAwEAwAUAIfYDAQDABQAh_gMBAMEFACHABAEAwAUAIcEEAQDBBQAhDhAAAK4GACC4AwAArQYAMLkDAAD7AgAQugMAAK0GADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACH2AwEA2AUAIf4DAQDZBQAhwAQBANgFACHBBAEA2QUAIQPUAwAALgAg1QMAAC4AINYDAAAuACAOuAMAAK8GADC5AwAA9QIAELoDAACvBgAwuwMBAMAFACHGA0AAxgUAIccDQADGBQAh2QMBAMAFACH_AwEAwAUAIZUEIADEBQAhwgQIAJ8GACHDBAgAnwYAIcQEAQDABQAhxQQBAMEFACHGBAEAwAUAIQ24AwAAsAYAMLkDAADfAgAQugMAALAGADC7AwEAwAUAIcYDQADGBQAhxwNAAMYFACHIAwEAwQUAIY8EAQDABQAhxwQBAMAFACHJBAAAsQbJBCLLBAAAsgbLBCLMBAEAwQUAIc0EIADEBQAhBwkAAMgFACBCAAC2BgAgQwAAtgYAIMkDAAAAyQQCygMAAADJBAjLAwAAAMkECNADAAC1BskEIgcJAADIBQAgQgAAtAYAIEMAALQGACDJAwAAAMsEAsoDAAAAywQIywMAAADLBAjQAwAAswbLBCIHCQAAyAUAIEIAALQGACBDAAC0BgAgyQMAAADLBALKAwAAAMsECMsDAAAAywQI0AMAALMGywQiBMkDAAAAywQCygMAAADLBAjLAwAAAMsECNADAAC0BssEIgcJAADIBQAgQgAAtgYAIEMAALYGACDJAwAAAMkEAsoDAAAAyQQIywMAAADJBAjQAwAAtQbJBCIEyQMAAADJBALKAwAAAMkECMsDAAAAyQQI0AMAALYGyQQiDrgDAAC3BgAwuQMAAMcCABC6AwAAtwYAMLsDAQDABQAhxgNAAMYFACHHA0AAxgUAIc0EIADEBQAhzgQBAMEFACHPBAEAwAUAIdAEAQDBBQAh0QQBAMEFACHSBAEAwAUAIdMEAQDABQAh1AQBAMEFACEMuAMAALgGADC5AwAArQIAELoDAAC4BgAwuwMBAMAFACHGA0AAxgUAIccDQADGBQAhgQQBAMEFACHVBAEAwAUAIdcEAAC5BtcEItgEIADEBQAh2QQBAMEFACHaBAEAwQUAIQcJAADIBQAgQgAAuwYAIEMAALsGACDJAwAAANcEAsoDAAAA1wQIywMAAADXBAjQAwAAugbXBCIHCQAAyAUAIEIAALsGACBDAAC7BgAgyQMAAADXBALKAwAAANcECMsDAAAA1wQI0AMAALoG1wQiBMkDAAAA1wQCygMAAADXBAjLAwAAANcECNADAAC7BtcEIg0lAACFBgAguAMAALwGADC5AwAAawAQugMAALwGADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACGBBAEA2QUAIdUEAQDYBQAh1wQAAL0G1wQi2AQgANwFACHZBAEA2QUAIdoEAQDZBQAhBMkDAAAA1wQCygMAAADXBAjLAwAAANcECNADAAC7BtcEIgu4AwAAvgYAMLkDAACVAgAQugMAAL4GADC7AwEAwAUAIcYDQADGBQAhxwNAAMYFACHZAwEAwAUAIe0DAAC_Bt0EIsUEAQDBBQAhxgQBAMAFACHbBEAAxgUAIQcJAADIBQAgQgAAwQYAIEMAAMEGACDJAwAAAN0EAsoDAAAA3QQIywMAAADdBAjQAwAAwAbdBCIHCQAAyAUAIEIAAMEGACBDAADBBgAgyQMAAADdBALKAwAAAN0ECMsDAAAA3QQI0AMAAMAG3QQiBMkDAAAA3QQCygMAAADdBAjLAwAAAN0ECNADAADBBt0EIgq4AwAAwgYAMLkDAAD_AQAQugMAAMIGADC7AwEAwAUAIcQDIADEBQAhxQNAAMUFACHZAwEAwAUAIe0DAADDBt4EIsYEAQDABQAh3gRAAMYFACEHCQAAyAUAIEIAAMUGACBDAADFBgAgyQMAAADeBALKAwAAAN4ECMsDAAAA3gQI0AMAAMQG3gQiBwkAAMgFACBCAADFBgAgQwAAxQYAIMkDAAAA3gQCygMAAADeBAjLAwAAAN4ECNADAADEBt4EIgTJAwAAAN4EAsoDAAAA3gQIywMAAADeBAjQAwAAxQbeBCIQuAMAAMYGADC5AwAA6QEAELoDAADGBgAwuwMBAMAFACHEAyAAxAUAIcUDQADFBQAhxgNAAMYFACHHA0AAxgUAIdcDAQDBBQAh_wMBAMAFACHfBAEAwAUAIeAEAgDHBgAh4QQCAMcGACHiBAEAwQUAIeMEAQDBBQAh5AQBAMAFACENCQAAyAUAIEIAAMgFACBDAADIBQAgZAAApAYAIGUAAMgFACDJAwIAAAABygMCAAAABMsDAgAAAATMAwIAAAABzQMCAAAAAc4DAgAAAAHPAwIAAAAB0AMCAMgGACENCQAAyAUAIEIAAMgFACBDAADIBQAgZAAApAYAIGUAAMgFACDJAwIAAAABygMCAAAABMsDAgAAAATMAwIAAAABzQMCAAAAAc4DAgAAAAHPAwIAAAAB0AMCAMgGACEPuAMAAMkGADC5AwAA0QEAELoDAADJBgAwuwMBAMAFACHEAyAAxAUAIcUDQADFBQAhxgNAAMYFACHHA0AAxgUAIdgDAQDABQAh_gMBAMEFACGPBAEAwAUAIa8EEADDBQAhwAQBAMAFACHlBAIAxwYAIeYEAQDBBQAhDbgDAADKBgAwuQMAALkBABC6AwAAygYAMLsDAQDABQAhxAMgAMQFACHFA0AAxQUAIcYDQADGBQAhxwNAAMYFACHkAwEAwAUAIcAEAQDABQAh5wRAAMYFACHoBEAAxgUAIekEIADEBQAhEAgAAMwGACAYAADNBgAgHAAAzgYAILgDAADLBgAwuQMAAB8AELoDAADLBgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAhwAQBANgFACHnBEAA3gUAIegEQADeBQAh6QQgANwFACED1AMAAA4AINUDAAAOACDWAwAADgAgA9QDAAAbACDVAwAAGwAg1gMAABsAIAPUAwAASAAg1QMAAEgAINYDAABIACALuAMAAM8GADC5AwAAoQEAELoDAADPBgAwuwMBAMAFACHEAyAAxAUAIcUDQADFBQAhxgNAAMYFACHHA0AAxgUAIeQDAQDABQAh_gMBAMEFACHABAEAwAUAIRAEAADfBQAgBQAA0QYAIAgAAMwGACC4AwAA0AYAMLkDAAAKABC6AwAA0AYAMLsDAQDYBQAhvQMBANgFACG-AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAhyAMBANgFACHXAwEA2AUAIdgDAQDZBQAhEC0AAIMGACAuAACKBwAgLwAAggcAILgDAACJBwAwuQMAAAwAELoDAACJBwAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAh_gMBANkFACHABAEA2AUAIe4EAAAMACDvBAAADAAgDgQAANUGACC4AwAA0gYAMLkDAABxABC6AwAA0gYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIcgDAQDZBQAhjwQBANgFACHHBAEA2AUAIckEAADTBskEIssEAADUBssEIswEAQDZBQAhzQQgANwFACEEyQMAAADJBALKAwAAAMkECMsDAAAAyQQI0AMAALYGyQQiBMkDAAAAywQCygMAAADLBAjLAwAAAMsECNADAAC0BssEIiADAAD_BQAgDgAAgQYAIB0AAIAGACAhAACCBgAgIgAAgwYAICQAAIQGACApAACFBgAgKgAAhQYAICsAAIYGACC4AwAA-gUAMLkDAAAHABC6AwAA-gUAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIeUDAQDYBQAh5gMBANkFACHnAwEA2QUAIekDAAD7BekDIusDAAD8BesDIu0DAAD9Be0DIu4DIADcBQAh7wMBANkFACHwA0AA3QUAIfIDAAD-BfIDI_MDAQDYBQAh9AMBANgFACHuBAAABwAg7wQAAAcAIBEmAADXBgAgJwAA3wUAICgAANUGACC4AwAA1gYAMLkDAABnABC6AwAA1gYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIc0EIADcBQAhzgQBANkFACHPBAEA2AUAIdAEAQDZBQAh0QQBANkFACHSBAEA2AUAIdMEAQDYBQAh1AQBANkFACEPJQAAhQYAILgDAAC8BgAwuQMAAGsAELoDAAC8BgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAhgQQBANkFACHVBAEA2AUAIdcEAAC9BtcEItgEIADcBQAh2QQBANkFACHaBAEA2QUAIe4EAABrACDvBAAAawAgGRkBANkFACEjAADfBQAguAMAANgGADC5AwAAYwAQugMAANgGADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIeMDAQDYBQAh7QMAANkGjgQi9gMBANgFACGBBAEA2QUAIYIEAQDYBQAhgwQQANsFACGEBBAA2wUAIYUEEADbBQAhhgQQANsFACGHBBAA2wUAIYgEEADbBQAhiQQQANsFACGKBBAA2wUAIYsEEADbBQAhjAQQANsFACGOBEAA3QUAIQTJAwAAAI4EAsoDAAAAjgQIywMAAACOBAjQAwAAkQaOBCIPIAAA3wUAILgDAADaBgAwuQMAAF4AELoDAADaBgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAhjwQBANgFACGQBAEA2AUAIZEEAQDYBQAhkgQBANkFACGTBAEA2AUAIZQEAACTBgAglQQgANwFACGWBAEA2AUAIQPZAwEAAAABxgQBAAAAAdsEQAAAAAENAwAA3gYAIBsAAN8GACC4AwAA3AYAMLkDAABUABC6AwAA3AYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIdkDAQDYBQAh7QMAAN0G3QQixQQBANkFACHGBAEA2AUAIdsEQADeBQAhBMkDAAAA3QQCygMAAADdBAjLAwAAAN0ECNADAADBBt0EIh4EAADfBQAgBQAA0QYAIBgAAM0GACAcAADOBgAgHgAAhwcAIB8AAIgHACAjAADVBgAgLAAA4AUAILgDAACLBwAwuQMAAAMAELoDAACLBwAwuwMBANgFACG-AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAhyAMBANgFACHYAwEA2QUAIdkDAQDYBQAh2gMBANkFACHcAwAAjAfcAyPdA0AA3QUAId8DAACNB98DIuADEACOBwAh4QMBANkFACHiAwEA2QUAIeMDAQDZBQAh7gQAAAMAIO8EAAADACAYCgAAhgcAIAsAAOYGACAcAADOBgAgHQAAgAYAIB4AAIcHACAfAACIBwAguAMAAIUHADC5AwAADgAQugMAAIUHADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh1wMBANkFACH_AwEA2AUAId8EAQDYBQAh4AQCAIAHACHhBAIAgAcAIeIEAQDZBQAh4wQBANkFACHkBAEA2AUAIe4EAAAOACDvBAAADgAgAtkDAQAAAAHGBAEAAAABDAMAAN4GACAbAADfBgAguAMAAOEGADC5AwAAUAAQugMAAOEGADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHZAwEA2AUAIe0DAADiBt4EIsYEAQDYBQAh3gRAAN4FACEEyQMAAADeBALKAwAAAN4ECMsDAAAA3gQI0AMAAMUG3gQiAtkDAQAAAAHGBAEAAAABEQMAAN4GACALAADmBgAgGwAA3wYAILgDAADkBgAwuQMAAEgAELoDAADkBgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh2QMBANgFACH_AwEA2AUAIZUEIADcBQAhwgQIAOUGACHDBAgA5QYAIcQEAQDYBQAhxQQBANkFACHGBAEA2AUAIQjJAwgAAAABygMIAAAABMsDCAAAAATMAwgAAAABzQMIAAAAAc4DCAAAAAHPAwgAAAAB0AMIAKQGACESCAAAzAYAIBgAAM0GACAcAADOBgAguAMAAMsGADC5AwAAHwAQugMAAMsGADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACHABAEA2AUAIecEQADeBQAh6ARAAN4FACHpBCAA3AUAIe4EAAAfACDvBAAAHwAgEQ0AAOkGACC4AwAA5wYAMLkDAAA_ABC6AwAA5wYAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIe0DAADoBpwEIoEEAQDYBQAhjwQBANgFACGaBAEA2QUAIZwEAQDZBQAhnQQBANkFACGeBAEA2QUAIZ8EIADcBQAhoAQBANkFACGhBEAA3QUAIQTJAwAAAJwEAsoDAAAAnAQIywMAAACcBAjQAwAAlwacBCIaAwAA3gYAIA4AAIEGACAWAAD4BgAgFwAA-QYAIBgAAM0GACAZAADhBQAguAMAAPYGADC5AwAAIQAQugMAAPYGADC7AwEA2AUAIbwDAQDZBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIe0DAAD3BqYEIqQEAQDYBQAhpgQgANwFACGnBCAA3AUAIagEAQDZBQAhqQQBANkFACGqBEAA3QUAIasEAQDYBQAh7gQAACEAIO8EAAAhACAMEwAA6wYAILgDAADqBgAwuQMAADcAELoDAADqBgAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh_gMBANkFACGPBAEA2AUAIbUEAQDYBQAhtgQgANwFACG3BAEA2AUAIRcRAADxBgAgEgAA8gYAIBQAAPMGACC4AwAA7wYAMLkDAAAuABC6AwAA7wYAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIfgDAADwBr0EIv4DAQDZBQAhuAQBANgFACG5BAEA2QUAIboEAQDZBQAhuwQBANkFACG9BBAA2wUAIb4EEADbBQAhvwQBANgFACHuBAAALgAg7wQAAC4AIBQTAADrBgAgFQAA4AUAILgDAADsBgAwuQMAADMAELoDAADsBgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAhrQQAAO0GrQQirgQIAOUGACGvBBAA2wUAIbAEEADbBQAhsQQBANkFACGyBEAA3QUAIbMECADuBgAhtAQBANkFACG1BAEA2AUAIQTJAwAAAK0EAsoDAAAArQQIywMAAACtBAjQAwAApgatBCIIyQMIAAAAAcoDCAAAAAXLAwgAAAAFzAMIAAAAAc0DCAAAAAHOAwgAAAABzwMIAAAAAdADCACiBgAhFREAAPEGACASAADyBgAgFAAA8wYAILgDAADvBgAwuQMAAC4AELoDAADvBgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAh-AMAAPAGvQQi_gMBANkFACG4BAEA2AUAIbkEAQDZBQAhugQBANkFACG7BAEA2QUAIb0EEADbBQAhvgQQANsFACG_BAEA2AUAIQTJAwAAAL0EAsoDAAAAvQQIywMAAAC9BAjQAwAAqwa9BCIQEAAArgYAILgDAACtBgAwuQMAAPsCABC6AwAArQYAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIfYDAQDYBQAh_gMBANkFACHABAEA2AUAIcEEAQDZBQAh7gQAAPsCACDvBAAA-wIAIAPUAwAAMwAg1QMAADMAINYDAAAzACAD1AMAADcAINUDAAA3ACDWAwAANwAgDA0AAOkGACAOAAD1BgAguAMAAPQGADC5AwAAKAAQugMAAPQGADC7AwEA2AUAIbwDAQDYBQAhxgNAAN4FACHHA0AA3gUAIYEEAQDYBQAhogQBANgFACGjBCAA3AUAIRUEAADfBQAgDAAA4AUAIA8AAOEFACC4AwAA1wUAMLkDAAAjABC6AwAA1wUAMLsDAQDYBQAhvAMBANgFACG9AwEA2AUAIb4DAQDZBQAhvwMBANkFACHBAwAA2gXBAyLCAxAA2wUAIcMDEADbBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHIAwEA2AUAIe4EAAAjACDvBAAAIwAgGAMAAN4GACAOAACBBgAgFgAA-AYAIBcAAPkGACAYAADNBgAgGQAA4QUAILgDAAD2BgAwuQMAACEAELoDAAD2BgAwuwMBANgFACG8AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh2QMBANgFACHtAwAA9wamBCKkBAEA2AUAIaYEIADcBQAhpwQgANwFACGoBAEA2QUAIakEAQDZBQAhqgRAAN0FACGrBAEA2AUAIQTJAwAAAKYEAsoDAAAApgQIywMAAACmBAjQAwAAnAamBCIWEwAA6wYAIBUAAOAFACC4AwAA7AYAMLkDAAAzABC6AwAA7AYAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIa0EAADtBq0EIq4ECADlBgAhrwQQANsFACGwBBAA2wUAIbEEAQDZBQAhsgRAAN0FACGzBAgA7gYAIbQEAQDZBQAhtQQBANgFACHuBAAAMwAg7wQAADMAIAPUAwAAPwAg1QMAAD8AINYDAAA_ACAVAwAA3gYAIAsAAP0GACAaAAD-BgAguAMAAPoGADC5AwAAGwAQugMAAPoGADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIe0DAAD8BvoDIvUDEADbBQAh9gMBANgFACH4AwAA-wb4AyL6AwEA2QUAIfsDAQDZBQAh_AMBANkFACH9A0AA3QUAIf4DAQDZBQAh_wMBANkFACGABAEA2QUAIQTJAwAAAPgDAsoDAAAA-AMIywMAAAD4AwjQAwAAjQb4AyIEyQMAAAD6AwLKAwAAAPoDCMsDAAAA-gMI0AMAAIsG-gMiEggAAMwGACAYAADNBgAgHAAAzgYAILgDAADLBgAwuQMAAB8AELoDAADLBgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAhwAQBANgFACHnBEAA3gUAIegEQADeBQAh6QQgANwFACHuBAAAHwAg7wQAAB8AIBoDAADeBgAgDgAAgQYAIBYAAPgGACAXAAD5BgAgGAAAzQYAIBkAAOEFACC4AwAA9gYAMLkDAAAhABC6AwAA9gYAMLsDAQDYBQAhvAMBANkFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdkDAQDYBQAh7QMAAPcGpgQipAQBANgFACGmBCAA3AUAIacEIADcBQAhqAQBANkFACGpBAEA2QUAIaoEQADdBQAhqwQBANgFACHuBAAAIQAg7wQAACEAIBMFAACDBwAgBgAAgQcAIAcAAIIHACAIAADMBgAguAMAAP8GADC5AwAAEgAQugMAAP8GADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh2AMBANgFACH-AwEA2QUAIY8EAQDYBQAhrwQQANsFACHABAEA2AUAIeUEAgCABwAh5gQBANkFACEIyQMCAAAAAcoDAgAAAATLAwIAAAAEzAMCAAAAAc0DAgAAAAHOAwIAAAABzwMCAAAAAdADAgDIBQAhFQUAAIMHACAGAACBBwAgBwAAggcAIAgAAMwGACC4AwAA_wYAMLkDAAASABC6AwAA_wYAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHYAwEA2AUAIf4DAQDZBQAhjwQBANgFACGvBBAA2wUAIcAEAQDYBQAh5QQCAIAHACHmBAEA2QUAIe4EAAASACDvBAAAEgAgA9QDAAASACDVAwAAEgAg1gMAABIAIBAtAACDBgAgLgAAigcAIC8AAIIHACC4AwAAiQcAMLkDAAAMABC6AwAAiQcAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIf4DAQDZBQAhwAQBANgFACHuBAAADAAg7wQAAAwAIAP_AwEAAAAB3wQBAAAAAeQEAQAAAAEWCgAAhgcAIAsAAOYGACAcAADOBgAgHQAAgAYAIB4AAIcHACAfAACIBwAguAMAAIUHADC5AwAADgAQugMAAIUHADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh1wMBANkFACH_AwEA2AUAId8EAQDYBQAh4AQCAIAHACHhBAIAgAcAIeIEAQDZBQAh4wQBANkFACHkBAEA2AUAIRUFAACDBwAgBgAAgQcAIAcAAIIHACAIAADMBgAguAMAAP8GADC5AwAAEgAQugMAAP8GADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh2AMBANgFACH-AwEA2QUAIY8EAQDYBQAhrwQQANsFACHABAEA2AUAIeUEAgCABwAh5gQBANkFACHuBAAAEgAg7wQAABIAIAPUAwAAUAAg1QMAAFAAINYDAABQACAD1AMAAFQAINUDAABUACDWAwAAVAAgDi0AAIMGACAuAACKBwAgLwAAggcAILgDAACJBwAwuQMAAAwAELoDAACJBwAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAh_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-BwAwPQAAwgcAMPAEAAC_BwAw8QQAAMAHADDyBAAAwQcAIPMEAACjBwAw9AQAAKMHADD1BAAAowcAMPYEAACjBwAw9wQAAMMHADD4BAAApgcAMAcOAADIBwAguwMBAAAAAbwDAQAAAAHGA0AAAAABxwNAAAAAAaIEAQAAAAGjBCAAAAABAgAAACoAIDwAAMcHACADAAAAKgAgPAAAxwcAID0AAMUHACABNQAA6g0AMAIAAAAqACA1AADFBwAgAgAAAKcHACA1AADEBwAgBrsDAQCVBwAhvAMBAJUHACHGA0AAmwcAIccDQACbBwAhogQBAJUHACGjBCAAmQcAIQcOAADGBwAguwMBAJUHACG8AwEAlQcAIcYDQACbBwAhxwNAAJsHACGiBAEAlQcAIaMEIACZBwAhBTwAAOUNACA9AADoDQAg8AQAAOYNACDxBAAA5w0AIPYEAACnBQAgBw4AAMgHACC7AwEAAAABvAMBAAAAAcYDQAAAAAHHA0AAAAABogQBAAAAAaMEIAAAAAEDPAAA5Q0AIPAEAADmDQAg9gQAAKcFACAQAwAA2QcAIAsAANoHACC7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB7QMAAAD6AwL1AxAAAAAB9gMBAAAAAfgDAAAA-AMC-gMBAAAAAfsDAQAAAAH8AwEAAAAB_QNAAAAAAf4DAQAAAAH_AwEAAAABAgAAAB0AIDwAANgHACADAAAAHQAgPAAA2AcAID0AANUHACABNQAA5A0AMBUDAADeBgAgCwAA_QYAIBoAAP4GACC4AwAA-gYAMLkDAAAbABC6AwAA-gYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAh2QMBANgFACHtAwAA_Ab6AyL1AxAA2wUAIfYDAQDYBQAh-AMAAPsG-AMi-gMBAAAAAfsDAQAAAAH8AwEA2QUAIf0DQADdBQAh_gMBANkFACH_AwEA2QUAIYAEAQDZBQAhAgAAAB0AIDUAANUHACACAAAA0QcAIDUAANIHACASuAMAANAHADC5AwAA0QcAELoDAADQBwAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh2QMBANgFACHtAwAA_Ab6AyL1AxAA2wUAIfYDAQDYBQAh-AMAAPsG-AMi-gMBANkFACH7AwEA2QUAIfwDAQDZBQAh_QNAAN0FACH-AwEA2QUAIf8DAQDZBQAhgAQBANkFACESuAMAANAHADC5AwAA0QcAELoDAADQBwAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh2QMBANgFACHtAwAA_Ab6AyL1AxAA2wUAIfYDAQDYBQAh-AMAAPsG-AMi-gMBANkFACH7AwEA2QUAIfwDAQDZBQAh_QNAAN0FACH-AwEA2QUAIf8DAQDZBQAhgAQBANkFACEOuwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACHtAwAA1Af6AyL1AxAAmAcAIfYDAQCVBwAh-AMAANMH-AMi-gMBAJYHACH7AwEAlgcAIfwDAQCWBwAh_QNAAJoHACH-AwEAlgcAIf8DAQCWBwAhAfMEAAAA-AMCAfMEAAAA-gMCEAMAANYHACALAADXBwAguwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACHtAwAA1Af6AyL1AxAAmAcAIfYDAQCVBwAh-AMAANMH-AMi-gMBAJYHACH7AwEAlgcAIfwDAQCWBwAh_QNAAJoHACH-AwEAlgcAIf8DAQCWBwAhBTwAANwNACA9AADiDQAg8AQAAN0NACDxBAAA4Q0AIPYEAAAFACAHPAAA2g0AID0AAN8NACDwBAAA2w0AIPEEAADeDQAg9AQAAB8AIPUEAAAfACD2BAAApAEAIBADAADZBwAgCwAA2gcAILsDAQAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAPoDAvUDEAAAAAH2AwEAAAAB-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_gMBAAAAAf8DAQAAAAEDPAAA3A0AIPAEAADdDQAg9gQAAAUAIAM8AADaDQAg8AQAANsNACD2BAAApAEAIAy7AwEAAAABxgNAAAAAAccDQAAAAAHtAwAAAJwEAo8EAQAAAAGaBAEAAAABnAQBAAAAAZ0EAQAAAAGeBAEAAAABnwQgAAAAAaAEAQAAAAGhBEAAAAABAgAAAEEAIDwAAOcHACADAAAAQQAgPAAA5wcAID0AAOYHACABNQAA2Q0AMBENAADpBgAguAMAAOcGADC5AwAAPwAQugMAAOcGADC7AwEAAAABxgNAAN4FACHHA0AA3gUAIe0DAADoBpwEIoEEAQDYBQAhjwQBANgFACGaBAEA2QUAIZwEAQDZBQAhnQQBANkFACGeBAEA2QUAIZ8EIADcBQAhoAQBANkFACGhBEAA3QUAIQIAAABBACA1AADmBwAgAgAAAOMHACA1AADkBwAgELgDAADiBwAwuQMAAOMHABC6AwAA4gcAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIe0DAADoBpwEIoEEAQDYBQAhjwQBANgFACGaBAEA2QUAIZwEAQDZBQAhnQQBANkFACGeBAEA2QUAIZ8EIADcBQAhoAQBANkFACGhBEAA3QUAIRC4AwAA4gcAMLkDAADjBwAQugMAAOIHADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHtAwAA6AacBCKBBAEA2AUAIY8EAQDYBQAhmgQBANkFACGcBAEA2QUAIZ0EAQDZBQAhngQBANkFACGfBCAA3AUAIaAEAQDZBQAhoQRAAN0FACEMuwMBAJUHACHGA0AAmwcAIccDQACbBwAh7QMAAOUHnAQijwQBAJUHACGaBAEAlgcAIZwEAQCWBwAhnQQBAJYHACGeBAEAlgcAIZ8EIACZBwAhoAQBAJYHACGhBEAAmgcAIQHzBAAAAJwEAgy7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHtAwAA5QecBCKPBAEAlQcAIZoEAQCWBwAhnAQBAJYHACGdBAEAlgcAIZ4EAQCWBwAhnwQgAJkHACGgBAEAlgcAIaEEQACaBwAhDLsDAQAAAAHGA0AAAAABxwNAAAAAAe0DAAAAnAQCjwQBAAAAAZoEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBCAAAAABoAQBAAAAAaEEQAAAAAETAwAA6QcAIBYAAOoHACAXAADrBwAgGAAA7AcAIBkAAO0HACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAKYEAqQEAQAAAAGmBCAAAAABpwQgAAAAAagEAQAAAAGpBAEAAAABqgRAAAAAAasEAQAAAAEDPAAA1w0AIPAEAADYDQAg9gQAAAUAIAM8AADVDQAg8AQAANYNACD2BAAANQAgBDwAANsHADDwBAAA3AcAMPIEAADeBwAg9gQAAN8HADAEPAAAyQcAMPAEAADKBwAw8gQAAMwHACD2BAAAzQcAMAQ8AAC-BwAw8AQAAL8HADDyBAAAwQcAIPYEAACjBwAwAzwAANMNACDwBAAA1A0AIPYEAADdBAAgBDwAAK0HADDwBAAArgcAMPIEAACwBwAg9gQAALEHADAEPAAAnwcAMPAEAACgBwAw8gQAAKIHACD2BAAAowcAMA8DAACKCgAgDgAAjAoAIB0AAIsKACAhAACNCgAgIgAAjgoAICQAAI8KACApAACQCgAgKgAAkAoAICsAAJEKACDFAwAAjwcAIOYDAACPBwAg5wMAAI8HACDvAwAAjwcAIPADAACPBwAg8gMAAI8HACAAAAAAAAU8AACpDQAgPQAA0Q0AIPAEAACqDQAg8QQAANANACD2BAAA3QQAIAc8AACnDQAgPQAAzg0AIPAEAACoDQAg8QQAAM0NACD0BAAADAAg9QQAAAwAIPYEAAABACALPAAA-gcAMD0AAP8HADDwBAAA-wcAMPEEAAD8BwAw8gQAAP0HACDzBAAA_gcAMPQEAAD-BwAw9QQAAP4HADD2BAAA_gcAMPcEAACACAAw-AQAAIEIADARCgAAuwgAIAsAALwIACAcAAC_CAAgHgAAvQgAIB8AAL4IACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAf8DAQAAAAHfBAEAAAAB4AQCAAAAAeEEAgAAAAHiBAEAAAAB4wQBAAAAAeQEAQAAAAECAAAAEAAgPAAAuggAIAMAAAAQACA8AAC6CAAgPQAAhQgAIAE1AADMDQAwFwoAAIYHACALAADmBgAgHAAAzgYAIB0AAIAGACAeAACHBwAgHwAAiAcAILgDAACFBwAwuQMAAA4AELoDAACFBwAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh1wMBANkFACH_AwEA2AUAId8EAQDYBQAh4AQCAIAHACHhBAIAgAcAIeIEAQDZBQAh4wQBANkFACHkBAEA2AUAIe0EAACEBwAgAgAAABAAIDUAAIUIACACAAAAgggAIDUAAIMIACAQuAMAAIEIADC5AwAAgggAELoDAACBCAAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdcDAQDZBQAh_wMBANgFACHfBAEA2AUAIeAEAgCABwAh4QQCAIAHACHiBAEA2QUAIeMEAQDZBQAh5AQBANgFACEQuAMAAIEIADC5AwAAgggAELoDAACBCAAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdcDAQDZBQAh_wMBANgFACHfBAEA2AUAIeAEAgCABwAh4QQCAIAHACHiBAEA2QUAIeMEAQDZBQAh5AQBANgFACEMuwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIf8DAQCVBwAh3wQBAJUHACHgBAIAhAgAIeEEAgCECAAh4gQBAJYHACHjBAEAlgcAIeQEAQCVBwAhBfMEAgAAAAH5BAIAAAAB-gQCAAAAAfsEAgAAAAH8BAIAAAABEQoAAIYIACALAACHCAAgHAAAiggAIB4AAIgIACAfAACJCAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIf8DAQCVBwAh3wQBAJUHACHgBAIAhAgAIeEEAgCECAAh4gQBAJYHACHjBAEAlgcAIeQEAQCVBwAhBTwAAK0NACA9AADKDQAg8AQAAK4NACDxBAAAyQ0AIPYEAAAVACAFPAAAqw0AID0AAMcNACDwBAAArA0AIPEEAADGDQAg9gQAAKQBACALPAAAqwgAMD0AALAIADDwBAAArAgAMPEEAACtCAAw8gQAAK4IACDzBAAArwgAMPQEAACvCAAw9QQAAK8IADD2BAAArwgAMPcEAACxCAAw-AQAALIIADALPAAAnAgAMD0AAKEIADDwBAAAnQgAMPEEAACeCAAw8gQAAJ8IACDzBAAAoAgAMPQEAACgCAAw9QQAAKAIADD2BAAAoAgAMPcEAACiCAAw-AQAAKMIADALPAAAiwgAMD0AAJAIADDwBAAAjAgAMPEEAACNCAAw8gQAAI4IACDzBAAAjwgAMPQEAACPCAAw9QQAAI8IADD2BAAAjwgAMPcEAACRCAAw-AQAAJIIADAMAwAAmggAIAsAAJsIACC7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB_wMBAAAAAZUEIAAAAAHCBAgAAAABwwQIAAAAAcQEAQAAAAHFBAEAAAABAgAAAEoAIDwAAJkIACADAAAASgAgPAAAmQgAID0AAJYIACABNQAAxQ0AMBIDAADeBgAgCwAA5gYAIBsAAN8GACC4AwAA5AYAMLkDAABIABC6AwAA5AYAMLsDAQAAAAHGA0AA3gUAIccDQADeBQAh2QMBANgFACH_AwEA2AUAIZUEIADcBQAhwgQIAOUGACHDBAgA5QYAIcQEAQDYBQAhxQQBANkFACHGBAEA2AUAIewEAADjBgAgAgAAAEoAIDUAAJYIACACAAAAkwgAIDUAAJQIACAOuAMAAJIIADC5AwAAkwgAELoDAACSCAAwuwMBANgFACHGA0AA3gUAIccDQADeBQAh2QMBANgFACH_AwEA2AUAIZUEIADcBQAhwgQIAOUGACHDBAgA5QYAIcQEAQDYBQAhxQQBANkFACHGBAEA2AUAIQ64AwAAkggAMLkDAACTCAAQugMAAJIIADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIf8DAQDYBQAhlQQgANwFACHCBAgA5QYAIcMECADlBgAhxAQBANgFACHFBAEA2QUAIcYEAQDYBQAhCrsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh_wMBAJUHACGVBCAAmQcAIcIECACVCAAhwwQIAJUIACHEBAEAlQcAIcUEAQCWBwAhBfMECAAAAAH5BAgAAAAB-gQIAAAAAfsECAAAAAH8BAgAAAABDAMAAJcIACALAACYCAAguwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACH_AwEAlQcAIZUEIACZBwAhwgQIAJUIACHDBAgAlQgAIcQEAQCVBwAhxQQBAJYHACEFPAAAvQ0AID0AAMMNACDwBAAAvg0AIPEEAADCDQAg9gQAAAUAIAU8AAC7DQAgPQAAwA0AIPAEAAC8DQAg8QQAAL8NACD2BAAApAEAIAwDAACaCAAgCwAAmwgAILsDAQAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAH_AwEAAAABlQQgAAAAAcIECAAAAAHDBAgAAAABxAQBAAAAAcUEAQAAAAEDPAAAvQ0AIPAEAAC-DQAg9gQAAAUAIAM8AAC7DQAg8AQAALwNACD2BAAApAEAIAgDAACqCAAguwMBAAAAAcYDQAAAAAHHA0AAAAAB2QMBAAAAAe0DAAAA3QQCxQQBAAAAAdsEQAAAAAECAAAAVgAgPAAAqQgAIAMAAABWACA8AACpCAAgPQAApwgAIAE1AAC6DQAwDgMAAN4GACAbAADfBgAguAMAANwGADC5AwAAVAAQugMAANwGADC7AwEAAAABxgNAAN4FACHHA0AA3gUAIdkDAQDYBQAh7QMAAN0G3QQixQQBANkFACHGBAEA2AUAIdsEQADeBQAh6gQAANsGACACAAAAVgAgNQAApwgAIAIAAACkCAAgNQAApQgAIAu4AwAAowgAMLkDAACkCAAQugMAAKMIADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIe0DAADdBt0EIsUEAQDZBQAhxgQBANgFACHbBEAA3gUAIQu4AwAAowgAMLkDAACkCAAQugMAAKMIADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACHZAwEA2AUAIe0DAADdBt0EIsUEAQDZBQAhxgQBANgFACHbBEAA3gUAIQe7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIe0DAACmCN0EIsUEAQCWBwAh2wRAAJsHACEB8wQAAADdBAIIAwAAqAgAILsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh7QMAAKYI3QQixQQBAJYHACHbBEAAmwcAIQU8AAC1DQAgPQAAuA0AIPAEAAC2DQAg8QQAALcNACD2BAAABQAgCAMAAKoIACC7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB7QMAAADdBALFBAEAAAAB2wRAAAAAAQM8AAC1DQAg8AQAALYNACD2BAAABQAgBwMAALkIACC7AwEAAAABxAMgAAAAAcUDQAAAAAHZAwEAAAAB7QMAAADeBALeBEAAAAABAgAAAFIAIDwAALgIACADAAAAUgAgPAAAuAgAID0AALYIACABNQAAtA0AMA0DAADeBgAgGwAA3wYAILgDAADhBgAwuQMAAFAAELoDAADhBgAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHZAwEA2AUAIe0DAADiBt4EIsYEAQDYBQAh3gRAAN4FACHrBAAA4AYAIAIAAABSACA1AAC2CAAgAgAAALMIACA1AAC0CAAgCrgDAACyCAAwuQMAALMIABC6AwAAsggAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIdkDAQDYBQAh7QMAAOIG3gQixgQBANgFACHeBEAA3gUAIQq4AwAAsggAMLkDAACzCAAQugMAALIIADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHZAwEA2AUAIe0DAADiBt4EIsYEAQDYBQAh3gRAAN4FACEGuwMBAJUHACHEAyAAmQcAIcUDQACaBwAh2QMBAJUHACHtAwAAtQjeBCLeBEAAmwcAIQHzBAAAAN4EAgcDAAC3CAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAh2QMBAJUHACHtAwAAtQjeBCLeBEAAmwcAIQU8AACvDQAgPQAAsg0AIPAEAACwDQAg8QQAALENACD2BAAABQAgBwMAALkIACC7AwEAAAABxAMgAAAAAcUDQAAAAAHZAwEAAAAB7QMAAADeBALeBEAAAAABAzwAAK8NACDwBAAAsA0AIPYEAAAFACARCgAAuwgAIAsAALwIACAcAAC_CAAgHgAAvQgAIB8AAL4IACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAf8DAQAAAAHfBAEAAAAB4AQCAAAAAeEEAgAAAAHiBAEAAAAB4wQBAAAAAeQEAQAAAAEDPAAArQ0AIPAEAACuDQAg9gQAABUAIAM8AACrDQAg8AQAAKwNACD2BAAApAEAIAQ8AACrCAAw8AQAAKwIADDyBAAArggAIPYEAACvCAAwBDwAAJwIADDwBAAAnQgAMPIEAACfCAAg9gQAAKAIADAEPAAAiwgAMPAEAACMCAAw8gQAAI4IACD2BAAAjwgAMAM8AACpDQAg8AQAAKoNACD2BAAA3QQAIAM8AACnDQAg8AQAAKgNACD2BAAAAQAgBDwAAPoHADDwBAAA-wcAMPIEAAD9BwAg9gQAAP4HADAAAAAAAAHzBAAAANwDAwHzBAAAAN8DAgXzBBAAAAAB-QQQAAAAAfoEEAAAAAH7BBAAAAAB_AQQAAAAAQc8AAD-DAAgPQAApQ0AIPAEAAD_DAAg8QQAAKQNACD0BAAABwAg9QQAAAcAIPYEAADdBAAgBTwAAPwMACA9AACiDQAg8AQAAP0MACDxBAAAoQ0AIPYEAADdBAAgBzwAAPoMACA9AACfDQAg8AQAAPsMACDxBAAAng0AIPQEAAAMACD1BAAADAAg9gQAAAEAIAs8AAD_CAAwPQAAgwkAMPAEAACACQAw8QQAAIEJADDyBAAAggkAIPMEAACvCAAw9AQAAK8IADD1BAAArwgAMPYEAACvCAAw9wQAAIQJADD4BAAAsggAMAs8AAD0CAAwPQAA-AgAMPAEAAD1CAAw8QQAAPYIADDyBAAA9wgAIPMEAACgCAAw9AQAAKAIADD1BAAAoAgAMPYEAACgCAAw9wQAAPkIADD4BAAAowgAMAs8AADpCAAwPQAA7QgAMPAEAADqCAAw8QQAAOsIADDyBAAA7AgAIPMEAACPCAAw9AQAAI8IADD1BAAAjwgAMPYEAACPCAAw9wQAAO4IADD4BAAAkggAMAs8AADeCAAwPQAA4ggAMPAEAADfCAAw8QQAAOAIADDyBAAA4QgAIPMEAADNBwAw9AQAAM0HADD1BAAAzQcAMPYEAADNBwAw9wQAAOMIADD4BAAA0AcAMAs8AADTCAAwPQAA1wgAMPAEAADUCAAw8QQAANUIADDyBAAA1ggAIPMEAACxBwAw9AQAALEHADD1BAAAsQcAMPYEAACxBwAw9wQAANgIADD4BAAAtAcAMBMOAADdCAAgFgAA6gcAIBcAAOsHACAYAADsBwAgGQAA7QcAILsDAQAAAAG8AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAe0DAAAApgQCpAQBAAAAAaYEIAAAAAGnBCAAAAABqAQBAAAAAakEAQAAAAGqBEAAAAABqwQBAAAAAQIAAAAmACA8AADcCAAgAwAAACYAIDwAANwIACA9AADaCAAgATUAAJ0NADACAAAAJgAgNQAA2ggAIAIAAAC1BwAgNQAA2QgAIA67AwEAlQcAIbwDAQCWBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHtAwAAtwemBCKkBAEAlQcAIaYEIACZBwAhpwQgAJkHACGoBAEAlgcAIakEAQCWBwAhqgRAAJoHACGrBAEAlQcAIRMOAADbCAAgFgAAugcAIBcAALsHACAYAAC8BwAgGQAAvQcAILsDAQCVBwAhvAMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIe0DAAC3B6YEIqQEAQCVBwAhpgQgAJkHACGnBCAAmQcAIagEAQCWBwAhqQQBAJYHACGqBEAAmgcAIasEAQCVBwAhBzwAAJgNACA9AACbDQAg8AQAAJkNACDxBAAAmg0AIPQEAAAjACD1BAAAIwAg9gQAAKcFACATDgAA3QgAIBYAAOoHACAXAADrBwAgGAAA7AcAIBkAAO0HACC7AwEAAAABvAMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHtAwAAAKYEAqQEAQAAAAGmBCAAAAABpwQgAAAAAagEAQAAAAGpBAEAAAABqgRAAAAAAasEAQAAAAEDPAAAmA0AIPAEAACZDQAg9gQAAKcFACAQCwAA2gcAIBoAAOgIACC7AwEAAAABxgNAAAAAAccDQAAAAAHtAwAAAPoDAvUDEAAAAAH2AwEAAAAB-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_gMBAAAAAf8DAQAAAAGABAEAAAABAgAAAB0AIDwAAOcIACADAAAAHQAgPAAA5wgAID0AAOUIACABNQAAlw0AMAIAAAAdACA1AADlCAAgAgAAANEHACA1AADkCAAgDrsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIe0DAADUB_oDIvUDEACYBwAh9gMBAJUHACH4AwAA0wf4AyL6AwEAlgcAIfsDAQCWBwAh_AMBAJYHACH9A0AAmgcAIf4DAQCWBwAh_wMBAJYHACGABAEAlgcAIRALAADXBwAgGgAA5ggAILsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIe0DAADUB_oDIvUDEACYBwAh9gMBAJUHACH4AwAA0wf4AyL6AwEAlgcAIfsDAQCWBwAh_AMBAJYHACH9A0AAmgcAIf4DAQCWBwAh_wMBAJYHACGABAEAlgcAIQc8AACSDQAgPQAAlQ0AIPAEAACTDQAg8QQAAJQNACD0BAAAIQAg9QQAACEAIPYEAAAmACAQCwAA2gcAIBoAAOgIACC7AwEAAAABxgNAAAAAAccDQAAAAAHtAwAAAPoDAvUDEAAAAAH2AwEAAAAB-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_gMBAAAAAf8DAQAAAAGABAEAAAABAzwAAJINACDwBAAAkw0AIPYEAAAmACAMCwAAmwgAIBsAAPMIACC7AwEAAAABxgNAAAAAAccDQAAAAAH_AwEAAAABlQQgAAAAAcIECAAAAAHDBAgAAAABxAQBAAAAAcUEAQAAAAHGBAEAAAABAgAAAEoAIDwAAPIIACADAAAASgAgPAAA8ggAID0AAPAIACABNQAAkQ0AMAIAAABKACA1AADwCAAgAgAAAJMIACA1AADvCAAgCrsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIf8DAQCVBwAhlQQgAJkHACHCBAgAlQgAIcMECACVCAAhxAQBAJUHACHFBAEAlgcAIcYEAQCVBwAhDAsAAJgIACAbAADxCAAguwMBAJUHACHGA0AAmwcAIccDQACbBwAh_wMBAJUHACGVBCAAmQcAIcIECACVCAAhwwQIAJUIACHEBAEAlQcAIcUEAQCWBwAhxgQBAJUHACEFPAAAjA0AID0AAI8NACDwBAAAjQ0AIPEEAACODQAg9gQAABAAIAwLAACbCAAgGwAA8wgAILsDAQAAAAHGA0AAAAABxwNAAAAAAf8DAQAAAAGVBCAAAAABwgQIAAAAAcMECAAAAAHEBAEAAAABxQQBAAAAAcYEAQAAAAEDPAAAjA0AIPAEAACNDQAg9gQAABAAIAgbAAD-CAAguwMBAAAAAcYDQAAAAAHHA0AAAAAB7QMAAADdBALFBAEAAAABxgQBAAAAAdsEQAAAAAECAAAAVgAgPAAA_QgAIAMAAABWACA8AAD9CAAgPQAA-wgAIAE1AACLDQAwAgAAAFYAIDUAAPsIACACAAAApAgAIDUAAPoIACAHuwMBAJUHACHGA0AAmwcAIccDQACbBwAh7QMAAKYI3QQixQQBAJYHACHGBAEAlQcAIdsEQACbBwAhCBsAAPwIACC7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHtAwAApgjdBCLFBAEAlgcAIcYEAQCVBwAh2wRAAJsHACEFPAAAhg0AID0AAIkNACDwBAAAhw0AIPEEAACIDQAg9gQAABAAIAgbAAD-CAAguwMBAAAAAcYDQAAAAAHHA0AAAAAB7QMAAADdBALFBAEAAAABxgQBAAAAAdsEQAAAAAEDPAAAhg0AIPAEAACHDQAg9gQAABAAIAcbAACJCQAguwMBAAAAAcQDIAAAAAHFA0AAAAAB7QMAAADeBALGBAEAAAAB3gRAAAAAAQIAAABSACA8AACICQAgAwAAAFIAIDwAAIgJACA9AACGCQAgATUAAIUNADACAAAAUgAgNQAAhgkAIAIAAACzCAAgNQAAhQkAIAa7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHtAwAAtQjeBCLGBAEAlQcAId4EQACbBwAhBxsAAIcJACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHtAwAAtQjeBCLGBAEAlQcAId4EQACbBwAhBTwAAIANACA9AACDDQAg8AQAAIENACDxBAAAgg0AIPYEAAAQACAHGwAAiQkAILsDAQAAAAHEAyAAAAABxQNAAAAAAe0DAAAA3gQCxgQBAAAAAd4EQAAAAAEDPAAAgA0AIPAEAACBDQAg9gQAABAAIAM8AAD-DAAg8AQAAP8MACD2BAAA3QQAIAM8AAD8DAAg8AQAAP0MACD2BAAA3QQAIAM8AAD6DAAg8AQAAPsMACD2BAAAAQAgBDwAAP8IADDwBAAAgAkAMPIEAACCCQAg9gQAAK8IADAEPAAA9AgAMPAEAAD1CAAw8gQAAPcIACD2BAAAoAgAMAQ8AADpCAAw8AQAAOoIADDyBAAA7AgAIPYEAACPCAAwBDwAAN4IADDwBAAA3wgAMPIEAADhCAAg9gQAAM0HADAEPAAA0wgAMPAEAADUCAAw8gQAANYIACD2BAAAsQcAMAAAAAHzBAAAAOkDAgHzBAAAAOsDAgHzBAAAAO0DAgHzBAAAAPIDAwc8AAD8CQAgPQAA_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_AwEAAAABwQMAAADBAwLCAxAAAAABwwMQAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAECAAAApwUAIDwAAPIJACADAAAAIwAgPAAA8gkAID0AAPYJACAQAAAAIwAgDAAAnQcAIA8AAJ4HACA1AAD2CQAguwMBAJUHACG8AwEAlQcAIb0DAQCVBwAhvgMBAJYHACG_AwEAlgcAIcEDAACXB8EDIsIDEACYBwAhwwMQAJgHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIQ4MAACdBwAgDwAAngcAILsDAQCVBwAhvAMBAJUHACG9AwEAlQcAIb4DAQCWBwAhvwMBAJYHACHBAwAAlwfBAyLCAxAAmAcAIcMDEACYBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACELBQAAwQgAIAgAAMIIACC7AwEAAAABvQMBAAAAAb4DAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB1wMBAAAAAdgDAQAAAAECAAAAiAEAIDwAAPcJACADAAAACgAgPAAA9wkAID0AAPsJACANAAAACgAgBQAA-AcAIAgAAPkHACA1AAD7CQAguwMBAJUHACG9AwEAlQcAIb4DAQCWBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHXAwEAlQcAIdgDAQCWBwAhCwUAAPgHACAIAAD5BwAguwMBAJUHACG9AwEAlQcAIb4DAQCWBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHXAwEAlQcAIdgDAQCWBwAhFwUAAIwJACAYAACQCQAgHAAAjwkAIB4AAI0JACAfAACOCQAgIwAAigkAICwAAJEJACC7AwEAAAABvgMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHYAwEAAAAB2QMBAAAAAdoDAQAAAAHcAwAAANwDA90DQAAAAAHfAwAAAN8DAuADEAAAAAHhAwEAAAAB4gMBAAAAAeMDAQAAAAECAAAABQAgPAAA_AkAIAMAAAADACA8AAD8CQAgPQAAgAoAIBkAAAADACAFAADNCAAgGAAA0QgAIBwAANAIACAeAADOCAAgHwAAzwgAICMAAMsIACAsAADSCAAgNQAAgAoAILsDAQCVBwAhvgMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdgDAQCWBwAh2QMBAJUHACHaAwEAlgcAIdwDAADICNwDI90DQACaBwAh3wMAAMkI3wMi4AMQAMoIACHhAwEAlgcAIeIDAQCWBwAh4wMBAJYHACEXBQAAzQgAIBgAANEIACAcAADQCAAgHgAAzggAIB8AAM8IACAjAADLCAAgLAAA0ggAILsDAQCVBwAhvgMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdgDAQCWBwAh2QMBAJUHACHaAwEAlgcAIdwDAADICNwDI90DQACaBwAh3wMAAMkI3wMi4AMQAMoIACHhAwEAlgcAIeIDAQCWBwAh4wMBAJYHACEDPAAA_AkAIPAEAAD9CQAg9gQAAAUAIAM8AAD3CQAg8AQAAPgJACD2BAAAiAEAIAM8AADyCQAg8AQAAPMJACD2BAAApwUAIAQ8AADkCQAw8AQAAOUJADDyBAAA5wkAIPYEAADoCQAwBDwAANgJADDwBAAA2QkAMPIEAADbCQAg9gQAANwJADAEPAAAywkAMPAEAADMCQAw8gQAAM4JACD2BAAAzwkAMAQ8AADACQAw8AQAAMEJADDyBAAAwwkAIPYEAAC0CQAwBDwAALAJADDwBAAAsQkAMPIEAACzCQAg9gQAALQJADAEPAAAogkAMPAEAACjCQAw8gQAAKUJACD2BAAApgkAMBIEAADxBwAgBQAAmAwAIBgAAO0LACAcAADuCwAgHgAApAwAIB8AAKUMACAjAADxBwAgLAAA8gcAIL4DAACPBwAgxQMAAI8HACDYAwAAjwcAINoDAACPBwAg3AMAAI8HACDdAwAAjwcAIOADAACPBwAg4QMAAI8HACDiAwAAjwcAIOMDAACPBwAgBgQAAPEHACAFAACYDAAgCAAA7AsAIL4DAACPBwAgxQMAAI8HACDYAwAAjwcAIAYEAADxBwAgDAAA8gcAIA8AAPMHACC-AwAAjwcAIL8DAACPBwAgxQMAAI8HACAAAAAAAAAAAAAAAAAAAAAFPAAA4AwAID0AAOMMACDwBAAA4QwAIPEEAADiDAAg9gQAAN0EACADPAAA4AwAIPAEAADhDAAg9gQAAN0EACAAAAAFPAAA2wwAID0AAN4MACDwBAAA3AwAIPEEAADdDAAg9gQAAN0EACADPAAA2wwAIPAEAADcDAAg9gQAAN0EACAAAAAFPAAA1gwAID0AANkMACDwBAAA1wwAIPEEAADYDAAg9gQAACYAIAM8AADWDAAg8AQAANcMACD2BAAAJgAgAAAAAAAAAAAAAAAB8wQAAACtBAIF8wQIAAAAAfkECAAAAAH6BAgAAAAB-wQIAAAAAfwECAAAAAEFPAAA0AwAID0AANQMACDwBAAA0QwAIPEEAADTDAAg9gQAADAAIAs8AAC3CgAwPQAAuwoAMPAEAAC4CgAw8QQAALkKADDyBAAAugoAIPMEAACxBwAw9AQAALEHADD1BAAAsQcAMPYEAACxBwAw9wQAALwKADD4BAAAtAcAMBMDAADpBwAgDgAA3QgAIBcAAOsHACAYAADsBwAgGQAA7QcAILsDAQAAAAG8AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAKYEAqQEAQAAAAGmBCAAAAABpwQgAAAAAagEAQAAAAGpBAEAAAABqgRAAAAAAQIAAAAmACA8AAC_CgAgAwAAACYAIDwAAL8KACA9AAC-CgAgATUAANIMADACAAAAJgAgNQAAvgoAIAIAAAC1BwAgNQAAvQoAIA67AwEAlQcAIbwDAQCWBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIe0DAAC3B6YEIqQEAQCVBwAhpgQgAJkHACGnBCAAmQcAIagEAQCWBwAhqQQBAJYHACGqBEAAmgcAIRMDAAC5BwAgDgAA2wgAIBcAALsHACAYAAC8BwAgGQAAvQcAILsDAQCVBwAhvAMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh7QMAALcHpgQipAQBAJUHACGmBCAAmQcAIacEIACZBwAhqAQBAJYHACGpBAEAlgcAIaoEQACaBwAhEwMAAOkHACAOAADdCAAgFwAA6wcAIBgAAOwHACAZAADtBwAguwMBAAAAAbwDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB2QMBAAAAAe0DAAAApgQCpAQBAAAAAaYEIAAAAAGnBCAAAAABqAQBAAAAAakEAQAAAAGqBEAAAAABAzwAANAMACDwBAAA0QwAIPYEAAAwACAEPAAAtwoAMPAEAAC4CgAw8gQAALoKACD2BAAAsQcAMAAAAAU8AADLDAAgPQAAzgwAIPAEAADMDAAg8QQAAM0MACD2BAAAMAAgAzwAAMsMACDwBAAAzAwAIPYEAAAwACAAAAAAAAHzBAAAAL0EAgU8AADEDAAgPQAAyQwAIPAEAADFDAAg8QQAAMgMACD2BAAA-AIAIAs8AADcCgAwPQAA4QoAMPAEAADdCgAw8QQAAN4KADDyBAAA3woAIPMEAADgCgAw9AQAAOAKADD1BAAA4AoAMPYEAADgCgAw9wQAAOIKADD4BAAA4woAMAs8AADQCgAwPQAA1QoAMPAEAADRCgAw8QQAANIKADDyBAAA0woAIPMEAADUCgAw9AQAANQKADD1BAAA1AoAMPYEAADUCgAw9wQAANYKADD4BAAA1woAMAe7AwEAAAABxgNAAAAAAccDQAAAAAH-AwEAAAABjwQBAAAAAbYEIAAAAAG3BAEAAAABAgAAADkAIDwAANsKACADAAAAOQAgPAAA2woAID0AANoKACABNQAAxwwAMAwTAADrBgAguAMAAOoGADC5AwAANwAQugMAAOoGADC7AwEAAAABxgNAAN4FACHHA0AA3gUAIf4DAQDZBQAhjwQBANgFACG1BAEA2AUAIbYEIADcBQAhtwQBANgFACECAAAAOQAgNQAA2goAIAIAAADYCgAgNQAA2QoAIAu4AwAA1woAMLkDAADYCgAQugMAANcKADC7AwEA2AUAIcYDQADeBQAhxwNAAN4FACH-AwEA2QUAIY8EAQDYBQAhtQQBANgFACG2BCAA3AUAIbcEAQDYBQAhC7gDAADXCgAwuQMAANgKABC6AwAA1woAMLsDAQDYBQAhxgNAAN4FACHHA0AA3gUAIf4DAQDZBQAhjwQBANgFACG1BAEA2AUAIbYEIADcBQAhtwQBANgFACEHuwMBAJUHACHGA0AAmwcAIccDQACbBwAh_gMBAJYHACGPBAEAlQcAIbYEIACZBwAhtwQBAJUHACEHuwMBAJUHACHGA0AAmwcAIccDQACbBwAh_gMBAJYHACGPBAEAlQcAIbYEIACZBwAhtwQBAJUHACEHuwMBAAAAAcYDQAAAAAHHA0AAAAAB_gMBAAAAAY8EAQAAAAG2BCAAAAABtwQBAAAAAQ8VAADBCgAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAABrQQAAACtBAKuBAgAAAABrwQQAAAAAbAEEAAAAAGxBAEAAAABsgRAAAAAAbMECAAAAAG0BAEAAAABAgAAADUAIDwAAOcKACADAAAANQAgPAAA5woAID0AAOYKACABNQAAxgwAMBQTAADrBgAgFQAA4AUAILgDAADsBgAwuQMAADMAELoDAADsBgAwuwMBAAAAAcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACGtBAAA7QatBCKuBAgA5QYAIa8EEADbBQAhsAQQANsFACGxBAEA2QUAIbIEQADdBQAhswQIAO4GACG0BAEA2QUAIbUEAQDYBQAhAgAAADUAIDUAAOYKACACAAAA5AoAIDUAAOUKACASuAMAAOMKADC5AwAA5AoAELoDAADjCgAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIeQDAQDYBQAhrQQAAO0GrQQirgQIAOUGACGvBBAA2wUAIbAEEADbBQAhsQQBANkFACGyBEAA3QUAIbMECADuBgAhtAQBANkFACG1BAEA2AUAIRK4AwAA4woAMLkDAADkCgAQugMAAOMKADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACGtBAAA7QatBCKuBAgA5QYAIa8EEADbBQAhsAQQANsFACGxBAEA2QUAIbIEQADdBQAhswQIAO4GACG0BAEA2QUAIbUEAQDYBQAhDrsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIa0EAACzCq0EIq4ECACVCAAhrwQQAJgHACGwBBAAmAcAIbEEAQCWBwAhsgRAAJoHACGzBAgAtAoAIbQEAQCWBwAhDxUAALYKACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACGtBAAAswqtBCKuBAgAlQgAIa8EEACYBwAhsAQQAJgHACGxBAEAlgcAIbIEQACaBwAhswQIALQKACG0BAEAlgcAIQ8VAADBCgAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAABrQQAAACtBAKuBAgAAAABrwQQAAAAAbAEEAAAAAGxBAEAAAABsgRAAAAAAbMECAAAAAG0BAEAAAABAzwAAMQMACDwBAAAxQwAIPYEAAD4AgAgBDwAANwKADDwBAAA3QoAMPIEAADfCgAg9gQAAOAKADAEPAAA0AoAMPAEAADRCgAw8gQAANMKACD2BAAA1AoAMAAAAAs8AADvCgAwPQAA9AoAMPAEAADwCgAw8QQAAPEKADDyBAAA8goAIPMEAADzCgAw9AQAAPMKADD1BAAA8woAMPYEAADzCgAw9wQAAPUKADD4BAAA9goAMBASAADpCgAgFAAA6goAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAfgDAAAAvQQC_gMBAAAAAbgEAQAAAAG5BAEAAAABugQBAAAAAbsEAQAAAAG9BBAAAAABvgQQAAAAAQIAAAAwACA8AAD6CgAgAwAAADAAIDwAAPoKACA9AAD5CgAgATUAAMMMADAVEQAA8QYAIBIAAPIGACAUAADzBgAguAMAAO8GADC5AwAALgAQugMAAO8GADC7AwEAAAABxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIfgDAADwBr0EIv4DAQDZBQAhuAQBANgFACG5BAEA2QUAIboEAQDZBQAhuwQBANkFACG9BBAA2wUAIb4EEADbBQAhvwQBANgFACECAAAAMAAgNQAA-QoAIAIAAAD3CgAgNQAA-AoAIBK4AwAA9goAMLkDAAD3CgAQugMAAPYKADC7AwEA2AUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAh5AMBANgFACH4AwAA8Aa9BCL-AwEA2QUAIbgEAQDYBQAhuQQBANkFACG6BAEA2QUAIbsEAQDZBQAhvQQQANsFACG-BBAA2wUAIb8EAQDYBQAhErgDAAD2CgAwuQMAAPcKABC6AwAA9goAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHkAwEA2AUAIfgDAADwBr0EIv4DAQDZBQAhuAQBANgFACG5BAEA2QUAIboEAQDZBQAhuwQBANkFACG9BBAA2wUAIb4EEADbBQAhvwQBANgFACEOuwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh-AMAAMwKvQQi_gMBAJYHACG4BAEAlQcAIbkEAQCWBwAhugQBAJYHACG7BAEAlgcAIb0EEACYBwAhvgQQAJgHACEQEgAAzgoAIBQAAM8KACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACH4AwAAzAq9BCL-AwEAlgcAIbgEAQCVBwAhuQQBAJYHACG6BAEAlgcAIbsEAQCWBwAhvQQQAJgHACG-BBAAmAcAIRASAADpCgAgFAAA6goAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAfgDAAAAvQQC_gMBAAAAAbgEAQAAAAG5BAEAAAABugQBAAAAAbsEAQAAAAG9BBAAAAABvgQQAAAAAQQ8AADvCgAw8AQAAPAKADDyBAAA8goAIPYEAADzCgAwAAAAAAAAAAAABzwAAL4MACA9AADBDAAg8AQAAL8MACDxBAAAwAwAIPQEAAAHACD1BAAABwAg9gQAAN0EACADPAAAvgwAIPAEAAC_DAAg9gQAAN0EACAAAAAAAAAB8wQAAADXBAILPAAAjwsAMD0AAJMLADDwBAAAkAsAMPEEAACRCwAw8gQAAJILACDzBAAAtAkAMPQEAAC0CQAw9QQAALQJADD2BAAAtAkAMPcEAACUCwAw-AQAALcJADAMJwAAvwkAICgAAMoJACC7AwEAAAABxgNAAAAAAccDQAAAAAHNBCAAAAABzwQBAAAAAdAEAQAAAAHRBAEAAAAB0gQBAAAAAdMEAQAAAAHUBAEAAAABAgAAAGkAIDwAAJcLACADAAAAaQAgPAAAlwsAID0AAJYLACABNQAAvQwAMAIAAABpACA1AACWCwAgAgAAALgJACA1AACVCwAgCrsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIc0EIACZBwAhzwQBAJUHACHQBAEAlgcAIdEEAQCWBwAh0gQBAJUHACHTBAEAlQcAIdQEAQCWBwAhDCcAALwJACAoAADICQAguwMBAJUHACHGA0AAmwcAIccDQACbBwAhzQQgAJkHACHPBAEAlQcAIdAEAQCWBwAh0QQBAJYHACHSBAEAlQcAIdMEAQCVBwAh1AQBAJYHACEMJwAAvwkAICgAAMoJACC7AwEAAAABxgNAAAAAAccDQAAAAAHNBCAAAAABzwQBAAAAAdAEAQAAAAHRBAEAAAAB0gQBAAAAAdMEAQAAAAHUBAEAAAABBDwAAI8LADDwBAAAkAsAMPIEAACSCwAg9gQAALQJADAAAAAAAAAAAAAAAAc8AAC4DAAgPQAAuwwAIPAEAAC5DAAg8QQAALoMACD0BAAACgAg9QQAAAoAIPYEAACIAQAgAzwAALgMACDwBAAAuQwAIPYEAACIAQAgAAAAAAAHPAAArAwAID0AALYMACDwBAAArQwAIPEEAAC1DAAg9AQAABIAIPUEAAASACD2BAAAFQAgCzwAALgLADA9AAC9CwAw8AQAALkLADDxBAAAugsAMPIEAAC7CwAg8wQAALwLADD0BAAAvAsAMPUEAAC8CwAw9gQAALwLADD3BAAAvgsAMPgEAAC_CwAwBTwAAK4MACA9AACzDAAg8AQAAK8MACDxBAAAsgwAIPYEAAABACALPAAArwsAMD0AALMLADDwBAAAsAsAMPEEAACxCwAw8gQAALILACDzBAAA_gcAMPQEAAD-BwAw9QQAAP4HADD2BAAA_gcAMPcEAAC0CwAw-AQAAIEIADARCwAAvAgAIBwAAL8IACAdAAClCwAgHgAAvQgAIB8AAL4IACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdcDAQAAAAH_AwEAAAAB3wQBAAAAAeAEAgAAAAHhBAIAAAAB4gQBAAAAAeMEAQAAAAECAAAAEAAgPAAAtwsAIAMAAAAQACA8AAC3CwAgPQAAtgsAIAE1AACxDAAwAgAAABAAIDUAALYLACACAAAAgggAIDUAALULACAMuwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh_wMBAJUHACHfBAEAlQcAIeAEAgCECAAh4QQCAIQIACHiBAEAlgcAIeMEAQCWBwAhEQsAAIcIACAcAACKCAAgHQAApAsAIB4AAIgIACAfAACJCAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh_wMBAJUHACHfBAEAlQcAIeAEAgCECAAh4QQCAIQIACHiBAEAlgcAIeMEAQCWBwAhEQsAALwIACAcAAC_CAAgHQAApQsAIB4AAL0IACAfAAC-CAAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHXAwEAAAAB_wMBAAAAAd8EAQAAAAHgBAIAAAAB4QQCAAAAAeIEAQAAAAHjBAEAAAABDgUAAMULACAHAADECwAgCAAAxgsAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB2AMBAAAAAf4DAQAAAAGPBAEAAAABrwQQAAAAAcAEAQAAAAHlBAIAAAABAgAAABUAIDwAAMMLACADAAAAFQAgPAAAwwsAID0AAMILACABNQAAsAwAMBMFAACDBwAgBgAAgQcAIAcAAIIHACAIAADMBgAguAMAAP8GADC5AwAAEgAQugMAAP8GADC7AwEAAAABxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHYAwEA2AUAIf4DAQDZBQAhjwQBANgFACGvBBAA2wUAIcAEAQAAAAHlBAIAgAcAIeYEAQDZBQAhAgAAABUAIDUAAMILACACAAAAwAsAIDUAAMELACAPuAMAAL8LADC5AwAAwAsAELoDAAC_CwAwuwMBANgFACHEAyAA3AUAIcUDQADdBQAhxgNAAN4FACHHA0AA3gUAIdgDAQDYBQAh_gMBANkFACGPBAEA2AUAIa8EEADbBQAhwAQBANgFACHlBAIAgAcAIeYEAQDZBQAhD7gDAAC_CwAwuQMAAMALABC6AwAAvwsAMLsDAQDYBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHYAwEA2AUAIf4DAQDZBQAhjwQBANgFACGvBBAA2wUAIcAEAQDYBQAh5QQCAIAHACHmBAEA2QUAIQu7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh2AMBAJUHACH-AwEAlgcAIY8EAQCVBwAhrwQQAJgHACHABAEAlQcAIeUEAgCECAAhDgUAAK0LACAHAACsCwAgCAAArgsAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHYAwEAlQcAIf4DAQCWBwAhjwQBAJUHACGvBBAAmAcAIcAEAQCVBwAh5QQCAIQIACEOBQAAxQsAIAcAAMQLACAIAADGCwAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHYAwEAAAAB_gMBAAAAAY8EAQAAAAGvBBAAAAABwAQBAAAAAeUEAgAAAAEEPAAAuAsAMPAEAAC5CwAw8gQAALsLACD2BAAAvAsAMAM8AACuDAAg8AQAAK8MACD2BAAAAQAgBDwAAK8LADDwBAAAsAsAMPIEAACyCwAg9gQAAP4HADADPAAArAwAIPAEAACtDAAg9gQAABUAIAAAAAs8AADgCwAwPQAA5AsAMPAEAADhCwAw8QQAAOILADDyBAAA4wsAIPMEAAD-BwAw9AQAAP4HADD1BAAA_gcAMPYEAAD-BwAw9wQAAOULADD4BAAAgQgAMAs8AADXCwAwPQAA2wsAMPAEAADYCwAw8QQAANkLADDyBAAA2gsAIPMEAADNBwAw9AQAAM0HADD1BAAAzQcAMPYEAADNBwAw9wQAANwLADD4BAAA0AcAMAs8AADOCwAwPQAA0gsAMPAEAADPCwAw8QQAANALADDyBAAA0QsAIPMEAACPCAAw9AQAAI8IADD1BAAAjwgAMPYEAACPCAAw9wQAANMLADD4BAAAkggAMAwDAACaCAAgGwAA8wgAILsDAQAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAGVBCAAAAABwgQIAAAAAcMECAAAAAHEBAEAAAABxQQBAAAAAcYEAQAAAAECAAAASgAgPAAA1gsAIAMAAABKACA8AADWCwAgPQAA1QsAIAE1AACrDAAwAgAAAEoAIDUAANULACACAAAAkwgAIDUAANQLACAKuwMBAJUHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACGVBCAAmQcAIcIECACVCAAhwwQIAJUIACHEBAEAlQcAIcUEAQCWBwAhxgQBAJUHACEMAwAAlwgAIBsAAPEIACC7AwEAlQcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIZUEIACZBwAhwgQIAJUIACHDBAgAlQgAIcQEAQCVBwAhxQQBAJYHACHGBAEAlQcAIQwDAACaCAAgGwAA8wgAILsDAQAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAGVBCAAAAABwgQIAAAAAcMECAAAAAHEBAEAAAABxQQBAAAAAcYEAQAAAAEQAwAA2QcAIBoAAOgIACC7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB7QMAAAD6AwL1AxAAAAAB9gMBAAAAAfgDAAAA-AMC-gMBAAAAAfsDAQAAAAH8AwEAAAAB_QNAAAAAAf4DAQAAAAGABAEAAAABAgAAAB0AIDwAAN8LACADAAAAHQAgPAAA3wsAID0AAN4LACABNQAAqgwAMAIAAAAdACA1AADeCwAgAgAAANEHACA1AADdCwAgDrsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh7QMAANQH-gMi9QMQAJgHACH2AwEAlQcAIfgDAADTB_gDIvoDAQCWBwAh-wMBAJYHACH8AwEAlgcAIf0DQACaBwAh_gMBAJYHACGABAEAlgcAIRADAADWBwAgGgAA5ggAILsDAQCVBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh7QMAANQH-gMi9QMQAJgHACH2AwEAlQcAIfgDAADTB_gDIvoDAQCWBwAh-wMBAJYHACH8AwEAlgcAIf0DQACaBwAh_gMBAJYHACGABAEAlgcAIRADAADZBwAgGgAA6AgAILsDAQAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAPoDAvUDEAAAAAH2AwEAAAAB-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_gMBAAAAAYAEAQAAAAERCgAAuwgAIBwAAL8IACAdAAClCwAgHgAAvQgAIB8AAL4IACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdcDAQAAAAHfBAEAAAAB4AQCAAAAAeEEAgAAAAHiBAEAAAAB4wQBAAAAAeQEAQAAAAECAAAAEAAgPAAA6AsAIAMAAAAQACA8AADoCwAgPQAA5wsAIAE1AACpDAAwAgAAABAAIDUAAOcLACACAAAAgggAIDUAAOYLACAMuwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh3wQBAJUHACHgBAIAhAgAIeEEAgCECAAh4gQBAJYHACHjBAEAlgcAIeQEAQCVBwAhEQoAAIYIACAcAACKCAAgHQAApAsAIB4AAIgIACAfAACJCAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh3wQBAJUHACHgBAIAhAgAIeEEAgCECAAh4gQBAJYHACHjBAEAlgcAIeQEAQCVBwAhEQoAALsIACAcAAC_CAAgHQAApQsAIB4AAL0IACAfAAC-CAAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHXAwEAAAAB3wQBAAAAAeAEAgAAAAHhBAIAAAAB4gQBAAAAAeMEAQAAAAHkBAEAAAABBDwAAOALADDwBAAA4QsAMPIEAADjCwAg9gQAAP4HADAEPAAA1wsAMPAEAADYCwAw8gQAANoLACD2BAAAzQcAMAQ8AADOCwAw8AQAAM8LADDyBAAA0QsAIPYEAACPCAAwAAAAAAAACzwAAIoMADA9AACODAAw8AQAAIsMADDxBAAAjAwAMPIEAACNDAAg8wQAANwJADD0BAAA3AkAMPUEAADcCQAw9gQAANwJADD3BAAAjwwAMPgEAADfCQAwCzwAAP4LADA9AACDDAAw8AQAAP8LADDxBAAAgAwAMPIEAACBDAAg8wQAAIIMADD0BAAAggwAMPUEAACCDAAw9gQAAIIMADD3BAAAhAwAMPgEAACFDAAwCzwAAPULADA9AAD5CwAw8AQAAPYLADDxBAAA9wsAMPIEAAD4CwAg8wQAALwLADD0BAAAvAsAMPUEAAC8CwAw9gQAALwLADD3BAAA-gsAMPgEAAC_CwAwDgYAAMcLACAHAADECwAgCAAAxgsAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB_gMBAAAAAY8EAQAAAAGvBBAAAAABwAQBAAAAAeUEAgAAAAHmBAEAAAABAgAAABUAIDwAAP0LACADAAAAFQAgPAAA_QsAID0AAPwLACABNQAAqAwAMAIAAAAVACA1AAD8CwAgAgAAAMALACA1AAD7CwAgC7sDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACH-AwEAlgcAIY8EAQCVBwAhrwQQAJgHACHABAEAlQcAIeUEAgCECAAh5gQBAJYHACEOBgAAqwsAIAcAAKwLACAIAACuCwAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIf4DAQCWBwAhjwQBAJUHACGvBBAAmAcAIcAEAQCVBwAh5QQCAIQIACHmBAEAlgcAIQ4GAADHCwAgBwAAxAsAIAgAAMYLACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAf4DAQAAAAGPBAEAAAABrwQQAAAAAcAEAQAAAAHlBAIAAAAB5gQBAAAAAQsEAADACAAgCAAAwggAILsDAQAAAAG9AwEAAAABvgMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHIAwEAAAAB1wMBAAAAAQIAAACIAQAgPAAAiQwAIAMAAACIAQAgPAAAiQwAID0AAIgMACABNQAApwwAMBAEAADfBQAgBQAA0QYAIAgAAMwGACC4AwAA0AYAMLkDAAAKABC6AwAA0AYAMLsDAQAAAAG9AwEA2AUAIb4DAQDZBQAhxAMgANwFACHFA0AA3QUAIcYDQADeBQAhxwNAAN4FACHIAwEAAAAB1wMBAAAAAdgDAQDZBQAhAgAAAIgBACA1AACIDAAgAgAAAIYMACA1AACHDAAgDbgDAACFDAAwuQMAAIYMABC6AwAAhQwAMLsDAQDYBQAhvQMBANgFACG-AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAhyAMBANgFACHXAwEA2AUAIdgDAQDZBQAhDbgDAACFDAAwuQMAAIYMABC6AwAAhQwAMLsDAQDYBQAhvQMBANgFACG-AwEA2QUAIcQDIADcBQAhxQNAAN0FACHGA0AA3gUAIccDQADeBQAhyAMBANgFACHXAwEA2AUAIdgDAQDZBQAhCbsDAQCVBwAhvQMBAJUHACG-AwEAlgcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAhyAMBAJUHACHXAwEAlQcAIQsEAAD3BwAgCAAA-QcAILsDAQCVBwAhvQMBAJUHACG-AwEAlgcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAhyAMBAJUHACHXAwEAlQcAIQsEAADACAAgCAAAwggAILsDAQAAAAG9AwEAAAABvgMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHIAwEAAAAB1wMBAAAAARcEAACLCQAgGAAAkAkAIBwAAI8JACAeAACNCQAgHwAAjgkAICMAAIoJACAsAACRCQAguwMBAAAAAb4DAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAByAMBAAAAAdkDAQAAAAHaAwEAAAAB3AMAAADcAwPdA0AAAAAB3wMAAADfAwLgAxAAAAAB4QMBAAAAAeIDAQAAAAHjAwEAAAABAgAAAAUAIDwAAJIMACADAAAABQAgPAAAkgwAID0AAJEMACABNQAApgwAMAIAAAAFACA1AACRDAAgAgAAAOAJACA1AACQDAAgELsDAQCVBwAhvgMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIcgDAQCVBwAh2QMBAJUHACHaAwEAlgcAIdwDAADICNwDI90DQACaBwAh3wMAAMkI3wMi4AMQAMoIACHhAwEAlgcAIeIDAQCWBwAh4wMBAJYHACEXBAAAzAgAIBgAANEIACAcAADQCAAgHgAAzggAIB8AAM8IACAjAADLCAAgLAAA0ggAILsDAQCVBwAhvgMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIcgDAQCVBwAh2QMBAJUHACHaAwEAlgcAIdwDAADICNwDI90DQACaBwAh3wMAAMkI3wMi4AMQAMoIACHhAwEAlgcAIeIDAQCWBwAh4wMBAJYHACEXBAAAiwkAIBgAAJAJACAcAACPCQAgHgAAjQkAIB8AAI4JACAjAACKCQAgLAAAkQkAILsDAQAAAAG-AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAcgDAQAAAAHZAwEAAAAB2gMBAAAAAdwDAAAA3AMD3QNAAAAAAd8DAAAA3wMC4AMQAAAAAeEDAQAAAAHiAwEAAAAB4wMBAAAAAQQ8AACKDAAw8AQAAIsMADDyBAAAjQwAIPYEAADcCQAwBDwAAP4LADDwBAAA_wsAMPIEAACBDAAg9gQAAIIMADAEPAAA9QsAMPAEAAD2CwAw8gQAAPgLACD2BAAAvAsAMAAABS0AAI4KACAuAACWDAAgLwAAlwwAIMUDAACPBwAg_gMAAI8HACAEJQAAkAoAIIEEAACPBwAg2QQAAI8HACDaBAAAjwcAIAoKAACjDAAgCwAAmwwAIBwAAO4LACAdAACLCgAgHgAApAwAIB8AAKUMACDFAwAAjwcAINcDAACPBwAg4gQAAI8HACDjBAAAjwcAIAQIAADsCwAgGAAA7QsAIBwAAO4LACDFAwAAjwcAIAsDAACKCgAgDgAAjAoAIBYAAKEMACAXAACiDAAgGAAA7QsAIBkAAPMHACC8AwAAjwcAIMUDAACPBwAgqAQAAI8HACCpBAAAjwcAIKoEAACPBwAgCBEAAJ4MACASAACfDAAgFAAAoAwAIMUDAACPBwAg_gMAAI8HACC5BAAAjwcAILoEAACPBwAguwQAAI8HACAEEAAA_AoAIMUDAACPBwAg_gMAAI8HACDBBAAAjwcAIAAABxMAAJ0MACAVAADyBwAgxQMAAI8HACCxBAAAjwcAILIEAACPBwAgswQAAI8HACC0BAAAjwcAIAAHBQAAmAwAIAYAAKMMACAHAACXDAAgCAAA7AsAIMUDAACPBwAg_gMAAI8HACDmBAAAjwcAIAAAELsDAQAAAAG-AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAcgDAQAAAAHZAwEAAAAB2gMBAAAAAdwDAAAA3AMD3QNAAAAAAd8DAAAA3wMC4AMQAAAAAeEDAQAAAAHiAwEAAAAB4wMBAAAAAQm7AwEAAAABvQMBAAAAAb4DAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAByAMBAAAAAdcDAQAAAAELuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAH-AwEAAAABjwQBAAAAAa8EEAAAAAHABAEAAAAB5QQCAAAAAeYEAQAAAAEMuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHXAwEAAAAB3wQBAAAAAeAEAgAAAAHhBAIAAAAB4gQBAAAAAeMEAQAAAAHkBAEAAAABDrsDAQAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAPoDAvUDEAAAAAH2AwEAAAAB-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_gMBAAAAAYAEAQAAAAEKuwMBAAAAAcYDQAAAAAHHA0AAAAAB2QMBAAAAAZUEIAAAAAHCBAgAAAABwwQIAAAAAcQEAQAAAAHFBAEAAAABxgQBAAAAAQ8FAADFCwAgBgAAxwsAIAgAAMYLACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdgDAQAAAAH-AwEAAAABjwQBAAAAAa8EEAAAAAHABAEAAAAB5QQCAAAAAeYEAQAAAAECAAAAFQAgPAAArAwAIAotAACTDAAgLgAAlAwAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAf4DAQAAAAHABAEAAAABAgAAAAEAIDwAAK4MACALuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHYAwEAAAAB_gMBAAAAAY8EAQAAAAGvBBAAAAABwAQBAAAAAeUEAgAAAAEMuwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHXAwEAAAAB_wMBAAAAAd8EAQAAAAHgBAIAAAAB4QQCAAAAAeIEAQAAAAHjBAEAAAABAwAAAAwAIDwAAK4MACA9AAC0DAAgDAAAAAwAIC0AAPILACAuAADzCwAgNQAAtAwAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIf4DAQCWBwAhwAQBAJUHACEKLQAA8gsAIC4AAPMLACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACH-AwEAlgcAIcAEAQCVBwAhAwAAABIAIDwAAKwMACA9AAC3DAAgEQAAABIAIAUAAK0LACAGAACrCwAgCAAArgsAIDUAALcMACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh2AMBAJUHACH-AwEAlgcAIY8EAQCVBwAhrwQQAJgHACHABAEAlQcAIeUEAgCECAAh5gQBAJYHACEPBQAArQsAIAYAAKsLACAIAACuCwAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdgDAQCVBwAh_gMBAJYHACGPBAEAlQcAIa8EEACYBwAhwAQBAJUHACHlBAIAhAgAIeYEAQCWBwAhDAQAAMAIACAFAADBCAAguwMBAAAAAb0DAQAAAAG-AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAcgDAQAAAAHXAwEAAAAB2AMBAAAAAQIAAACIAQAgPAAAuAwAIAMAAAAKACA8AAC4DAAgPQAAvAwAIA4AAAAKACAEAAD3BwAgBQAA-AcAIDUAALwMACC7AwEAlQcAIb0DAQCVBwAhvgMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIcgDAQCVBwAh1wMBAJUHACHYAwEAlgcAIQwEAAD3BwAgBQAA-AcAILsDAQCVBwAhvQMBAJUHACG-AwEAlgcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAhyAMBAJUHACHXAwEAlQcAIdgDAQCWBwAhCrsDAQAAAAHGA0AAAAABxwNAAAAAAc0EIAAAAAHPBAEAAAAB0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEAQAAAAEaAwAAgQoAIA4AAIMKACAdAACCCgAgIQAAhAoAICIAAIUKACAkAACGCgAgKQAAhwoAICoAAIgKACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHpAwAAAOkDAusDAAAA6wMC7QMAAADtAwLuAyAAAAAB7wMBAAAAAfADQAAAAAHyAwAAAPIDA_MDAQAAAAH0AwEAAAABAgAAAN0EACA8AAC-DAAgAwAAAAcAIDwAAL4MACA9AADCDAAgHAAAAAcAIAMAAJkJACAOAACbCQAgHQAAmgkAICEAAJwJACAiAACdCQAgJAAAngkAICkAAJ8JACAqAACgCQAgNQAAwgwAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACEaAwAAmQkAIA4AAJsJACAdAACaCQAgIQAAnAkAICIAAJ0JACAkAACeCQAgKQAAnwkAICoAAKAJACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACHlAwEAlQcAIeYDAQCWBwAh5wMBAJYHACHpAwAAlQnpAyLrAwAAlgnrAyLtAwAAlwntAyLuAyAAmQcAIe8DAQCWBwAh8ANAAJoHACHyAwAAmAnyAyPzAwEAlQcAIfQDAQCVBwAhDrsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAfgDAAAAvQQC_gMBAAAAAbgEAQAAAAG5BAEAAAABugQBAAAAAbsEAQAAAAG9BBAAAAABvgQQAAAAAQq7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAH2AwEAAAAB_gMBAAAAAcAEAQAAAAHBBAEAAAABAgAAAPgCACA8AADEDAAgDrsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAa0EAAAArQQCrgQIAAAAAa8EEAAAAAGwBBAAAAABsQQBAAAAAbIEQAAAAAGzBAgAAAABtAQBAAAAAQe7AwEAAAABxgNAAAAAAccDQAAAAAH-AwEAAAABjwQBAAAAAbYEIAAAAAG3BAEAAAABAwAAAPsCACA8AADEDAAgPQAAygwAIAwAAAD7AgAgNQAAygwAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIfYDAQCVBwAh_gMBAJYHACHABAEAlQcAIcEEAQCWBwAhCrsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIfYDAQCVBwAh_gMBAJYHACHABAEAlQcAIcEEAQCWBwAhEREAAOgKACASAADpCgAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB-AMAAAC9BAL-AwEAAAABuAQBAAAAAbkEAQAAAAG6BAEAAAABuwQBAAAAAb0EEAAAAAG-BBAAAAABvwQBAAAAAQIAAAAwACA8AADLDAAgAwAAAC4AIDwAAMsMACA9AADPDAAgEwAAAC4AIBEAAM0KACASAADOCgAgNQAAzwwAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIfgDAADMCr0EIv4DAQCWBwAhuAQBAJUHACG5BAEAlgcAIboEAQCWBwAhuwQBAJYHACG9BBAAmAcAIb4EEACYBwAhvwQBAJUHACEREQAAzQoAIBIAAM4KACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACH4AwAAzAq9BCL-AwEAlgcAIbgEAQCVBwAhuQQBAJYHACG6BAEAlgcAIbsEAQCWBwAhvQQQAJgHACG-BBAAmAcAIb8EAQCVBwAhEREAAOgKACAUAADqCgAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB-AMAAAC9BAL-AwEAAAABuAQBAAAAAbkEAQAAAAG6BAEAAAABuwQBAAAAAb0EEAAAAAG-BBAAAAABvwQBAAAAAQIAAAAwACA8AADQDAAgDrsDAQAAAAG8AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAKYEAqQEAQAAAAGmBCAAAAABpwQgAAAAAagEAQAAAAGpBAEAAAABqgRAAAAAAQMAAAAuACA8AADQDAAgPQAA1QwAIBMAAAAuACARAADNCgAgFAAAzwoAIDUAANUMACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACH4AwAAzAq9BCL-AwEAlgcAIbgEAQCVBwAhuQQBAJYHACG6BAEAlgcAIbsEAQCWBwAhvQQQAJgHACG-BBAAmAcAIb8EAQCVBwAhEREAAM0KACAUAADPCgAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh-AMAAMwKvQQi_gMBAJYHACG4BAEAlQcAIbkEAQCWBwAhugQBAJYHACG7BAEAlgcAIb0EEACYBwAhvgQQAJgHACG_BAEAlQcAIRQDAADpBwAgDgAA3QgAIBYAAOoHACAYAADsBwAgGQAA7QcAILsDAQAAAAG8AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdkDAQAAAAHtAwAAAKYEAqQEAQAAAAGmBCAAAAABpwQgAAAAAagEAQAAAAGpBAEAAAABqgRAAAAAAasEAQAAAAECAAAAJgAgPAAA1gwAIAMAAAAhACA8AADWDAAgPQAA2gwAIBYAAAAhACADAAC5BwAgDgAA2wgAIBYAALoHACAYAAC8BwAgGQAAvQcAIDUAANoMACC7AwEAlQcAIbwDAQCWBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIe0DAAC3B6YEIqQEAQCVBwAhpgQgAJkHACGnBCAAmQcAIagEAQCWBwAhqQQBAJYHACGqBEAAmgcAIasEAQCVBwAhFAMAALkHACAOAADbCAAgFgAAugcAIBgAALwHACAZAAC9BwAguwMBAJUHACG8AwEAlgcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh2QMBAJUHACHtAwAAtwemBCKkBAEAlQcAIaYEIACZBwAhpwQgAJkHACGoBAEAlgcAIakEAQCWBwAhqgRAAJoHACGrBAEAlQcAIRoDAACBCgAgDgAAgwoAIB0AAIIKACAiAACFCgAgJAAAhgoAICkAAIcKACAqAACICgAgKwAAiQoAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAekDAAAA6QMC6wMAAADrAwLtAwAAAO0DAu4DIAAAAAHvAwEAAAAB8ANAAAAAAfIDAAAA8gMD8wMBAAAAAfQDAQAAAAECAAAA3QQAIDwAANsMACADAAAABwAgPAAA2wwAID0AAN8MACAcAAAABwAgAwAAmQkAIA4AAJsJACAdAACaCQAgIgAAnQkAICQAAJ4JACApAACfCQAgKgAAoAkAICsAAKEJACA1AADfDAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh5QMBAJUHACHmAwEAlgcAIecDAQCWBwAh6QMAAJUJ6QMi6wMAAJYJ6wMi7QMAAJcJ7QMi7gMgAJkHACHvAwEAlgcAIfADQACaBwAh8gMAAJgJ8gMj8wMBAJUHACH0AwEAlQcAIRoDAACZCQAgDgAAmwkAIB0AAJoJACAiAACdCQAgJAAAngkAICkAAJ8JACAqAACgCQAgKwAAoQkAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACEaAwAAgQoAIA4AAIMKACAdAACCCgAgIQAAhAoAICIAAIUKACApAACHCgAgKgAAiAoAICsAAIkKACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHpAwAAAOkDAusDAAAA6wMC7QMAAADtAwLuAyAAAAAB7wMBAAAAAfADQAAAAAHyAwAAAPIDA_MDAQAAAAH0AwEAAAABAgAAAN0EACA8AADgDAAgAwAAAAcAIDwAAOAMACA9AADkDAAgHAAAAAcAIAMAAJkJACAOAACbCQAgHQAAmgkAICEAAJwJACAiAACdCQAgKQAAnwkAICoAAKAJACArAAChCQAgNQAA5AwAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACEaAwAAmQkAIA4AAJsJACAdAACaCQAgIQAAnAkAICIAAJ0JACApAACfCQAgKgAAoAkAICsAAKEJACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACHlAwEAlQcAIeYDAQCWBwAh5wMBAJYHACHpAwAAlQnpAyLrAwAAlgnrAyLtAwAAlwntAyLuAyAAmQcAIe8DAQCWBwAh8ANAAJoHACHyAwAAmAnyAyPzAwEAlQcAIfQDAQCVBwAhCrsDAQAAAAHGA0AAAAABxwNAAAAAAY8EAQAAAAGQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlAQAAPEJACCVBCAAAAABELsDAQAAAAG-AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAcgDAQAAAAHYAwEAAAAB2QMBAAAAAdoDAQAAAAHcAwAAANwDA90DQAAAAAHfAwAAAN8DAuADEAAAAAHhAwEAAAAB4gMBAAAAARQZAQAAAAG7AwEAAAABxgNAAAAAAccDQAAAAAHZAwEAAAAB7QMAAACOBAL2AwEAAAABgQQBAAAAAYIEAQAAAAGDBBAAAAABhAQQAAAAAYUEEAAAAAGGBBAAAAABhwQQAAAAAYgEEAAAAAGJBBAAAAABigQQAAAAAYsEEAAAAAGMBBAAAAABjgRAAAAAARoDAACBCgAgDgAAgwoAIB0AAIIKACAhAACECgAgIgAAhQoAICQAAIYKACApAACHCgAgKwAAiQoAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAekDAAAA6QMC6wMAAADrAwLtAwAAAO0DAu4DIAAAAAHvAwEAAAAB8ANAAAAAAfIDAAAA8gMD8wMBAAAAAfQDAQAAAAECAAAA3QQAIDwAAOgMACADAAAABwAgPAAA6AwAID0AAOwMACAcAAAABwAgAwAAmQkAIA4AAJsJACAdAACaCQAgIQAAnAkAICIAAJ0JACAkAACeCQAgKQAAnwkAICsAAKEJACA1AADsDAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh5QMBAJUHACHmAwEAlgcAIecDAQCWBwAh6QMAAJUJ6QMi6wMAAJYJ6wMi7QMAAJcJ7QMi7gMgAJkHACHvAwEAlgcAIfADQACaBwAh8gMAAJgJ8gMj8wMBAJUHACH0AwEAlQcAIRoDAACZCQAgDgAAmwkAIB0AAJoJACAhAACcCQAgIgAAnQkAICQAAJ4JACApAACfCQAgKwAAoQkAILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACEKuwMBAAAAAcYDQAAAAAHHA0AAAAABzQQgAAAAAc4EAQAAAAHPBAEAAAAB0AQBAAAAAdEEAQAAAAHSBAEAAAAB1AQBAAAAARoDAACBCgAgDgAAgwoAIB0AAIIKACAhAACECgAgIgAAhQoAICQAAIYKACAqAACICgAgKwAAiQoAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAekDAAAA6QMC6wMAAADrAwLtAwAAAO0DAu4DIAAAAAHvAwEAAAAB8ANAAAAAAfIDAAAA8gMD8wMBAAAAAfQDAQAAAAECAAAA3QQAIDwAAO4MACAJuwMBAAAAAcYDQAAAAAHHA0AAAAABgQQBAAAAAdUEAQAAAAHXBAAAANcEAtgEIAAAAAHZBAEAAAAB2gQBAAAAAQIAAACYAgAgPAAA8AwAIAMAAAAHACA8AADuDAAgPQAA9AwAIBwAAAAHACADAACZCQAgDgAAmwkAIB0AAJoJACAhAACcCQAgIgAAnQkAICQAAJ4JACAqAACgCQAgKwAAoQkAIDUAAPQMACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACHlAwEAlQcAIeYDAQCWBwAh5wMBAJYHACHpAwAAlQnpAyLrAwAAlgnrAyLtAwAAlwntAyLuAyAAmQcAIe8DAQCWBwAh8ANAAJoHACHyAwAAmAnyAyPzAwEAlQcAIfQDAQCVBwAhGgMAAJkJACAOAACbCQAgHQAAmgkAICEAAJwJACAiAACdCQAgJAAAngkAICoAAKAJACArAAChCQAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh5QMBAJUHACHmAwEAlgcAIecDAQCWBwAh6QMAAJUJ6QMi6wMAAJYJ6wMi7QMAAJcJ7QMi7gMgAJkHACHvAwEAlgcAIfADQACaBwAh8gMAAJgJ8gMj8wMBAJUHACH0AwEAlQcAIQMAAABrACA8AADwDAAgPQAA9wwAIAsAAABrACA1AAD3DAAguwMBAJUHACHGA0AAmwcAIccDQACbBwAhgQQBAJYHACHVBAEAlQcAIdcEAACNC9cEItgEIACZBwAh2QQBAJYHACHaBAEAlgcAIQm7AwEAlQcAIcYDQACbBwAhxwNAAJsHACGBBAEAlgcAIdUEAQCVBwAh1wQAAI0L1wQi2AQgAJkHACHZBAEAlgcAIdoEAQCWBwAhCrsDAQAAAAHGA0AAAAABxwNAAAAAAc0EIAAAAAHOBAEAAAABzwQBAAAAAdAEAQAAAAHRBAEAAAAB0gQBAAAAAdMEAQAAAAEJuwMBAAAAAcYDQAAAAAHHA0AAAAABjwQBAAAAAccEAQAAAAHJBAAAAMkEAssEAAAAywQCzAQBAAAAAc0EIAAAAAEKLgAAlAwAIC8AAJUMACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAeQDAQAAAAH-AwEAAAABwAQBAAAAAQIAAAABACA8AAD6DAAgGg4AAIMKACAdAACCCgAgIQAAhAoAICIAAIUKACAkAACGCgAgKQAAhwoAICoAAIgKACArAACJCgAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB5QMBAAAAAeYDAQAAAAHnAwEAAAAB6QMAAADpAwLrAwAAAOsDAu0DAAAA7QMC7gMgAAAAAe8DAQAAAAHwA0AAAAAB8gMAAADyAwPzAwEAAAAB9AMBAAAAAQIAAADdBAAgPAAA_AwAIBoDAACBCgAgDgAAgwoAIB0AAIIKACAhAACECgAgJAAAhgoAICkAAIcKACAqAACICgAgKwAAiQoAILsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAekDAAAA6QMC6wMAAADrAwLtAwAAAO0DAu4DIAAAAAHvAwEAAAAB8ANAAAAAAfIDAAAA8gMD8wMBAAAAAfQDAQAAAAECAAAA3QQAIDwAAP4MACASCgAAuwgAIAsAALwIACAcAAC_CAAgHQAApQsAIB8AAL4IACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdcDAQAAAAH_AwEAAAAB3wQBAAAAAeAEAgAAAAHhBAIAAAAB4gQBAAAAAeMEAQAAAAHkBAEAAAABAgAAABAAIDwAAIANACADAAAADgAgPAAAgA0AID0AAIQNACAUAAAADgAgCgAAhggAIAsAAIcIACAcAACKCAAgHQAApAsAIB8AAIkIACA1AACEDQAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh_wMBAJUHACHfBAEAlQcAIeAEAgCECAAh4QQCAIQIACHiBAEAlgcAIeMEAQCWBwAh5AQBAJUHACESCgAAhggAIAsAAIcIACAcAACKCAAgHQAApAsAIB8AAIkIACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh1wMBAJYHACH_AwEAlQcAId8EAQCVBwAh4AQCAIQIACHhBAIAhAgAIeIEAQCWBwAh4wQBAJYHACHkBAEAlQcAIQa7AwEAAAABxAMgAAAAAcUDQAAAAAHtAwAAAN4EAsYEAQAAAAHeBEAAAAABEgoAALsIACALAAC8CAAgHAAAvwgAIB0AAKULACAeAAC9CAAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHXAwEAAAAB_wMBAAAAAd8EAQAAAAHgBAIAAAAB4QQCAAAAAeIEAQAAAAHjBAEAAAAB5AQBAAAAAQIAAAAQACA8AACGDQAgAwAAAA4AIDwAAIYNACA9AACKDQAgFAAAAA4AIAoAAIYIACALAACHCAAgHAAAiggAIB0AAKQLACAeAACICAAgNQAAig0AILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHXAwEAlgcAIf8DAQCVBwAh3wQBAJUHACHgBAIAhAgAIeEEAgCECAAh4gQBAJYHACHjBAEAlgcAIeQEAQCVBwAhEgoAAIYIACALAACHCAAgHAAAiggAIB0AAKQLACAeAACICAAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh_wMBAJUHACHfBAEAlQcAIeAEAgCECAAh4QQCAIQIACHiBAEAlgcAIeMEAQCWBwAh5AQBAJUHACEHuwMBAAAAAcYDQAAAAAHHA0AAAAAB7QMAAADdBALFBAEAAAABxgQBAAAAAdsEQAAAAAESCgAAuwgAIAsAALwIACAdAAClCwAgHgAAvQgAIB8AAL4IACC7AwEAAAABxAMgAAAAAcUDQAAAAAHGA0AAAAABxwNAAAAAAdcDAQAAAAH_AwEAAAAB3wQBAAAAAeAEAgAAAAHhBAIAAAAB4gQBAAAAAeMEAQAAAAHkBAEAAAABAgAAABAAIDwAAIwNACADAAAADgAgPAAAjA0AID0AAJANACAUAAAADgAgCgAAhggAIAsAAIcIACAdAACkCwAgHgAAiAgAIB8AAIkIACA1AACQDQAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdcDAQCWBwAh_wMBAJUHACHfBAEAlQcAIeAEAgCECAAh4QQCAIQIACHiBAEAlgcAIeMEAQCWBwAh5AQBAJUHACESCgAAhggAIAsAAIcIACAdAACkCwAgHgAAiAgAIB8AAIkIACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh1wMBAJYHACH_AwEAlQcAId8EAQCVBwAh4AQCAIQIACHhBAIAhAgAIeIEAQCWBwAh4wQBAJYHACHkBAEAlQcAIQq7AwEAAAABxgNAAAAAAccDQAAAAAH_AwEAAAABlQQgAAAAAcIECAAAAAHDBAgAAAABxAQBAAAAAcUEAQAAAAHGBAEAAAABFAMAAOkHACAOAADdCAAgFgAA6gcAIBcAAOsHACAZAADtBwAguwMBAAAAAbwDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB2QMBAAAAAe0DAAAApgQCpAQBAAAAAaYEIAAAAAGnBCAAAAABqAQBAAAAAakEAQAAAAGqBEAAAAABqwQBAAAAAQIAAAAmACA8AACSDQAgAwAAACEAIDwAAJINACA9AACWDQAgFgAAACEAIAMAALkHACAOAADbCAAgFgAAugcAIBcAALsHACAZAAC9BwAgNQAAlg0AILsDAQCVBwAhvAMBAJYHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIdkDAQCVBwAh7QMAALcHpgQipAQBAJUHACGmBCAAmQcAIacEIACZBwAhqAQBAJYHACGpBAEAlgcAIaoEQACaBwAhqwQBAJUHACEUAwAAuQcAIA4AANsIACAWAAC6BwAgFwAAuwcAIBkAAL0HACC7AwEAlQcAIbwDAQCWBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHZAwEAlQcAIe0DAAC3B6YEIqQEAQCVBwAhpgQgAJkHACGnBCAAmQcAIagEAQCWBwAhqQQBAJYHACGqBEAAmgcAIasEAQCVBwAhDrsDAQAAAAHGA0AAAAABxwNAAAAAAe0DAAAA-gMC9QMQAAAAAfYDAQAAAAH4AwAAAPgDAvoDAQAAAAH7AwEAAAAB_AMBAAAAAf0DQAAAAAH-AwEAAAAB_wMBAAAAAYAEAQAAAAEPBAAA7gcAIA8AAPAHACC7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcEDAAAAwQMCwgMQAAAAAcMDEAAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAByAMBAAAAAQIAAACnBQAgPAAAmA0AIAMAAAAjACA8AACYDQAgPQAAnA0AIBEAAAAjACAEAACcBwAgDwAAngcAIDUAAJwNACC7AwEAlQcAIbwDAQCVBwAhvQMBAJUHACG-AwEAlgcAIb8DAQCWBwAhwQMAAJcHwQMiwgMQAJgHACHDAxAAmAcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAhyAMBAJUHACEPBAAAnAcAIA8AAJ4HACC7AwEAlQcAIbwDAQCVBwAhvQMBAJUHACG-AwEAlgcAIb8DAQCWBwAhwQMAAJcHwQMiwgMQAJgHACHDAxAAmAcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAhyAMBAJUHACEOuwMBAAAAAbwDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB7QMAAACmBAKkBAEAAAABpgQgAAAAAacEIAAAAAGoBAEAAAABqQQBAAAAAaoEQAAAAAGrBAEAAAABAwAAAAwAIDwAAPoMACA9AACgDQAgDAAAAAwAIC4AAPMLACAvAAD0CwAgNQAAoA0AILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIf4DAQCWBwAhwAQBAJUHACEKLgAA8wsAIC8AAPQLACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACH-AwEAlgcAIcAEAQCVBwAhAwAAAAcAIDwAAPwMACA9AACjDQAgHAAAAAcAIA4AAJsJACAdAACaCQAgIQAAnAkAICIAAJ0JACAkAACeCQAgKQAAnwkAICoAAKAJACArAAChCQAgNQAAow0AILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACEaDgAAmwkAIB0AAJoJACAhAACcCQAgIgAAnQkAICQAAJ4JACApAACfCQAgKgAAoAkAICsAAKEJACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACHlAwEAlQcAIeYDAQCWBwAh5wMBAJYHACHpAwAAlQnpAyLrAwAAlgnrAyLtAwAAlwntAyLuAyAAmQcAIe8DAQCWBwAh8ANAAJoHACHyAwAAmAnyAyPzAwEAlQcAIfQDAQCVBwAhAwAAAAcAIDwAAP4MACA9AACmDQAgHAAAAAcAIAMAAJkJACAOAACbCQAgHQAAmgkAICEAAJwJACAkAACeCQAgKQAAnwkAICoAAKAJACArAAChCQAgNQAApg0AILsDAQCVBwAhxAMgAJkHACHFA0AAmgcAIcYDQACbBwAhxwNAAJsHACHkAwEAlQcAIeUDAQCVBwAh5gMBAJYHACHnAwEAlgcAIekDAACVCekDIusDAACWCesDIu0DAACXCe0DIu4DIACZBwAh7wMBAJYHACHwA0AAmgcAIfIDAACYCfIDI_MDAQCVBwAh9AMBAJUHACEaAwAAmQkAIA4AAJsJACAdAACaCQAgIQAAnAkAICQAAJ4JACApAACfCQAgKgAAoAkAICsAAKEJACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACHlAwEAlQcAIeYDAQCWBwAh5wMBAJYHACHpAwAAlQnpAyLrAwAAlgnrAyLtAwAAlwntAyLuAyAAmQcAIe8DAQCWBwAh8ANAAJoHACHyAwAAmAnyAyPzAwEAlQcAIfQDAQCVBwAhCi0AAJMMACAvAACVDAAguwMBAAAAAcQDIAAAAAHFA0AAAAABxgNAAAAAAccDQAAAAAHkAwEAAAAB_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_gMBAJYHACGPBAEAlQcAIa8EEACYBwAhwAQBAJUHACHlBAIAhAgAIeYEAQCWBwAhDLsDAQAAAAHEAyAAAAABxQNAAAAAAcYDQAAAAAHHA0AAAAAB_wMBAAAAAd8EAQAAAAHgBAIAAAAB4QQCAAAAAeIEAQAAAAHjBAEAAAAB5AQBAAAAAQMAAAAMACA8AACnDQAgPQAAzw0AIAwAAAAMACAtAADyCwAgLwAA9AsAIDUAAM8NACC7AwEAlQcAIcQDIACZBwAhxQNAAJoHACHGA0AAmwcAIccDQACbBwAh5AMBAJUHACH-AwEAlgcAIcAEAQCVBwAhCi0AAPILACAvAAD0CwAguwMBAJUHACHEAyAAmQcAIcUDQACaBwAhxgNAAJsHACHHA0AAmwcAIeQDAQCVBwAh_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-AMAAAD4AwL6AwEAAAAB-wMBAAAAAfwDAQAAAAH9A0AAAAAB_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_MDAQCVBwAh9AMBAJUHACEECQAlLQYCLokBBC-KAQYJBAADBXwBCQAkGIABCRx_Fx59GR9-GiMIAyyBAQoKAwkCCQAjDl0LHQsEIWEdImICJGYeKWofKnAfK3QiBAQAAwUNAQgRBQkAHAcJABsKAAYLAAgcWBcdTwQeUxkfVxoFBQABBhMGBxYGCBcFCQAHAgcYAAgZAAQIGgUJABgYHgkcSxcDAwACCyAIGiIKBwMAAgkAFg4kCxYADhdCFRhDCRlEDAQEAAMJAA0MJwoPKwwCDQAKDgALAgwsAA8tAAMJABQTAA8VPQoECQATEQAQEjYOFDoSAgkAERAxDwEQMgABEwAPAhI7ABQ8AAEVPgABDQAKAxdFABhGABlHAAMDAAILAAgbAAUDCEwAGE0AHE4AAgMAAhsABQIDAAIbAAUDHFsAHlkAH1oAAQhcAAEgAAMBIwADAyZsICcAAyhvAwIJACElbR8BJW4AAQR1AwYhdgAidwAkeAApeQAqegArewAFGIUBAByEAQAeggEAH4MBACyGAQADLYsBAC6MAQAvjQEAAAAAAwkAKkIAK0MALAAAAAMJACpCACtDACwAAAMJADFCADJDADMAAAADCQAxQgAyQwAzAgUAAQbGAQYCBQABBswBBgUJADhCADtDADxkADllADoAAAAAAAUJADhCADtDADxkADllADoDCgAGCwAIHd4BBAMKAAYLAAgd5AEEBQkAQUIAREMARWQAQmUAQwAAAAAABQkAQUIAREMARWQAQmUAQwIDAAIbAAUCAwACGwAFAwkASkIAS0MATAAAAAMJAEpCAEtDAEwCAwACGwAFAgMAAhsABQMJAFFCAFJDAFMAAAADCQBRQgBSQwBTAAADCQBYQgBZQwBaAAAAAwkAWEIAWUMAWgMmugIgJwADKLsCAwMmwQIgJwADKMICAwMJAF9CAGBDAGEAAAADCQBfQgBgQwBhAQTUAgMBBNoCAwMJAGZCAGdDAGgAAAADCQBmQgBnQwBoAwMAAgsACBsABQMDAAILAAgbAAUFCQBtQgBwQwBxZABuZQBvAAAAAAAFCQBtQgBwQwBxZABuZQBvAAADCQB2QgB3QwB4AAAAAwkAdkIAd0MAeAERABABEQAQBQkAfUIAgAFDAIEBZAB-ZQB_AAAAAAAFCQB9QgCAAUMAgQFkAH5lAH8BEwAPARMADwMJAIYBQgCHAUMAiAEAAAADCQCGAUIAhwFDAIgBARMADwETAA8FCQCNAUIAkAFDAJEBZACOAWUAjwEAAAAAAAUJAI0BQgCQAUMAkQFkAI4BZQCPAQMDAAIO3QMLFgAOAwMAAg7jAwsWAA4DCQCWAUIAlwFDAJgBAAAAAwkAlgFCAJcBQwCYAQINAAoOAAsCDQAKDgALAwkAnQFCAJ4BQwCfAQAAAAMJAJ0BQgCeAUMAnwEBDQAKAQ0ACgMJAKQBQgClAUMApgEAAAADCQCkAUIApQFDAKYBASAAAwEgAAMDCQCrAUIArAFDAK0BAAAAAwkAqwFCAKwBQwCtAQEjAAMBIwADBQkAsgFCALUBQwC2AWQAswFlALQBAAAAAAAFCQCyAUIAtQFDALYBZACzAWUAtAEDAwACC80ECBrOBAoDAwACC9QECBrVBAoFCQC7AUIAvgFDAL8BZAC8AWUAvQEAAAAAAAUJALsBQgC-AUMAvwFkALwBZQC9AQAAAwkAxAFCAMUBQwDGAQAAAAMJAMQBQgDFAUMAxgEDBAADBYAFASP_BAMDBAADBYcFASOGBQMFCQDLAUIAzgFDAM8BZADMAWUAzQEAAAAAAAUJAMsBQgDOAUMAzwFkAMwBZQDNAQIEAAMFmQUBAgQAAwWfBQEDCQDUAUIA1QFDANYBAAAAAwkA1AFCANUBQwDWAQEEAAMBBAADBQkA2wFCAN4BQwDfAWQA3AFlAN0BAAAAAAAFCQDbAUIA3gFDAN8BZADcAWUA3QEwAgExjgEBMpABATORAQE0kgEBNpQBATeWASY4lwEnOZkBATqbASY7nAEoPp0BAT-eAQFAnwEmRKIBKUWjAS1GpQEIR6YBCEioAQhJqQEISqoBCEusAQhMrgEmTa8BLk6xAQhPswEmULQBL1G1AQhStgEIU7cBJlS6ATBVuwE0VrwBBle9AQZYvgEGWb8BBlrAAQZbwgEGXMQBJl3FATVeyAEGX8oBJmDLATZhzQEGYs4BBmPPASZm0gE3Z9MBPWjUAQVp1QEFatYBBWvXAQVs2AEFbdoBBW7cASZv3QE-cOABBXHiASZy4wE_c-UBBXTmAQV15wEmduoBQHfrAUZ47AEZee0BGXruARl77wEZfPABGX3yARl-9AEmf_UBR4AB9wEZgQH5ASaCAfoBSIMB-wEZhAH8ARmFAf0BJoYBgAJJhwGBAk2IAYICGokBgwIaigGEAhqLAYUCGowBhgIajQGIAhqOAYoCJo8BiwJOkAGNAhqRAY8CJpIBkAJPkwGRAhqUAZICGpUBkwImlgGWAlCXAZcCVJgBmQIgmQGaAiCaAZwCIJsBnQIgnAGeAiCdAaACIJ4BogImnwGjAlWgAaUCIKEBpwImogGoAlajAakCIKQBqgIgpQGrAiamAa4CV6cBrwJbqAGwAh-pAbECH6oBsgIfqwGzAh-sAbQCH60BtgIfrgG4AiavAbkCXLABvQIfsQG_AiayAcACXbMBwwIftAHEAh-1AcUCJrYByAJetwHJAmK4AcoCIrkBywIiugHMAiK7Ac0CIrwBzgIivQHQAiK-AdICJr8B0wJjwAHWAiLBAdgCJsIB2QJkwwHbAiLEAdwCIsUB3QImxgHgAmXHAeECacgB4gIXyQHjAhfKAeQCF8sB5QIXzAHmAhfNAegCF84B6gImzwHrAmrQAe0CF9EB7wIm0gHwAmvTAfECF9QB8gIX1QHzAibWAfYCbNcB9wJy2AH5AhDZAfoCENoB_QIQ2wH-AhDcAf8CEN0BgQMQ3gGDAybfAYQDc-ABhgMQ4QGIAybiAYkDdOMBigMQ5AGLAxDlAYwDJuYBjwN15wGQA3noAZEDD-kBkgMP6gGTAw_rAZQDD-wBlQMP7QGXAw_uAZkDJu8BmgN68AGcAw_xAZ4DJvIBnwN78wGgAw_0AaEDD_UBogMm9gGlA3z3AaYDggH4AacDEvkBqAMS-gGpAxL7AaoDEvwBqwMS_QGtAxL-Aa8DJv8BsAODAYACsgMSgQK0AyaCArUDhAGDArYDEoQCtwMShQK4AyaGArsDhQGHArwDiQGIAr0DDokCvgMOigK_Aw6LAsADDowCwQMOjQLDAw6OAsUDJo8CxgOKAZACyAMOkQLKAyaSAssDiwGTAswDDpQCzQMOlQLOAyaWAtEDjAGXAtIDkgGYAtMDCpkC1AMKmgLVAwqbAtYDCpwC1wMKnQLZAwqeAtsDJp8C3AOTAaAC3wMKoQLhAyaiAuIDlAGjAuQDCqQC5QMKpQLmAyamAukDlQGnAuoDmQGoAusDDKkC7AMMqgLtAwyrAu4DDKwC7wMMrQLxAwyuAvMDJq8C9AOaAbAC9gMMsQL4AyayAvkDmwGzAvoDDLQC-wMMtQL8Aya2Av8DnAG3AoAEoAG4AoEEFbkCggQVugKDBBW7AoQEFbwChQQVvQKHBBW-AokEJr8CigShAcACjAQVwQKOBCbCAo8EogHDApAEFcQCkQQVxQKSBCbGApUEowHHApYEpwHIApcEHckCmAQdygKZBB3LApoEHcwCmwQdzQKdBB3OAp8EJs8CoASoAdACogQd0QKkBCbSAqUEqQHTAqYEHdQCpwQd1QKoBCbWAqsEqgHXAqwErgHYAq0EHtkCrgQe2gKvBB7bArAEHtwCsQQe3QKzBB7eArUEJt8CtgSvAeACuAQe4QK6BCbiArsEsAHjArwEHuQCvQQe5QK-BCbmAsEEsQHnAsIEtwHoAsMECekCxAQJ6gLFBAnrAsYECewCxwQJ7QLJBAnuAssEJu8CzAS4AfAC0AQJ8QLSBCbyAtMEuQHzAtYECfQC1wQJ9QLYBCb2AtsEugH3AtwEwAH4At4EA_kC3wQD-gLhBAP7AuIEA_wC4wQD_QLlBAP-AucEJv8C6ATBAYAD6gQDgQPsBCaCA-0EwgGDA-4EA4QD7wQDhQPwBCaGA_MEwwGHA_QExwGIA_UEAokD9gQCigP3BAKLA_gEAowD-QQCjQP7BAKOA_0EJo8D_gTIAZADggUCkQOEBSaSA4UFyQGTA4gFApQDiQUClQOKBSaWA40FygGXA44F0AGYA48FBJkDkAUEmgORBQSbA5IFBJwDkwUEnQOVBQSeA5cFJp8DmAXRAaADmwUEoQOdBSaiA54F0gGjA6AFBKQDoQUEpQOiBSamA6UF0wGnA6YF1wGoA6gFC6kDqQULqgOrBQurA6wFC6wDrQULrQOvBQuuA7EFJq8DsgXYAbADtAULsQO2BSayA7cF2QGzA7gFC7QDuQULtQO6BSa2A70F2gG3A74F4AE"
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
          httpStatus3.FORBIDDEN,
          "Your account has been suspended/blocked!"
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
var AdminService = {
  getDashboardStats
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
var AdminController = {
  getDashboardStats: getDashboardStats2
};

// src/app/module/admin/admin.route.ts
var router2 = Router2();
router2.get(
  "/dashboard-stats",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  AdminController.getDashboardStats
);
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
var sendVerificationOtpEmail = async (to, name, otp) => {
  const subject = "Verification Code for Your University Portal Account";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to Study Abroad Portal</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering. Please use the following 6-digit verification code to activate your account:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; border-radius: 6px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 13px;">This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
  `;
  try {
    if (config_default.smtp_user && config_default.smtp_password && !config_default.smtp_user.includes("demo")) {
      await transporter.sendMail({
        from: config_default.email_sender || config_default.smtp_user,
        to,
        subject,
        html
      });
    } else {
      console.log(
        `
[Email Simulation] To: ${to} | Verification OTP: ${otp}
`
      );
    }
  } catch (error) {
    console.log(
      `
[Email Delivery Notice] Failed to send email to ${to}:`,
      error.message
    );
    console.log(`[OTP] Verification code fallback: ${otp}
`);
  }
};
var sendPasswordResetOtpEmail = async (to, name, otp) => {
  const subject = "Password Reset OTP - University Portal";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #dc2626; text-align: center;">Password Reset Request</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Use the following code to proceed:</p>
      <div style="background-color: #fef2f2; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #991b1b; border-radius: 6px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 13px;">This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
    </div>
  `;
  try {
    if (config_default.smtp_user && config_default.smtp_password && !config_default.smtp_user.includes("demo")) {
      await transporter.sendMail({
        from: config_default.email_sender || config_default.smtp_user,
        to,
        subject,
        html
      });
    } else {
      console.log(
        `
[Email Simulation] To: ${to} | Password Reset OTP: ${otp}
`
      );
    }
  } catch (error) {
    console.log(
      `
[Email Delivery Notice] Failed to send email to ${to}:`,
      error.message
    );
    console.log(`[OTP] Password reset fallback: ${otp}
`);
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
  if (!user || user.isDeleted) {
    throw new AppError(
      httpStatus9.NOT_FOUND,
      "User does not exist with this email!"
    );
  }
  if (user.status === "INACTIVE" || !user.isEmailVerified) {
    throw new AppError(
      httpStatus9.FORBIDDEN,
      "Your email is not verified yet. Please verify your account with the OTP sent to your Gmail."
    );
  }
  if (user.status === "BLOCKED") {
    throw new AppError(
      httpStatus9.FORBIDDEN,
      "Your account has been suspended/blocked by the administrator!"
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
      studentId: user.student?.studentId,
      counselorId: user.counselor?.counselorId,
      accessScope: user.student?.accessScope
    }
  };
};
var googleLogin = async (payload) => {
  let googlePayload;
  try {
    if (config_default.google_client_id && config_default.google_client_id !== "demo_client_id" && payload.idToken !== "mock-google-id-token") {
      const ticket = await googleClient.verifyIdToken({
        idToken: payload.idToken,
        audience: config_default.google_client_id
      });
      googlePayload = ticket.getPayload();
    } else {
      googlePayload = {
        email: "arafat.student@gmail.com",
        name: "Google Student",
        sub: `google-mock-${Date.now()}`,
        picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
      };
    }
  } catch (error) {
    throw new AppError(httpStatus9.BAD_REQUEST, "Google authentication failed!");
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
  } else if (!user.isEmailVerified || user.status === "INACTIVE") {
    user = await prisma.user.update({
      where: { email },
      data: { isEmailVerified: true, status: "ACTIVE" },
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
import httpStatus18 from "http-status";

// src/app/module/higher-study/higher-study.service.ts
import httpStatus17 from "http-status";

// src/app/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: config_default.cloudinary_cloud_name,
  api_key: config_default.cloudinary_api_key,
  api_secret: config_default.cloudinary_api_secret
});

// src/app/module/higher-study/higher-study.service.ts
var createCountry = async (payload) => {
  const isExist = await prisma.country.findFirst({
    where: {
      OR: [{ name: payload.name }, { code: payload.code }]
    }
  });
  if (isExist) {
    throw new AppError(
      httpStatus17.CONFLICT,
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
var updateGlobalUniversity = async (id, payload) => {
  const university = await prisma.globalUniversity.findUnique({ where: { id } });
  if (!university || university.isDeleted) {
    throw new AppError(httpStatus17.NOT_FOUND, "University not found!");
  }
  const updated = await prisma.globalUniversity.update({
    where: { id },
    data: payload,
    include: { country: true, docRequirements: true }
  });
  return updated;
};
var getGlobalUniversities = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereConditions = { isDeleted: false };
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
        _count: { select: { programs: true } }
      },
      orderBy: { name: "asc" }
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
var getGlobalUniversityDetails = async (id) => {
  const university = await prisma.globalUniversity.findUnique({
    where: { id },
    include: {
      country: true,
      docRequirements: true,
      programs: { where: { isDeleted: false } }
    }
  });
  if (!university || university.isDeleted) {
    throw new AppError(httpStatus17.NOT_FOUND, "University not found!");
  }
  return university;
};
var addUniversityDocRequirement = async (universityId, payload) => {
  const university = await prisma.globalUniversity.findUnique({
    where: { id: universityId }
  });
  if (!university) {
    throw new AppError(httpStatus17.NOT_FOUND, "University not found!");
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
      httpStatus17.NOT_FOUND,
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
      documents: true,
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
        documents: true
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
    throw new AppError(httpStatus17.NOT_FOUND, "Application not found!");
  }
  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId },
    include: { user: true }
  });
  if (!counselor) {
    throw new AppError(httpStatus17.NOT_FOUND, "Counselor not found!");
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
    throw new AppError(httpStatus17.FORBIDDEN, "Counselor profile not found!");
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
      httpStatus17.BAD_REQUEST,
      "Please upload a document file (PDF/Image)!"
    );
  }
  const doc = await prisma.applicationDocument.findUnique({
    where: { id: documentId },
    include: { application: true }
  });
  if (!doc) {
    throw new AppError(httpStatus17.NOT_FOUND, "Document item not found!");
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
  return updated;
};
var verifyDocument = async (documentId, payload) => {
  const doc = await prisma.applicationDocument.findUnique({
    where: { id: documentId },
    include: {
      application: { include: { student: { include: { user: true } } } }
    }
  });
  if (!doc) {
    throw new AppError(httpStatus17.NOT_FOUND, "Document item not found!");
  }
  const updated = await prisma.applicationDocument.update({
    where: { id: documentId },
    data: {
      status: payload.status,
      adminFeedback: payload.adminFeedback
    }
  });
  if (payload.status === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: doc.application.student.userId,
        title: "Document Rejected \u2014 Re-upload Needed",
        body: `Your document '${doc.title}' was rejected. Note: ${payload.adminFeedback || "Please review requirements and re-upload."}`,
        audience: "HIGHER_STUDY",
        priority: "CRITICAL_ALERT"
      }
    });
  }
  return updated;
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
      httpStatus17.BAD_REQUEST,
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
    throw new AppError(httpStatus17.NOT_FOUND, "Application not found!");
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
    throw new AppError(httpStatus17.FORBIDDEN, "Access denied to this application!");
  }
  if (!application.offerLetterUrl) {
    throw new AppError(httpStatus17.NOT_FOUND, "Offer letter has not been issued yet!");
  }
  if (!application.isOfferUnlocked) {
    throw new AppError(
      httpStatus17.PAYMENT_REQUIRED,
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
    throw new AppError(httpStatus17.NOT_FOUND, "Application not found!");
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
    throw new AppError(httpStatus17.NOT_FOUND, "Blog post not found!");
  }
  return post;
};
var deleteBlogPost = async (id) => {
  await prisma.blogPost.delete({ where: { id } });
  return { message: "Blog post deleted successfully!" };
};
var HigherStudyService = {
  createCountry,
  getCountries,
  createGlobalUniversity,
  updateGlobalUniversity,
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
  assignCounselor,
  addCounselorNote,
  uploadApplicationDocument,
  verifyDocument,
  updateApplicationStage,
  issueOfferLetter,
  getOfferLetterDownload,
  toggleOfferLetterLock,
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug,
  deleteBlogPost
};

// src/app/module/higher-study/higher-study.controller.ts
var createCountry2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.createCountry(req.body);
  sendResponse(res, {
    statusCode: httpStatus18.CREATED,
    success: true,
    message: "Country created successfully!",
    data: result
  });
});
var getCountries2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getCountries();
  sendResponse(res, {
    statusCode: httpStatus18.OK,
    success: true,
    message: "Countries fetched successfully!",
    data: result
  });
});
var createGlobalUniversity2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.createGlobalUniversity(req.body);
    sendResponse(res, {
      statusCode: httpStatus18.CREATED,
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
      statusCode: httpStatus18.OK,
      success: true,
      message: "Global university updated successfully!",
      data: result
    });
  }
);
var getGlobalUniversities2 = catchAsync(
  async (req, res) => {
    const result = await HigherStudyService.getGlobalUniversities(req.query);
    sendResponse(res, {
      statusCode: httpStatus18.OK,
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
      statusCode: httpStatus18.OK,
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
      statusCode: httpStatus18.CREATED,
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
      statusCode: httpStatus18.OK,
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
      statusCode: httpStatus18.OK,
      success: true,
      message: result.message,
      data: null
    });
  }
);
var createGlobalProgram2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.createGlobalProgram(req.body);
  sendResponse(res, {
    statusCode: httpStatus18.CREATED,
    success: true,
    message: "Global degree program added!",
    data: result
  });
});
var getGlobalPrograms2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getGlobalPrograms(req.query);
  sendResponse(res, {
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.CREATED,
    success: true,
    message: "Higher study application created with checklist!",
    data: result
  });
});
var getMyApplications2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await HigherStudyService.getMyApplications(studentId);
  sendResponse(res, {
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.CREATED,
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
      statusCode: httpStatus18.OK,
      success: true,
      message: "Document uploaded to Cloudinary successfully!",
      data: result
    });
  }
);
var verifyDocument2 = catchAsync(async (req, res) => {
  const documentId = req.params.documentId;
  const result = await HigherStudyService.verifyDocument(documentId, req.body);
  sendResponse(res, {
    statusCode: httpStatus18.OK,
    success: true,
    message: `Document status marked as ${req.body.status}!`,
    data: result
  });
});
var updateApplicationStage2 = catchAsync(
  async (req, res) => {
    const applicationId = req.params.applicationId;
    const result = await HigherStudyService.updateApplicationStage(
      applicationId,
      req.body.status
    );
    sendResponse(res, {
      statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
    success: true,
    message: `Offer letter ${isOfferUnlocked ? "unlocked" : "locked"} successfully!`,
    data: result
  });
});
var createBlogPost2 = catchAsync(async (req, res) => {
  const authorId = req.user.userId;
  const result = await HigherStudyService.createBlogPost(authorId, req.body);
  sendResponse(res, {
    statusCode: httpStatus18.CREATED,
    success: true,
    message: "Blog article published successfully!",
    data: result
  });
});
var getBlogPosts2 = catchAsync(async (req, res) => {
  const result = await HigherStudyService.getBlogPosts(req.query);
  sendResponse(res, {
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
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
    statusCode: httpStatus18.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var HigherStudyController = {
  createCountry: createCountry2,
  getCountries: getCountries2,
  createGlobalUniversity: createGlobalUniversity2,
  updateGlobalUniversity: updateGlobalUniversity2,
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
  assignCounselor: assignCounselor2,
  addCounselorNote: addCounselorNote2,
  uploadApplicationDocument: uploadApplicationDocument2,
  verifyDocument: verifyDocument2,
  updateApplicationStage: updateApplicationStage2,
  issueOfferLetter: issueOfferLetter2,
  downloadOfferLetter,
  toggleOfferLetterLock: toggleOfferLetterLock2,
  createBlogPost: createBlogPost2,
  getBlogPosts: getBlogPosts2,
  getBlogPostBySlug: getBlogPostBySlug2,
  deleteBlogPost: deleteBlogPost2
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
router8.patch(
  "/universities/:id",
  checkAuth("SUPER_ADMIN", "ADMIN"),
  HigherStudyController.updateGlobalUniversity
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
import httpStatus19 from "http-status";

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
  const whereConditions = {
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
    take: 30
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
var NotificationService = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead
};

// src/app/module/notification/notification.controller.ts
var createNotification2 = catchAsync(async (req, res) => {
  const result = await NotificationService.createNotification(req.body);
  sendResponse(res, {
    statusCode: httpStatus19.CREATED,
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
    statusCode: httpStatus19.OK,
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
      statusCode: httpStatus19.OK,
      success: true,
      message: "Notification marked as read!",
      data: result
    });
  }
);
var NotificationController = {
  createNotification: createNotification2,
  getMyNotifications: getMyNotifications2,
  markNotificationAsRead: markNotificationAsRead2
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
  "/:id/read",
  checkAuth("ADMIN", "SUPER_ADMIN", "COUNSELOR", "STUDENT"),
  NotificationController.markNotificationAsRead
);
var NotificationRoutes = router9;

// src/app/module/payment/payment.route.ts
import { Router as Router10 } from "express";

// src/app/module/payment/payment.controller.ts
import httpStatus21 from "http-status";

// src/app/module/payment/payment.service.ts
import httpStatus20 from "http-status";
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
    throw new AppError(httpStatus20.NOT_FOUND, "Student profile not found!");
  }
  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount: payload.amount,
      currency: "USD",
      paymentType: payload.paymentType,
      status: "PENDING",
      description: payload.description || `${payload.paymentType.replace("_", " ")} Payment`,
      semesterId: payload.semesterId
    }
  });
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
                name: payload.description || `University ${payload.paymentType}`
              },
              unit_amount: Math.round(payload.amount * 100)
              // in cents
            },
            quantity: 1
          }
        ],
        mode: "payment",
        customer_email: userEmail,
        client_reference_id: payment.id,
        success_url: `${config_default.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
        cancel_url: `${config_default.frontend_url}/payment/cancelled?payment_id=${payment.id}`
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
    throw new AppError(httpStatus20.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paymentId = session.client_reference_id;
    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: /* @__PURE__ */ new Date(),
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : void 0
        }
      });
    }
  }
  return { received: true };
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
    throw new AppError(httpStatus20.NOT_FOUND, "Payment record not found!");
  }
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument2({ margin: 45 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
    doc.fontSize(22).text("OFFICIAL PAYMENT RECEIPT", { align: "center", underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text("Global University & Higher Study Portal", { align: "center" });
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
var PaymentService = {
  createCheckoutSession,
  handleStripeWebhook,
  getMyPaymentHistory,
  generatePaymentReceiptPDF
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
      statusCode: httpStatus21.OK,
      success: true,
      message: "Stripe checkout session initialized!",
      data: result
    });
  }
);
var handleStripeWebhook2 = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const result = await PaymentService.handleStripeWebhook(req.body, sig);
  res.status(httpStatus21.OK).json(result);
});
var getMyPaymentHistory2 = catchAsync(async (req, res) => {
  const studentId = req.user.studentId;
  const result = await PaymentService.getMyPaymentHistory(studentId);
  sendResponse(res, {
    statusCode: httpStatus21.OK,
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
      `attachment; filename="receipt_${paymentId}.pdf"`
    );
    res.send(pdfBuffer);
  }
);
var PaymentController = {
  createCheckoutSession: createCheckoutSession2,
  handleStripeWebhook: handleStripeWebhook2,
  getMyPaymentHistory: getMyPaymentHistory2,
  downloadPaymentReceiptPDF
};

// src/app/module/payment/payment.route.ts
var router10 = Router10();
router10.post(
  "/create-checkout-session",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  PaymentController.createCheckoutSession
);
router10.post("/webhook", PaymentController.handleStripeWebhook);
router10.get(
  "/my-history",
  checkAuth("STUDENT"),
  checkStudentScope("ACADEMIC"),
  PaymentController.getMyPaymentHistory
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
import httpStatus23 from "http-status";

// src/app/module/user/user.service.ts
import bcrypt2 from "bcryptjs";
import httpStatus22 from "http-status";
var getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: true,
      counselor: true
    }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus22.NOT_FOUND, "User profile not found!");
  }
  return user;
};
var updateMe = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true, counselor: true }
  });
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus22.NOT_FOUND, "User not found!");
  }
  const result = await prisma.$transaction(async (tx) => {
    if (payload.name) {
      await tx.user.update({
        where: { id: userId },
        data: { name: payload.name }
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
    throw new AppError(httpStatus22.BAD_REQUEST, "Please upload an image file!");
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
    throw new AppError(httpStatus22.CONFLICT, "User with this email already exists!");
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
    throw new AppError(httpStatus22.NOT_FOUND, "Admin not found!");
  }
  if (admin.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus22.FORBIDDEN,
      "Cannot delete the Super Admin account!"
    );
  }
  if (admin.role !== "ADMIN") {
    throw new AppError(httpStatus22.BAD_REQUEST, "Target user is not an Admin!");
  }
  await prisma.user.delete({ where: { id: adminId } });
  return { message: "Admin account deleted successfully!" };
};
var createCounselor = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (isUserExists) {
    throw new AppError(httpStatus22.CONFLICT, "User with this email already exists!");
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
    throw new AppError(httpStatus22.CONFLICT, "User with this email already exists!");
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
    throw new AppError(httpStatus22.NOT_FOUND, "Target user not found!");
  }
  if (requesterRole === "ADMIN") {
    if (targetUser.role === "SUPER_ADMIN" || targetUser.role === "ADMIN") {
      throw new AppError(
        httpStatus22.FORBIDDEN,
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
      httpStatus22.BAD_REQUEST,
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
    throw new AppError(httpStatus22.NOT_FOUND, "User not found!");
  }
  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus22.FORBIDDEN,
      "Super Admin account cannot be deleted!"
    );
  }
  if (requesterRole === "ADMIN") {
    if (targetUser.role === "ADMIN") {
      throw new AppError(
        httpStatus22.FORBIDDEN,
        "Admins cannot delete other Admins!"
      );
    }
  }
  await prisma.user.delete({ where: { id: userId } });
  return { message: "User deleted successfully!" };
};
var updateUserStatus = async (requesterRole, userId, status) => {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new AppError(httpStatus22.NOT_FOUND, "User not found!");
  }
  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError(
      httpStatus22.FORBIDDEN,
      "Cannot modify status of Super Admin!"
    );
  }
  if (requesterRole === "ADMIN" && targetUser.role === "ADMIN") {
    throw new AppError(
      httpStatus22.FORBIDDEN,
      "Admins cannot modify status of other Admins!"
    );
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status }
  });
  return updated;
};
var getAllUsers = async (query, requesterRole) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";
  const whereConditions = {
    isDeleted: false
  };
  if (requesterRole === "ADMIN") {
    whereConditions.role = {
      in: ["COUNSELOR", "STUDENT"]
    };
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
  getAllUsers
};

// src/app/module/user/user.controller.ts
var getMe2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserService.getMe(userId);
  sendResponse(res, {
    statusCode: httpStatus23.OK,
    success: true,
    message: "User profile fetched successfully!",
    data: result
  });
});
var updateMe2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await UserService.updateMe(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus23.OK,
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
    statusCode: httpStatus23.OK,
    success: true,
    message: "Profile image updated successfully!",
    data: result
  });
});
var createAdmin2 = catchAsync(async (req, res) => {
  const result = await UserService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus23.CREATED,
    success: true,
    message: "Admin account created successfully!",
    data: result
  });
});
var deleteAdmin2 = catchAsync(async (req, res) => {
  const result = await UserService.deleteAdmin(req.params.adminId);
  sendResponse(res, {
    statusCode: httpStatus23.OK,
    success: true,
    message: result.message,
    data: null
  });
});
var createCounselor2 = catchAsync(async (req, res) => {
  const result = await UserService.createCounselor(req.body);
  sendResponse(res, {
    statusCode: httpStatus23.CREATED,
    success: true,
    message: "Counselor account created successfully!",
    data: result
  });
});
var customCreateUser2 = catchAsync(async (req, res) => {
  const result = await UserService.customCreateUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus23.CREATED,
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
      statusCode: httpStatus23.OK,
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
    statusCode: httpStatus23.OK,
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
    statusCode: httpStatus23.OK,
    success: true,
    message: "User status updated successfully!",
    data: result
  });
});
var getAllUsers2 = catchAsync(async (req, res) => {
  const requesterRole = req.user.role;
  const result = await UserService.getAllUsers(req.query, requesterRole);
  sendResponse(res, {
    statusCode: httpStatus23.OK,
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
import httpStatus25 from "http-status";

// src/app/module/commission/commission.service.ts
import httpStatus24 from "http-status";
var createCommission = async (payload) => {
  const student = await prisma.student.findUnique({
    where: { id: payload.studentId },
    include: { user: true }
  });
  if (!student) {
    throw new AppError(httpStatus24.NOT_FOUND, "Student not found!");
  }
  const agentUser = await prisma.user.findUnique({
    where: { id: payload.referredByUserId },
    include: { counselor: true }
  });
  if (!agentUser) {
    throw new AppError(httpStatus24.NOT_FOUND, "Referred agent user not found!");
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
    throw new AppError(httpStatus24.NOT_FOUND, "Commission record not found!");
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
    throw new AppError(httpStatus24.NOT_FOUND, "Student not found!");
  }
  const agent = await prisma.user.findUnique({ where: { id: referredByUserId } });
  if (!agent) {
    throw new AppError(httpStatus24.NOT_FOUND, "Agent/Counselor user not found!");
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
    throw new AppError(httpStatus24.NOT_FOUND, "Counselor not found!");
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
    statusCode: httpStatus25.CREATED,
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
      statusCode: httpStatus25.OK,
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
      statusCode: httpStatus25.OK,
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
      statusCode: httpStatus25.OK,
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
    statusCode: httpStatus25.OK,
    success: true,
    message: "Referral commission ledger retrieved!",
    data: result
  });
});
var getAllAgencyCommissions2 = catchAsync(
  async (req, res) => {
    const result = await CommissionService.getAllAgencyCommissions(req.query);
    sendResponse(res, {
      statusCode: httpStatus25.OK,
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
  max: 200,
  // Limit each IP to 200 requests per window
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
  res.status(httpStatus26.OK).json({
    success: true,
    message: "University & Global Higher Study Management API is operational.",
    version: "1.0.0"
  });
});
app.get("/api/v1", (req, res) => {
  res.status(httpStatus26.OK).json({
    success: true,
    message: "API v1 service is operational.",
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
    try {
      await prisma.$connect();
      console.log(
        "[Database] PostgreSQL Database Connected Successfully via Prisma 7."
      );
    } catch (dbError) {
      console.log(
        "[Database] Connection Notice (Check DATABASE_URL):",
        dbError.message
      );
    }
    try {
      await redisClient.connect();
      console.log("[Redis] Connected Successfully.");
    } catch (redisError) {
      console.log(
        "[Redis] Notice (Running in memory-fallback mode):",
        redisError.message
      );
    }
    try {
      await seedInitialData();
    } catch (seedError) {
      console.log("[Seed] Notice:", seedError.message);
    }
    app_default.listen(PORT, () => {
      console.log(
        `[Server] Running on port ${PORT} [Mode: ${config_default.node_env}]`
      );
      console.log(`[API] Base URL: http://localhost:${PORT}/api/v1`);
    });
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