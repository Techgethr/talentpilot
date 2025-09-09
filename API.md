# TalentPilot API Documentation

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Endpoints

### Chat

#### POST /api/chat
Send a job description to get matching candidates.

**Request Body:**
```json
{
  "message": "We're looking for a senior React developer with 5+ years of experience..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "We're looking for a senior React developer with 5+ years of experience...",
    "requirements": {
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "experienceLevel": "mid-level",
      "jobType": "full-time"
    },
    "candidates": [
      {
        "id": 1,
        "name": "John Doe",
        "similarity": 0.95,
        "skills": ["JavaScript", "React", "Node.js"],
        "experience": "5 years"
      }
    ]
  }
}
```

### Candidates

#### POST /api/candidates/upload
Upload and process a candidate CV.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "cvText": "Experienced developer with 5 years of experience in web development..."
}
```

**Response:**
```json
{
  "success": true,
  "candidateId": 123,
  "message": "CV uploaded and processed successfully"
}
```

#### GET /api/candidates/:id
Get candidate by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "5 years of experience in web development",
    "education": "Bachelor's degree in Computer Science",
    "cv_text": "Experienced developer with 5 years of experience...",
    "created_at": "2025-09-09T10:00:00.000Z",
    "updated_at": "2025-09-09T10:00:00.000Z"
  }
}
```

### Jobs

#### POST /api/jobs
Create a new job posting.

**Request Body:**
```json
{
  "title": "Senior React Developer",
  "description": "We're looking for a senior React developer with 5+ years of experience..."
}
```

**Response:**
```json
{
  "success": true,
  "jobId": 456,
  "message": "Job posting created successfully"
}
```

#### GET /api/jobs/:id
Get job by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Senior React Developer",
    "description": "We're looking for a senior React developer with 5+ years of experience...",
    "requirements": {
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "experienceLevel": "mid-level",
      "jobType": "full-time"
    },
    "created_at": "2025-09-09T10:00:00.000Z",
    "updated_at": "2025-09-09T10:00:00.000Z"
  }
}
```

#### GET /api/jobs/:id/candidates
Search candidates for a specific job.

**Response:**
```json
{
  "success": true,
  "jobId": 1,
  "jobTitle": "Senior React Developer",
  "candidates": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": "5 years",
      "similarity": 0.95
    }
  ]
}
```

### Users

#### POST /api/users
Create a new user (Admin only).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "recruiter"
}
```

**Response:**
```json
{
  "success": true,
  "userId": 789,
  "message": "User created successfully"
}
```

#### GET /api/users/:id
Get user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "recruiter",
    "created_at": "2025-09-09T10:00:00.000Z"
  }
}
```

#### PUT /api/users/:id
Update user (User can only update their own profile, Admin can update any).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

#### DELETE /api/users/:id
Delete user (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Feedback

#### POST /api/feedback
Submit feedback on candidate matches.

**Request Body:**
```json
{
  "jobId": 1,
  "candidateId": 2,
  "rating": 5,
  "comment": "Excellent match for the position"
}
```

**Response:**
```json
{
  "success": true,
  "feedbackId": 123,
  "message": "Feedback submitted successfully"
}
```

#### GET /api/feedback/:jobId
Get feedback for a specific job.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "job_id": 1,
      "candidate_id": 2,
      "user_id": 3,
      "rating": 5,
      "comment": "Excellent match for the position",
      "created_at": "2025-09-09T10:00:00.000Z",
      "user_name": "Jane Smith",
      "candidate_name": "John Doe"
    }
  ]
}
```