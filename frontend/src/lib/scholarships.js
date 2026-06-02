// Static seed data for the demo. In production, replace with a Supabase query:
//   const { data } = await supabase.from('scholarships').select('*')

export const SCHOLARSHIPS = [
  {
    id: 'mcf',
    org: 'MasterCard Foundation',
    name: 'Scholars Program — African Universities',
    amount: 'Full funding',
    match: 98,
    category: 'merit',
    type: 'Need + merit',
    level: 'Undergraduate',
    destination: 'Africa',
    tags: ['Undergraduate', 'Africa', 'STEM', 'Need + merit'],
    deadline: '2026-12-15',
    featured: true,
  },
  {
    id: 'chevening',
    org: 'UK Government',
    name: 'Chevening Scholarship 2025/26',
    amount: '£18,000 / yr',
    match: 91,
    category: 'abroad',
    type: 'Leadership',
    level: 'Postgraduate',
    destination: 'UK',
    tags: ['Postgraduate', 'UK', 'Leadership'],
    deadline: '2026-11-05',
  },
  {
    id: 'daad',
    org: 'DAAD Germany',
    name: 'Development-Related Postgraduate Courses',
    amount: '€934 / month',
    match: 87,
    category: 'abroad',
    type: 'Field-specific',
    level: 'Postgraduate',
    destination: 'Germany',
    tags: ['Postgraduate', 'Germany', 'Engineering'],
    deadline: '2026-10-31',
  },
  {
    id: 'gates',
    org: 'Gates Foundation',
    name: 'Gates Cambridge Scholarship',
    amount: 'Full funding',
    match: 82,
    category: 'merit',
    type: 'Research',
    level: 'Postgraduate',
    destination: 'UK',
    tags: ['Postgraduate', 'UK', 'Research'],
    deadline: '2026-01-08',
  },
  {
    id: 'mtn',
    org: 'MTN Foundation',
    name: 'MTN Science & Technology Scholarship',
    amount: '₦500,000 / yr',
    match: 79,
    category: 'local',
    type: 'STEM',
    level: 'Undergraduate',
    destination: 'Nigeria',
    tags: ['Undergraduate', 'Nigeria', 'STEM'],
    deadline: '2026-12-20',
    fresh: true,
  },
  {
    id: 'commonwealth',
    org: 'Commonwealth',
    name: 'Commonwealth Shared Scholarship',
    amount: 'Full funding',
    match: 74,
    category: 'abroad',
    type: 'Development',
    level: 'Masters',
    destination: 'UK',
    tags: ['Masters', 'UK', 'Development'],
    deadline: '2026-02-14',
  },
  {
    id: 'shell',
    org: 'Shell Nigeria',
    name: 'Shell Nigeria University Scholarship',
    amount: '₦800,000 / yr',
    match: 76,
    category: 'local',
    type: 'STEM',
    level: 'Undergraduate',
    destination: 'Nigeria',
    tags: ['Undergraduate', 'Nigeria', 'STEM'],
    deadline: '2026-09-30',
  },
  {
    id: 'nnpc',
    org: 'NNPC',
    name: 'NNPC / SNEPCo National Merit Award',
    amount: 'Full funding',
    match: 88,
    category: 'local',
    type: 'Engineering',
    level: 'Undergraduate',
    destination: 'Nigeria',
    tags: ['Undergraduate', 'Nigeria', 'Engineering'],
    deadline: '2026-12-10',
    fresh: true,
  },
]

export function getScholarship(id) {
  return SCHOLARSHIPS.find((s) => s.id === id)
}

export function daysUntil(deadlineISO) {
  const d = new Date(deadlineISO)
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function matchTier(match) {
  if (match >= 90) return 'high'
  if (match >= 80) return 'med'
  return 'good'
}

export function deadlineTier(days) {
  if (days < 0) return 'past'
  if (days <= 30) return 'urgent'
  if (days <= 60) return 'warn'
  return 'ok'
}

export function formatDeadline(deadlineISO) {
  const days = daysUntil(deadlineISO)
  const d = new Date(deadlineISO)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const date = d.getDate()
  const year = d.getFullYear()
  if (days < 0) return 'Deadline passed'
  if (days <= 60) return `${month} ${date} · ${days} day${days === 1 ? '' : 's'} left`
  return `${month} ${date}, ${year}`
}
