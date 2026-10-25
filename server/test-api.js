// server/test-api.js
// Terminal-only end-to-end API verification suite

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('   PARCELPILOT MERN STACK — API VERIFICATION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(health.status === 'ok', 'Health status is ok');
    assert(health.database === 'connected', 'MongoDB database is connected', `got ${health.database}`);

    // 2. Authentication: Reject invalid credentials
    const invalidAuthRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@parcelpilot.demo', password: 'WrongPassword999' })
    });
    assert(invalidAuthRes.status === 401, 'Invalid credentials properly rejected with 401');

    // 3. Authentication: Admin login with valid credentials
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@parcelpilot.demo', password: 'Admin@123456' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login returns 200 OK');
    assert(!!loginData.token, 'JWT token returned on login');
    assert(loginData.user?.role === 'admin', 'User has admin role');
    assert(!loginData.user?.password, 'Password hash is NEVER exposed in response');
    const token = loginData.token;

    // 4. Auth Verification: GET /api/auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK');
    assert(meData.user?.email === 'admin@parcelpilot.demo', 'Profile matches authenticated user');

    // 5. Public Tracking (No Auth Required)
    const trackRes = await fetch(`${BASE_URL}/shipments/track/PP-2048-7316`);
    const trackData = await trackRes.json();
    assert(trackRes.status === 200, 'Public tracking returns 200 OK without token');
    assert(trackData.trackingId === 'PP-2048-7316', 'Tracking ID matches requested shipment');
    assert(Array.isArray(trackData.timeline) && trackData.timeline.length > 0, 'Tracking timeline contains event history');
    assert(!trackData.recipient?.phone && !trackData.recipient?.email, 'Privacy: Recipient phone and email are SANITIZED from public response');

    // 6. Public Tracking: Invalid tracking ID returns 404
    const notFoundTrack = await fetch(`${BASE_URL}/shipments/track/PP-INVALID-9999`);
    assert(notFoundTrack.status === 404, 'Nonexistent tracking ID returns 404 Not Found');

    // 7. Security: Unauthorized Mutation Rejection (POST without token)
    const unauthPost = await fetch(`${BASE_URL}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: 'Hacker',
        recipientEmail: 'hacker@test.com',
        origin: 'Mumbai',
        destination: 'Delhi',
        weight: '1.0 kg'
      })
    });
    assert(unauthPost.status === 401, 'Unauthorized shipment creation rejected with 401');

    // 8. Authorized Shipment Creation (POST with JWT)
    const createRes = await fetch(`${BASE_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipientName: 'Sanjay Kapoor',
        recipientEmail: 'sanjay.kapoor@example.in',
        recipientPhone: '+91 98111 22334',
        origin: 'Bengaluru',
        destination: 'Kolkata',
        service: 'Express',
        weight: '3.2 kg'
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, 'Shipment creation returns 201 Created');
    const createdShipment = createData.shipment || createData;
    assert(createdShipment.trackingId?.startsWith('PP-'), 'Server generated unique tracking ID format PP-XXXX-XXXX');
    assert(createdShipment.status === 'Pending Pickup', 'Initial status set to Pending Pickup');
    const newTrackingId = createdShipment.trackingId;

    // 9. Status Update (PATCH with JWT)
    const updateRes = await fetch(`${BASE_URL}/shipments/${newTrackingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'Picked Up',
        location: 'Bengaluru Hub',
        description: 'Package received at pickup center by carrier'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'Status update returns 200 OK');
    const updatedShip = updateData.shipment || updateData;
    assert(updatedShip.status === 'Picked Up', 'Shipment status updated to Picked Up');

    // 10. Persistence Verification in MongoDB
    const getRes = await fetch(`${BASE_URL}/shipments/${newTrackingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await getRes.json();
    const fetchedShip = getData.shipment || getData;
    assert(fetchedShip.status === 'Picked Up', 'MongoDB persistence verified: status is Picked Up');
    const lastEvent = fetchedShip.timeline?.[fetchedShip.timeline.length - 1];
    assert(lastEvent?.location === 'Bengaluru Hub', 'Tracking event appended to MongoDB timeline correctly');

    // 11. Dashboard Statistics
    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const stats = await statsRes.json();
    assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200 OK');
    assert(typeof stats.total === 'number' && stats.total >= 6, 'Dashboard total calculated from MongoDB records');

    // 12. Activity Log
    const actRes = await fetch(`${BASE_URL}/activity`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const actData = await actRes.json();
    assert(actRes.status === 200, 'GET /api/activity returns 200 OK');
    assert(Array.isArray(actData) && actData.length > 0, 'Activity feed populated from tracking events');

    // 13. Reports
    const repRes = await fetch(`${BASE_URL}/reports/shipments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const repData = await repRes.json();
    assert(repRes.status === 200, 'GET /api/reports/shipments returns 200 OK');
    assert(Array.isArray(repData.statusBreakdown), 'Reports contain status distribution');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
