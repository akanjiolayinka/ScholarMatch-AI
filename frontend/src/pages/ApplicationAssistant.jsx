import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppNav from '../components/AppNav'
import { getScholarship, daysUntil } from '../lib/scholarships'
import {
  QUICK_ACTIONS,
  SCHOLAR_RESPONSES,
  buildPersonalStatement,
  buildCV,
  buildCoverLetter,
  wordCount,
} from '../lib/drafts'
import { streamDraft } from '../lib/draftsApi'
import { useSession } from '../lib/useSession'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import './ApplicationAssistant.css'

// Map the editor tab key to the backend `type` param. The server persists
// drafts under these same keys on applications.documents.
const TYPE_BY_TAB = { ps: 'ps', cv: 'cv', cl: 'cover_letter' }

const TABS = [
  { key: 'ps', label: 'Personal statement', icon: 'ti-pencil', rec: '500–650 words' },
  { key: 'cv', label: 'CV / Resume', icon: 'ti-id', rec: '1–2 pages' },
  { key: 'cl', label: 'Cover letter', icon: 'ti-mail', rec: '200–300 words' },
  { key: 'docs', label: 'My docs', icon: 'ti-folder', rec: '' },
]

function orgInitials(org) {
  return org.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function ApplicationAssistant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSession()
  const scholarship = getScholarship(id)
  const [tab, setTab] = useState('ps')
  const [doneTabs, setDoneTabs] = useState(() => new Set(['cv']))
  const [chat, setChat] = useState(() => [
    { role: 'ai', text: `I've drafted your personal statement for the ${scholarship?.name || 'scholarship'} based on your profile. It hits their three core themes: academic excellence, leadership, and giving back.` },
    { role: 'ai', text: "The highlighted sections are places I'd recommend you personalise further — add a specific story or detail only you can tell. That's what wins committees over." },
  ])
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [docs, setDocs] = useState([])
  // Streamed documents, keyed by tab. When present, the editor renders these
  // instead of the static seed sections.
  const [streamed, setStreamed] = useState({}) // { ps: string, cv: string, cover_letter: string }
  const [generating, setGenerating] = useState(false)
  const cancelStreamRef = useRef(null)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const rotateRef = useRef(0)

  const days = scholarship ? daysUntil(scholarship.deadline) : 0

  const sections = useMemo(() => {
    if (!scholarship) return []
    if (tab === 'ps') return buildPersonalStatement(scholarship)
    if (tab === 'cv') return buildCV(scholarship)
    if (tab === 'cl') return buildCoverLetter(scholarship)
    return []
  }, [tab, scholarship])

  const wc = useMemo(() => wordCount(sections), [sections])

  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const id = window.setTimeout(() => { el.scrollTop = el.scrollHeight }, 60)
    return () => window.clearTimeout(id)
  }, [chat, typing])

  function autoResize(el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }

  function sendMessage(text) {
    if (!text.trim() || typing) return
    setChat((c) => [...c, { role: 'user', text }])
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      const reply = SCHOLAR_RESPONSES[rotateRef.current % SCHOLAR_RESPONSES.length]
      rotateRef.current += 1
      setChat((c) => [...c, { role: 'ai', text: reply }])
    }, 1300)
  }

  function handleSend() {
    const v = draft.trim()
    if (!v) return
    setDraft('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    sendMessage(v)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function generate() {
    const type = TYPE_BY_TAB[tab]
    if (!type || !scholarship) return
    if (!isSupabaseConfigured) {
      // No backend wired in demo mode — show a friendly note in the chat.
      sendMessage('Live generation needs the API + Groq key configured. Showing the static draft.')
      return
    }
    setGenerating(true)
    setStreamed((s) => ({ ...s, [type]: '' }))
    cancelStreamRef.current?.()
    streamDraft(
      { type, scholarshipId: scholarship.id },
      {
        onChunk: (_chunk, full) => setStreamed((s) => ({ ...s, [type]: full })),
        onDone: () => setGenerating(false),
        onError: (err) => {
          setGenerating(false)
          setChat((c) => [...c, { role: 'ai', text: `Couldn't reach the writing model: ${err.message}` }])
        },
      },
    ).then((cancel) => { cancelStreamRef.current = cancel })
  }

  function refineSelection(instruction) {
    if (!isSupabaseConfigured) {
      sendMessage(instruction)
      return
    }
    const type = TYPE_BY_TAB[tab]
    const selection = streamed[type] || sectionsToPlain(sections)
    setChat((c) => [...c, { role: 'user', text: instruction }])
    setTyping(true)
    let buf = ''
    streamDraft(
      { type: 'refine', scholarshipId: scholarship.id, instruction, selection },
      {
        onChunk: (chunk) => { buf += chunk },
        onDone: (full) => {
          setTyping(false)
          setStreamed((s) => ({ ...s, [type]: full || buf }))
          setChat((c) => [...c, { role: 'ai', text: 'Updated. The new version is in the editor.' }])
        },
        onError: (err) => {
          setTyping(false)
          setChat((c) => [...c, { role: 'ai', text: `Refine failed: ${err.message}` }])
        },
      },
    )
  }

  // Cancel any in-flight stream on unmount or tab change.
  useEffect(() => () => cancelStreamRef.current?.(), [])
  useEffect(() => () => cancelStreamRef.current?.(), [tab])

  // Load persisted documents from previous sessions on first mount.
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user?.id || !isSupabaseConfigured || !scholarship) return
      const { data } = await supabase
        .from('applications')
        .select('documents')
        .eq('user_id', user.id)
        .eq('scholarship_id', scholarship.id)
        .maybeSingle()
      if (cancelled || !data?.documents) return
      setStreamed(data.documents)
    }
    load()
    return () => { cancelled = true }
  }, [user, scholarship])

  function markReady() {
    setDoneTabs((s) => new Set([...s, tab]))
  }

  function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    const next = files.map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: f.size,
      type: guessType(f.name),
    }))
    setDocs((d) => [...d, ...next])
  }

  if (!scholarship) {
    return (
      <div className="aa-root">
        <AppNav />
        <div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Scholarship not found</div>
          <Link to="/dashboard" style={{ color: '#185FA5' }}>← Back to matches</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="aa-root">
      <AppNav />

      <div className="aa-breadcrumb">
        <button onClick={() => navigate('/dashboard')}>Matches</button>
        <i className="ti ti-chevron-right" style={{ fontSize: 11 }} aria-hidden="true" />
        <button onClick={() => navigate('/dashboard')}>{scholarship.org}</button>
        <i className="ti ti-chevron-right" style={{ fontSize: 11 }} aria-hidden="true" />
        <span className="cur">Application Assistant</span>
      </div>

      <div className="aa-body">
        <section className="aa-left">
          <div className="aa-scholar-banner">
            <div className="aa-scholar-info">
              <div className="aa-scholar-logo">{orgInitials(scholarship.org)}</div>
              <div>
                <div className="aa-scholar-name">{scholarship.name}</div>
                <div className="aa-scholar-sub">
                  <span>{scholarship.destination}</span>
                  <span className="aa-pill match">{scholarship.match}% match</span>
                  <span className="aa-pill deadline">
                    <i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" /> {days >= 0 ? `${days} days left` : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
            <button className="aa-btn-outline" style={{ fontSize: 11 }}>
              <i className="ti ti-external-link" style={{ fontSize: 12 }} aria-hidden="true" /> View requirements
            </button>
          </div>

          <div className="aa-doc-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`aa-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
                role="tab"
                aria-selected={tab === t.key}
              >
                <i className={`ti ${t.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
                {t.label}
                {doneTabs.has(t.key) && (
                  <span className="aa-tab-done"><i className="ti ti-check" style={{ fontSize: 9, color: 'var(--color-text-success)' }} aria-hidden="true" /></span>
                )}
              </button>
            ))}
          </div>

          {tab === 'docs' ? (
            <DocVault docs={docs} fileRef={fileRef} onPick={() => fileRef.current?.click()} onFiles={handleFiles} />
          ) : (
            <div className="aa-editor-wrap">
              <div className="aa-editor-toolbar" role="toolbar" aria-label="Formatting">
                <button className="aa-tool-btn" style={{ fontWeight: 700 }} title="Bold">B</button>
                <button className="aa-tool-btn" style={{ fontStyle: 'italic' }} title="Italic">I</button>
                <button className="aa-tool-btn" style={{ textDecoration: 'underline' }} title="Underline">U</button>
                <div className="aa-tool-sep" />
                <button className="aa-tool-btn" title="Bulleted list"><i className="ti ti-list" style={{ fontSize: 12 }} aria-hidden="true" /></button>
                <button className="aa-tool-btn" title="Numbered list"><i className="ti ti-list-numbers" style={{ fontSize: 12 }} aria-hidden="true" /></button>
                <div className="aa-tool-sep" />
                <button className="aa-tool-btn ai" onClick={() => refineSelection('Make this section sharper and more vivid')}>
                  <i className="ti ti-sparkles" style={{ fontSize: 11 }} aria-hidden="true" /> AI improve
                </button>
                <button className="aa-tool-btn" onClick={() => refineSelection('Rephrase this passage while keeping the meaning')}>
                  <i className="ti ti-arrows-left-right" style={{ fontSize: 11 }} aria-hidden="true" /> Rephrase
                </button>
                <button className="aa-tool-btn ai" onClick={generate} disabled={generating}>
                  <i className="ti ti-bolt" style={{ fontSize: 11 }} aria-hidden="true" /> {generating ? 'Generating…' : 'Regenerate'}
                </button>
                <div className="aa-tool-sep" />
                <button className="aa-tool-btn" title="Copy"><i className="ti ti-copy" style={{ fontSize: 12 }} aria-hidden="true" /></button>
                <button className="aa-tool-btn" title="Download"><i className="ti ti-download" style={{ fontSize: 12 }} aria-hidden="true" /></button>
              </div>

              <div className="aa-doc">
                {(() => {
                  const streamedText = streamed[TYPE_BY_TAB[tab]]
                  if (streamedText) {
                    return (
                      <div className="aa-doc-section">
                        <div className="aa-doc-section-title">
                          {TABS.find((t) => t.key === tab)?.label}
                          <span className="aa-ai-tag">AI {generating ? 'drafting…' : 'drafted'}</span>
                        </div>
                        {streamedText.split(/\n\n+/).map((para, i) => (
                          <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{para}{generating && i === streamedText.split(/\n\n+/).length - 1 ? '▍' : ''}</p>
                        ))}
                      </div>
                    )
                  }
                  return (
                    <>
                      {sections.map((sec) => (
                        <div className="aa-doc-section" key={sec.title}>
                          <div className="aa-doc-section-title">
                            {sec.title}
                            {sec.ai && <span className="aa-ai-tag">AI drafted</span>}
                          </div>
                          {sec.paragraphs.map((p, i) => <Paragraph key={i} p={p} />)}
                        </div>
                      ))}
                      {tab === 'ps' && (
                        <div className="aa-highlight-hint">
                          <i className="ti ti-bulb" style={{ fontSize: 14 }} aria-hidden="true" />
                          Scholar suggests personalising the highlighted sections — add a specific story only you can tell.
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              <div className="aa-editor-footer">
                <div className="aa-word-count">
                  {wc.words} words · {wc.chars.toLocaleString()} characters
                  {tab === 'ps' && ' · Recommended: 500–650 words'}
                  {tab === 'cv' && ' · CV ready'}
                  {tab === 'cl' && ' · Recommended: 200–300 words'}
                </div>
                <div className="aa-footer-actions">
                  <button className="aa-btn-outline"><i className="ti ti-device-floppy" style={{ fontSize: 13 }} aria-hidden="true" /> Save draft</button>
                  <button className="aa-btn-outline"><i className="ti ti-file-type-pdf" style={{ fontSize: 13 }} aria-hidden="true" /> Export PDF</button>
                  <button className="aa-btn-outline"><i className="ti ti-file-type-doc" style={{ fontSize: 13 }} aria-hidden="true" /> Export Word</button>
                  <button className="aa-btn-primary" onClick={() => { markReady(); navigate('/tracker') }}>
                    <i className="ti ti-check" style={{ fontSize: 13 }} aria-hidden="true" /> Mark as ready
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="aa-right">
          <div className="aa-ai-header">
            <div className="aa-ai-title">
              <span className="aa-ai-dot" />
              Scholar — Application AI
            </div>
            <button className="aa-btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}>
              <i className="ti ti-refresh" style={{ fontSize: 11 }} aria-hidden="true" /> Regenerate
            </button>
          </div>

          <div className="aa-chat" ref={chatRef}>
            {chat.map((m, i) => (
              <div key={i} className={`aa-msg ${m.role}`}>
                {m.role === 'ai'
                  ? <div className="aa-ai-av">S</div>
                  : <div className="aa-user-av"><i className="ti ti-user" style={{ fontSize: 12 }} aria-hidden="true" /></div>}
                <div className={`aa-bubble ${m.role}`}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="aa-msg">
                <div className="aa-ai-av">S</div>
                <div className="aa-typing" aria-label="Scholar is typing">
                  <div className="aa-dot" /><div className="aa-dot" /><div className="aa-dot" />
                </div>
              </div>
            )}
          </div>

          <div className="aa-quick-actions">
            <div className="aa-qa-label">Quick actions</div>
            <div className="aa-qa-chips">
              {QUICK_ACTIONS.map((q) => (
                <button key={q} className="aa-qa-chip" onClick={() => isSupabaseConfigured ? refineSelection(q) : sendMessage(q)}>{q}</button>
              ))}
            </div>
          </div>

          <div className="aa-input-row">
            <textarea
              ref={inputRef}
              className="aa-input"
              rows={1}
              placeholder="Ask Scholar to refine anything..."
              value={draft}
              onChange={(e) => { setDraft(e.target.value); autoResize(e.target) }}
              onKeyDown={handleKey}
              aria-label="Message Scholar"
            />
            <button className="aa-send" onClick={handleSend} disabled={!draft.trim() || typing} aria-label="Send">
              <i className="ti ti-send" style={{ fontSize: 14, color: '#F5A623' }} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function sectionsToPlain(sections) {
  return sections.map((sec) => sec.paragraphs.map((p) => {
    if (typeof p === 'string') return p
    if (p.html) return p.html.replace(/<[^>]+>/g, '')
    if (p.parts) return p.parts.map((x) => x.text).join('')
    return ''
  }).join('\n\n')).join('\n\n')
}

function Paragraph({ p }) {
  if (typeof p === 'string') return <p>{p}</p>
  if (p.html) return <p dangerouslySetInnerHTML={{ __html: p.html }} />
  if (p.parts) {
    return (
      <p>
        {p.parts.map((part, i) => part.highlight
          ? <span key={i} className="aa-highlight" title="Click to refine">{part.text}</span>
          : <span key={i}>{part.text}</span>,
        )}
      </p>
    )
  }
  return null
}

function DocVault({ docs, fileRef, onPick, onFiles }) {
  function onDrop(e) {
    e.preventDefault()
    onFiles(e.dataTransfer.files)
  }
  return (
    <div className="aa-editor-wrap">
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600 }}>Your documents</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Upload supporting files once — Scholar uses them to fill in accurate details across all your applications.
        </div>
      </div>
      <label
        className="aa-drop"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={onPick}
      >
        <i className="ti ti-cloud-upload" aria-hidden="true" />
        <div className="aa-drop-title">Drag files here, or click to browse</div>
        <div className="aa-drop-sub">Accepted: PDF, JPG, PNG · Max 10MB per file</div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
      </label>

      {docs.length === 0 ? (
        <div className="aa-docs-empty">
          No documents uploaded yet. Add your transcript to help Scholar generate more accurate applications.
        </div>
      ) : (
        <div className="aa-docs-grid">
          {docs.map((d) => (
            <div className="aa-doc-card" key={d.id}>
              <div className="aa-doc-card-icon"><i className={`ti ${iconForType(d.type)}`} style={{ fontSize: 16 }} aria-hidden="true" /></div>
              <div className="aa-doc-card-info">
                <div className="aa-doc-card-name" title={d.name}>{d.name}</div>
                <div className="aa-doc-card-meta">{labelForType(d.type)} · {formatSize(d.size)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function guessType(name) {
  const n = name.toLowerCase()
  if (n.includes('transcript')) return 'transcript'
  if (n.includes('waec') || n.includes('neco')) return 'waec'
  if (n.includes('passport') || n.includes('id')) return 'passport'
  if (n.includes('recommend') || n.includes('letter')) return 'recommendation'
  return 'other'
}
function labelForType(t) {
  return {
    transcript: 'Academic transcript',
    waec: 'WAEC / NECO result',
    passport: 'Passport / ID',
    recommendation: 'Recommendation letter',
    other: 'Other',
  }[t] || 'Other'
}
function iconForType(t) {
  return {
    transcript: 'ti-school',
    waec: 'ti-certificate',
    passport: 'ti-id-badge',
    recommendation: 'ti-mail',
    other: 'ti-file',
  }[t] || 'ti-file'
}
function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
