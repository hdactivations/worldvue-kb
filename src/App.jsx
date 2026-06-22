import { useState, useEffect, useCallback } from 'react'
import { sb } from './supabase'
import { SEED_DATA } from './seedData'
import './App.css'

const CATEGORIES = ['All','Networking/Connectivity','VLAN','FTG','OTT','Native Casting','Hardware']
const PLATFORMS = ['Platform 1','Platform 2','Custom Build']

function SeverityPill({ sev }) {
  return <span className={`pill sev-${sev}`}>{sev.charAt(0).toUpperCase()+sev.slice(1)}</span>
}

function KBCard({ item }) {
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
            {(item.platforms||[]).map(p => <span key={p} className="pill plat-pill">{p}</span>)}
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
        </div>
      )}
    </div>
  )
}

function KBView({ articles, loading }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [platform, setPlatform] = useState('All')

  const filtered = articles.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.symptom.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    const matchC = category === 'All' || a.category === category
    const matchP = platform === 'All' || (a.platforms||[]).includes(platform)
    return matchQ && matchC && matchP
  })

  const countFor = cat => articles.filter(a => cat === 'All' ? true : a.category === cat).length
  const countPlat = p => articles.filter(a => p === 'All' ? true : (a.platforms||[]).includes(p)).length

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
      </div>
      <div className="content">
        <div className="search-wrap">
          <input className="search-input" placeholder="Search by symptom, title, or category..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        {loading ? (
          <div className="loading"><span className="spinner"/>Loading KB articles...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No articles match your search.</div>
        ) : (
          <div className="card-grid">
            {filtered.map(a => <KBCard key={a.id} item={a}/>)}
          </div>
        )}
      </div>
    </div>
  )
}

function SubmitView() {
  const empty = { category:'Networking/Connectivity', severity:'medium', platforms:[], title:'', symptom:'', root_cause:'', steps:'', resolution:'', submitted_by:'', site_code:'', notes:'' }
  const [form, setForm] = useState(empty)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))
  const togglePlat = p => set('platforms', form.platforms.includes(p) ? form.platforms.filter(x => x !== p) : [...form.platforms, p])

  const handleSubmit = async () => {
    if (!form.title||!form.symptom||!form.root_cause||!form.steps||!form.resolution||!form.submitted_by||form.platforms.length===0) {
      alert('Please fill in all required fields and select at least one platform.')
      return
    }
    setSubmitting(true)
    const stepsArr = form.steps.split('\n').map(s => s.trim()).filter(Boolean)
    const { error } = await sb.from('kb_pending').insert([{ ...form, steps: stepsArr }])
    setSubmitting(false)
    if (error) { alert('Submission failed: ' + error.message); return }
    setSuccess(true)
    setForm(empty)
  }

  return (
    <div className="main-layout">
      <div className="content">
        <div className="form-card">
          <div className="form-title">Submit a New Case</div>
          <div className="form-sub">Document a resolved issue for engineer review. Approved cases are added to the live KB.</div>
          <div className="form-grid">
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
            <div className="form-group">
              <label>Your Name *</label>
              <input value={form.submitted_by} onChange={e => set('submitted_by', e.target.value)} placeholder="First Last"/>
            </div>
            <div className="form-group">
              <label>Site Code</label>
              <input value={form.site_code} onChange={e => set('site_code', e.target.value)} placeholder="e.g. C0012"/>
            </div>
            <div className="form-group full">
              <label>Additional Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything else useful..."/>
            </div>
          </div>
          <div style={{marginTop:'20px'}}>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '⚡ Submit for Review'}
            </button>
          </div>
          {success && <div className="success-msg">✓ Case submitted! An engineer will review it shortly.</div>}
        </div>
      </div>
    </div>
  )
}

function ReviewView({ pending, loading, onApprove, onReject }) {
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
                <button className="btn-reject" onClick={() => onReject(item.id)}>✕ Reject</button>
              </div>
            </div>
          )
        })}
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

  const handleApprove = async (item) => {
    const steps = Array.isArray(item.steps) ? item.steps : JSON.parse(item.steps || '[]')
    const { error } = await sb.from('kb_articles').insert([{
      category: item.category, severity: item.severity, platforms: item.platforms,
      title: item.title, symptom: item.symptom, root_cause: item.root_cause,
      steps, resolution: item.resolution, submitted_by: item.submitted_by,
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

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="logo-mark">WV</div>
          <div>
            <div className="header-title">WORLDVUE TROUBLESHOOTING KB</div>
            <div className="header-sub">FTG · OTT · Native Casting · Advanced Deployment Team</div>
          </div>
        </div>
        <div className="tab-bar">
          <button className={`tab ${tab==='kb'?'active':''}`} onClick={()=>setTab('kb')}>Knowledge Base</button>
          <button className={`tab ${tab==='stats'?'active':''}`} onClick={()=>setTab('stats')}>Stats</button>
          <button className={`tab ${tab==='submit'?'active':''}`} onClick={()=>setTab('submit')}>Submit Case</button>
          <button className={`tab ${tab==='review'?'active':''}`} onClick={()=>{setTab('review');loadPending()}}>
            Review Queue {pending.length > 0 && <span className="badge">{pending.length}</span>}
          </button>
        </div>
      </div>
      {tab==='kb' && <KBView articles={articles} loading={loadingArticles}/>}
      {tab==='stats' && <StatsView articles={articles}/>}
      {tab==='submit' && <SubmitView/>}
      {tab==='review' && <ReviewView pending={pending} loading={loadingPending} onApprove={handleApprove} onReject={handleReject}/>}
    </div>
  )
}
