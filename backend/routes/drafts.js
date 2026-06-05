import { Router } from 'express'
import Groq from 'groq-sdk'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const MODEL = 'llama-3.3-70b-versatile'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are Scholar, the writing AI inside ScholarMatch — an app
that helps African students win international scholarships. You draft personal
statements, CVs, and cover letters in the student's own voice.

Rules:
- Warm and specific. Never clinical, never robotic.
- Always use the student's real name and concrete details from their profile.
- Reference the scholarship's stated values explicitly.
- No "As an AI...", no "Certainly!", no filler.
- Output plain prose only — no markdown, no headings unless asked.`

const DOC_PROMPTS = {
  ps: ({ profile, scholarship }) => `Write a personal statement for the ${scholarship.name} from ${scholarship.organisation}.

Student profile:
- Name: ${profile.name || 'the applicant'}
- Nationality: ${profile.nationality || 'not specified'}
- Degree: ${profile.degree || ''} at ${profile.university || ''}, level ${profile.level || ''}
- GPA: ${profile.gpa || ''} / ${profile.gpa_scale || 5}
- Field of focus: ${profile.field || ''}
- Goal: ${profile.goal || ''}
- Preferred destinations: ${(profile.destinations || []).join(', ')}
- Extracurriculars & leadership: ${profile.extras || ''}
- Languages: ${(profile.languages || []).join(', ')}

Scholarship context:
- ${scholarship.description || ''}
- Requirements: ${scholarship.requirements || ''}
- Tags: ${(scholarship.tags || []).join(', ')}

Structure: Opening hook (personal, specific), Academic background, Leadership &
impact, Goals & vision. 500–650 words. Anchor the opening in a concrete image
from the student's background.`,

  cv: ({ profile }) => `Draft a one-page CV in plain text for ${profile.name || 'the applicant'}.

Profile:
- Degree: ${profile.degree || ''} at ${profile.university || ''} (level ${profile.level || ''})
- GPA: ${profile.gpa || ''} / ${profile.gpa_scale || 5}
- Focus: ${profile.field || ''}
- Extracurriculars: ${profile.extras || ''}
- Languages: ${(profile.languages || []).join(', ')}

Sections: Education, Projects (with impact metrics where plausible), Leadership
& activities, Technical skills. Use short bullets. No markdown.`,

  cover_letter: ({ profile, scholarship }) => `Write a 200–300 word cover letter for the ${scholarship.name}
from ${profile.name || 'the applicant'} (Computer Engineering, ${profile.university || ''}).

Three paragraphs: who you are + why this scholarship specifically, what you bring
(academic + leadership evidence), what you'll do with it (forward-looking, ties
to ${scholarship.organisation}'s mission). Sign with the student's name.`,

  refine: ({ instruction, selection }) => `Refine the following passage according to this
instruction: "${instruction}".

Passage:
"""
${selection}
"""

Return only the revised passage. No preamble.`,
}

function buildMessages(type, ctx) {
  const builder = DOC_PROMPTS[type]
  if (!builder) throw new Error(`Unknown draft type: ${type}`)
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: builder(ctx) },
  ]
}

// POST /api/drafts/generate
// Body: { type, scholarshipId, instruction?, selection? }
// Streams text/event-stream with `data: <chunk>` lines and a final `event: done`.
router.post('/generate', requireAuth, async (req, res) => {
  const { userId, supabase } = req
  const { type, scholarshipId, instruction, selection } = req.body || {}

  if (!type || (type !== 'refine' && !scholarshipId)) {
    return res.status(400).json({ error: 'Missing type or scholarshipId' })
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
  }

  // Fetch context up-front so any error fails before we open the SSE channel.
  let profile = null
  let scholarship = null
  if (type !== 'refine') {
    const [profRes, schRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('scholarships').select('*').eq('id', scholarshipId).maybeSingle(),
    ])
    profile = profRes.data
    scholarship = schRes.data
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' })
  }

  const messages = buildMessages(type, { profile, scholarship, instruction, selection })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  let fullText = ''
  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: type === 'refine' ? 0.5 : 0.7,
      max_tokens: 1400,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content
      if (!delta) continue
      fullText += delta
      // SSE encoding: newlines in payload break the protocol, so escape them.
      const encoded = delta.replace(/\n/g, '\\n')
      res.write(`data: ${encoded}\n\n`)
    }

    // Persist the generated draft on the application row so it survives reloads.
    if (type !== 'refine' && scholarshipId) {
      const { data: app } = await supabase
        .from('applications')
        .select('id, documents')
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId)
        .maybeSingle()

      const documents = { ...(app?.documents || {}), [type]: fullText }
      if (app) {
        await supabase.from('applications').update({ documents }).eq('id', app.id)
      } else {
        await supabase.from('applications').upsert({
          user_id: userId,
          scholarship_id: scholarshipId,
          status: 'saved',
          documents,
        }, { onConflict: 'user_id,scholarship_id' })
      }
    }

    res.write('event: done\ndata: {}\n\n')
    res.end()
  } catch (err) {
    console.error('drafts/generate error:', err)
    res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`)
    res.end()
  }
})

export default router
