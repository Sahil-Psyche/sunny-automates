export type NodeKind = 'trigger' | 'action' | 'ai' | 'logic' | 'human' | 'output';

export interface FlowNode {
  id: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  kind: NodeKind;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  animated?: boolean;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  navTitle: string;
  dek: string;
  sector: string;
  buildType: string;
  trigger: string;
  surfaces: string;
  caption: string;
  quote: string;
  problem: string[];
  system: { title: string; body: string }[];
  notes: { title: string; body: string }[];
  stack: string[];
  n8nImage?: string;
  n8nUrl?: string;
  flow: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
}

export const projects: Project[] = [
  {
    slug: 'inbox-triage',
    index: '01',
    title: 'The inbox that sorts itself',
    navTitle: 'Inbox triage',
    dek: 'Every email classified, summarised and routed — with a human checkpoint before anything sends.',
    sector: 'Founders & small teams',
    buildType: 'Live n8n workflow',
    trigger: 'Gmail trigger (polling)',
    surfaces: 'Gmail · Telegram · Data table',
    caption: 'fig. 02 — inbox.triage / live build from n8n',
    quote: 'The urgent email is never at the top. Routing is the job.',
    problem: [
      `An inbox is not a to-do list, but it behaves like one. Client requests, invoices, newsletters and calendar noise land in the same place, and the urgent item is usually three scrolls below something that can wait.`,
      `The failure is not laziness — it is a routing problem. For a small team, the cost compounds: replies get delayed, asks get lost, and nobody can say what came in this week without opening a second app.`,
    ],
    system: [
      { title: 'Catch every message', body: 'A Gmail trigger polls a dedicated label. Self-sent mail is ignored so the system never loops on itself.' },
      { title: 'Normalise before judging', body: 'Sender, subject and body are reshaped into one clean record so the classifier reads the actual request, not a wall of quoted history.' },
      { title: 'Classify with a threshold', body: 'One AI step returns urgent / client / admin / noise, a one-line summary and a confidence score. No silent guessing.' },
      { title: 'Route by class', body: 'Urgent goes to Telegram with a summary and link. Routine mail becomes a draft reply waiting in the thread. Everything else is logged.' },
      { title: 'Keep a human in the loop', body: 'Risky drafts are created, never auto-sent. A person sees the amount before the customer does.' },
    ],
    notes: [
      { title: 'Idempotent by design', body: 'Every message is deduplicated by Gmail message ID, so retries and overlapping runs cannot double-post.' },
      { title: 'Loud failures', body: 'A dedicated error workflow posts the node, error and run link to Telegram. Nothing dies quietly.' },
      { title: 'Drafts, not autopilot', body: 'The human checkpoint is deliberate. Tone and judgement still belong to the person who owns the relationship.' },
      { title: 'One switch off', body: 'Disabling the trigger returns the inbox to normal immediately. No data migration, no lock-in.' },
    ],
    stack: ['n8n', 'Gmail', 'OpenAI', 'Telegram', 'Data table'],
    n8nImage: '/workflows/inbox-triage.png',
    n8nUrl: 'https://pheonix369.app.n8n.cloud/workflow/95leKzDjRkJti2q1',
    flow: {
      nodes: [
        { id: 'trigger', label: 'Gmail trigger', sub: 'polls label', col: 0, row: 0, kind: 'trigger' },
        { id: 'normalize', label: 'Normalize email', sub: 'sender · subject · body', col: 1, row: 0, kind: 'action' },
        { id: 'ai', label: 'AI triage & draft', sub: 'class + summary + score', col: 2, row: 0, kind: 'ai' },
        { id: 'urgent', label: 'Is urgent?', sub: 'confidence threshold', col: 3, row: 0, kind: 'logic' },
        { id: 'telegram', label: 'Alert owner', sub: 'Telegram + link', col: 4, row: 0, kind: 'output' },
        { id: 'routine', label: 'Is routine?', sub: 'draft or log', col: 4, row: 1, kind: 'logic' },
        { id: 'draft', label: 'Create reply draft', sub: 'waits for approval', col: 5, row: 1, kind: 'output' },
        { id: 'log', label: 'Log triage', sub: 'data table', col: 5, row: 0, kind: 'output' },
        { id: 'error', label: 'Error alert', sub: 'node · error · run link', col: 4, row: 2, kind: 'output' },
      ],
      edges: [
        { from: 'trigger', to: 'normalize', animated: true },
        { from: 'normalize', to: 'ai', animated: true },
        { from: 'ai', to: 'urgent', animated: true },
        { from: 'urgent', to: 'telegram', label: 'urgent' },
        { from: 'urgent', to: 'routine', label: 'not urgent' },
        { from: 'telegram', to: 'log', animated: true },
        { from: 'routine', to: 'draft', label: 'routine' },
        { from: 'routine', to: 'log', label: 'other', dashed: true },
        { from: 'draft', to: 'log' },
        { from: 'urgent', to: 'error', label: 'on fail', dashed: true },
      ],
    },
  },
  {
    slug: 'support-triage',
    index: '02',
    title: 'Support that reads the order',
    navTitle: 'Support bot',
    dek: 'A WhatsApp support bot that answers FAQs from context and hands off to a human when it should not guess.',
    sector: 'E-commerce & services',
    buildType: 'Live n8n workflow',
    trigger: 'WhatsApp trigger',
    surfaces: 'WhatsApp · OpenAI · Telegram',
    caption: 'fig. 03 — support.bot / live build from n8n',
    quote: 'The first reply should already know the answer — or know to ask a person.',
    problem: [
      `Support stalls when the agent has to leave the conversation to find the answer. The customer waits, repeats themselves, and the thread gets longer. FAQ questions are the worst: high volume, low patience.`,
      `The fix is not a smarter chatbot. It is making sure the first reply either answers from context or escalates with the full thread attached — never a confident guess.`,
    ],
    system: [
      { title: 'Catch the message', body: 'A WhatsApp trigger starts the flow on every inbound message.' },
      { title: 'Agent with memory', body: 'An AI agent replies using windowed conversation memory, so follow-up questions keep context without re-asking.' },
      { title: 'Guarded handoff', body: 'An IF node checks whether the request needs a human. If yes, Telegram gets the thread and a handoff note.' },
      { title: 'Reply on WhatsApp', body: 'Routine questions get a direct answer on WhatsApp. No second app for the customer.' },
      { title: 'Model is swappable', body: 'The chat model is a sub-node, so the provider can change without rewiring the agent.' },
    ],
    notes: [
      { title: 'No invented details', body: 'If the agent cannot answer from context, it escalates instead of filling the gap with plausible text.' },
      { title: 'Human on money', body: 'Refunds, discounts and compensation are never auto-handled. A person sees them first.' },
      { title: 'Cheap memory', body: 'Windowed buffer memory keeps token cost flat on long threads.' },
      { title: 'One thread, one record', body: 'The conversation and the handoff decision are logged together for a clean handover.' },
    ],
    stack: ['n8n', 'WhatsApp', 'OpenAI', 'Telegram'],
    n8nImage: '/workflows/support-triage.png',
    n8nUrl: 'https://pheonix369.app.n8n.cloud/workflow/rs2ryvGVBe4cLP6y',
    flow: {
      nodes: [
        { id: 'trigger', label: 'WhatsApp trigger', sub: 'inbound message', col: 0, row: 0, kind: 'trigger' },
        { id: 'agent', label: 'Support agent', sub: 'AI · memory', col: 1, row: 0, kind: 'ai' },
        { id: 'handoff', label: 'Needs handoff?', sub: 'route decision', col: 2, row: 0, kind: 'logic' },
        { id: 'telegram', label: 'Handoff to human', sub: 'Telegram + thread', col: 3, row: 0, kind: 'human' },
        { id: 'reply', label: 'Reply on WhatsApp', sub: 'direct answer', col: 3, row: 1, kind: 'output' },
      ],
      edges: [
        { from: 'trigger', to: 'agent', animated: true },
        { from: 'agent', to: 'handoff', animated: true },
        { from: 'handoff', to: 'telegram', label: 'yes', dashed: true },
        { from: 'handoff', to: 'reply', label: 'no' },
      ],
    },
  },
  {
    slug: 'lead-router',
    index: '03',
    title: 'Every lead lands with context',
    navTitle: 'Lead capture',
    dek: 'Inbound leads captured, scored with AI and routed to the owner in seconds — with a confirmation back to the lead.',
    sector: 'SaaS & startups',
    buildType: 'Live n8n workflow',
    trigger: 'Form trigger',
    surfaces: 'Form · Data table · OpenAI · Telegram · Gmail',
    caption: 'fig. 04 — lead.capture / live build from n8n',
    quote: 'Leads go cold in the handoff, not in the inbox.',
    problem: [
      `Leads rarely go cold because nobody cares. They go cold because the handoff is slow and the context is thin. A form submission becomes a row in a spreadsheet, then someone has to notice it, look up the company, and decide who owns it.`,
      `By the time that happens, the lead has already spoken to someone else. The system should do the boring part before a human opens the tab.`,
    ],
    system: [
      { title: 'Receive the form', body: 'A form trigger catches name, email, company and the free-text message — no polling, no spreadsheet as the source of truth.' },
      { title: 'Normalise and store', body: 'The lead is reshaped into one record and written to a data table before any AI call, so nothing is lost if scoring fails.' },
      { title: 'Score with AI', body: 'AI scores fit, intent and urgency and returns a short reason. Every score has a sentence explaining why it exists.' },
      { title: 'Route by score', body: 'Hot leads alert the owner on Telegram with a brief and a suggested first reply. Every lead gets an email confirmation.' },
      { title: 'Accountable decisions', body: 'Score, route and reason are written back to the data table for weekly review.' },
    ],
    notes: [
      { title: 'Explainable scoring', body: 'No mysterious lead score. Each point maps to a rule a human can read, question and change.' },
      { title: 'Store before scoring', body: 'The lead is persisted first, so a failed AI call never loses an inbound request.' },
      { title: 'Enrichment is optional', body: 'If the enrichment call fails, the lead is still routed with a warning. A missing extra is not a lost lead.' },
      { title: 'Decisions are logged', body: 'Score, route and reason are written back for weekly review — the system stays accountable.' },
    ],
    stack: ['n8n', 'Form trigger', 'OpenAI', 'Telegram', 'Gmail', 'Data table'],
    n8nImage: '/workflows/lead-router.png',
    n8nUrl: 'https://pheonix369.app.n8n.cloud/workflow/nOZXfFIeP6sfQlkA',
    flow: {
      nodes: [
        { id: 'form', label: 'Lead form', sub: 'name · email · intent', col: 0, row: 0, kind: 'trigger' },
        { id: 'normalize', label: 'Normalize lead', sub: 'one record', col: 1, row: 0, kind: 'action' },
        { id: 'store', label: 'Store lead', sub: 'data table', col: 2, row: 0, kind: 'action' },
        { id: 'ai', label: 'AI score lead', sub: 'fit · intent · urgency', col: 3, row: 0, kind: 'ai' },
        { id: 'hot', label: 'Is hot lead?', sub: 'score threshold', col: 4, row: 0, kind: 'logic' },
        { id: 'telegram', label: 'Alert owner', sub: 'Telegram + brief', col: 5, row: 0, kind: 'output' },
        { id: 'email', label: 'Email confirmation', sub: 'to the lead', col: 6, row: 0, kind: 'output' },
      ],
      edges: [
        { from: 'form', to: 'normalize', animated: true },
        { from: 'normalize', to: 'store', animated: true },
        { from: 'store', to: 'ai', animated: true },
        { from: 'ai', to: 'hot', animated: true },
        { from: 'hot', to: 'telegram', label: 'hot' },
        { from: 'hot', to: 'telegram', label: 'cold', dashed: true },
        { from: 'telegram', to: 'email' },
      ],
    },
  },
  {
    slug: 'invoice-followup',
    index: '04',
    title: 'Follow-up that does not forget',
    navTitle: 'Invoice follow-up',
    dek: 'Overdue invoices detected daily, a reminder drafted by AI and sent by email and WhatsApp — then the record updated.',
    sector: 'Local & service businesses',
    buildType: 'Live n8n workflow',
    trigger: 'Daily schedule',
    surfaces: 'Schedule · Data table · OpenAI · Gmail · WhatsApp',
    caption: 'fig. 05 — invoice.followup / live build from n8n',
    quote: 'The second follow-up never happens because it lives in someone’s head.',
    problem: [
      `Most small businesses do not lose money because clients refuse to pay. They lose it because the follow-up is manual, inconsistent and quietly dropped when the week gets busy.`,
      `A spreadsheet reminder is one more tab nobody opens on a job site. The system should notice, draft and send — and record that it did.`,
    ],
    system: [
      { title: 'Check every day', body: 'A daily schedule trigger runs the check without anyone remembering to open the sheet.' },
      { title: 'Find the overdue', body: 'Pending invoices are pulled from the data table and filtered to those past due.' },
      { title: 'Draft with context', body: 'AI drafts a polite reminder from the invoice data — amount, date, days overdue — not a generic template.' },
      { title: 'Send on both channels', body: 'The reminder goes out by email and WhatsApp, matching how the client actually reads.' },
      { title: 'Close the loop', body: 'The invoice record is updated so the same reminder is never sent twice.' },
    ],
    notes: [
      { title: 'A hard stop', body: 'Each invoice is reminded once per cycle. The system cannot turn into a spam machine.' },
      { title: 'Reply detection', body: 'A payment or reply cancels the next reminder. The loop respects the human on the other side.' },
      { title: 'Timezone-aware', body: 'Schedules run in the business timezone, not the server clock.' },
      { title: 'Visible by default', body: 'A daily digest of unreconciled invoices makes silent failure impossible.' },
    ],
    stack: ['n8n', 'Schedule trigger', 'OpenAI', 'Gmail', 'WhatsApp', 'Data table'],
    n8nImage: '/workflows/invoice-followup.png',
    n8nUrl: 'https://pheonix369.app.n8n.cloud/workflow/Hi2v7Va3RZpDMEyA',
    flow: {
      nodes: [
        { id: 'schedule', label: 'Daily invoice check', sub: 'schedule trigger', col: 0, row: 0, kind: 'trigger' },
        { id: 'get', label: 'Get pending invoices', sub: 'data table', col: 1, row: 0, kind: 'action' },
        { id: 'filter', label: 'Filter overdue', sub: 'past due only', col: 2, row: 0, kind: 'logic' },
        { id: 'ai', label: 'AI draft reminder', sub: 'amount · date · days', col: 3, row: 0, kind: 'ai' },
        { id: 'email', label: 'Send reminder email', sub: 'Gmail', col: 4, row: 0, kind: 'output' },
        { id: 'whatsapp', label: 'Send reminder WhatsApp', sub: 'WhatsApp', col: 5, row: 0, kind: 'output' },
        { id: 'update', label: 'Update invoice status', sub: 'data table', col: 6, row: 0, kind: 'action' },
      ],
      edges: [
        { from: 'schedule', to: 'get', animated: true },
        { from: 'get', to: 'filter', animated: true },
        { from: 'filter', to: 'ai', animated: true },
        { from: 'ai', to: 'email', animated: true },
        { from: 'email', to: 'whatsapp' },
        { from: 'whatsapp', to: 'update' },
      ],
    },
  },
  {
    slug: 'appointment-booking',
    index: '05',
    title: 'Bookings that confirm themselves',
    navTitle: 'Appointment booking',
    dek: 'Booking requests captured, confirmed by email and WhatsApp, and reminded the day before — without a receptionist.',
    sector: 'Local & service businesses',
    buildType: 'Live n8n workflow',
    trigger: 'Form trigger + daily schedule',
    surfaces: 'Form · Data table · Gmail · WhatsApp',
    caption: 'fig. 06 — appointment.booking / live build from n8n',
    quote: 'The reminder should be automatic. The no-show should not be.',
    problem: [
      `Service businesses lose appointments to no-shows and to the friction of booking itself. A form that nobody answers, a confirmation that never arrives, a reminder that lives in someone’s head.`,
      `The system should capture the request, confirm it on the channels the client actually reads, and remind them the day before — every time, without a person chasing.`,
    ],
    system: [
      { title: 'Capture the request', body: 'A form trigger collects name, contact, service and preferred time.' },
      { title: 'Normalise and store', body: 'The booking is reshaped into one record and written to a data table.' },
      { title: 'Confirm on two channels', body: 'A confirmation email and a WhatsApp message go out immediately, so the client has it where they read.' },
      { title: 'Remind the day before', body: 'A daily schedule pulls tomorrow’s appointments and sends a WhatsApp reminder.' },
      { title: 'One record, always', body: 'The data table is the single source of truth for what is booked and what was reminded.' },
    ],
    notes: [
      { title: 'Two confirmation channels', body: 'Email plus WhatsApp covers the clients who read one but not the other.' },
      { title: 'Reminder is idempotent', body: 'Each appointment is reminded once. Re-runs do not double-message.' },
      { title: 'Timezone-aware', body: 'The daily reminder runs in the business timezone, not the server clock.' },
      { title: 'Visible by default', body: 'Tomorrow’s appointments and reminder status are visible in the data table.' },
    ],
    stack: ['n8n', 'Form trigger', 'Schedule trigger', 'Gmail', 'WhatsApp', 'Data table'],
    n8nImage: '/workflows/appointment-booking.png',
    n8nUrl: 'https://pheonix369.app.n8n.cloud/workflow/xojSToJMaKAXWiqI',
    flow: {
      nodes: [
        { id: 'form', label: 'Appointment request form', sub: 'form trigger', col: 0, row: 0, kind: 'trigger' },
        { id: 'normalize', label: 'Normalize booking', sub: 'one record', col: 1, row: 0, kind: 'action' },
        { id: 'store', label: 'Store appointment', sub: 'data table', col: 2, row: 0, kind: 'action' },
        { id: 'email', label: 'Send confirmation email', sub: 'Gmail', col: 3, row: 0, kind: 'output' },
        { id: 'whatsapp', label: 'Send confirmation WhatsApp', sub: 'WhatsApp', col: 4, row: 0, kind: 'output' },
        { id: 'schedule', label: 'Daily reminder schedule', sub: 'schedule trigger', col: 0, row: 2, kind: 'trigger' },
        { id: 'get', label: 'Get tomorrow appointments', sub: 'data table', col: 1, row: 2, kind: 'action' },
        { id: 'remind', label: 'Send reminder WhatsApp', sub: 'WhatsApp', col: 2, row: 2, kind: 'output' },
      ],
      edges: [
        { from: 'form', to: 'normalize', animated: true },
        { from: 'normalize', to: 'store', animated: true },
        { from: 'store', to: 'email', animated: true },
        { from: 'email', to: 'whatsapp' },
        { from: 'schedule', to: 'get', animated: true },
        { from: 'get', to: 'remind' },
      ],
    },
  },
];

export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug);

export const getNextProject = (slug: string) => {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
};