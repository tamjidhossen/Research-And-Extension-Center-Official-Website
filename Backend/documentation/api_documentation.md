# Research And Extension Center API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Admin Endpoints](#admin-endpoints)
   - [Authentication](#admin-authentication)
   - [Proposal Management](#proposal-management)
   - [Reviewer Management](#reviewer-management)
   - [Notice Management](#notice-management)
   - [Invoice Management](#invoice-management)
3. [Student Endpoints](#student-endpoints)
   - [Proposal Submission](#student-proposal-submission)
4. [Teacher Endpoints](#teacher-endpoints)
   - [Proposal Submission](#teacher-proposal-submission)
5. [Reviewer Endpoints](#reviewer-endpoints)
   - [Proposal Review](#proposal-review)
   - [Invoice Submission](#reviewer-invoice-submission)

## Authentication

### JWT Token
- All administrative and secured endpoints require a JWT (JSON Web Token) in the Authorization header
- Format: `Bearer <token>`

## Admin Endpoints

### Admin Authentication

#### Login
- **Endpoint:** `POST /v1/api/admin/login`
- **Request Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```

#### Register
- **Endpoint:** `POST /v1/api/admin/register`
- **Request Body:**
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "securePassword"
  }
  ```

#### Password Reset
- **Request Reset Password:**
  - **Endpoint:** `POST /v1/api/admin/research-proposal/request-reset-password`
  - **Request Body:**
    ```json
    {
      "email": "admin@example.com"
    }
    ```

- **Reset Password:**
  - **Endpoint:** `POST /v1/api/admin/research-proposal/reset-password`
  - **Request Body:**
    ```json
    {
      "token": "reset_token",
      "newPassword": "newPassword"
    }
    ```

### Proposal Management

#### Add Approval Budget
- **Endpoint:** `POST /v1/api/admin/research-proposal/approval-budget`
- **Request Body:**
  ```json
  {
    "proposal_type": "teacher",
    "proposal_id": "proposal_id",
    "approval_budget": 43323
  }
  ```

#### Update Proposal Status
- **Endpoint:** `PUT /v1/api/admin/research-proposal/status-update/{type}/{proposal_id}/{status}`
- **Parameters:**
  - `type`: "teacher" or "student"
  - `proposal_id`: Unique proposal identifier
  - `status`: Status code

#### Get Proposals
- **Get All Proposals:**
  - **Endpoint:** `GET /v1/api/admin/research-proposal`

- **Get Proposal Documents:**
  - **Endpoint:** `GET /v1/api/admin/research-proposal/overviews`

#### Update Fiscal Year
- **Endpoint:** `POST /v1/api/admin/research-proposal/fiscal-year/update`
- **Request Body:**
  ```json
  {
    "fiscal_year": "2025-2026"
  }
  ```

### Reviewer Management

#### Add Reviewer
- **Endpoint:** `POST /v1/api/admin/reviewer/add`
- **Request Body:**
  ```json
  {
    "name": "Reviewer Name",
    "email": "reviewer@example.com",
    "designation": "Associate Professor",
    "department": "Computer Science",
    "address": "University Address"
  }
  ```

#### Get Reviewers
- **Endpoint:** `GET /v1/api/admin/get-reviewers`

#### Set Reviewer for Proposal
- **Endpoint:** `POST /v1/api/admin/research-proposal/sent-to-reviewer`
- **Request Body:**
  ```json
  {
    "reviewer_id": "reviewer_id",
    "proposal_id": "proposal_id",
    "proposal_type": "student"
  }
  ```

#### Get Review Details
- **Endpoint:** `GET /v1/api/admin/reviewer/review-details`

### Notice Management

#### Add Notice
- **Endpoint:** `POST /v1/api/notice/add`
- **Form Data:**
  - `title`: Notice title
  - `description`: Notice description
  - `link`: Optional URL
  - `files`: Attachments

#### Get Notices
- **Endpoint:** `GET /v1/api/notice/get-notice/`

#### Delete Notice
- **Endpoint:** `DELETE /v1/api/notice/delete/{notice_id}`

### Invoice Management

#### Send Reviewer Invoice
- **Endpoint:** `POST /v1/api/admin/reviewer-invoice`
- **Form Data:**
  - `invoice`: Invoice file
  - `reviewer_id`: Reviewer identifier
  - `fiscal_year`: Fiscal year

#### Get Invoices
- **Endpoint:** `GET /v1/api/admin/invoices`

#### Delete Invoice
- **Endpoint:** `DELETE /v1/api/admin/invoice/delete/{invoice_id}`

## Student Endpoints

### Student Proposal Submission
- **Endpoint:** `POST /v1/api/research-proposal/student/submit`
- **Form Data Includes:**
  - Project director details
  - Part A and Part B documents
  - Department and faculty
  - Project title and details
  - Budget
  - Session
  - CGPA
  - Supervisor details
  - Roll number

### Student Proposal Update
- **Endpoint:** `POST /v1/api/research-proposal/student/update`
- **Form Data Includes:**
  - Proposal ID
  - Part A document
  - Updates (title, budget, etc.)

## Teacher Endpoints

### Teacher Proposal Submission
- **Endpoint:** `POST /v1/api/research-proposal/teacher/submit`
- **Form Data Includes:**
  - Project director details
  - Part A and Part B documents
  - Designation
  - Department and faculty
  - Project title
  - Research location
  - Project details
  - Total budget

### Teacher Proposal Update
- **Endpoint:** `POST /v1/api/research-proposal/teacher/update`
- **Form Data Includes:**
  - Proposal ID
  - Part A document
  - Updates (title, budget, etc.)

## Reviewer Endpoints

### Proposal Review

#### Submit Marks
- **Endpoint:** `POST /v1/api/reviewer/research-proposal/submit/mark`
- **Form Data:**
  - `total_mark`: Numerical score
  - `marksheet`: Review document

#### Verify Review
- **Endpoint:** `POST /v1/api/reviewer/research-proposal/review/verify`

### Reviewer Invoice Submission
- **Endpoint:** `POST /v1/api/reviewer/research-proposal/submit/invoice`
- **Form Data:**
  - `invoice`: Invoice file

## Notes
- All endpoints require proper authentication
- Ensure all form data and JSON payloads are correctly formatted
- Keep JWT tokens secure and regenerate if compromised
- Some endpoints may have additional validation not shown in this documentation

## Error Handling
- Expect standard HTTP status codes (200 for success, 400 for bad request, 401 for unauthorized, 500 for server errors)
- Specific error messages will be returned in the response body

## Version
- Current API Version: v1
- Base URL: `http://localhost:4000/v1/api/`
