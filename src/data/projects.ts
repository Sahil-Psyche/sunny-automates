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
    buildType: 'Self-initiated build',
    trigger: 'New Gmail message',
    surfaces: 'Gmail · Telegram · Sheets',
    caption: 'fig. 02 — inbox.triage / a self-initiated build',
    quote: 'The urgent email is never at the top. Routing is the job.',
    problem: [
      `An inbox is not a to-do list, but it behaves like one. Client requests, invoices, newsletters and calendar noise land in the same place, and the urgent item is usually three scrolls below something that can wait.`,
      `The failure is not laziness — it is a routing problem. For a small team, the cost compounds: replies get delayed, asks get lost, and nobody can say what came in this week without opening a second app.`,
    ],
    system: [
      {
        title: 'Catch every message',
        body: 'A Gmail trigger watches a dedicated label. Self-sent mail is ignored so the system never loops on itself.',
      },
      {
        title: 'Normalise before judging',
        body: 'Quoted threads and signatures are stripped first, so the classifier reads the actual request instead of a wall of history.',
      },
      {
        title: 'Classify with a threshold',
        body: 'One AI step returns urgent / client / admin / noise, a one-line summary and a confidence score. No silent guessing.',
      },
      {
        title: 'Route, do not dump',
        body: 'Urgent goes to Telegram with a summary and link. Client mail gets a draft reply waiting in the thread. Everything is logged in Sheets.',
      },
      {
        title: 'Keep a human in the loop',
        body: 'Low-confidence messages and risky drafts go to a review queue. Drafts are created, never auto-sent.',
      },
    ],
    notes: [
      {
        title: 'Idempotent by design',
        body: 'Every message is deduplicated by Gmail message ID, so retries and overlapping runs cannot double-post.',
      },
      {
        title: 'Loud failures',
        body: 'A dedicated error workflow posts the node, error and run link to Telegram. Nothing dies quietly.',
      },
      {
        title: 'Drafts, not autopilot',
        body: 'The human checkpoint is deliberate. Tone and judgement still belong to the person who owns the relationship.',
      },
      {
        title: 'One switch off',
        body: 'Disabling the trigger returns the inbox to normal immediately. No data migration, no lock-in.',
      },
    ],
    stack: ['n8n', 'Gmail', 'OpenAI', 'Telegram', 'Google Sheets'],
    flow: {
      nodes: [
        { id: 'trigger', label: 'Gmail trigger', sub: 'label: inbox', col: 0, row: 0, kind: 'trigger' },
        { id: 'clean', label: 'Strip the noise', sub: 'quotes · signatures', col: 1, row: 0, kind: 'action' },
        { id: 'classify', label: 'Classify + summarise', sub: 'urgent / client / admin', col: 2, row: 0, kind: 'ai' },
        { id: 'route', label: 'Route by class', sub: 'confidence threshold', col: 3, row: 0, kind: 'logic' },
        { id: 'telegram', label: 'Urgent alert', sub: 'Telegram + summary', col: 4, row: 0, kind: 'output' },
        { id: 'draft', label: 'Draft reply', sub: 'waits for approval', col: 4, row: 1, kind: 'output' },
        { id: 'log', label: 'Sheets log', sub: 'every message', col: 4, row: 2, kind: 'output' },
        { id: 'review', label: 'Human review', sub: 'low confidence', col: 4, row: 3, kind: 'human' },
        { id: 'error', label: 'Error alert', sub: 'node · error · run link', col: 4, row: 4, kind: 'output' },
      ],
      edges: [
        { from: 'trigger', to: 'clean', animated: true },
        { from: 'clean', to: 'classify', animated: true },
        { from: 'classify', to: 'route', animated: true },
        { from: 'route', to: 'telegram', label: 'urgent' },
        { from: 'route', to: 'draft', label: 'client' },
        { from: 'route', to: 'log', label: 'all' },
        { from: 'route', to: 'review', label: '< 0.7', dashed: true },
        { from: 'route', to: 'error', label: 'on fail', dashed: true },
      ],
    },
  },
  {
    slug: 'support-triage',
    index: '02',
    title: 'Support that reads the order',
    navTitle: 'Support triage',
    dek: 'A support triage system that pulls order context before drafting a reply — so customers are never asked for a number they already sent.',
    sector: 'E-commerce',
    buildType: 'Reference build',
    trigger: 'WhatsApp or email message',
    surfaces: 'Shopify · WhatsApp · Telegram',
    caption: 'fig. 03 — support.triage / reference build for a small store',
    quote: 'The first draft should already know the order.',
    problem: [
      `Support replies stall when the agent has to leave the conversation to find the order. The customer waits, repeats themselves, and the thread gets longer. Delivery and refund questions are the worst: high emotion, high context.`,
      `The fix is not a smarter chatbot. It is making sure the first draft already knows what was ordered, when it shipped, and whether it was delivered.`,
    ],
    system: [
      {
        title: 'Catch the message',
        body: 'A WhatsApp Cloud API or Gmail trigger normalises sender, channel and text into one shape.',
      },
      {
        title: 'Extract intent and reference',
        body: 'AI pulls the order number, email or tracking ID. If there is nothing to look up, it asks for one detail — not a whole form.',
      },
      {
        title: 'Fetch order context',
        body: 'An HTTP call to the Shopify Admin API returns items, fulfilment status, tracking and dates.',
      },
      {
        title: 'Choose the lane',
        body: 'Delivery, refund, product question or unknown. Each lane gets a different guardrail and a different owner.',
      },
      {
        title: 'Draft with facts',
        body: 'The reply is written from the order data, not from guesses. Refunds and compensation always require approval.',
      },
    ],
    notes: [
      {
        title: 'No invented details',
        body: 'If the lookup fails or returns nothing, the system escalates instead of filling the gap with plausible-sounding text.',
      },
      {
        title: 'Approval on money',
        body: 'Refunds, discounts and compensation are drafted, never sent. A person sees the amount before the customer does.',
      },
      {
        title: 'Cheap lookups',
        body: 'Order data is cached for the thread and lookups are rate-limited, so a busy day does not hammer the store API.',
      },
      {
        title: 'One thread, one record',
        body: 'The conversation, order reference and decision are logged together for a clean handover.',
      },
    ],
    stack: ['n8n', 'WhatsApp', 'Shopify', 'OpenAI', 'Telegram', 'Gmail'],
    flow: {
      nodes: [
        { id: 'message', label: 'Message in', sub: 'WhatsApp / email', col: 0, row: 0, kind: 'trigger' },
        { id: 'intent', label: 'Extract intent', sub: 'order ref + question', col: 1, row: 0, kind: 'ai' },
        { id: 'lookup', label: 'Order lookup', sub: 'Shopify Admin API', col: 2, row: 0, kind: 'action' },
        { id: 'lane', label: 'Choose lane', sub: 'delivery / refund / other', col: 3, row: 0, kind: 'logic' },
        { id: 'draft', label: 'Draft with context', sub: 'real order facts', col: 4, row: 0, kind: 'ai' },
        { id: 'approve', label: 'Approve + send', sub: 'human checkpoint', col: 5, row: 0, kind: 'human' },
        { id: 'queue', label: 'Human queue', sub: 'unknown orders', col: 4, row: 2, kind: 'human' },
      ],
      edges: [
        { from: 'message', to: 'intent', animated: true },
        { from: 'intent', to: 'lookup', animated: true },
        { from: 'lookup', to: 'lane', animated: true },
        { from: 'lane', to: 'draft', label: 'known' },
        { from: 'draft', to: 'approve', label: 'always' },
        { from: 'lane', to: 'queue', label: 'unknown', dashed: true },
      ],
    },
  },
  {
    slug: 'lead-router',
    index: '03',
    title: 'Every lead lands with context',
    navTitle: 'Lead routing',
    dek: 'Inbound interest validated, enriched and routed before it goes cold — so the first conversation starts with context.',
    sector: 'SaaS & startups',
    buildType: 'Reference build',
    trigger: 'Form submission / webhook',
    surfaces: 'HubSpot · Slack · Sheets',
    caption: 'fig. 04 — lead.router / reference build for a seed-stage team',
    quote: 'Leads go cold in the handoff, not in the inbox.',
    problem: [
      `Leads rarely go cold because nobody cares. They go cold because the handoff is slow and the context is thin. A form submission becomes a row in a spreadsheet, then someone has to notice it, look up the company, and decide who owns it.`,
      `By the time that happens, the lead has already spoken to someone else. The system should do the boring part before a human opens the tab.`,
    ],
    system: [
      {
        title: 'Receive the form',
        body: 'A webhook catches name, email, company and the free-text message — no polling, no spreadsheet as the source of truth.',
      },
      {
        title: 'Validate and dedupe',
        body: 'Email format and disposable domains are checked. Existing contacts and open deals are matched before anything is created.',
      },
      {
        title: 'Enrich and summarise',
        body: 'AI condenses the message into use case, urgency and a suggested first reply. Domain lookup adds company context where available.',
      },
      {
        title: 'Score with reasons',
        body: 'Fit, intent and urgency are scored with simple rules. Every score has a sentence explaining why it exists.',
      },
      {
        title: 'Route with a brief',
        body: 'HubSpot is upserted, then Slack posts the owner a short brief and a first line they can actually use. Low scores go to nurture with a reason.',
      },
    ],
    notes: [
      {
        title: 'Explainable scoring',
        body: 'No mysterious lead score. Each point maps to a rule a human can read, question and change.',
      },
      {
        title: 'Dedupe before create',
        body: 'Email plus domain matching prevents the duplicate-deal problem that makes CRM data untrustworthy.',
      },
      {
        title: 'Enrichment is optional',
        body: 'If the enrichment call fails, the lead is still routed with a warning. A missing extra is not a lost lead.',
      },
      {
        title: 'Decisions are logged',
        body: 'Score, route and reason are written back to Sheets for weekly review — the system stays accountable.',
      },
    ],
    stack: ['n8n', 'Google Sheets', 'OpenAI', 'HubSpot', 'Slack', 'Gmail'],
    flow: {
      nodes: [
        { id: 'webhook', label: 'Form webhook', sub: 'name / email / intent', col: 0, row: 0, kind: 'trigger' },
        { id: 'validate', label: 'Validate + dedupe', sub: 'email · domain', col: 1, row: 0, kind: 'logic' },
        { id: 'enrich', label: 'Enrich + summarise', sub: 'use case · urgency', col: 2, row: 0, kind: 'ai' },
        { id: 'score', label: 'Score with reasons', sub: 'fit / intent / urgency', col: 3, row: 0, kind: 'logic' },
        { id: 'crm', label: 'Upsert CRM', sub: 'HubSpot contact + deal', col: 4, row: 0, kind: 'action' },
        { id: 'slack', label: 'Owner brief', sub: 'summary + first reply', col: 5, row: 0, kind: 'output' },
        { id: 'nurture', label: 'Nurture list', sub: 'low score + reason', col: 4, row: 2, kind: 'output' },
      ],
      edges: [
        { from: 'webhook', to: 'validate', animated: true },
        { from: 'validate', to: 'enrich', label: 'valid' },
        { from: 'enrich', to: 'score', animated: true },
        { from: 'score', to: 'crm', label: 'score ≥ 60' },
        { from: 'crm', to: 'slack', label: 'owner' },
        { from: 'score', to: 'nurture', label: '< 60', dashed: true },
      ],
    },
  },
  {
    slug: 'follow-up-engine',
    index: '04',
    title: 'Follow-up that does not forget',
    navTitle: 'Follow-up engine',
    dek: 'A lead loop that replies in seconds, waits, checks for a response and nudges once more — without a reminder spreadsheet.',
    sector: 'Local & service businesses',
    buildType: 'Reference build',
    trigger: 'New inquiry / missed call',
    surfaces: 'WhatsApp · Gmail · Sheets',
    caption: 'fig. 05 — followup.engine / reference build for a two-person team',
    quote: 'The second follow-up never happens because it lives in someone’s head.',
    problem: [
      `Most local businesses do not lose leads because they are bad at the work. They lose them because the first reply takes hours and the second follow-up never happens.`,
      `The follow-up lives in someone's head, and heads get busy. A spreadsheet reminder is one more tab nobody opens on a job site.`,
    ],
    system: [
      {
        title: 'Capture the inquiry',
        body: 'A form, WhatsApp message or missed-call webhook becomes one lead record with source and service interest.',
      },
      {
        title: 'Reply in seconds',
        body: 'The lead gets a short message with a booking link and an honest expectation of what happens next.',
      },
      {
        title: 'Log and wait',
        body: 'The lead is written to Sheets, then the workflow waits 24 hours — inside business hours, not at 3 a.m.',
      },
      {
        title: 'Check for a reply',
        body: 'An inbound-message webhook updates the record. If the lead replied, the owner is notified and the loop stops immediately.',
      },
      {
        title: 'Nudge once, then stop',
        body: 'One polite follow-up. Then the lead is marked closed and appears in a daily digest — visible, not silently lost.',
      },
    ],
    notes: [
      {
        title: 'A hard stop',
        body: 'One follow-up only. The system cannot turn into a spam machine, even if the status data is wrong.',
      },
      {
        title: 'Reply detection',
        body: 'Any inbound message from the lead cancels the next step. The loop respects the human on the other side.',
      },
      {
        title: 'Timezone-aware waits',
        body: "Waits are scheduled in business hours for the lead's region, not just the server clock.",
      },
      {
        title: 'Visible by default',
        body: 'The daily digest of unreplied leads makes the one thing automation should never do — fail silently — impossible.',
      },
    ],
    stack: ['n8n', 'WhatsApp', 'Gmail', 'Google Sheets', 'Telegram'],
    flow: {
      nodes: [
        { id: 'inquiry', label: 'Inquiry in', sub: 'form / missed call', col: 0, row: 0, kind: 'trigger' },
        { id: 'reply', label: 'Instant reply', sub: 'booking link', col: 1, row: 0, kind: 'output' },
        { id: 'log', label: 'Log the lead', sub: 'source · service · status', col: 2, row: 0, kind: 'action' },
        { id: 'wait', label: 'Wait 24 hours', sub: 'business hours only', col: 3, row: 0, kind: 'logic' },
        { id: 'check', label: 'Check for reply', sub: 'inbound webhook', col: 4, row: 0, kind: 'logic' },
        { id: 'nudge', label: 'One nudge', sub: 'then close the loop', col: 5, row: 0, kind: 'output' },
        { id: 'owner', label: 'Notify owner', sub: 'lead replied', col: 5, row: 2, kind: 'output' },
      ],
      edges: [
        { from: 'inquiry', to: 'reply', animated: true },
        { from: 'reply', to: 'log', animated: true },
        { from: 'log', to: 'wait' },
        { from: 'wait', to: 'check' },
        { from: 'check', to: 'nudge', label: 'no reply' },
        { from: 'check', to: 'owner', label: 'replied', dashed: true },
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
