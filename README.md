# University Management Backend

A secure, scalable RESTful backend built with **TypeScript, Express 5, PostgreSQL, and Prisma ORM**. Features 3-tier RBAC, transaction-safe course enrollment, automated GPA calculation, PDF transcripts, and Stripe checkout payment integration.

---

## Quick Links & Resources

| Resource | URL / Location | Description |
|---|---|---|
| **Live Production API** | `https://riseabroad-server.vercel.app/api/v1` | Hosted live on Vercel Serverless Functions |
| **Local API Base URL** | `http://localhost:5000/api/v1` | Local development server |
| **GitHub Repository** | [student-management-backend-A6](https://github.com/arafathussen/student-management-backend-A6) | Complete source code with 39+ meaningful commits |
| **Postman Collection (File)** | [`University_Management_System.postman_collection.json`](./University_Management_System.postman_collection.json) | 13 folders, 74 structured requests v2.1.0 |
| **Postman Published Docs** | [Interactive Web Documentation](https://documenter.getpostman.com/view/56453818/2sBYHXPxia) | Live API documentation and interactive testing |

---

## Pre-Configured Test Accounts (RBAC Roles)

Use these active accounts seeded directly in the PostgreSQL database for testing all role-based permissions and 403 Forbidden checks:

| Role | Email | Password | Access Privileges & Capabilities |
|---|---|---|---|
| **Super Admin** | `admin@university.com` | `AdminPassword123!` | System-wide master control, user status & role management, department/semester/course setup, dashboard analytics |
| **Counselor** | `counselor@university.com` | `Counselor123!` | Academic desk, attendance recording, grade submission, student application management, document verification |
| **Student** | `arafat.student@gmail.com` | `Student123!` | Course enrollment, semester course registration, transcript PDF download, attendance records, Stripe fee payments |

---

## Postman Setup & Testing Guide

### Step 1: Import Collection
1. Open **Postman**.
2. Click **Import** (Top left) and select [`University_Management_System.postman_collection.json`](./University_Management_System.postman_collection.json).

### Step 2: Switch Between Live Production & Local Server
The collection uses a dynamic collection variable `{{baseUrl}}`:
1. Click on collection: **`Rise Abroad Education Management System`**.
2. Go to the **Variables** tab.
3. Edit `Current Value` of `baseUrl`:
   - **For Live Production Testing (Recommended):** `https://riseabroad-server.vercel.app/api/v1`
   - **For Local Testing:** `http://localhost:5000/api/v1`
4. Press `Ctrl + S` to save.

### Step 3: Authorization Tokens
When you login using any account from **Module 1**, copy the `accessToken` and paste it into the respective collection variable:
- `superAdminToken` — Set after logging in as `admin@university.com`
- `counselorToken` — Set after logging in as `counselor@university.com`
- `studentToken` — Set after logging in as `arafat.student@gmail.com`

---

## API Documentation & Request Payloads

---

### Module 1: Authentication & Security (`/api/v1/auth`)

#### 1.1 Register Student Account
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Arafat Hussen",
  "email": "arafat.student@gmail.com",
  "password": "Student123!",
  "contactNumber": "+8801700000000",
  "address": "Dhaka, Bangladesh",
  "gender": "MALE",
  "accessScope": "BOTH"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully! A 6-digit verification OTP has been sent to your email.",
  "data": {
    "userId": "0194b1ef-...",
    "email": "arafat.student@gmail.com",
    "status": "PENDING_VERIFICATION"
  }
}
```

---

#### 1.2 Verify Email with 6-Digit OTP
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/verify-email`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "arafat.student@gmail.com",
  "otpCode": "123456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully! Your account is now active.",
  "data": {
    "isVerified": true,
    "status": "ACTIVE"
  }
}
```

---

#### 1.3 Login User (Generates Access Token)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "admin@university.com",
  "password": "AdminPassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "0194b1ee-...",
      "name": "System Super Admin",
      "email": "admin@university.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

---

#### 1.4 Google GCP Social Login
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/google`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "role": "STUDENT"
}
```

---

#### 1.5 Change Password (Protected)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/change-password`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Request Body:**
```json
{
  "oldPassword": "Student123!",
  "newPassword": "NewStudentPass123!"
}
```

---

### Module 2: User Profile & Role Management (`/api/v1/users`)

#### 2.1 Get My Profile
- **Method:** `GET`
- **URL:** `{{baseUrl}}/users/me`
- **Headers:** `Authorization: Bearer {{studentToken}}`
- **Response (200 OK):** Returns current authenticated user record with student/counselor/faculty profile details.

---

#### 2.2 Update User Status (Admin Only)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/users/{userId}/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "status": "ACTIVE"
}
```
*(Options: `ACTIVE`, `INACTIVE`, `BLOCKED`)*

---

#### 2.3 Update User Role (Super Admin Only)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/users/{userId}/role`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "role": "ADMIN"
}
```
*(Options: `SUPER_ADMIN`, `ADMIN`, `COUNSELOR`, `STUDENT`)*

---

#### 2.4 Get All Users with Pagination & Search
- **Method:** `GET`
- **URL:** `{{baseUrl}}/users?page=1&limit=10&role=STUDENT&searchTerm=Arafat`
- **Headers:** `Authorization: Bearer {{superAdminToken}}`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Users fetched successfully!",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "data": [ ... ]
}
```

---

### Module 3: Academic Curriculum & Structure (`/api/v1/academic`)

#### 3.1 Create Academic Department
- **Method:** `POST`
- **URL:** `{{baseUrl}}/academic/departments`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "name": "Computer Science & Engineering",
  "code": "CSE",
  "description": "Department of Computer Science and Engineering"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Academic department created successfully!",
  "data": {
    "id": "0194b1ef-...",
    "name": "Computer Science & Engineering",
    "code": "CSE",
    "description": "Department of Computer Science and Engineering"
  }
}
```

---

#### 3.2 Get All Academic Departments
- **Method:** `GET`
- **URL:** `{{baseUrl}}/academic/departments`
- **Headers:** None (Public)

---

#### 3.3 Create Academic Semester
- **Method:** `POST`
- **URL:** `{{baseUrl}}/academic/semesters`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "name": "Fall 2026",
  "code": "FALL-2026",
  "startDate": "2026-09-01T00:00:00.000Z",
  "endDate": "2026-12-31T23:59:59.000Z",
  "isCurrent": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Academic semester created successfully!",
  "data": {
    "id": "0194b1f0-...",
    "name": "Fall 2026",
    "code": "FALL-2026",
    "isCurrent": true
  }
}
```

---

#### 3.4 Get All Academic Semesters
- **Method:** `GET`
- **URL:** `{{baseUrl}}/academic/semesters`
- **Headers:** None (Public)

---

#### 3.5 Create Course (with Credits & Tuition Fee)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/academic/courses`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "title": "Data Structures & Algorithms",
  "code": "CSE-201",
  "credits": 3,
  "tuitionFee": 15000,
  "description": "Core algorithm analysis, trees, graphs, and sorting",
  "departmentId": "PASTE_DEPARTMENT_ID_HERE"
}
```
*(Optional prerequisite check: supply `"prerequisiteId": "PASTE_PREREQ_COURSE_ID"`)*

---

#### 3.6 Get All Courses
- **Method:** `GET`
- **URL:** `{{baseUrl}}/academic/courses`
- **Headers:** None (Public)

---

#### 3.7 Create Course Section (with Seat Capacity Limit)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/academic/sections`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "sectionName": "Section 1",
  "maxCapacity": 40,
  "roomNumber": "Lab-402",
  "scheduleTime": "Sunday / Tuesday 10:00 AM - 11:30 AM",
  "courseId": "PASTE_COURSE_ID_HERE",
  "semesterId": "PASTE_SEMESTER_ID_HERE"
}
```

---

#### 3.8 Get Sections by Course ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/academic/sections/{courseId}`
- **Headers:** None (Public)

---

### Module 4: Course Enrollment & Registration (`/api/v1/enrollments`)

#### 4.1 Register Course Section (Transaction-Safe)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/enrollments/register`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Business Operations Handled:**
  - Checks if section exists and has available seats (`availableSeats > 0`).
  - Checks if student already enrolled in another section of this course in the current semester.
  - Validates course prerequisite: Student must have completed & passed the prerequisite course.
  - Executes inside a **Prisma Interactive Transaction**: decrements available seats by 1 and registers the student.
- **Request Body:**
```json
{
  "sectionId": "PASTE_SECTION_ID_HERE"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Successfully enrolled in course section!",
  "data": {
    "id": "0194b1f2-...",
    "status": "ENROLLED",
    "enrolledAt": "2026-11-01T08:00:00.000Z",
    "section": {
      "sectionName": "Section 1",
      "availableSeats": 39
    }
  }
}
```

---

#### 4.2 Get My Enrolled Courses
- **Method:** `GET`
- **URL:** `{{baseUrl}}/enrollments/my-courses`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

#### 4.3 Drop Course Section
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/enrollments/{enrollmentId}`
- **Headers:** `Authorization: Bearer {{studentToken}}`
- **Business Logic:** Automatically marks enrollment as `DROPPED` and restores section seat count by +1 in transaction.

---

### Module 5: Student Attendance System (`/api/v1/attendance`)

#### 5.1 Record Daily Section Attendance
- **Method:** `POST`
- **URL:** `{{baseUrl}}/attendance/record`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{counselorToken}}` (or `{{superAdminToken}}`)
- **Request Body:**
```json
{
  "facultyId": "PASTE_FACULTY_OR_COUNSELOR_ID",
  "sectionId": "PASTE_SECTION_ID",
  "date": "2026-11-01",
  "records": [
    {
      "studentId": "PASTE_STUDENT_ID",
      "status": "PRESENT",
      "remarks": "Attended on time"
    }
  ]
}
```
*(Statuses: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`)*

---

#### 5.2 Get My Attendance Records
- **Method:** `GET`
- **URL:** `{{baseUrl}}/attendance/my`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

#### 5.3 Get Section Attendance Summary
- **Method:** `GET`
- **URL:** `{{baseUrl}}/attendance/section/{sectionId}`
- **Headers:** `Authorization: Bearer {{superAdminToken}}`

---

### Module 6: Academic Grading & GPA Transcripts (`/api/v1/grades`)

#### 6.1 Submit Course Grade
- **Method:** `POST`
- **URL:** `{{baseUrl}}/grades/submit`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}` (or `{{counselorToken}}`)
- **Grading Scale Automatically Calculated:**
  - `80+` ➔ `A+ (4.00)`
  - `75-79` ➔ `A (3.75)`
  - `70-74` ➔ `A- (3.50)`
  - `65-69` ➔ `B+ (3.25)`
  - `60-64` ➔ `B (3.00)`
  - `55-59` ➔ `B- (2.75)`
  - `50-54` ➔ `C+ (2.50)`
  - `45-49` ➔ `C (2.25)`
  - `40-44` ➔ `D (2.00)`
  - `<40` ➔ `F (0.00)`
- **Request Body:**
```json
{
  "studentId": "PASTE_STUDENT_ID",
  "sectionId": "PASTE_SECTION_ID",
  "marks": 88,
  "remarks": "Excellent performance in midterm and lab assignments"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Grade submitted and published successfully!",
  "data": {
    "marks": 88,
    "gradePoint": 4.0,
    "letterGrade": "A+",
    "isPublished": true
  }
}
```

---

#### 6.2 Get My Academic Results & CGPA
- **Method:** `GET`
- **URL:** `{{baseUrl}}/grades/my-results`
- **Headers:** `Authorization: Bearer {{studentToken}}`
- **Response (200 OK):** Returns completed courses, credits earned, grade point per course, and cumulative GPA (CGPA).

---

#### 6.3 Download Official Transcript PDF
- **Method:** `GET`
- **URL:** `{{baseUrl}}/grades/transcript-pdf`
- **Headers:** `Authorization: Bearer {{studentToken}}`
- **Description:** Dynamically streams an official, digitally stamped Academic Transcript PDF built with `pdfkit`.

---

### Module 7: Stripe Payment Gateway Integration (`/api/v1/payments`)

#### 7.1 Create Stripe Checkout Session
- **Method:** `POST`
- **URL:** `{{baseUrl}}/payments/create-checkout-session`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Request Body:**
```json
{
  "amount": 250,
  "paymentType": "TUITION_FEE",
  "description": "Fall 2026 Semester Tuition - Rise Abroad Education"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Checkout session created successfully!",
  "data": {
    "sessionId": "cs_test_a1b2c3...",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3...",
    "paymentId": "0194b1f4-..."
  }
}
```

#### Test Card Credentials for Stripe:
- **Card Number:** `4242 4242 4242 4242`
- **Expiration:** Any future month/year (e.g., `12/28`)
- **CVC:** `123`
- **Postal Code:** `12345`

---

#### 7.2 Download Official Payment Receipt PDF
- **Method:** `GET`
- **URL:** `{{baseUrl}}/payments/receipt/{paymentId}`
- **Headers:** `Authorization: Bearer {{studentToken}}`
- **Description:** Downloads an official electronically-verified PDF invoice receipt with company stamp and payment status.

---

#### 7.3 Get My Payment History
- **Method:** `GET`
- **URL:** `{{baseUrl}}/payments/my-history`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

### Module 8: Global Higher Study & Applications (`/api/v1/higher-study`)

#### 8.1 Create Partner University
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/universities`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "name": "University of Central Lancashire (Cyprus)",
  "countryId": "PASTE_COUNTRY_ID",
  "city": "Pyla, Larnaca",
  "ranking": 801,
  "description": "Prestigious British campus in Cyprus with full international accreditation.",
  "websiteUrl": "https://www.uclancyprus.ac.cy",
  "paymentType": "UPFRONT_FEE",
  "upfrontFeeAmount": 150
}
```

---

#### 8.2 Student Applies for Program
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/applications/apply`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Request Body:**
```json
{
  "programId": "PASTE_PROGRAM_ID_HERE",
  "intake": "Fall 2026",
  "fundingSource": "Self Funded"
}
```

---

### Module 9: Admin Analytics & System Notifications (`/api/v1/admin`)

#### 9.1 Get System Dashboard Statistics
- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/dashboard-stats`
- **Headers:** `Authorization: Bearer {{superAdminToken}}`
- **Response (200 OK):** Returns counts of total students, counselors, active courses, applications, and revenue summary.

---

#### 9.2 Broadcast System Notification
- **Method:** `POST`
- **URL:** `{{baseUrl}}/notifications/broadcast`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body:**
```json
{
  "title": "Semester Registration Open",
  "message": "Fall 2026 semester registration is now officially open for all enrolled students.",
  "priority": "INFO",
  "audience": "ALL"
}
```

---

#### 9.3 Get My Notifications
- **Method:** `GET`
- **URL:** `{{baseUrl}}/notifications/my`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

## Security, Performance & Architecture Highlights

1. **Layered Modular Architecture:** Strict separation of concerns (`Route ➔ Controller ➔ Service ➔ Prisma ORM`).
2. **Interactive Database Transactions:** Critical workflows (Course enrollment seats, Drop course, Stripe webhooks) execute inside `prisma.$transaction` to guarantee atomicity and avoid race conditions.
3. **Role-Based Authorization (RBAC):** Middleware validates Bearer JWT tokens and immediately yields `403 Forbidden` for unauthorized roles.
4. **Input Validation:** Every payload is validated against strict **Zod schemas** before reaching the controller.
5. **Security Suite:** 
   - HTTP Header hardening via **Helmet**.
   - Configured **CORS** policies with credential allowance.
   - Brute-force & DDoS protection via **express-rate-limit**.
6. **Soft Deletes:** Records utilize `isDeleted: true` and `deletedAt` timestamps instead of destructive drops.
7. **Audit Logging:** System administrative actions are captured through `activityLogger` into the database.

---

## Local Development & Build Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables (.env)
cp .env.example .env

# 3. Generate Prisma client
npm run prisma:generate

# 4. Synchronize database schema
npx prisma db push

# 5. Start dev server with hot reload
npm run dev

# 6. Build production bundle (Prisma + tsup)
npm run build
```

---
*University Management System — Batch 7 Assignment 6.*
