// Stub Scholar drafts. In production, generate these on the server via Anthropic
// (POST /api/drafts) and persist to public.applications or a drafts table.

export const QUICK_ACTIONS = [
  'Make it more concise',
  'Strengthen the closing',
  'Add more about my projects',
  'Match the scholarship tone',
  'Check grammar and flow',
  'Rewrite the leadership section',
  'Make the opening more personal',
  'Add a specific example',
]

export const SCHOLAR_RESPONSES = [
  "I've updated that section. The revised version flows more naturally and connects better to the scholarship's stated values. Want me to adjust the tone of the next paragraph too?",
  "Done. I've tightened the language and removed two redundant sentences. You're now at 361 words — still room to add one strong personal detail before hitting the 500-word target.",
  "Updated. The new closing paragraph is more forward-looking and ties back to the scholarship's mission of developing transformational leaders who give back. Much stronger now.",
  "Good catch. I've aligned the vocabulary and tone more closely with the scholarship's official language — especially around 'transformational leadership' and 'economic empowerment'. This should resonate better with the review committee.",
  'Checked. Grammar is solid overall. I\'ve flagged two sentence fragments in the Leadership section and suggested a smoother transition between your academic and goals paragraphs.',
]

export function buildPersonalStatement(s) {
  return [
    {
      title: 'Opening',
      ai: true,
      paragraphs: [
        "Growing up in Lagos, Nigeria, I witnessed firsthand the transformative power of education — and equally, the barriers that prevent talented young Africans from accessing it. As a third-year Computer Engineering student at the University of Lagos with a GPA of 4.3/5.0, I have dedicated myself not only to academic excellence but to building solutions that address real challenges facing my community.",
      ],
    },
    {
      title: 'Academic background',
      ai: true,
      paragraphs: [
        { parts: [
          { text: 'My studies have equipped me with a strong foundation in ' },
          { text: 'software engineering, embedded systems, and data structures', highlight: true },
          { text: '. Beyond coursework, I have pursued independent projects including a smart campus attendance system using NFC technology, which demonstrated my ability to bridge hardware and software to solve practical problems. ' },
          { text: 'This project earned recognition at the UNILAG Engineering Exhibition 2024.', highlight: true },
        ]},
      ],
    },
    {
      title: 'Leadership & impact',
      ai: true,
      paragraphs: [
        `I serve as the technical lead of my faculty's innovation club, where I have mentored 12 junior students in programming fundamentals. I believe that transformational leadership — one of ${s.org}'s core values — is not a title but a practice I have been building every day.`,
      ],
    },
    {
      title: 'Goals & vision',
      ai: true,
      paragraphs: [
        { parts: [
          { text: `Upon graduation, I intend to build technology infrastructure that empowers African creators and entrepreneurs. ${s.org}'s commitment to developing leaders who give back to their communities aligns directly with the values I carry — ` },
          { text: 'and the future I am working to build.', highlight: true },
        ]},
      ],
    },
  ]
}

export function buildCV() {
  return [
    {
      title: 'Education',
      ai: true,
      paragraphs: [
        { html: '<strong>B.Eng Computer Engineering</strong> — University of Lagos, 2022–present<br/>GPA: 4.3 / 5.0 · Expected graduation: July 2026<br/>Relevant courses: Data Structures, Embedded Systems, Software Engineering, AI & Machine Learning' },
      ],
    },
    {
      title: 'Projects',
      ai: true,
      paragraphs: [
        { html: '<strong>NFC Smart Attendance System</strong> — Built a campus-wide attendance solution using NFC cards and a React dashboard. Deployed across 3 departments. Reduced manual errors by 80%.' },
        { html: '<strong>Budget Tracker App</strong> — Full-stack web app with Node.js backend and PostgreSQL. 200+ active users among UNILAG students.' },
      ],
    },
    {
      title: 'Leadership',
      ai: true,
      paragraphs: [
        { html: '<strong>Technical Lead</strong>, UNILAG Faculty Innovation Club — 2023–present<br/>Mentored 12 junior students in programming. Organised 3 hackathons.' },
      ],
    },
    {
      title: 'Skills',
      ai: true,
      paragraphs: ['Python · JavaScript · React · Node.js · PostgreSQL · C++ · NFC/RFID · Git · Docker'],
    },
  ]
}

export function buildCoverLetter(s) {
  return [
    {
      title: 'Cover letter',
      ai: true,
      paragraphs: [
        `Dear ${s.org} Committee,`,
        `I am writing to express my strong interest in the ${s.name}. As a Computer Engineering student at the University of Lagos with a deep commitment to transformational leadership and community impact, I believe this program represents the perfect environment for me to grow into the leader Africa needs.`,
        'My academic record — a GPA of 4.3/5.0 — reflects my dedication. But beyond grades, I have spent the last two years building technology that solves real problems for my peers and community. I look forward to bringing that same drive to your network.',
        'Sincerely,\nTemi Adeyemi',
      ],
    },
  ]
}

export function wordCount(sections) {
  let words = 0
  let chars = 0
  for (const sec of sections) {
    for (const p of sec.paragraphs) {
      let text = ''
      if (typeof p === 'string') text = p
      else if (p.html) text = p.html.replace(/<[^>]+>/g, '')
      else if (p.parts) text = p.parts.map((x) => x.text).join('')
      chars += text.length
      words += text.trim().split(/\s+/).filter(Boolean).length
    }
  }
  return { words, chars }
}
