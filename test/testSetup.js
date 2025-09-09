// test/testSetup.js
// Simple test script to verify setup

const tidbService = require('../src/services/tidbService');

async function testSetup() {
  try {
    console.log('Testing TiDB Cloud connection...');
    
    // Initialize database connection
    await tidbService.initialize();
    
    console.log('✓ Connected to TiDB Cloud successfully');
    
    // Test creating tables
    await tidbService.createTables();
    
    console.log('✓ Tables created successfully');
    
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
    
    console.log('\n✅ All tests passed! Your setup is working correctly.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testSetup();