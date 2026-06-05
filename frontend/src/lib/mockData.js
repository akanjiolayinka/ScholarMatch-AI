// Single source of mock data for the demo. Every page reads from here when
// running without a backend. Keep in sync with the schema in supabase/schema.sql
// — these objects mirror the row shapes you'd get from Supabase.

export const MOCK_SCHOLARSHIPS = [
  {
    id: 's1', name: 'Scholars Program — African Universities',
    organization: 'MasterCard Foundation', amount: 'Full funding',
    match_score: 98, deadline: '2025-12-15', status: 'saved',
    tags: ['Undergraduate', 'Africa', 'STEM'], destinations: ['Africa'],
    description: 'Supporting talented African students with demonstrated financial need.',
    is_new: true, level: 'Undergraduate', category: 'merit', destination: 'Africa', featured: true,
  },
  {
    id: 's2', name: 'Chevening Scholarship 2025/26',
    organization: 'UK Government', amount: '£18,000 / yr',
    match_score: 91, deadline: '2026-11-05', status: 'applied',
    tags: ['Postgraduate', 'UK', 'Leadership'], destinations: ['UK'],
    description: "The UK's global scholarship programme for future leaders.",
    is_new: true, level: 'Postgraduate', category: 'abroad', destination: 'UK', submitted: 'Nov 3',
  },
  {
    id: 's3', name: 'Development-Related Postgraduate Courses',
    organization: 'DAAD Germany', amount: '€934 / month',
    match_score: 87, deadline: '2026-10-31', status: 'applied',
    tags: ['Postgraduate', 'Germany', 'Engineering'], destinations: ['Germany'],
    description: 'Funding for postgraduate students from developing countries.',
    is_new: false, level: 'Postgraduate', category: 'abroad', destination: 'Germany', submitted: 'Oct 28',
  },
  {
    id: 's4', name: 'Gates Cambridge Scholarship',
    organization: 'Gates Foundation', amount: 'Full funding',
    match_score: 82, deadline: '2026-01-08', status: 'saved',
    tags: ['Postgraduate', 'UK', 'Research'], destinations: ['UK'],
    description: 'Full-cost scholarship for outstanding applicants to Cambridge.',
    is_new: false, level: 'Postgraduate', category: 'merit', destination: 'UK',
  },
  {
    id: 's5', name: 'MTN Science & Technology Scholarship',
    organization: 'MTN Foundation', amount: '₦500,000 / yr',
    match_score: 79, deadline: '2025-12-20', status: 'saved',
    tags: ['Undergraduate', 'Nigeria', 'STEM'], destinations: ['Nigeria'],
    description: 'Supporting Nigerian undergraduates in STEM fields.',
    is_new: true, level: 'Undergraduate', category: 'local', destination: 'Nigeria',
  },
  {
    id: 's6', name: 'Commonwealth Shared Scholarship',
    organization: 'Commonwealth', amount: 'Full funding',
    match_score: 74, deadline: '2026-02-14', status: 'interview',
    tags: ['Masters', 'UK', 'Development'], destinations: ['UK'],
    description: 'For students from low and middle income Commonwealth countries.',
    is_new: false, level: 'Masters', category: 'abroad', destination: 'UK',
  },
  {
    id: 's7', name: 'NNPC/SNEPCo National Merit Award',
    organization: 'NNPC', amount: 'Full funding',
    match_score: 88, deadline: '2025-12-10', status: 'interview',
    tags: ['Undergraduate', 'Nigeria', 'Engineering'], destinations: ['Nigeria'],
    description: 'Merit-based award for Nigerian engineering students.',
    is_new: false, level: 'Undergraduate', category: 'local', destination: 'Nigeria',
    interview: 'Dec 10',
  },
  {
    id: 's8', name: 'Shell Nigeria University Scholarship',
    organization: 'Shell Nigeria', amount: '₦800,000 / yr',
    match_score: 85, deadline: '2025-10-12', status: 'won',
    tags: ['Undergraduate', 'Nigeria', 'STEM'], destinations: ['Nigeria'],
    description: 'Supporting talented Nigerian students in STEM disciplines.',
    is_new: false, level: 'Undergraduate', category: 'local', destination: 'Nigeria',
    awarded: 'Oct 12',
  },
]

// Tracker columns are derived from `status`. Mapping: saved → Not applied,
// applied → Applied, interview → Interview, won/lost → Result.
export function statusToCol(status) {
  if (status === 'won' || status === 'lost') return 'result'
  return status || 'saved'
}

export const MOCK_PROFILE = {
  name: 'Temi Adeyemi',
  email: 'temi@scholarmatch.ai',
  university: 'University of Lagos',
  degree: 'B.Eng Computer Engineering',
  level: '300 Level',
  gpa: '4.3',
  gpaScale: '5.0',
  field: 'Computer Engineering',
  nationality: 'Nigerian',
  goal: 'Study abroad for postgrad',
  destinations: ['UK', 'Germany'],
  languages: 'English, Yoruba',
  extras: 'Technical Lead, UNILAG Innovation Club. Mentored 12 junior students. Built NFC attendance system deployed across 3 departments.',
  projects: 'NFC Smart Attendance System (deployed across 3 departments). Budget Tracker App (200+ active users).',
  needBased: false,
  newMatches: true,
  deadlines: true,
  weeklyDigest: false,
  completion_pct: 87,
}

export function getMockScholarship(id) {
  return MOCK_SCHOLARSHIPS.find((s) => s.id === id) || MOCK_SCHOLARSHIPS[0]
}

// Build a realistic personal-statement skeleton for any scholarship. Used by
// the Application Assistant when the live Groq stream isn't available.
export function buildMockPS(scholarship) {
  const org = scholarship.organization || scholarship.org || 'this foundation'
  return `Growing up in Lagos, Nigeria, I witnessed firsthand the transformative power of education — and equally, the barriers that prevent talented young Africans from accessing it. As a third-year Computer Engineering student at the University of Lagos with a GPA of 4.3/5.0, I have dedicated myself not only to academic excellence but to building solutions that address real challenges facing my community. The ${scholarship.name} represents the kind of opportunity that takes promising students and turns them into the leaders Africa needs.

My studies have equipped me with a strong foundation in software engineering, embedded systems, and data structures. Beyond coursework, I have pursued independent projects including a smart campus attendance system using NFC technology, which demonstrated my ability to bridge hardware and software to solve practical problems. This project earned recognition at the UNILAG Engineering Exhibition 2024 and is now deployed across three departments on campus.

I serve as the technical lead of my faculty's innovation club, where I have mentored 12 junior students in programming fundamentals. I believe that transformational leadership — one of ${org}'s core values — is not a title but a practice I have been building every day. The leadership philosophy I am developing draws directly from the values that ${org} champions.

Upon graduation, I intend to build technology infrastructure that empowers African creators and entrepreneurs. ${org}'s commitment to developing leaders who give back to their communities aligns directly with the values I carry — and the future I am working to build.`
}

export function buildMockCV() {
  return `EDUCATION
B.Eng Computer Engineering — University of Lagos, 2022–present
GPA: 4.3 / 5.0 · Expected graduation: July 2026
Relevant courses: Data Structures, Embedded Systems, Software Engineering, AI & Machine Learning

PROJECTS
NFC Smart Attendance System — Built a campus-wide attendance solution using NFC cards and a React dashboard. Deployed across 3 departments. Reduced manual errors by 80%.
Budget Tracker App — Full-stack web app with Node.js backend and PostgreSQL. 200+ active users among UNILAG students.

LEADERSHIP
Technical Lead, UNILAG Faculty Innovation Club — 2023–present
Mentored 12 junior students in programming. Organised 3 hackathons.

SKILLS
Python · JavaScript · React · Node.js · PostgreSQL · C++ · NFC/RFID · Git · Docker`
}

export function buildMockCover(scholarship) {
  const org = scholarship.organization || scholarship.org || 'this foundation'
  return `Dear ${org} Committee,

I am writing to express my strong interest in the ${scholarship.name}. As a Computer Engineering student at the University of Lagos with a deep commitment to transformational leadership and community impact, I believe this program represents the perfect environment for me to grow into the leader Africa needs.

My academic record — a GPA of 4.3/5.0 — reflects my dedication. But beyond grades, I have spent the last two years building technology that solves real problems for my peers and community. I look forward to bringing that same drive to your network.

Sincerely,
Temi Adeyemi`
}
