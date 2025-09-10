# TalentPilot API Documentation

## Overview

The TalentPilot API provides endpoints for managing conversations, candidates, jobs, and feedback. The API is organized around REST principles and returns JSON responses.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, there is no authentication required for API endpoints. All endpoints are publicly accessible.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

## Conversations

### Get All Conversations

**GET** `/conversations`

Retrieve all conversations, ordered by most recently updated.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Senior React Developer",
      "user_id": null,
      "created_at": "2023-05-01T10:00:00.000Z",
      "updated_at": "2023-05-01T10:05:00.000Z"
    }
  ]
}
```

### Create Conversation

**POST** `/conversations`

Create a new conversation.

#### Request Body

```json
{
  "title": "New Conversation"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "New Conversation"
  }
}
```

### Get Conversation

**GET** `/conversations/{id}`

Retrieve a specific conversation and its messages.

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Senior React Developer",
    "user_id": null,
    "created_at": "2023-05-01T10:00:00.000Z",
    "updated_at": "2023-05-01T10:05:00.000Z",
    "messages": [
      {
        "id": 1,
        "conversation_id": 1,
        "role": "user",
        "content": "I need a senior React developer",
        "created_at": "2023-05-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "conversation_id": 1,
        "role": "assistant",
        "content": "# Job Analysis Results...",
        "created_at": "2023-05-01T10:05:00.000Z"
      }
    ]
  }
}
```

### Update Conversation Title

**PUT** `/conversations/{id}/title`

Update the title of a conversation.

#### Request Body

```json
{
  "title": "Updated Title"
}
```

#### Response

```json
{
  "success": true,
  "message": "Conversation title updated successfully"
}
```

### Send Message in Conversation

**POST** `/conversations/message`

Send a message in a conversation and get AI-generated candidate matches.

#### Request Body

```json
{
  "message": "I need a senior React developer with 5+ years experience",
  "conversationId": 1
}
```

If `conversationId` is not provided, a new conversation will be created.

#### Response

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 1,
      "title": "Senior React Developer",
      "user_id": null,
      "created_at": "2023-05-01T10:00:00.000Z",
      "updated_at": "2023-05-01T10:05:00.000Z",
      "messages": [
        // Array of messages in the conversation
      ]
    },
    "agentResult": {
      // Detailed agent processing results
    },
    "candidatesDelivered": true
  }
}
```

### Provide Feedback on Conversation

**POST** `/conversations/{id}/feedback`

Provide feedback on the candidates or job description in a conversation.

#### Request Body

```json
{
  "feedback": "I'm looking for candidates with more experience in Node.js"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "conversation": {
      // Updated conversation with feedback message
    },
    "feedback": "Based on your feedback, I've refined the search..."
  }
}
```

### Delete Conversation

**DELETE** `/conversations/{id}`

Delete a conversation and all its messages.

#### Response

```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

## Candidates

### Upload Candidate CV

**POST** `/candidates/upload`

Upload and process a candidate's CV.

#### Request

Multipart form data with:
- `cv` - The CV file (PDF or DOCX)
- `name` - Candidate's name
- `email` - Candidate's email
- `phone` - Candidate's phone number
- `linkedinUrl` - Candidate's LinkedIn profile URL

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  }
}
```

### Get All Candidates

**GET** `/candidates`

Retrieve all candidates.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "created_at": "2023-05-01T10:00:00.000Z"
    }
  ]
}
```

### Get Candidate

**GET** `/candidates/{id}`

Retrieve a specific candidate's details.

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "cv_text": "Candidate's CV content...",
    "cv_vector": [0.1, 0.2, 0.3, ...], // Vector representation
    "created_at": "2023-05-01T10:00:00.000Z",
    "updated_at": "2023-05-01T10:00:00.000Z"
  }
}
```

### Update Candidate

**PUT** `/candidates/{id}`

Update a candidate's information.

#### Request

Multipart form data with any of:
- `cv` - Updated CV file
- `name` - Updated name
- `email` - Updated email
- `phone` - Updated phone number
- `linkedinUrl` - Updated LinkedIn URL

#### Response

```json
{
  "success": true,
  "message": "Candidate updated successfully"
}
```

### Get Similar Candidates

**GET** `/candidates/{id}/similar`

Find candidates similar to a given candidate using vector similarity.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1987654321",
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "similarity": 0.85
    }
  ]
}
```

## Chat

### Send Chat Message

**POST** `/chat`

Send a job description and get candidate matches.

#### Request Body

```json
{
  "message": "I need a senior React developer with 5+ years experience"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "jobRequirements": {
      "jobTitle": "Senior React Developer",
      "experienceLevel": "Senior",
      "requiredSkills": ["React", "JavaScript", "HTML", "CSS"],
      "education": "Bachelor's degree in Computer Science or related field"
    },
    "candidates": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "linkedinUrl": "https://linkedin.com/in/johndoe",
        "similarity": 0.92,
        "profileSummary": "Experienced React developer with 7 years of experience...",
        "matchAnalysis": {
          "matchScore": 92,
          "strengths": ["React expertise", "Frontend development"],
          "keySkillsMatch": ["React", "JavaScript"],
          "areasForDevelopment": ["Backend experience"],
          "experienceRelevance": "7 years of React experience",
          "culturalFit": "Strong team player",
          "summary": "Excellent match for the position"
        },
        "communicationTemplates": {
          "email": {
            "subject": "Opportunity for Senior React Developer - John Doe",
            "body": "Dear John,\n\nWe have an exciting opportunity..."
          },
          "linkedin": {
            "message": "Hi John, I have an opportunity that might interest you..."
          },
          "phone": {
            "opening": "Hi John",
            "introduction": "I'm calling about a Senior React Developer position...",
            "valueProposition": "This role offers the opportunity to work with cutting-edge technologies...",
            "questions": ["What are you looking for in your next role?", "What's your experience with React?"],
            "nextSteps": "Would you be interested in learning more about this opportunity?"
          }
        }
      }
    ],
    "overallSummary": "Job Analysis Complete:\n\nPosition: Senior React Developer\nCandidates Found: 5\n\nTop candidates have been identified..."
  }
}
```
