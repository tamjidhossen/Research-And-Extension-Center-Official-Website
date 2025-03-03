# RE Center Digitalization API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Admin Endpoints](#admin-endpoints)
  - [Registration and Authentication](#registration-and-authentication)
  - [Research Proposal Management](#research-proposal-management)
  - [Reviewer Management](#reviewer-management)
  - [Fiscal Year Management](#fiscal-year-management)
- [Notice Management](#notice-management)
- [Reviewer Endpoints](#reviewer-endpoints)
- [Student Endpoints](#student-endpoints)
- [Teacher Endpoints](#teacher-endpoints)

## Authentication

Most endpoints require authentication via a JWT token. Include the token in the Authorization header as follows:

```
Authorization: Bearer <jwt_token>
```

## Admin Endpoints

### Registration and Authentication

#### Register Admin
- **URL**: `/v1/api/admin/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "securePassword123"
  }
  ```
- **Description**: Creates a new admin account.

#### Admin Login
- **URL**: `/v1/api/admin/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "securePassword123"
  }
  ```
- **Description**: Authenticates an admin and returns a JWT token.

#### Request Password Reset
- **URL**: `/v1/api/admin/research-proposal/request-reset-password`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "admin@example.com"
  }
  ```
- **Description**: Sends a password reset email with a token.

#### Reset Password
- **URL**: `/v1/api/admin/research-proposal/reset-password`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "token": "reset_token",
    "newPassword": "newPassword123"
  }
  ```
- **Description**: Resets admin password using the token received via email.

### Research Proposal Management

#### Upload Research Proposal Documents
- **URL**: `/v1/api/admin/research-proposal/upload`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: FormData with the following fields:
  - `fiscal_year`: Year range (e.g., "2026-2027")
  - `student_partA_en`: PDF/DOCX file
  - `student_partB_en`: PDF/DOCX file
  - `teacher_partA_en`: PDF/DOCX file
  - `teacher_partB_en`: PDF/DOCX file
  - `teacher_partA_bn`: PDF/DOCX file
  - `teacher_partB_bn`: PDF/DOCX file
  - `student_partA_bn`: PDF/DOCX file
  - `student_partB_bn`: PDF/DOCX file
- **Description**: Uploads proposal form templates for students and teachers.

#### Get Proposal Overviews
- **URL**: `/v1/api/admin/research-proposal/overviews`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns an overview of all submitted research proposals.

#### Get Research Proposals
- **URL**: `/v1/api/admin/research-proposal`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns detailed information about all research proposals.

#### Update Proposal Status
- **URL**: `/v1/api/admin/research-proposal/status-update/:type/:id/:status`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Path Parameters**:
  - `type`: "teacher" or "student"
  - `id`: Proposal ID
  - `status`: Status code (e.g., 2)
- **Description**: Updates the status of a research proposal.

#### Update Registration Status
- **URL**: `/v1/api/admin/research-proposal/registration-status/update/:status`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Path Parameters**:
  - `status`: Status code (e.g., 1)
- **Description**: Updates the overall registration status for proposals.

#### Add Approval Budget
- **URL**: `/v1/api/admin/research-proposal/approval-budget`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "proposal_type": "teacher",
    "proposal_id": "67c609c45e255ea3fd2da292",
    "approval_budget": 43323
  }
  ```
- **Description**: Sets an approved budget for a research proposal.

### Reviewer Management

#### Add Reviewer
- **URL**: `/v1/api/admin/reviewer/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Reviewer Name",
    "email": "reviewer@example.com",
    "designation": "Associate Professor",
    "department": "Computer Science Engineering",
    "address": "University Name"
  }
  ```
- **Description**: Adds a new reviewer to the system.

#### Send Proposal to Reviewer
- **URL**: `/v1/api/admin/research-proposal/sent-to-reviewer`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "reviewer_id": "67c5e64cf196dd3761eb7b75",
    "proposal_id": "67c609c45e255ea3fd2da292",
    "proposal_type": "teacher"
  }
  ```
- **Description**: Assigns a research proposal to a reviewer.

#### Get Reviewers
- **URL**: `/v1/api/admin/get-reviewers`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns a list of all reviewers in the system.

#### Get Review Details
- **URL**: `/v1/api/admin/reviewer/review-details`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns details of all reviews submitted by reviewers.

### Fiscal Year Management

#### Update Fiscal Year
- **URL**: `/v1/api/admin/research-proposal/fiscal-year/update`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "fiscal_year": "2025-2026"
  }
  ```
- **Description**: Sets the current fiscal year for research proposals.

## Notice Management

#### Add Notice
- **URL**: `/v1/api/notice/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**: FormData with the following fields:
  - `title`: Notice title
  - `description`: Notice description
  - `link`: Related link (optional)
  - `files`: Files to attach to the notice
- **Description**: Creates a new notice with optional file attachments.

#### Get Notices
- **URL**: `/v1/api/notice/get-notice`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns all notices.

#### Delete Notice
- **URL**: `/v1/api/notice/delete/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Path Parameters**:
  - `id`: Notice ID
- **Description**: Deletes a specific notice.

## Reviewer Endpoints

#### Submit Marks
- **URL**: `/v1/api/reviewer/research-proposal/submit/mark`
- **Method**: `POST`
- **Auth Required**: Yes (Reviewer token)
- **Body**: FormData with the following fields:
  - `total_mark`: Numerical score (e.g., "70.05")
  - `marksheet`: PDF file containing evaluation details
- **Description**: Allows a reviewer to submit evaluation marks for an assigned proposal.

#### Verify Review
- **URL**: `/v1/api/reviewer/research-proposal/review/verify`
- **Method**: `POST`
- **Auth Required**: Yes (Reviewer token)
- **Description**: Verifies a reviewer's identity and access to assigned proposals.

## Student Endpoints

#### Submit Proposal
- **URL**: `/v1/api/research-proposal/student/submit`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: FormData with the following fields:
  - `project_director`: JSON string with director's information
  - `partA`: PDF form part A
  - `partB`: PDF form part B
  - `department`: Department name
  - `faculty`: Faculty name
  - `project_title`: JSON string with title in Bengali and English
  - `project_details`: JSON string with page and word count
  - `total_budget`: Budget amount
  - `session`: Academic session
  - `cgpa_honours`: CGPA
  - `supervisor`: JSON string with supervisor's information
  - `roll_no`: Student roll number
- **Description**: Submits a new research proposal from a student.

#### Update Proposal
- **URL**: `/v1/api/research-proposal/student/update`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: FormData with the following fields:
  - `proposal_id`: ID of the proposal to update
  - `partA`: Updated PDF form part A (optional)
  - `updates`: JSON string with fields to update
- **Description**: Updates an existing student research proposal.

## Teacher Endpoints

#### Submit Proposal
- **URL**: `/v1/api/research-proposal/teacher/submit`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: FormData with the following fields:
  - `project_director`: JSON string with director's information
  - `partA`: PDF form part A
  - `partB`: PDF form part B
  - `designation`: Teacher's designation
  - `department`: Department name
  - `faculty`: Faculty name
  - `project_title`: JSON string with title in Bengali and English
  - `research_location`: Location where research will be conducted
  - `project_details`: JSON string with page and word count
  - `total_budget`: Budget amount
- **Description**: Submits a new research proposal from a teacher.

#### Update Proposal
- **URL**: `/v1/api/research-proposal/teacher/update`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: FormData with the following fields:
  - `proposal_id`: ID of the proposal to update
  - `partA`: Updated PDF form part A (optional)
  - `updates`: JSON string with fields to update
- **Description**: Updates an existing teacher research proposal.
