// Single source of mock data for the demo. Every page reads from here when
// running without a backend. Keep in sync with the schema in supabase/schema.sql
// — these objects mirror the row shapes you'd get from Supabase.

// All deadlines are pinned to 2026 so the demo doesn't show "Closed" pills.
// Eligibility / requirements are used by the View Requirements panel and the
// "Why am I a fit?" comparison.
export const MOCK_SCHOLARSHIPS = [
  {
    id: 's1', name: 'Scholars Program — African Universities',
    organization: 'MasterCard Foundation', amount: 'Full funding',
    match_score: 98, deadline: '2026-12-15', status: 'saved',
    tags: ['Undergraduate', 'Africa', 'STEM'], destinations: ['Africa'],
    description: 'A flagship programme supporting talented African students with demonstrated financial need across leading universities on the continent.',
    funded_by: 'MasterCard Foundation', funding_type: 'Full tuition, fees, stipend',
    eligible_nationalities: 'All African nationalities', level: 'Undergraduate', eligible_fields: 'STEM, Public Health, Climate',
    gpa_min: '3.5 / 5.0', need_based: true, official_url: 'https://mastercardfdn.org',
    is_new: true, category: 'merit', destination: 'Africa', featured: true,
  },
  {
    id: 's2', name: 'Chevening Scholarship 2026/27',
    organization: 'UK Government', amount: '£18,000 / yr',
    match_score: 91, deadline: '2026-11-05', status: 'applied',
    tags: ['Postgraduate', 'UK', 'Leadership'], destinations: ['UK'],
    description: "The UK government's global scholarship programme for emerging leaders who'll return home and drive change.",
    funded_by: 'UK Foreign, Commonwealth & Development Office', funding_type: 'Full tuition + stipend',
    eligible_nationalities: '160+ Chevening-eligible countries', level: 'Postgraduate', eligible_fields: 'All fields',
    gpa_min: 'Second class upper (2:1) or equivalent', need_based: false, official_url: 'https://chevening.org',
    is_new: true, category: 'abroad', destination: 'UK', submitted: 'Nov 3',
  },
  {
    id: 's3', name: 'Development-Related Postgraduate Courses',
    organization: 'DAAD Germany', amount: '€934 / month',
    match_score: 87, deadline: '2026-10-31', status: 'applied',
    tags: ['Postgraduate', 'Germany', 'Engineering'], destinations: ['Germany'],
    description: 'A DAAD programme funding postgraduates from developing countries in development-related fields at German universities.',
    funded_by: 'German Academic Exchange Service (DAAD)', funding_type: 'Stipend, tuition, travel',
    eligible_nationalities: 'Developing countries (DAC list)', level: 'Postgraduate', eligible_fields: 'Engineering, Public Policy, Health, Agriculture',
    gpa_min: 'Above-average Bachelors degree', need_based: false, official_url: 'https://daad.de',
    is_new: false, category: 'abroad', destination: 'Germany', submitted: 'Oct 28',
  },
  {
    id: 's4', name: 'Gates Cambridge Scholarship',
    organization: 'Gates Foundation', amount: 'Full funding',
    match_score: 82, deadline: '2026-12-08', status: 'saved',
    tags: ['Postgraduate', 'UK', 'Research'], destinations: ['UK'],
    description: 'A full-cost scholarship for outstanding international applicants pursuing graduate study at the University of Cambridge.',
    funded_by: 'Bill & Melinda Gates Foundation', funding_type: 'Full tuition, stipend, travel',
    eligible_nationalities: 'All non-UK nationalities', level: 'Postgraduate', eligible_fields: 'All fields',
    gpa_min: 'First class honours or equivalent', need_based: false, official_url: 'https://gatescambridge.org',
    is_new: false, category: 'merit', destination: 'UK',
  },
  {
    id: 's5', name: 'MTN Science & Technology Scholarship',
    organization: 'MTN Foundation', amount: '₦500,000 / yr',
    match_score: 79, deadline: '2026-12-20', status: 'saved',
    tags: ['Undergraduate', 'Nigeria', 'STEM'], destinations: ['Nigeria'],
    description: 'Supporting Nigerian undergraduates in STEM fields with annual tuition assistance and mentorship.',
    funded_by: 'MTN Foundation Nigeria', funding_type: 'Tuition assistance',
    eligible_nationalities: 'Nigerian', level: 'Undergraduate', eligible_fields: 'Science, Engineering, Technology',
    gpa_min: '4.0 / 5.0 (or 3.0 / 4.0)', need_based: true, official_url: 'https://mtn.com/foundation',
    is_new: true, category: 'local', destination: 'Nigeria',
  },
  {
    id: 's6', name: 'Commonwealth Shared Scholarship',
    organization: 'Commonwealth', amount: 'Full funding',
    match_score: 74, deadline: '2026-02-14', status: 'interview',
    tags: ['Masters', 'UK', 'Development'], destinations: ['UK'],
    description: 'For students from low- and middle-income Commonwealth countries pursuing one-year masters in the UK.',
    funded_by: 'Commonwealth Scholarship Commission', funding_type: 'Full tuition + stipend',
    eligible_nationalities: 'Commonwealth (low & middle income)', level: 'Masters', eligible_fields: 'Priority development areas',
    gpa_min: 'Second class upper or equivalent', need_based: true, official_url: 'https://cscuk.fcdo.gov.uk',
    is_new: false, category: 'abroad', destination: 'UK',
  },
  {
    id: 's7', name: 'NNPC/SNEPCo National Merit Award',
    organization: 'NNPC', amount: 'Full funding',
    match_score: 88, deadline: '2026-12-10', status: 'interview',
    tags: ['Undergraduate', 'Nigeria', 'Engineering'], destinations: ['Nigeria'],
    description: 'A merit-based award for Nigerian engineering undergraduates that includes full sponsorship and an internship pipeline at NNPC.',
    funded_by: 'NNPC/SNEPCo', funding_type: 'Full sponsorship + stipend',
    eligible_nationalities: 'Nigerian', level: 'Undergraduate', eligible_fields: 'Engineering, Geosciences',
    gpa_min: 'Min CGPA 4.0/5.0', need_based: false, official_url: 'https://shell.com.ng',
    is_new: false, category: 'local', destination: 'Nigeria', interview: 'Dec 10',
  },
  {
    id: 's8', name: 'Shell Nigeria University Scholarship',
    organization: 'Shell Nigeria', amount: '₦800,000 / yr',
    match_score: 85, deadline: '2026-10-12', status: 'won',
    tags: ['Undergraduate', 'Nigeria', 'STEM'], destinations: ['Nigeria'],
    description: 'Annual tuition support for talented Nigerian undergraduates in STEM disciplines, plus a Shell internship.',
    funded_by: 'Shell Nigeria', funding_type: 'Tuition + internship',
    eligible_nationalities: 'Nigerian', level: 'Undergraduate', eligible_fields: 'STEM',
    gpa_min: 'CGPA 4.0/5.0', need_based: false, official_url: 'https://shell.com.ng',
    is_new: false, category: 'local', destination: 'Nigeria', awarded: 'Oct 12',
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

// Compare the user's profile against a scholarship's requirements and produce
// a list of pros (✓) and cautions (⚠) the panel renders. Each item has
// { ok, text }.
export function fitReasons(profile, scholarship) {
  const out = []
  const nat = (profile?.nationality || '').toLowerCase()
  const dests = (profile?.destinations || []).map((d) => String(d).toLowerCase())
  const gpa = parseFloat(profile?.gpa) || null
  const scale = parseFloat(profile?.gpaScale) || 5
  const ratio = gpa ? gpa / scale : null
  const field = (profile?.field || profile?.degree || '').toLowerCase()
  const tags = (scholarship.tags || []).map((t) => t.toLowerCase())
  const level = (scholarship.level || '').toLowerCase()
  const goal = (profile?.goal || '').toLowerCase()

  // Nationality
  const elig = (scholarship.eligible_nationalities || '').toLowerCase()
  if (nat && (elig.includes(nat) || elig.includes('african') && /nigerian|ghanaian|kenyan|south african|african/.test(nat) || elig.includes('all'))) {
    out.push({ ok: true, text: `Your nationality (${profile.nationality}) is eligible for this scholarship` })
  } else if (nat) {
    out.push({ ok: false, text: `Confirm eligibility — sponsors specify "${scholarship.eligible_nationalities}"` })
  }

  // GPA
  if (ratio != null) {
    if (ratio >= 0.75) out.push({ ok: true, text: `Your GPA (${profile.gpa}/${scale}) meets or exceeds the requirement` })
    else if (ratio >= 0.65) out.push({ ok: false, text: `Your GPA (${profile.gpa}/${scale}) is close — a strong personal statement helps` })
    else out.push({ ok: false, text: `Your GPA (${profile.gpa}/${scale}) is below the typical bar — focus on impact stories` })
  }

  // Field
  if (field) {
    const matchedTag = tags.find((t) => field.includes(t) || t.includes(field))
    if (matchedTag) out.push({ ok: true, text: `Your field (${profile.field || profile.degree}) matches their ${matchedTag.toUpperCase()} focus` })
    else if (tags.includes('all fields') || (scholarship.eligible_fields || '').toLowerCase().includes('all')) out.push({ ok: true, text: 'Your field is eligible — this scholarship accepts all fields' })
  }

  // Destination
  if (dests.length && scholarship.destination) {
    const dest = scholarship.destination.toLowerCase()
    if (dests.includes(dest) || dests.includes('open to anywhere')) {
      out.push({ ok: true, text: `Your destination preference (${scholarship.destination}) aligns with this opportunity` })
    } else {
      out.push({ ok: false, text: `This scholarship is for study in ${scholarship.destination} — not on your destination list yet` })
    }
  }

  // Leadership
  if ((profile?.extras || '').length > 20) {
    out.push({ ok: true, text: 'Your leadership and extracurricular history strengthens your application' })
  }

  // Level vs goal
  if (level.includes('postgrad') && goal.includes('undergrad')) {
    out.push({ ok: false, text: 'This scholarship prefers postgraduate applicants — you may want to apply in your final year' })
  } else if (level.includes('undergrad') && goal.includes('postgrad')) {
    out.push({ ok: false, text: 'This is an undergraduate award — only useful if you want to fund your current degree' })
  }

  // Need-based
  if (scholarship.need_based && profile?.needBased === false) {
    out.push({ ok: false, text: 'This sponsor weights demonstrated financial need — you opted out of need-based matches' })
  }

  return out
}

export const APPLICATION_CHECKLIST = [
  'Personal statement (500–650 words)',
  'CV / Resume',
  'Academic transcript',
  'Two recommendation letters',
  'Passport copy',
]

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
