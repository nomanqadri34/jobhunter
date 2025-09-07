// Test script to verify all services are working
const axios = require('axios');

async function testServices() {
  console.log('Testing service connections...\n');
  
  // Test Node.js backend
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Node.js Backend: Connected');
  } catch (error) {
    console.log('❌ Node.js Backend: Failed to connect');
  }
  
  // Test Python Flask service
  try {
    const response = await axios.get('http://localhost:5001/health');
    console.log('✅ Python Flask: Connected');
  } catch (error) {
    console.log('❌ Python Flask: Failed to connect');
  }
  
  // Test React frontend (check if running)
  try {
    const response = await axios.get('http://localhost:5173/');
    console.log('✅ React Frontend: Connected');
  } catch (error) {
    console.log('❌ React Frontend: Failed to connect');
  }
}

testServices();