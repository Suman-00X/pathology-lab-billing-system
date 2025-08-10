import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'mylab@test.com',
        password: 'test123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('- Organization:', data.client.organizationName);
      console.log('- Email:', data.client.email);
      console.log('- Token received:', !!data.token);
    } else {
      const errorData = await response.json();
      console.log('❌ Login failed:', response.status);
      console.log('- Error:', errorData.message);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\nℹ️ Make sure the server is running:');
    console.log('   cd server && npm start');
  }
}

testLogin();
