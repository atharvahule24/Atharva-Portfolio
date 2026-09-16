import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(!!session);
      setLoadingAuth(false);
      if (!session) {
        navigate('/admin', { replace: true });
      } else if (window.location.pathname === '/admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(!!session);
      if (!session) {
        navigate('/admin', { replace: true });
      } else if (window.location.pathname === '/admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (auth) {
      const fetchUnread = async () => {
        const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false);
        setUnreadCount(count || 0);
      };
      fetchUnread();

      const channel = supabase.channel('messages-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchUnread)
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Incorrect credentials');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loadingAuth) return null;

  if (!auth) {
    return (
      <div className={styles.loginWrapper}>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <h2>Admin Login</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.adminWrap}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>
      
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('projects')} className={activeTab === 'projects' ? styles.active : ''}>Projects</button>
        <button onClick={() => setActiveTab('skills')} className={activeTab === 'skills' ? styles.active : ''}>Skills</button>
        <button onClick={() => setActiveTab('certifications')} className={activeTab === 'certifications' ? styles.active : ''}>Certifications</button>
        <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? styles.active : ''}>Stats</button>
        <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? styles.active : ''} style={{ position: 'relative' }}>
          Messages
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#D97706', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
          )}
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'skills' && <SkillsTab />}
        {activeTab === 'certifications' && <CertificationsTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'messages' && <MessagesTab />}
      </div>
    </div>
  );
}

// -----------------------------
// PROJECTS TAB
// -----------------------------
const defaultProjectForm = { title: '', subtitle: '', description: '', bullets: [''], tech_stack: [], github_url: '', demo_url: '', video_url: '', status: 'Live', order_index: 0, milestones: [], lessons: '' };

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(defaultProjectForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('order_index');
    if (data) setProjects(data);
  }

  async function saveProject(e) {
    e.preventDefault();
    setSaving(true);
    const bulletInputs = Array.from(e.target.querySelectorAll('input[name="bullet"]'));
    const bullets = bulletInputs.map(input => input.value.trim()).filter(Boolean);
    const payload = { ...form, bullets };
    
    try {
      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setForm(defaultProjectForm);
      setEditingId(null);
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id) {
    setSaving(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setConfirmDeleteId(null);
      fetchProjects();
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  async function moveProject(index, direction) {
    if (direction === 'up' && index > 0) {
      const p1 = projects[index];
      const p2 = projects[index - 1];
      await supabase.from('projects').update({ order_index: p2.order_index }).eq('id', p1.id);
      await supabase.from('projects').update({ order_index: p1.order_index }).eq('id', p2.id);
      fetchProjects();
    } else if (direction === 'down' && index < projects.length - 1) {
      const p1 = projects[index];
      const p2 = projects[index + 1];
      await supabase.from('projects').update({ order_index: p2.order_index }).eq('id', p1.id);
      await supabase.from('projects').update({ order_index: p1.order_index }).eq('id', p2.id);
      fetchProjects();
    }
  }

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || '',
      subtitle: p.subtitle || '',
      description: p.description || '',
      bullets: p.bullets?.length ? p.bullets : [''],
      tech_stack: p.tech_stack || [],
      github_url: p.github_url || '',
      demo_url: p.demo_url || '',
      video_url: p.video_url || '',
      status: p.status || 'Live',
      order_index: p.order_index || 0,
      milestones: p.milestones || [],
      lessons: p.lessons || ''
    });
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{showForm ? (editingId ? 'Edit Project' : 'Add Project') : 'Projects'}</h3>
        {!showForm && (
          <button onClick={() => { setForm(defaultProjectForm); setEditingId(null); setShowForm(true); }} className={styles.addBtn}>
            Add New Project
          </button>
        )}
      </div>

      {saveSuccess && <div className={styles.successFlash}>Saved ✓</div>}

      {showForm ? (
        <form onSubmit={saveProject} className={styles.form}>
          <label>Order Index</label>
          <input type="number" value={form.order_index} onChange={e => setForm({...form, order_index: parseInt(e.target.value)})} required />
          <label>Title</label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <label>Subtitle</label>
          <input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option>Live</option>
            <option>In Progress</option>
          </select>
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          
          <label>What I Built (Bullets)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {form.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  name="bullet" 
                  value={b} 
                  onChange={e => {
                    const nb = [...form.bullets];
                    nb[i] = e.target.value;
                    setForm({...form, bullets: nb});
                  }} 
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setForm({...form, bullets: form.bullets.filter((_, idx) => idx !== i)})} className={styles.iconBtn}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, bullets: [...form.bullets, '']})} style={{ width: 'fit-content' }}>＋ Add Bullet</button>
          </div>

          <label>Tech Stack</label>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {form.tech_stack.map((t, i) => (
                <span key={i} className={styles.pill}>
                  {t} <button type="button" onClick={() => setForm({...form, tech_stack: form.tech_stack.filter((_, idx) => idx !== i)})} className={styles.pillClose}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim()) {
                      setForm({...form, tech_stack: [...form.tech_stack, tagInput.trim()]});
                      setTagInput('');
                    }
                  }
                }}
                placeholder="Add tech stack tag"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => {
                if (tagInput.trim()) {
                  setForm({...form, tech_stack: [...form.tech_stack, tagInput.trim()]});
                  setTagInput('');
                }
              }} style={{ width: 'fit-content', marginTop: 0 }}>Add Tag</button>
            </div>
          </div>

          <label>GitHub URL</label>
          <input value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} />
          <label>Live Demo URL</label>
          <input placeholder="Leave empty if not deployed" value={form.demo_url} onChange={e => setForm({...form, demo_url: e.target.value})} />
          <label>Video Demo URL</label>
          <input placeholder="YouTube or direct link" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} />
          
          <label>Milestones (For In Progress Projects)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {form.milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  value={m.label} 
                  onChange={e => {
                    const nm = [...form.milestones];
                    nm[i].label = e.target.value;
                    setForm({...form, milestones: nm});
                  }} 
                  style={{ flex: 1 }}
                  placeholder="Milestone label"
                />
                <select 
                  value={m.status} 
                  onChange={e => {
                    const nm = [...form.milestones];
                    nm[i].status = e.target.value;
                    setForm({...form, milestones: nm});
                  }}
                  style={{ width: '150px' }}
                >
                  <option value="done">Done</option>
                  <option value="in_progress">In Progress</option>
                  <option value="planned">Planned</option>
                </select>
                <button type="button" onClick={() => setForm({...form, milestones: form.milestones.filter((_, idx) => idx !== i)})} className={styles.iconBtn}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, milestones: [...form.milestones, { label: '', status: 'planned' }]})} style={{ width: 'fit-content' }}>＋ Add Milestone</button>
          </div>
          
          <label>Lessons Learned</label>
          <textarea rows={3} value={form.lessons} onChange={e => setForm({...form, lessons: e.target.value})} placeholder="What I learned..." />

          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} style={{ marginTop: 0 }}>
              {saving ? <span className={styles.spinner}></span> : 'Save Project'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn} style={{ marginTop: 0 }}>Cancel</button>
          </div>
        </form>
      ) : (
        <ul className={styles.list}>
          {projects.map((p, i) => (
            <li key={p.id}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong>{p.title}</strong>
                <span>{p.subtitle}</span>
                <span className={styles.statusBadge}>{p.status}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Order: {p.order_index})</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className={styles.iconBtn} onClick={() => moveProject(i, 'up')} title="Move Up">↑</button>
                <button className={styles.iconBtn} onClick={() => moveProject(i, 'down')} title="Move Down">↓</button>
                <button className={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                
                {confirmDeleteId === p.id ? (
                  <div className={styles.confirmDelete}>
                    <span style={{ fontSize: '0.8rem' }}>Delete this project? This cannot be undone.</span>
                    <button className={styles.dangerBtn} onClick={() => deleteProject(p.id)} disabled={saving}>
                      {saving ? <span className={styles.spinner}></span> : 'Yes, delete'}
                    </button>
                    <button className={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className={styles.dangerBtn} onClick={() => setConfirmDeleteId(p.id)}>Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// -----------------------------
// SKILLS TAB
// -----------------------------
function SkillsTab() {
  const [skills, setSkills] = useState([]);
  const categories = ['Languages', 'AI/ML', 'Frameworks & Tools', 'CS Fundamentals'];
  const [inputs, setInputs] = useState({ 'Languages': '', 'AI/ML': '', 'Frameworks & Tools': '', 'CS Fundamentals': '' });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSkills(); }, []);

  async function fetchSkills() {
    const { data } = await supabase.from('skills').select('*').order('created_at');
    if (data) setSkills(data);
  }

  async function addSkill(category) {
    const name = inputs[category].trim();
    if (!name) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('skills').insert([{ category, name }]);
      if (error) throw error;
      setInputs({ ...inputs, [category]: '' });
      fetchSkills();
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('skills').update({ name: editName.trim() }).eq('id', id);
      if (error) throw error;
      setEditingId(null);
      fetchSkills();
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSkill(id) {
    setSaving(true);
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      setConfirmDeleteId(null);
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.grid2x2}>
      {categories.map(cat => (
        <div key={cat} className={styles.skillCard}>
          <h4>{cat}</h4>
          <div className={styles.pillContainer}>
            {skills.filter(s => s.category === cat).map(s => (
              <div key={s.id} className={styles.skillPill}>
                {editingId === s.id ? (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '2px 4px', width: '100px', background: 'transparent', border: '1px solid var(--border)', color: 'inherit' }} />
                    <button onClick={() => saveEdit(s.id)} className={styles.iconBtn} disabled={saving}>✓</button>
                    <button onClick={() => setEditingId(null)} className={styles.iconBtn} disabled={saving}>×</button>
                  </div>
                ) : confirmDeleteId === s.id ? (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem' }}>Remove {s.name}?</span>
                    <button onClick={() => deleteSkill(s.id)} className={styles.iconBtn} disabled={saving}>✓</button>
                    <button onClick={() => setConfirmDeleteId(null)} className={styles.iconBtn} disabled={saving}>×</button>
                  </div>
                ) : (
                  <>
                    <span>{s.name}</span>
                    <button onClick={() => { setEditingId(s.id); setEditName(s.name); setConfirmDeleteId(null); }} className={styles.iconBtn} title="Edit" style={{border:'none'}}>✏️</button>
                    <button onClick={() => { setConfirmDeleteId(s.id); setEditingId(null); }} className={styles.iconBtn} title="Delete" style={{border:'none'}}>×</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <input 
              placeholder="New skill..." 
              value={inputs[cat]} 
              onChange={e => setInputs({...inputs, [cat]: e.target.value})}
              onKeyDown={e => { if (e.key === 'Enter') addSkill(cat); }}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'inherit' }}
            />
            <button onClick={() => addSkill(cat)} disabled={saving} className={styles.addBtn} style={{ marginTop: 0 }}>
              {saving && inputs[cat].trim() ? <span className={styles.spinner}></span> : 'Add'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------
// CERTIFICATIONS TAB
// -----------------------------
const defaultCertForm = { issuer: '', name: '', year: '', description: '', verify_url: '', tags: [], image_url: '', credential_id: '' };

function CertificationsTab() {
  const [certs, setCerts] = useState([]);
  const [form, setForm] = useState(defaultCertForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { fetchCerts(); }, []);

  async function fetchCerts() {
    const { data } = await supabase.from('certifications').select('*').order('created_at');
    if (data) setCerts(data);
  }

  async function saveCert(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('certifications').update(form).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('certifications').insert([form]);
        if (error) throw error;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setForm(defaultCertForm);
      setEditingId(null);
      setShowForm(false);
      fetchCerts();
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCert(id) {
    setSaving(true);
    try {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) throw error;
      setConfirmDeleteId(null);
      fetchCerts();
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      issuer: c.issuer || '',
      name: c.name || '',
      year: c.year || '',
      description: c.description || '',
      verify_url: c.verify_url || '',
      tags: c.tags || [],
      image_url: c.image_url || '',
      credential_id: c.credential_id || ''
    });
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{showForm ? (editingId ? 'Edit Certification' : 'Add Certification') : 'Certifications'}</h3>
        {!showForm && (
          <button onClick={() => { setForm(defaultCertForm); setEditingId(null); setShowForm(true); }} className={styles.addBtn}>
            Add New Certification
          </button>
        )}
      </div>

      {saveSuccess && <div className={styles.successFlash}>Saved ✓</div>}

      {showForm ? (
        <form onSubmit={saveCert} className={styles.form}>
          <label>Issuer</label>
          <input value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})} required />
          <label>Certification Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <label>Year</label>
          <input value={form.year} onChange={e => setForm({...form, year: e.target.value})} required />
          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          
          <label>Topics/Tags</label>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {form.tags.map((t, i) => (
                <span key={i} className={styles.pill}>
                  {t} <button type="button" onClick={() => setForm({...form, tags: form.tags.filter((_, idx) => idx !== i)})} className={styles.pillClose}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim()) {
                      setForm({...form, tags: [...form.tags, tagInput.trim()]});
                      setTagInput('');
                    }
                  }
                }}
                placeholder="Add topic/tag"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => {
                if (tagInput.trim()) {
                  setForm({...form, tags: [...form.tags, tagInput.trim()]});
                  setTagInput('');
                }
              }} style={{ width: 'fit-content', marginTop: 0 }}>Add Tag</button>
            </div>
          </div>

          <label>Verify URL</label>
          <input value={form.verify_url} onChange={e => setForm({...form, verify_url: e.target.value})} />
          <label>Image URL</label>
          <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="Direct image link" />
          <label>Credential ID</label>
          <input value={form.credential_id} onChange={e => setForm({...form, credential_id: e.target.value})} />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} style={{ marginTop: 0 }}>
              {saving ? <span className={styles.spinner}></span> : 'Save Certification'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn} style={{ marginTop: 0 }}>Cancel</button>
          </div>
        </form>
      ) : (
        <ul className={styles.list}>
          {certs.map(c => (
            <li key={c.id}>
              <div style={{ flex: 1 }}>
                <strong>{c.name}</strong> - {c.issuer} ({c.year})
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className={styles.editBtn} onClick={() => handleEdit(c)}>Edit</button>
                
                {confirmDeleteId === c.id ? (
                  <div className={styles.confirmDelete}>
                    <span style={{ fontSize: '0.8rem' }}>Delete this? Cannot be undone.</span>
                    <button className={styles.dangerBtn} onClick={() => deleteCert(c.id)} disabled={saving}>
                      {saving ? <span className={styles.spinner}></span> : 'Yes, delete'}
                    </button>
                    <button className={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className={styles.dangerBtn} onClick={() => setConfirmDeleteId(c.id)}>Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// -----------------------------
// STATS TAB
// -----------------------------
function StatsTab() {
  const [stats, setStats] = useState({ projects_count: 0, dsa_count: 0, certifications_count: 0 });
  const [id, setId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    const { data } = await supabase.from('stats').select('*').limit(1).single();
    if (data) {
      setStats({
        projects_count: data.projects_count,
        dsa_count: data.dsa_count,
        certifications_count: data.certifications_count
      });
      setId(data.id);
    }
  }

  async function updateStats(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) {
        const { error } = await supabase.from('stats').update(stats).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('stats').insert([stats]).select();
        if (error) throw error;
        if (data) setId(data[0].id);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Something went wrong, try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Update Stats</h3>
      </div>
      {saveSuccess && <div className={styles.successFlash}>Saved ✓</div>}
      <form onSubmit={updateStats} className={styles.form}>
        <label>Projects Count</label>
        <input type="number" value={stats.projects_count} onChange={e => setStats({...stats, projects_count: parseInt(e.target.value)})} required />
        <label>DSA Count</label>
        <input type="number" value={stats.dsa_count} onChange={e => setStats({...stats, dsa_count: parseInt(e.target.value)})} required />
        <label>Certifications Count</label>
        <input type="number" value={stats.certifications_count} onChange={e => setStats({...stats, certifications_count: parseInt(e.target.value)})} required />
        <button type="submit" className={styles.addBtn} disabled={saving} style={{ marginTop: '1rem', width: 'fit-content' }}>
          {saving ? <span className={styles.spinner}></span> : 'Save Stats'}
        </button>
      </form>
    </div>
  );
}

// -----------------------------
// MESSAGES TAB
// -----------------------------
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => { fetchMessages(); }, []);

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
  }

  async function toggleRead(id, currentStatus) {
    setWorking(true);
    try {
      await supabase.from('messages').update({ read: !currentStatus }).eq('id', id);
      fetchMessages();
    } catch (err) {
      alert('Error updating message');
    } finally {
      setWorking(false);
    }
  }

  async function deleteMessage(id) {
    setWorking(true);
    try {
      await supabase.from('messages').delete().eq('id', id);
      setConfirmDeleteId(null);
      fetchMessages();
    } catch (err) {
      alert('Error deleting message');
    } finally {
      setWorking(false);
    }
  }

  if (messages.length === 0) {
    return <div style={{ color: 'var(--slate)', fontStyle: 'italic', padding: '2rem 0' }}>No messages yet.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {messages.map(msg => (
        <div key={msg.id} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: msg.read ? '4px solid #10B981' : '4px solid transparent',
          borderRadius: '8px',
          padding: '1.5rem',
          position: 'relative',
          transition: 'border-color 0.3s'
        }}>
          {!msg.read && (
            <div style={{ position: 'absolute', top: '1.5rem', left: '-12px', width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }}></div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{msg.name}</h4>
              <a href={`mailto:${msg.email}`} style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.875rem', color: '#D97706', textDecoration: 'none' }}>{msg.email}</a>
            </div>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: 'var(--slate)' }}>
              {new Date(msg.created_at).toLocaleString()}
            </span>
          </div>
          
          <p style={{ margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.message}</p>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => toggleRead(msg.id, msg.read)} disabled={working} className={styles.editBtn}>
              {msg.read ? 'Mark as Unread' : 'Mark as Read'}
            </button>
            
            {confirmDeleteId === msg.id ? (
              <div className={styles.confirmDelete}>
                <span style={{ fontSize: '0.8rem' }}>Delete message?</span>
                <button className={styles.dangerBtn} onClick={() => deleteMessage(msg.id)} disabled={working}>Yes</button>
                <button className={styles.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              </div>
            ) : (
              <button className={styles.dangerBtn} onClick={() => setConfirmDeleteId(msg.id)} disabled={working}>Delete</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
