export const site = {
  name: 'Sunny Automates',
  owner: 'Sahil',
  tagline: 'Process-first automation for small teams.',
  description:
    'Sunny Automates builds n8n and Make systems for small teams. Every build starts with the process that is broken — not the tool that is trendy.',
  email: 'contact.sunnyautomates@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sunny-singh-987b19426',
  github: 'https://github.com/Sahil-Psyche',
  location: 'India',
  timezone: 'Asia/Kolkata',
  year: 2026,
};

const subject = "Automation project — let's talk";
const body = `Hi Sahil,

Here's the process that keeps breaking:

The tools involved:

How often it happens:

What happens when it fails:

—`;

export const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  site.email
)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const mailtoLink = `mailto:${site.email}?subject=${encodeURIComponent(
  subject
)}&body=${encodeURIComponent(body)}`;

export const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'Approach', href: '/#approach' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export const stack = [
  'n8n',
  'Make',
  'OpenAI',
  'Gmail',
  'Google Sheets',
  'Telegram',
  'WhatsApp',
  'Shopify',
  'HubSpot',
  'Slack',
  'Airtable',
  'Notion',
  'GitHub',
];
