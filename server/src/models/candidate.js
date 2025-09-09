// src/models/candidate.js
// Candidate data model

class Candidate {
  constructor(id, name, skills, experience, cvVector) {
    this.id = id;
    this.name = name;
    this.skills = skills; // Array of skills
    this.experience = experience; // Years of experience
    this.cvVector = cvVector; // Vector representation of CV
  }

  // Convert to database format
  toDatabaseFormat() {
    return {
      id: this.id,
      name: this.name,
      skills: this.skills,
      experience: this.experience,
      cv_vector: this.cvVector
    };
  }

  // Create from database format
  static fromDatabaseFormat(data) {
    return new Candidate(
      data.id,
      data.name,
      data.skills,
      data.experience,
      data.cv_vector
    );
  }
}

module.exports = Candidate;