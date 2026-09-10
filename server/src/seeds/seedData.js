import { dbRun, dbGet } from '../config/database.js';

const mockTickets = [
  {
    ticket_id: 'TKT-001',
    customer_name: 'Alex Rivera',
    customer_email: 'alex.rivera@fintechcorp.io',
    subject: 'Stripe webhook delivery failing with 504 Gateway Timeout',
    description: 'Since 08:30 UTC today, all our invoice.paid events are returning HTTP 504. Over 140 subscriptions have not activated automatically. Please investigate webhook queue backlog.',
    status: 'In Progress',
    priority: 'Urgent',
    notes: [
      {
        note_text: 'Escalated to Infrastructure team. Checked ingress logs and noticed high memory usage on webhook consumer container #3.',
        author: 'Sarah Jenkins (L2 Support)',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        note_text: 'Ingress node restarted. Webhook retry queue is processing at 25 events/sec. Monitoring error rate.',
        author: 'DevOps On-Call',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    ticket_id: 'TKT-002',
    customer_name: 'Elena Rostova',
    customer_email: 'elena@novadesign.co',
    subject: 'Unable to invite secondary team members to Organization workspace',
    description: 'When typing team email addresses into the member invite modal, the "Send Invitation" button remains disabled even though our Enterprise plan allows up to 50 seats.',
    status: 'Open',
    priority: 'High',
    notes: [
      {
        note_text: 'Verified customer seat count in billing DB: currently using 12 of 50 seats. Likely frontend email validation regex edge case.',
        author: 'Liam Chen',
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ]
  },
  {
    ticket_id: 'TKT-003',
    customer_name: 'Marcus Vance',
    customer_email: 'marcus.vance@apexlogistics.com',
    subject: 'Double charge on annual renewal invoice #INV-88301',
    description: 'Our corporate card was billed twice ($1,200 x 2) on September 8th for our Pro Annual subscription. Need a refund for the duplicate transaction as soon as possible.',
    status: 'Closed',
    priority: 'Urgent',
    notes: [
      {
        note_text: 'Investigated in Stripe Dashboard. Found concurrent checkout session triggers during network glitch. Issued immediate refund of $1,200 (Stripe Refund ID: re_3Lxx90).',
        author: 'Priya Sharma (Billing)',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        note_text: 'Refund confirmation email dispatched to customer. Customer verified receipt of refund memo.',
        author: 'Priya Sharma (Billing)',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ]
  },
  {
    ticket_id: 'TKT-004',
    customer_name: 'David Kim',
    customer_email: 'dkim@healthpulse.org',
    subject: 'Request for signed Business Associate Agreement (BAA) / HIPAA',
    description: 'We are expanding our deployment to patient records management and require Datastraw to execute our standard BAA prior to onboarding 2,000 healthcare users next month.',
    status: 'In Progress',
    priority: 'Medium',
    notes: [
      {
        note_text: 'Forwarded BAA package to Legal & Compliance team (attn: Rachel Weiss).',
        author: 'Carlos Gomez',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  },
  {
    ticket_id: 'TKT-005',
    customer_name: 'Sophia Patel',
    customer_email: 'sophia@patelconsulting.com',
    subject: 'Need assistance setting up Okta SAML 2.0 Single Sign-On',
    description: 'We configured the ACS URL and Entity ID according to docs, but login redirects result in error: "Invalid SAML assertion signature". Can a technical specialist review our metadata XML?',
    status: 'Open',
    priority: 'High',
    notes: []
  },
  {
    ticket_id: 'TKT-006',
    customer_name: 'Alex Rivera',
    customer_email: 'alex.rivera@fintechcorp.io',
    subject: 'Feature Request: Export audit logs to Amazon S3 bucket daily',
    description: 'For SOC-2 Type II audit compliance, our security officer requires automatic scheduled export of all user authentication and privilege change logs to our AWS S3 bucket.',
    status: 'Open',
    priority: 'Low',
    notes: [
      {
        note_text: 'Linked to Product Backlog ticket ENG-4891. Slated for Q4 roadmap consideration.',
        author: 'Sarah Jenkins',
        created_at: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ]
  },
  {
    ticket_id: 'TKT-007',
    customer_name: 'James Thornton',
    customer_email: 'j.thornton@beaconmedia.net',
    subject: 'Rate limit error (429) hit during batch CSV contact upload',
    description: 'We tried importing a batch of 8,500 subscriber contacts and received 429 Too Many Requests after ~2,000 rows. What is the current burst limit for bulk API operations?',
    status: 'Closed',
    priority: 'Medium',
    notes: [
      {
        note_text: 'Advised customer to utilize the async /v1/batch/contacts endpoint which handles chunking and does not consume synchronous rate tokens. Customer successfully completed upload.',
        author: 'Liam Chen',
        created_at: new Date(Date.now() - 3600000 * 36).toISOString()
      }
    ]
  },
  {
    ticket_id: 'TKT-008',
    customer_name: 'Chloe Bennett',
    customer_email: 'cbennett@greenleaf.eco',
    subject: 'PDF invoice download button triggers blank page in Safari 17',
    description: 'Clicking "Download PDF" on any past receipt opens a new tab with a white screen on macOS Sonoma with Safari 17. Works fine on Chrome.',
    status: 'In Progress',
    priority: 'Low',
    notes: [
      {
        note_text: 'Reproduced in browserstack on Safari 17. Blob object URL is missing Content-Disposition header in the worker response.',
        author: 'Carlos Gomez',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]
  }
];

export const seedDatabase = async () => {
  console.log('Seeding database with realistic support tickets...');
  
  // Clear existing records to ensure clean state
  await dbRun(`DELETE FROM notes`);
  await dbRun(`DELETE FROM tickets`);

  for (const t of mockTickets) {
    const created = new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)).toISOString();
    const updated = new Date().toISOString();

    await dbRun(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.ticket_id, t.customer_name, t.customer_email, t.subject, t.description, t.status, t.priority, created, updated]
    );

    if (t.notes && t.notes.length > 0) {
      for (const n of t.notes) {
        await dbRun(
          `INSERT INTO notes (ticket_id, note_text, author, created_at) VALUES (?, ?, ?, ?)`,
          [t.ticket_id, n.note_text, n.author, n.created_at || updated]
        );
      }
    }
  }

  console.log(`Successfully seeded ${mockTickets.length} tickets with notes!`);
};

// If run directly via node src/seeds/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
