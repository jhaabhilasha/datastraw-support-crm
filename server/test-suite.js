import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Verification Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} -> ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert('Health Check', health.status === 200 && health.body.status === 'ok', JSON.stringify(health.body));

    // 2. GET /api/tickets (List all tickets)
    const listRes = await makeRequest('/api/tickets');
    assert('GET /api/tickets returns array', listRes.status === 200 && Array.isArray(listRes.body));
    assert('Tickets contain required fields (ID, Name, Title/Subject, Status, Date)', 
      listRes.body.length > 0 && 
      listRes.body[0].ticket_id && 
      listRes.body[0].customer_name && 
      listRes.body[0].subject && 
      listRes.body[0].status && 
      listRes.body[0].created_at
    );

    // 3. POST /api/tickets (Create Ticket)
    const newTicketPayload = {
      customer_name: 'Test Customer',
      customer_email: 'test.customer@domain.com',
      subject: 'Automated Test Verification Issue',
      description: 'Verifying end-to-end ticket creation and auto ID assignment',
      priority: 'High'
    };
    const createRes = await makeRequest('/api/tickets', 'POST', newTicketPayload);
    assert('POST /api/tickets returns 201', createRes.status === 201);
    assert('POST /api/tickets returns auto-generated ticket_id & created_at', 
      createRes.body.ticket_id && createRes.body.ticket_id.startsWith('TKT-') && createRes.body.created_at
    );
    const createdId = createRes.body.ticket_id;

    // 4. GET /api/tickets/{ticket_id}
    const detailRes = await makeRequest(`/api/tickets/${createdId}`);
    assert(`GET /api/tickets/${createdId} returns ticket details`, 
      detailRes.status === 200 && 
      detailRes.body.ticket_id === createdId && 
      detailRes.body.subject === newTicketPayload.subject
    );

    // 5. PUT /api/tickets/{ticket_id} (Update status and add note as per spec: { status, notes })
    const updatePayload = {
      status: 'In Progress',
      notes: 'Initial support triage completed. Investigation underway.'
    };
    const updateRes = await makeRequest(`/api/tickets/${createdId}`, 'PUT', updatePayload);
    assert('PUT /api/tickets/{ticket_id} returns { success: true, updated_at }', 
      updateRes.status === 200 && updateRes.body.success === true && updateRes.body.updated_at
    );

    // 6. Verify detail now reflects updated status & note
    const updatedDetailRes = await makeRequest(`/api/tickets/${createdId}`);
    assert('Ticket status updated to In Progress', updatedDetailRes.body.status === 'In Progress');
    assert('Notes array contains triage note', 
      updatedDetailRes.body.notes && 
      updatedDetailRes.body.notes.some(n => n.note_text.includes('Initial support triage'))
    );

    // 7. Add direct note via POST /api/tickets/{ticket_id}/notes
    const noteRes = await makeRequest(`/api/tickets/${createdId}/notes`, 'POST', {
      note_text: 'Second internal collaboration note',
      author: 'QA Automated Agent'
    });
    assert('POST /api/tickets/{ticket_id}/notes returns 201', noteRes.status === 201 && noteRes.body.note_text);

    // 8. Search filter: ?search=Automated
    const searchRes = await makeRequest('/api/tickets?search=Automated');
    assert('GET /api/tickets?search= query finds created ticket', 
      searchRes.status === 200 && searchRes.body.some(t => t.ticket_id === createdId)
    );

    // 9. Status filter: ?status=In Progress
    const filterRes = await makeRequest('/api/tickets?status=In%20Progress');
    assert('GET /api/tickets?status=In Progress returns in-progress tickets', 
      filterRes.status === 200 && filterRes.body.every(t => t.status === 'In Progress')
    );

    // 10. Stats summary
    const statsRes = await makeRequest('/api/tickets/stats/summary');
    assert('GET /api/tickets/stats/summary returns metrics', 
      statsRes.status === 200 && 
      typeof statsRes.body.total === 'number' && 
      typeof statsRes.body.open === 'number' && 
      typeof statsRes.body.inProgress === 'number' && 
      typeof statsRes.body.closed === 'number'
    );

    // 11. Export CSV
    const exportRes = await makeRequest('/api/tickets/export/csv');
    assert('GET /api/tickets/export/csv returns 200 with text/csv', 
      exportRes.status === 200 && 
      exportRes.headers['content-type'].includes('text/csv') && 
      exportRes.raw.includes('Ticket ID')
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n===============================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`===============================`);

  if (failed > 0) process.exit(1);
}

runTests();
