async function test() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shopowner@example.com', password: 'pass123' })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    
    const cookie = loginRes.headers.get('set-cookie').split(';')[0];
    
    console.log('Fetching status...');
    const statusRes = await fetch('http://localhost:5000/api/subscriptions/status', {
      headers: { 'Cookie': cookie }
    });
    
    const data = await statusRes.json();
    if (!statusRes.ok) {
        console.error('API Error:', statusRes.status, data);
    } else {
        console.log('Status Response:', data);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
