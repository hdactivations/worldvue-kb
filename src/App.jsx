import { useState, useEffect, useCallback } from 'react'
import { sb } from './supabase'
import { SEED_DATA } from './seedData'
import './App.css'

const CATEGORIES = ['All','Networking/Connectivity','VLAN','FTG','OTT','Native Casting','Hardware']
const PLATFORMS = ['Platform 1','Platform 2','Custom Build']
const TEAMS = ['Advanced Activations','Advanced Support']
const ENGINEERS = {
'Advanced Activations': ['Ahsan Alam','Armando Rodriguez','Charlie Whitfield III','Leonel Garcia','Tyler Boudreaux'],
'Advanced Support': ['Alejandro Coyotl','Alyssa Martin','Chris Esmilla','DeMarea Sturdivant','Gromyko Wilson','James Shamburger','Joey de Leon','Raymond Leonard','Richard Wade','Tan Nguyen'],
}

function SeverityPill({ sev }) {
return <span className={`pill sev-${sev}`}>{sev.charAt(0).toUpperCase()+sev.slice(1)}</span>
}

function KBCard({ item, onEdit }) {
const [open, setOpen] = useState(false)
const steps = Array.isArray(item.steps) ? item.steps : JSON.parse(item.steps || '[]')
return (
<div className={`kb-card ${open ? 'expanded' : ''}`} onClick={() => setOpen(!open)}>
<div className="card-top">
<div style={{flex:1}}>
<div className="card-title">{item.title}</div>
<div className="card-meta">
<SeverityPill sev={item.severity}/>
<span className="pill cat-pill">{item.category}</span>
{item.team && <span className="pill team-pill">{item.team}</span>}
{(item.platforms||[]).map(p => <span key={p} className="pill plat-pill">{p}</span>)}
{item.site_code && <span className="pill site-pill">📍 {item.site_code}</span>}
</div>
</div>
<span className={`chevron ${open ? 'open' : ''}`}>⌄</span>
</div>
{open && (
<div className="card-detail" onClick={e => e.stopPropagation()}>
<div className="detail-section">
<label>Symptom</label>
<p>{item.symptom}</p>
</div>
<div className="detail-section">
<label>Root Cause</label>
<p>{item.root_cause}</p>
</div>
<div className="detail-section">
<label>Troubleshooting Steps</label>
<ol className="steps-list">
{steps.map((s, i) => (
<li key={i}><span className="step-num">{i+1}</span><span>{s}</span></li>
))}
</ol>
</div>
<div className="detail-section">
<label>Resolution</label>
<div className="resolution-box">✓ {item.resolution}</div>
</div>
{(item.submitted_by || item.site_code) && (
<div className="detail-section submitted-by-row">
{item.submitted_by && <span className="submitted-by-tag">👤 {item.submitted_by}</span>}
{item.site_code && <span className="submitted-by-tag">📍 Site: {item.site_code}</span>}
{onEdit && <button className="btn-edit-card" onClick={e => { e.stopPropagation(); onEdit(item); }}>✎ Edit Article</button>}
</div>
)}
</div>
)}
</div>
)
}

function KBView({ articles, loading, onEdit }) {
const [search, setSearch] = useState('')
const [category, setCategory] = useState('All')
const [platform, setPlatform] = useState('All')
const [team, setTeam] = useState('All')
const [siteCodeFilter, setSiteCodeFilter] = useState('All')
const [engineerFilter, setEngineerFilter] = useState('All')

const siteCodes = ['All', ...Array.from(new Set(articles.map(a => a.site_code).filter(Boolean))).sort()]
const engineers = ['All', ...Array.from(new Set(articles.map(a => a.submitted_by).filter(Boolean))).sort()]

const filtered = articles.filter(a => {
const q = search.toLowerCase()
const matchQ = !q || a.title.toLowerCase().includes(q) || a.symptom.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.site_code||'').toLowerCase().includes(q) || (a.submitted_by||'').toLowerCase().includes(q)
const matchC = category === 'All' || a.category === category
const matchP = platform === 'All' || (a.platforms||[]).includes(platform)
const matchT = team === 'All' || a.team === team
const matchSC = siteCodeFilter === 'All' || a.site_code === siteCodeFilter
const matchEng = engineerFilter === 'All' || a.submitted_by === engineerFilter
return matchQ && matchC && matchP && matchT && matchSC && matchEng
})

const countFor = cat => articles.filter(a => cat === 'All' ? true : a.category === cat).length
const countPlat = p => articles.filter(a => p === 'All' ? true : (a.platforms||[]).includes(p)).length
const countTeam = t => articles.filter(a => t === 'All' ? true : a.team === t).length

return (
<div className="main-layout">
<div className="sidebar">
<div className="filter-label">Category</div>
{CATEGORIES.map(c => (
<button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
{c} <span className="filter-count">{countFor(c)}</span>
</button>
))}
<hr className="divider"/>
<div className="filter-label">Platform</div>
{['All', ...PLATFORMS].map(p => (
<button key={p} className={`filter-btn ${platform === p ? 'active' : ''}`} onClick={() => setPlatform(p)}>
{p === 'All' ? 'All Platforms' : p} <span className="filter-count">{countPlat(p)}</span>
</button>
))}
<hr className="divider"/>
<div className="filter-label">Team</div>
{['All', ...TEAMS].map(t => (
<button key={t} className={`filter-btn ${team === t ? 'active' : ''}`} onClick={() => setTeam(t)}>
{t === 'All' ? 'All Teams' : t} <span className="filter-count">{countTeam(t)}</span>
</button>
))}
</div>
<div className="content">
<div className="search-wrap">
<input className="search-input" placeholder="Search by symptom, title, category, site code, or engineer..." value={search} onChange={e => setSearch(e.target.value)}/>
<div className="search-filters">
<select className="filter-select" value={siteCodeFilter} onChange={e => setSiteCodeFilter(e.target.value)}>
{siteCodes.map(sc => <option key={sc} value={sc}>{sc === 'All' ? 'All Site Codes' : sc}</option>)}
</select>
<select className="filter-select" value={engineerFilter} onChange={e => setEngineerFilter(e.target.value)}>
{engineers.map(eng => <option key={eng} value={eng}>{eng === 'All' ? 'All Engineers' : eng}</option>)}
</select>
</div>
</div>
{loading ? (
<div className="loading"><span className="spinner"/>Loading KB articles...</div>
) : filtered.length === 0 ? (
<div className="empty">No articles match your search.</div>
) : (
<div className="card-grid">
{filtered.map(a => <KBCard key={a.id} item={a} onEdit={onEdit}/>)}
</div>
)}
</div>
</div>
)
}

function SubmitView({ initialDraft, initialArticle, onDone }) {
const empty = { category:'Networking/Connectivity', severity:'medium', platforms:[], team:'', title:'', symptom:'', root_cause:'', steps:'', resolution:'', submitted_by:'', site_code:'', notes:'' }
const draftToForm = d => ({ ...empty, ...d, steps: Array.isArray(d.steps) ? d.steps.join('\n') : (d.steps || '') })
const [form, setForm] = useState(initialArticle ? draftToForm(initialArticle) : initialDraft ? draftToForm(initialDraft) : empty)
const [draftId, setDraftId] = useState(initialDraft ? initialDraft.id : null)
const articleId = initialArticle ? initialArticle.id : null
const [submitting, setSubmitting] = useState(false)
const [savingDraft, setSavingDraft] = useState(false)
const [success, setSuccess] = useState(false)
const [draftSaved, setDraftSaved] = useState(false)

const isResubmit = initialDraft?.status === 'pending_review'
const isArticleEdit = !!articleId

const set = (k, v) => setForm(f => ({...f, [k]: v}))
const togglePlat = p => set('platforms', form.platforms.includes(p) ? form.platforms.filter(x => x !== p) : [...form.platforms, p])
const setTeam = t => setForm(f => ({...f, team: t, submitted_by: ENGINEERS[t]?.includes(f.submitted_by) ? f.submitted_by : ''}))

const handleSaveDraft = async () => {
if (!form.title.trim()) {
alert('Please at least enter an Issue Title before saving as a draft.')
return
}
setSavingDraft(true)
const stepsArr = form.steps.split('\n').map(s => s.trim()).filter(Boolean)
const payload = { ...form, steps: stepsArr, status: 'draft' }
let error
if (draftId) {
({ error } = await sb.from('kb_pending').update(payload).eq('id', draftId))
} else {
const { data, error: insErr } = await sb.from('kb_pending').insert([payload]).select()
error = insErr
if (!error && data && data[0]) setDraftId(data[0].id)
}
setSavingDraft(false)
if (error) { alert('Failed to save draft: ' + error.message); return }
setDraftSaved(true)
setSuccess(false)
onDone && onDone()
}

const handleSubmit = async () => {
if (!form.title||!form.symptom||!form.root_cause||!form.steps||!form.resolution||!form.team||!form.submitted_by||form.platforms.length===0) {
alert('Please fill in all required fields, including Team and Engineer Name, and select at least one platform.')
return
}
setSubmitting(true)
const stepsArr = form.steps.split('\n').map(s => s.trim()).filter(Boolean)
let error
if (articleId) {
const { status: _s, notes: _n, ...articlePayload } = { ...form, steps: stepsArr }
;({ error } = await sb.from('kb_articles').update(articlePayload).eq('id', articleId))
} else {
const payload = { ...form, steps: stepsArr, status: 'pending_review' }
if (draftId) {
({ error } = await sb.from('kb_pending').update(payload).eq('id', draftId))
} else {
({ error } = await sb.from('kb_pending').insert([payload]))
}
}
setSubmitting(false)
if (error) { alert('Submission failed: ' + error.message); return }
setSuccess(true)
setDraftSaved(false)
setForm(empty)
setDraftId(null)
onDone && onDone()
}

return (
<div className="main-layout">
<div className="content">
<div className="form-card">
<div className="form-title">{articleId ? 'Edit KB Article' : draftId ? (initialDraft?.status === 'draft' ? 'Continue Open Ticket' : 'Edit Submitted Case') : 'Submit a New Case'}</div>
<div className="form-sub">Document a resolved issue for engineer review, or save your progress as an open ticket and finish it later. Approved cases are added to the live KB.</div>
<div className="form-grid">
<div className="form-group">
<label>Team *</label>
<select value={form.team} onChange={e => setTeam(e.target.value)}>
<option value="">Select team...</option>
{TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
</select>
</div>
<div className="form-group">
<label>Engineer Opening Case *</label>
<select value={form.submitted_by} onChange={e => set('submitted_by', e.target.value)} disabled={!form.team}>
<option value="">{form.team ? 'Select engineer...' : 'Select a team first'}</option>
{(ENGINEERS[form.team] || []).slice().sort().map(n => <option key={n} value={n}>{n}</option>)}
</select>
</div>
<div className="form-group full">
<label>Site Code</label>
<input value={form.site_code} onChange={e => set('site_code', e.target.value)} placeholder="e.g. C0012"/>
</div>
<div className="form-group">
<label>Category *</label>
<select value={form.category} onChange={e => set('category', e.target.value)}>
{CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
</select>
</div>
<div className="form-group">
<label>Severity *</label>
<select value={form.severity} onChange={e => set('severity', e.target.value)}>
<option value="high">High</option>
<option value="medium">Medium</option>
<option value="low">Low</option>
</select>
</div>
<div className="form-group full">
<label>Platform(s) *</label>
<div className="checkbox-group">
{PLATFORMS.map(p => (
<label key={p} className="checkbox-label">
<input type="checkbox" checked={form.platforms.includes(p)} onChange={() => togglePlat(p)}/>{p}
</label>
))}
</div>
</div>
<div className="form-group full">
<label>Issue Title *</label>
<input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Short descriptive title"/>
</div>
<div className="form-group full">
<label>Symptom Description *</label>
<textarea value={form.symptom} onChange={e => set('symptom', e.target.value)} placeholder="What the technician observed..."/>
</div>
<div className="form-group full">
<label>Root Cause *</label>
<textarea value={form.root_cause} onChange={e => set('root_cause', e.target.value)} placeholder="What caused the issue..."/>
</div>
<div className="form-group full">
<label>Troubleshooting Steps * (one per line)</label>
<textarea style={{minHeight:'120px'}} value={form.steps} onChange={e => set('steps', e.target.value)} placeholder={"Step 1\nStep 2\nStep 3"}/>
</div>
<div className="form-group full">
<label>Resolution Summary *</label>
<textarea value={form.resolution} onChange={e => set('resolution', e.target.value)} placeholder="What fixed it..."/>
</div>
<div className="form-group full">
<label>Additional Notes</label>
<textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything else useful..."/>
</div>
</div>
<div style={{marginTop:'20px', display:'flex', gap:'10px'}}>
<button className="btn-primary" onClick={handleSubmit} disabled={submitting || savingDraft}>
{submitting ? 'Saving...' : articleId ? '💾 Save Article Changes' : isResubmit ? '⚡ Resubmit for Review' : '⚡ Submit for Review'}
</button>
<button className="btn-draft" onClick={handleSaveDraft} disabled={submitting || savingDraft}>
{savingDraft ? 'Saving...' : '🕓 Save as Open Ticket'}
</button>
</div>
{success && <div className="success-msg">✓ Case submitted! An engineer will review it shortly.</div>}
{draftSaved && <div className="success-msg">✓ Saved as an open ticket. Find it under "Open Tickets" to finish later.</div>}
</div>
</div>
</div>
)
}

function ReviewView({ pending, loading, onApprove, onReject, onEdit }) {
if (loading) return <div className="main-layout"><div className="content"><div className="loading"><span className="spinner"/>Loading...</div></div></div>
if (pending.length === 0) return <div className="main-layout"><div className="content"><div className="empty">✓ No pending cases. Queue is clear.</div></div></div>
return (
<div className="main-layout">
<div className="content">
<div style={{marginBottom:'16px', color:'var(--sub)', fontSize:'13px'}}>{pending.length} case{pending.length!==1?'s':''} awaiting review</div>
{pending.map(item => {
const steps = Array.isArray(item.steps) ? item.steps : JSON.parse(item.steps || '[]')
return (
<div key={item.id} className="review-card">
<div className="review-header">
<div>
<div style={{fontWeight:700, fontSize:'14px', color:'var(--text)', marginBottom:'6px'}}>{item.title}</div>
<div className="card-meta">
<SeverityPill sev={item.severity}/>
<span className="pill cat-pill">{item.category}</span>
{item.team && <span className="pill team-pill">{item.team}</span>}
{(item.platforms||[]).map(p => <span key={p} className="pill plat-pill">{p}</span>)}
</div>
</div>
<div style={{fontSize:'11px', color:'var(--sub)', textAlign:'right', flexShrink:0}}>
By: {item.submitted_by}{item.site_code && <><br/>Site: {item.site_code}</>}
</div>
</div>
<div className="review-body">
<div><span className="review-label">Symptom: </span>{item.symptom}</div>
<div><span className="review-label">Root Cause: </span>{item.root_cause}</div>
<div className="review-label" style={{marginBottom:'4px'}}>Steps:</div>
<ol style={{paddingLeft:'18px', fontSize:'13px', lineHeight:'1.6'}}>{steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
<div><span className="review-label" style={{color:'var(--green)'}}>Resolution: </span>{item.resolution}</div>
{item.notes && <div><span className="review-label">Notes: </span><span style={{color:'var(--sub)'}}>{item.notes}</span></div>}
</div>
<div className="review-actions">
<button className="btn-approve" onClick={() => onApprove(item)}>✓ Approve & Add to KB</button>
<button className="btn-edit" onClick={() => onEdit(item)}>✎ Edit & Resubmit</button>
<button className="btn-reject" onClick={() => onReject(item.id)}>✕ Reject</button>
</div>
</div>
)
})}
</div>
</div>
)
}

function OpenTicketsView({ drafts, loading, onEdit, onDelete }) {
if (loading) return <div className="main-layout"><div className="content"><div className="loading"><span className="spinner"/>Loading...</div></div></div>
if (drafts.length === 0) return <div className="main-layout"><div className="content"><div className="empty">No open tickets. Start a case from "Submit Case" and save it as an open ticket to come back to it later.</div></div></div>
return (
<div className="main-layout">
<div className="content">
<div style={{marginBottom:'16px', color:'var(--sub)', fontSize:'13px'}}>{drafts.length} open ticket{drafts.length!==1?'s':''} in progress — shared with the team</div>
{drafts.map(item => (
<div key={item.id} className="review-card">
<div className="review-header">
<div>
<div style={{fontWeight:700, fontSize:'14px', color:'var(--text)', marginBottom:'6px'}}>{item.title || '(untitled ticket)'}</div>
<div className="card-meta">
<span className="pill cat-pill">{item.category}</span>
{item.team && <span className="pill team-pill">{item.team}</span>}
{(item.platforms||[]).map(p => <span key={p} className="pill plat-pill">{p}</span>)}
</div>
</div>
<div style={{fontSize:'11px', color:'var(--sub)', textAlign:'right', flexShrink:0}}>
{item.submitted_by && <>By: {item.submitted_by}<br/></>}
{item.site_code && <>Site: {item.site_code}</>}
</div>
</div>
<div className="review-actions">
<button className="btn-approve" onClick={() => onEdit(item)}>✎ Continue Editing</button>
<button className="btn-reject" onClick={() => onDelete(item.id)}>✕ Delete</button>
</div>
</div>
))}
</div>
</div>
)
}

function StatsView({ articles }) {
const byCat = CATEGORIES.filter(c => c !== 'All').map(c => ({ cat: c, count: articles.filter(a => a.category === c).length }))
const high = articles.filter(a => a.severity === 'high').length
const med = articles.filter(a => a.severity === 'medium').length
const low = articles.filter(a => a.severity === 'low').length
return (
<div className="main-layout">
<div className="content">
<div className="stats-row">
<div className="stat-card"><div className="stat-num">{articles.length}</div><div className="stat-label">Total KB Articles</div></div>
<div className="stat-card"><div className="stat-num" style={{color:'var(--red)'}}>{high}</div><div className="stat-label">High Severity</div></div>
<div className="stat-card"><div className="stat-num" style={{color:'var(--amber)'}}>{med}</div><div className="stat-label">Medium Severity</div></div>
<div className="stat-card"><div className="stat-num" style={{color:'var(--green)'}}>{low}</div><div className="stat-label">Low Severity</div></div>
</div>
<div className="cat-grid">
{byCat.map(({cat, count}) => (
<div key={cat} className="cat-card">
<span style={{fontSize:'13px', color:'var(--text)'}}>{cat}</span>
<span style={{fontSize:'22px', fontWeight:800, color:'var(--accent)'}}>{count}</span>
</div>
))}
</div>
</div>
</div>
)
}

export default function App() {
const [tab, setTab] = useState('kb')
const [articles, setArticles] = useState([])
const [pending, setPending] = useState([])
const [editingDraft, setEditingDraft] = useState(null)
const [editingArticle, setEditingArticle] = useState(null)
const [loadingArticles, setLoadingArticles] = useState(true)
const [loadingPending, setLoadingPending] = useState(true)

const loadArticles = useCallback(async () => {
setLoadingArticles(true)
const { data, error } = await sb.from('kb_articles').select('*').order('created_at')
if (!error) setArticles(data || [])
setLoadingArticles(false)
return data || []
}, [])

const loadPending = useCallback(async () => {
setLoadingPending(true)
const { data, error } = await sb.from('kb_pending').select('*').order('created_at')
if (!error) setPending(data || [])
setLoadingPending(false)
}, [])

useEffect(() => {
(async () => {
const data = await loadArticles()
if (data.length === 0) {
await sb.from('kb_articles').insert(SEED_DATA)
await loadArticles()
}
})()
loadPending()
}, [])

const reviewItems = pending.filter(p => (p.status || 'pending_review') !== 'draft')
const draftItems = pending.filter(p => p.status === 'draft')

const handleApprove = async (item) => {
const steps = Array.isArray(item.steps) ? item.steps : JSON.parse(item.steps || '[]')
const { error } = await sb.from('kb_articles').insert([{
category: item.category, severity: item.severity, platforms: item.platforms, team: item.team,
title: item.title, symptom: item.symptom, root_cause: item.root_cause,
steps, resolution: item.resolution, submitted_by: item.submitted_by, site_code: item.site_code,
approved_by: 'Engineer', approved_at: new Date().toISOString()
}])
if (!error) {
await sb.from('kb_pending').delete().eq('id', item.id)
await loadArticles()
await loadPending()
}
}

const handleReject = async (id) => {
await sb.from('kb_pending').delete().eq('id', id)
await loadPending()
}

const handleDeleteDraft = async (id) => {
if (!window.confirm('Delete this open ticket? This cannot be undone.')) return
await sb.from('kb_pending').delete().eq('id', id)
await loadPending()
}

const handleEditArticle = (item) => {
setEditingArticle(item)
setEditingDraft(null)
setTab('submit')
}

const handleEditDraft = (item) => {
setEditingDraft(item)
setTab('submit')
}

const handleSubmitDone = () => {
const wasArticleEdit = !!editingArticle
setEditingDraft(null)
setEditingArticle(null)
loadPending()
if (wasArticleEdit) {
loadArticles()
setTab('kb')
}
}

return (
<div className="app">
<div className="header">
<div className="header-left">
<img src="data:image/jpeg;base64,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" alt="Worldvue Logo" className="header-logo" />
<div>
<div className="header-title">ADVANCED ACTIVATIONS &amp; SUPPORT TROUBLESHOOTING KNOWLEDGE BASE</div>
<div className="header-sub">FTG · OTT · Native Casting · Advanced Deployment Team</div>
</div>
</div>
<div className="tab-bar">
<button className="tab home-btn" onClick={()=>setTab('kb')} title="Back to Knowledge Base">🏠 Home</button>
<button className={`tab ${tab==='kb'?'active':''}`} onClick={()=>setTab('kb')}>Knowledge Base</button>
<button className={`tab ${tab==='stats'?'active':''}`} onClick={()=>setTab('stats')}>Stats</button>
<button className={`tab ${tab==='submit'?'active':''}`} onClick={()=>{setEditingDraft(null);setTab('submit')}}>Submit Case</button>
<button className={`tab ${tab==='tickets'?'active':''}`} onClick={()=>{setTab('tickets');loadPending()}}>
Open Tickets {draftItems.length > 0 && <span className="badge">{draftItems.length}</span>}
</button>
<button className={`tab ${tab==='review'?'active':''}`} onClick={()=>{setTab('review');loadPending()}}>
Review Queue {reviewItems.length > 0 && <span className="badge">{reviewItems.length}</span>}
</button>
</div>
</div>
{tab==='kb' && <KBView articles={articles} loading={loadingArticles} onEdit={handleEditArticle}/>}
{tab==='stats' && <StatsView articles={articles}/>}
{tab==='submit' && <SubmitView initialDraft={editingDraft} initialArticle={editingArticle} onDone={handleSubmitDone}/>}
{tab==='tickets' && <OpenTicketsView drafts={draftItems} loading={loadingPending} onEdit={handleEditDraft} onDelete={handleDeleteDraft}/>}
{tab==='review' && <ReviewView pending={reviewItems} loading={loadingPending} onApprove={handleApprove} onReject={handleReject} onEdit={handleEditDraft}/>}
</div>
)
    }

