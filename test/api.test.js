// test/api.test.js
// Simple API tests

const tidbService = require('../src/services/tidbService');

async function runAPITests() {
  try {
    console.log('Running API tests...');
    
    // Initialize database connection
    await tidbService.initialize();
    
    console.log('✓ Database connection successful');
    
    // Test creating tables
    await tidbService.createTables();
    
    console.log('✓ Table creation successful');
    
    // Test inserting a sample candidate
    const sampleCandidate = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '5 years',
      education: 'BSc Computer Science',
      cvText: 'Experienced developer with 5 years of experience...',
      cvVector: Array(128).fill(0.5)
    };
    
    const candidateId = await tidbService.storeCandidate(sampleCandidate);
    console.log(`✓ Sample candidate inserted with ID: ${candidateId}`);
    
    // Test searching candidates
    const queryVector = Array(128).fill(0.5);
    const candidates = await tidbService.searchCandidates(queryVector, 5);
    console.log(`✓ Found ${candidates.length} candidates`);
    
    // Test inserting a sample job
    const insertJobSql = `
      INSERT INTO jobs (title, description, requirements, job_vector)
      VALUES (?, ?, ?, ?)
    `;
    
    const jobParams = [
      'Senior React Developer',
      'We are looking for an experienced React developer...',
      JSON.stringify({ requiredSkills: ['JavaScript', 'React'], experienceLevel: 'senior' }),
      JSON.stringify(Array(128).fill(0.7))
    ];
    
    const jobResult = await tidbService.executeQuery(insertJobSql, jobParams);
    console.log(`✓ Sample job inserted with ID: ${jobResult.insertId}`);
    
    // Test inserting a sample user
    const insertUserSql = `
      INSERT INTO users (name, email, role)
      VALUES (?, ?, ?)
    `;
    
    const userParams = ['Jane Smith', 'jane.smith@example.com', 'recruiter'];
    const userResult = await tidbService.executeQuery(insertUserSql, userParams);
    console.log(`✓ Sample user inserted with ID: ${userResult.insertId}`);
    
    console.log('\n✅ All API tests passed! Your API is working correctly.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ API tests failed:', error);
    process.exit(1);
  }
}

runAPITests();
