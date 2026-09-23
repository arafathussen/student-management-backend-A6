# Global Study Abroad & University Admission Management System — Backend API

> **Assignment:** Programming Hero Level 2 Batch 7 (B7A6 Enterprise Backend)  
> **Student Name:** Arafat Hussen  
> **Student ID:** L2B7-0059  
> **Tech Stack:** Node.js · Express 5 · TypeScript · **Prisma 7 (`7.9.1`)** · **PostgreSQL (Prisma Accelerate / Pooled)** · **Redis Cloud** · **Stripe** · **Cloudinary** · **Nodemailer (Live Gmail SMTP)** · **JWT & RBAC** · **Postman**

---

## Quick Links & Resources
- **Postman Collection File:** [`University_Management_System.postman_collection.json`](./University_Management_System.postman_collection.json)
- **Local API Base URL:** `http://localhost:5000/api/v1`
- **Frontend Dev URL:** `http://localhost:3000`
- **Live Production URL:** `https://your-deployed-domain.com/api/v1` *(Replace when deployed)*

---

## Pre-Configured Test Accounts (RBAC Roles)

Use these active accounts seeded in the PostgreSQL database for testing all role-based permissions:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Super Admin** | `admin@university.com` | `AdminPassword123!` | System control, Commission ledger, Admin creation, Full RBAC |
| **Senior Counselor** | `counselor@university.com` | `Counselor123!` | Application desk, Document verification, Notes, Offer letters |
| **Student Applicant** | `arafat.student@gmail.com` | `Student123!` | Higher study applications, Document uploads, Offer letter download, Chat |

---

## Postman Setup & Environment Switching Guide

### Step 1: Import the Postman Collection
1. Open **Postman**.
2. Click **Import** (Top left).
3. Drag & drop or select the file [`University_Management_System.postman_collection.json`](./University_Management_System.postman_collection.json).

### Step 2: Switching Between Localhost & Live Production URL
The collection uses a single dynamic variable `{{baseUrl}}` for every request:
1. Click on the collection title: **`Global Study Abroad & University Admission Management System`**.
2. Navigate to the **Variables** tab.
3. Edit the `Current Value` of `baseUrl`:
   - **For Local Testing:** `http://localhost:5000/api/v1`
   - **For Live Production:** `https://your-production-domain.com/api/v1`
4. Press `Ctrl + S` (or `Cmd + S`) to save. Every endpoint in the collection will now point to your target server!

### Step 3: Managing JWT Authorization Tokens
When you log in with different roles, copy the `accessToken` from the response into the collection variables:
- `superAdminToken` — Access token after logging in as `admin@university.com`
- `adminToken` — Access token after logging in as an Admin
- `counselorToken` — Access token after logging in as `counselor@university.com`
- `studentToken` — Access token after logging in as `arafat.student@gmail.com`

---

## Complete Step-by-Step API Documentation & Request Payloads

---

### Module 1: Authentication & Security (`/api/v1/auth`)

#### 1.1 Register Student
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Headers:** `Content-Type: application/json`
- **Description:** Registers a new student account and triggers a 6-digit OTP to the provided email (supports Gmail, Yahoo, Outlook, and any custom domain).
- **Request Body (JSON):**
```json
{
  "name": "Arafat Hussen",
  "email": "arafat.student@gmail.com",
  "password": "Student123!",
  "contactNumber": "+8801700000000",
  "address": "Dhaka, Bangladesh",
  "gender": "MALE",
  "accessScope": "HIGHER_STUDY_ONLY"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully! A 6-digit verification OTP has been sent to your email.",
  "data": {
    "userId": "cm123456789...",
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
- **Description:** Verifies the user's email with the OTP received via email and activates their account.
- **Request Body (JSON):**
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

#### 1.3 Resend OTP
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/resend-otp`
- **Headers:** `Content-Type: application/json`
- **Description:** Resends a fresh 6-digit OTP code to the user's email.
- **Request Body (JSON):**
```json
{
  "email": "arafat.student@gmail.com"
}
```

---

#### 1.4 Login (Super Admin / Admin / Counselor / Student)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Description:** Authenticates any registered user and returns a JWT Bearer access token and refresh token.
- **Request Body (JSON):**
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
  "message": "User logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "cm123...",
      "email": "admin@university.com",
      "name": "Super Admin",
      "role": "SUPER_ADMIN"
    }
  }
}
```

---

#### 1.5 Google Social Login (One-Tap)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/google`
- **Headers:** `Content-Type: application/json`
- **Description:** Authenticates or auto-registers a user via Google One-Tap OAuth token.
- **Request Body (JSON):**
```json
{
  "idToken": "mock-google-id-token"
}
```

---

#### 1.6 Forgot Password (Request OTP)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/forgot-password`
- **Headers:** `Content-Type: application/json`
- **Description:** Dispatches a password reset OTP to the user's registered email address.
- **Request Body (JSON):**
```json
{
  "email": "arafat.student@gmail.com"
}
```

---

#### 1.7 Reset Password (With OTP)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/reset-password`
- **Headers:** `Content-Type: application/json`
- **Description:** Sets a new password using the received OTP code.
- **Request Body (JSON):**
```json
{
  "email": "arafat.student@gmail.com",
  "otpCode": "123456",
  "newPassword": "NewPassword123!"
}
```

---

#### 1.8 Change Password (Authenticated)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/change-password`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Request Body (JSON):**
```json
{
  "currentPassword": "Student123!",
  "newPassword": "StudentNewPass123!"
}
```

---

### Module 2: User & RBAC Management (`/api/v1/users`)

#### 2.1 Get My Profile
- **Method:** `GET`
- **URL:** `{{baseUrl}}/users/me`
- **Headers:** `Authorization: Bearer {{superAdminToken}}`

---

#### 2.2 Create Admin (Super Admin Only)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/users/create-admin`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body (JSON):**
```json
{
  "name": "Academic Admin 1",
  "email": "admin1@university.com",
  "password": "Admin12345!"
}
```

---

#### 2.3 Create Counselor (Super Admin or Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/users/create-counselor`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.counselor@university.com",
  "password": "Counselor123!",
  "designation": "Senior European Education Counselor",
  "contactNumber": "+8801711223344",
  "specialization": "Cyprus & UK Admissions"
}
```

---

#### 2.4 Custom Create User (Super Admin Only)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/users/custom-create`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body (JSON):**
```json
{
  "name": "Custom Branch Officer",
  "email": "officer@branch.university.com",
  "password": "Officer12345!",
  "role": "COUNSELOR"
}
```

---

#### 2.5 Admin Reset User Password
- **Method:** `POST`
- **URL:** `{{baseUrl}}/users/reset-user-password`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "userId": "REPLACE_WITH_USER_ID",
  "newPassword": "ResetPass12345!",
  "sendResetEmail": false
}
```

---

#### 2.6 Update User Status (ACTIVE / BLOCKED)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/users/{userId}/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "status": "BLOCKED"
}
```

---

#### 2.7 Get All Users (Filtered by RBAC)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/users?page=1&limit=10`
- **Headers:** `Authorization: Bearer {{adminToken}}`

---

### Module 3: Global Higher Study & Universities (`/api/v1/higher-study`)

#### 3.1 Get All Countries
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/countries`
- **Headers:** *None (Public endpoint)*

---

#### 3.2 Create Country (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/countries`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "name": "United Kingdom",
  "code": "GB",
  "currency": "GBP",
  "description": "Study in the UK - Top ranking universities with post-study work visa opportunities.",
  "flagUrl": "https://flagcdn.com/w320/gb.png"
}
```

---

#### 3.3 Get Global Universities
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/universities?page=1&limit=10`
- **Headers:** *None (Public endpoint)*

---

#### 3.4 Create Global University
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/universities`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "name": "American University of Cyprus",
  "city": "Larnaca",
  "countryId": "REPLACE_WITH_COUNTRY_ID",
  "website": "https://aucy.ac.cy",
  "description": "Premier American curriculum institution in Cyprus.",
  "paymentType": "OFFER_DEPOSIT",
  "applicationFee": 0,
  "offerDepositFee": 500
}
```

---

#### 3.5 Add Dynamic Document Requirement to University
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/universities/{universityId}/doc-requirements`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "title": "Valid Passport Copy",
  "description": "Scanned copy of bio-data page (Min 2 years validity)",
  "isRequired": true,
  "docType": "PDF"
}
```

---

#### 3.6 Get University Doc Requirements
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/universities/{universityId}/doc-requirements`
- **Headers:** *None (Public endpoint)*

---

#### 3.7 Get Global Degree Programs
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/programs?page=1&limit=10`
- **Headers:** *None (Public endpoint)*

---

#### 3.8 Create Degree Program (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/programs`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "name": "BSc in Computer Science",
  "universityId": "REPLACE_WITH_UNIVERSITY_ID",
  "degreeLevel": "BACHELOR",
  "durationYears": 4.0,
  "tuitionFee": 6650.0,
  "initialDeposit": 4000.0,
  "intakeSeason": "Fall 2026",
  "ieltsRequirement": 5.0,
  "academicRequirement": "Minimum 60% in HSC"
}
```

---

### Module 4: Student Applications & Counselor Desk (`/api/v1/higher-study`)

#### 4.1 Apply for Degree Program (Student)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/applications/apply`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Request Body (JSON):**
```json
{
  "programId": "REPLACE_WITH_PROGRAM_ID"
}
```

---

#### 4.2 Get My Applications (Student)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/applications/my`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

#### 4.3 Get All Applications (Admin & Counselor)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/applications?page=1&limit=10`
- **Headers:** `Authorization: Bearer {{adminToken}}`

---

#### 4.4 Assign Counselor to Application
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/higher-study/applications/{applicationId}/assign-counselor`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "counselorId": "REPLACE_WITH_COUNSELOR_ID"
}
```

---

#### 4.5 Add Counselor Note (Private or Public)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/applications/{applicationId}/notes`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{counselorToken}}`
- **Request Body (JSON):**
```json
{
  "note": "Please re-upload your bank statement as the current copy is older than 3 months.",
  "isPrivate": false
}
```

---

#### 4.6 Verify Document Status (Counselor / Admin)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/higher-study/documents/{documentId}/verify`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{counselorToken}}`
- **Request Body (JSON):**
```json
{
  "status": "VERIFIED",
  "adminFeedback": "Passport copy verified successfully!"
}
```

---

#### 4.7 Update Application Stage Pipeline
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/higher-study/applications/{applicationId}/stage`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{counselorToken}}`
- **Stages:** `DRAFT` | `DOCUMENTS_PENDING` | `UNDER_REVIEW` | `SUBMITTED_TO_UNIVERSITY` | `OFFER_ISSUED` | `VISA_PROCESSING` | `ENROLLED` | `REJECTED`
- **Request Body (JSON):**
```json
{
  "status": "SUBMITTED_TO_UNIVERSITY"
}
```

---

#### 4.8 Issue & Upload Offer Letter (Counselor / Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/applications/{applicationId}/issue-offer-letter`
- **Headers:** `Authorization: Bearer {{counselorToken}}`
- **Body:** `form-data` with key `file` (PDF/Image).

---

#### 4.9 Toggle Offer Letter Lock / Unlock (Admin)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/higher-study/applications/{applicationId}/toggle-offer-lock`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "isOfferUnlocked": true
}
```

---

#### 4.10 Download Offer Letter (Student)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/applications/{applicationId}/download-offer-letter`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

### Module 5: Agency Commission & Payout Ledger (`/api/v1/commissions`)

#### 5.1 Create Commission Entry (Super Admin Only)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/commissions`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Request Body (JSON):**
```json
{
  "studentId": "REPLACE_WITH_STUDENT_ID",
  "referredByUserId": "REPLACE_WITH_COUNSELOR_USER_ID",
  "universityName": "American University of Cyprus",
  "grossAmount": 1000,
  "currency": "EUR",
  "vatPercentage": 10,
  "exchangeRateToBDT": 135,
  "notes": "Direct Fall 2026 admission commission"
}
```

---

#### 5.2 Mark Payout Status (Super Admin Only)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/commissions/{commissionId}/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{superAdminToken}}`
- **Statuses:** `PENDING` | `APPROVED` | `WITHDRAWN` | `REJECTED`
- **Request Body (JSON):**
```json
{
  "status": "WITHDRAWN",
  "notes": "Bank transfer completed to counselor account"
}
```

---

#### 5.3 Assign Student Referral (Admin & Super Admin)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/commissions/referral/{studentId}`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "referredByUserId": "REPLACE_WITH_COUNSELOR_OR_ADMIN_USER_ID"
}
```

---

#### 5.4 Toggle Counselor Commission Visibility
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/commissions/counselor/{counselorId}/visibility`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "canViewCommission": true
}
```

---

#### 5.5 Get My Referral Ledger (Counselor / Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/commissions/my-ledger`
- **Headers:** `Authorization: Bearer {{counselorToken}}`

---

#### 5.6 Get Master Financial Summary (Super Admin Only)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/commissions/all-ledger?page=1&limit=10`
- **Headers:** `Authorization: Bearer {{superAdminToken}}`

---

### Module 6: Educational Blog & News Portal (`/api/v1/higher-study/blogs`)

#### 6.1 Create Blog Post (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/higher-study/blogs`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "title": "Top 5 European Study Destinations with Low Tuition Fees in 2026",
  "content": "Explore affordable higher education opportunities in Cyprus, Germany, Poland, and Hungary with visa guidance and scholarship criteria...",
  "category": "Scholarship & Destination Guide",
  "tags": ["Europe", "Scholarships", "Cyprus", "Visa"],
  "bannerUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644"
}
```

---

#### 6.2 Get All Published Blog Posts
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/blogs?page=1&limit=10`
- **Headers:** *None (Public endpoint)*

---

#### 6.3 Get Blog Post By Slug
- **Method:** `GET`
- **URL:** `{{baseUrl}}/higher-study/blogs/top-5-european-study-destinations-with-low-tuition-fees-in-2026`
- **Headers:** *None (Public endpoint)*

---

### Module 7: Multi-Role Support Chat & Room Lock (`/api/v1/chat`)

#### 7.1 Send Chat Message
- **Method:** `POST`
- **URL:** `{{baseUrl}}/chat/send`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "studentUserId": "REPLACE_WITH_STUDENT_USER_ID",
  "message": "Hello Arafat, our admissions committee has reviewed your application for Cyprus.",
  "senderDisplayName": "Admissions Desk (Admin)"
}
```

---

#### 7.2 Get Chat Room Messages
- **Method:** `GET`
- **URL:** `{{baseUrl}}/chat/room/messages/{roomId}`
- **Headers:** `Authorization: Bearer {{adminToken}}`

---

#### 7.3 Toggle Chat Exclusive Lock (1-on-1 Takeover Mode)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/chat/room/{roomId}/lock`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{counselorToken}}`
- **Request Body (JSON):**
```json
{
  "lock": true
}
```

---

#### 7.4 Update Student Target Budget in Chat
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/chat/student/{studentUserId}/budget`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{adminToken}}`
- **Request Body (JSON):**
```json
{
  "targetBudget": 8000,
  "preferredCurrency": "USD",
  "preferredCountry": "Cyprus"
}
```

---

### Module 8: Stripe Payments & Invoices (`/api/v1/payments`)

#### 8.1 Create Stripe Payment Intent (Fee / Deposit)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/payments/create-intent`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{studentToken}}`
- **Request Body (JSON):**
```json
{
  "amount": 500,
  "currency": "USD",
  "paymentType": "OFFER_DEPOSIT",
  "higherStudyApplicationId": "REPLACE_WITH_APPLICATION_ID",
  "description": "Initial offer letter release deposit for AUCY"
}
```

---

#### 8.2 Get My Payments & Invoices
- **Method:** `GET`
- **URL:** `{{baseUrl}}/payments/my-payments`
- **Headers:** `Authorization: Bearer {{studentToken}}`

---

## Live Deployment & Updating API URL

When you deploy this backend to a live server (e.g., **Vercel**, **Railway**, **Render**, or a VPS):

1. **Set Production Environment Variables:**
   - `DATABASE_URL` = Your production PostgreSQL pooled connection string
   - `REDIS_URL` = Your Redis Cloud connection URL
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
   - `SMTP_USER` & `SMTP_PASS`
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. **Update Postman `baseUrl`:**
   - Change `baseUrl` variable to `https://your-live-domain.com/api/v1`
3. **Update Frontend Environment Variable:**
   - In `university-management-frontend/.env.local` or hosting provider settings:
   ```env
   NEXT_PUBLIC_API_URL=https://your-live-domain.com/api/v1
   ```

---

## Local Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Synchronize database schema
npx prisma db push

# Start backend in development mode
npm run dev

# Build production bundle
npm run build
```

---
*Built for Programming Hero Level 2 Batch 7 Final Project.*
