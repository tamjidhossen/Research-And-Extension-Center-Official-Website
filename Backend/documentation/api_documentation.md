# API Documentation

This document provides an overview of the API routes, their purpose, and expected behavior. The API is organized into different modules based on functionality.

## Main App Routes
- **`/api/research-proposal/student`** - Handles research proposal submissions by students.
- **`/api/research-proposal/teacher`** - Handles research proposal submissions by teachers.
- **`/api/admin`** - Handles admin authentication and management.
- **`/api/reviewer`** - Handles proposal reviews and marks allocation.

---

## Base URL
```
https://localhost:4000/v1
```

---

## Research Proposal Routes

### Submit Research Proposal (Student)
**Route:** `POST /api/research-proposal/student/submit`
- **Authentication:** Yes (student authentication required)
- **Description:** Submits a research proposal along with required documents.
- **Form Data:**
  - `partA`: PDF file (Required)
  - `partB`: PDF file (Required)
  - `proposal_data`: JSON object (Required)

### Submit Research Proposal (Teacher)
**Route:** `POST /api/research-proposal/teacher/submit`
- **Authentication:** Yes (teacher authentication required)
- **Description:** Submits a research proposal along with required documents.
- **Form Data:**
  - `partA`: PDF file (Required)
  - `partB`: PDF file (Required)
  - `proposal_data`: JSON object (Required)

**Request JSON (Teacher):**
```json
{
    "project_director": {
        "name_bn": "string",
        "name_en": "string",
        "mobile": "string",
        "email": "string"
    },
    "designation": "string",
    "department": "string",
    "faculty": "string",
    "project_title": {
        "title_bn": "string",
        "title_en": "string"
    },
    "research_location": "string",
    "project_details": {
        "approx_pages": "number",
        "approx_words": "number"
    },
    "total_budget": "string",
    "signatures": {
        "project_director": {
            "signature": "string",
            "date": "string"
        },
        "department_head": {
            "signature": "string",
            "date": "string",
            "recommendation": "string"
        },
        "dean": {
            "signature": "string",
            "date": "string",
            "recommendation": "string"
        }
    }
}
```
**Request JSON (Student):**
```json
{
    "project_director": {
        "name_bn": "string",
        "name_en": "string",
        "mobile": "string",
        "email": "string"
    },
    "department": "string",
    "faculty": "string",
    "session": "string",
    "roll_no": "string",
    "cgpa_honours": "number",
    "supervisor": {
        "name": "string",
        "designation": "string"
    },
    "project_title": {
        "title_bn": "string",
        "title_en": "string"
    },
    "project_details": {
        "approx_pages": "number",
        "approx_words": "number"
    },
    "total_budget" : "number",
    "signatures": {
        "project_director": {
            "signature": "string",
            "date": "string"
        },
        "department_head": {
            "signature": "string",
            "date": "string",
            "recommendation": "string"
        },
        "dean": {
            "signature": "string",
            "date": "string",
            "recommendation": "string"
        }
    }
}
```

---

## Admin Routes

### Upload Document
**Route:** `POST /api/admin/research-proposal/upload`
- **Authentication:** Yes (admin authentication required)
- **Description:** Upload proposal document.
- **Request Body:**
```json
{
    "fiscal_year": "2024-2025",
    "student_partA_en": "file",
    "student_partA_bn": "file",
    "student_partB_en": "file",
    "student_partB_bn": "file",
    "teacher_partA_en": "file",
    "teacher_partA_bn": "file",
    "teacher_partB_en": "file",
    "teacher_partB_bn": "file"
}
```

### Send Email Notification
**Route:** `POST /api/admin/research-proposal/{id}/notify`
- **Authentication:** Yes (admin authentication required)
- **Description:** Sends an email to the applicant regarding proposal updates.
- **Request Body:**
```json
{
    "message": "Your proposal needs updates. Please check the link provided."
}
```

### Assign Reviewer
**Route:** `PUT /api/admin/research-proposal/{id}/assign-reviewer`
- **Authentication:** Yes (admin authentication required)
- **Description:** Assigns a reviewer to evaluate a proposal.
- **Request Body:**
```json
{
    "reviewer_email": "string",
    "message" : "Formal message"
}
```

---

## Reviewer Routes

### Submit Marks
**Route:** `POST /api/reviewer/research-proposal/{id}/mark`
- **Authentication:** Yes (reviewer authentication required)
- **Description:** Submits marks for a reviewed proposal.
- **Form Data:**
  - `mark_sheet`: PDF file (Required)
- **Request Body:**
```json
{
    "marks1": "number",
    "marks2": "number",
    "marks3": "number",
    "marks4": "number",
}
```

---

## Proposal Update Request

### Request Update from Applicant
**Route:** `POST /api/admin/research-proposal/{id}/request-update`
- **Authentication:** Yes (admin authentication required)
- **Description:** Generates an update link for the applicant to modify their proposal.
- **Response:**
```json
{
    "update_link": "https://api.example.com/research-proposal/update/{token}"
}
```

---
### Update Research Proposal(teacher)
**Route:** `PUT /api/research-proposal/teacher/update`
- **Authentication:** Yes (applicant authentication required)
- **Description:** Allows the applicant to update their proposal after an update request.
- **Form Data:**
  - `partA`: PDF file (Optional)
  - `partB`: PDF file (Optional)
  - `updates`: JSON object (Optional)

---

---
### Update Research Proposal(student)
**Route:** `PUT /api/research-proposal/student/update`
- **Authentication:** Yes (applicant authentication required)
- **Description:** Allows the applicant to update their proposal after an update request.
- **Form Data:**
  - `partA`: PDF file (Optional)
  - `partB`: PDF file (Optional)
  - `updates`: JSON object (Optional)

---
## Status Codes
- **200 OK** - Successful request
- **201 Created** - Resource created
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Authentication required
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side error

---

## Contact
For any issues or questions, contact support at **nabeelahsanofficial@gmail.com**.
