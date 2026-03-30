import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const API = 'http://localhost:4000/api';

const formatData = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('ro-RO', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
};

const ACTIVE_STATUSES = ['pending', 'confirmata', 'activa'];

const StatusBadge = ({ status }) => {
    const map = {
        pending:    { text: 'În așteptare', cls: 'badge-pending' },
        confirmata: { text: 'Confirmată',   cls: 'badge-activ'   },
        activa:     { text: 'Activă',       cls: 'badge-activ'   },
        anulata:    { text: 'Anulată',      cls: 'badge-anulat'  },
    };
    const s = map[status] || { text: status, cls: '' };
    return <span className={`status-badge ${s.cls}`}>{s.text}</span>;
};

/* ══════════════════════════════════════
   ADMIN VIEW
══════════════════════════════════════ */
function AdminView({ token }) {
    const [tab, setTab]           = useState('cereri');
    const [cereri, setCereri]     = useState([]);
    const [programari, setProgramari] = useState([]);
    const [loadingCereri, setLoadingCereri] = useState(true);
    const [loadingProg, setLoadingProg]     = useState(true);
    const [aprobatId, setAprobatId]         = useState(null);
    const [anulareId, setAnulareId]         = useState(null);
    const [filtruStatus, setFiltruStatus]   = useState('toate');

    useEffect(() => {
        fetch(`${API}/medici/neaprobati`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setCereri(Array.isArray(d) ? d : []); setLoadingCereri(false); })
            .catch(() => setLoadingCereri(false));
    }, [token]);

    useEffect(() => {
        if (tab !== 'programari') return;
        setLoadingProg(true);
        fetch(`${API}/programari/toate`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { setProgramari(Array.isArray(d) ? d : []); setLoadingProg(false); })
            .catch(() => setLoadingProg(false));
    }, [tab, token]);

    const aproba = async (id) => {
        await fetch(`${API}/medici/aproba/${id}`, {
            method: 'PUT', headers: { Authorization: `Bearer ${token}` },
        });
        setAprobatId(id);
        setTimeout(() => {
            setCereri(prev => prev.filter(m => m._id !== id));
            setAprobatId(null);
        }, 1400);
    };

    const anuleaza = async (id) => {
        if (!window.confirm('Ești sigur că vrei să anulezi această programare?')) return;
        setAnulareId(id);
        try {
            const res = await fetch(`${API}/programari/${id}/anuleaza-admin`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setProgramari(prev =>
                    prev.map(p => p._id === id ? { ...p, status: 'anulata' } : p)
                );
            }
        } catch (err) {
            console.error('Eroare anulare:', err);
        } finally {
            setAnulareId(null);
        }
    };

    const programariFiltrate = programari.filter(p =>
        filtruStatus === 'toate' ? true : p.status === filtruStatus
    );

    return (
        <div className="profil-wrapper">
            <div className="profil-hero admin-hero">
                <div className="hero-ornament top-left" />
                <div className="hero-ornament bottom-right" />
                <div className="profil-hero-content">
                    <div className="profil-avatar-ring">
                        <div className="profil-avatar">A</div>
                    </div>
                    <div className="profil-hero-info">
                        <span className="profil-role-badge">Administrator</span>
                        <h1 className="profil-name">Panou de control</h1>
                        <p className="profil-sub">Gestionează conturile și programările platformei BookMed</p>
                    </div>
                </div>
            </div>

            <div className="profil-tabs-bar">
                <button className={`profil-tab ${tab === 'cereri' ? 'active' : ''}`} onClick={() => setTab('cereri')}>
                    <span className="tab-icon">📋</span> Cereri conturi medici
                    {cereri.length > 0 && <span className="tab-badge">{cereri.length}</span>}
                </button>
                <button className={`profil-tab ${tab === 'programari' ? 'active' : ''}`} onClick={() => setTab('programari')}>
                    <span className="tab-icon">📅</span> Toate programările
                </button>
            </div>

            <div className="profil-content">
                {tab === 'cereri' && (
                    <div className="fade-in">
                        <div className="section-heading">
                            <h2>Cereri în așteptare</h2>
                            <p>Verifică datele medicului și aprobă accesul pe platformă</p>
                        </div>
                        {loadingCereri && <div className="loading-row"><div className="mini-spinner" /></div>}
                        {!loadingCereri && cereri.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">✦</span>
                                <p>Nu există cereri în așteptare</p>
                            </div>
                        )}
                        <div className="cards-grid">
                            {cereri.map(m => (
                                <div key={m._id} className={`info-card cerere-card ${aprobatId === m._id ? 'approved-anim' : ''}`}>
                                    <div className="cerere-header">
                                        <div className="cerere-avatar">{(m.nume || 'M')[0].toUpperCase()}</div>
                                        <div className="cerere-header-info">
                                            <strong className="cerere-name">Dr. {m.nume}</strong>
                                            <span className="cerere-spec">{m.specialitate}</span>
                                        </div>
                                        <span className="badge-pending">În așteptare</span>
                                    </div>
                                    <div className="cerere-details">
                                        <div className="detail-row"><span>📧 Email</span><strong>{m.email}</strong></div>
                                        <div className="detail-row"><span>📍 Locație</span><strong>{m.locatie || '—'}</strong></div>
                                        <div className="detail-row"><span>💰 Preț</span><strong>{m.pretConsultatie ? `${m.pretConsultatie} €` : '—'}</strong></div>
                                        <div className="detail-row">
                                            <span>🕐 Program</span>
                                            <strong>{m.program?.oraStart && m.program?.oraSfarsit ? `${m.program.oraStart} – ${m.program.oraSfarsit}` : '—'}</strong>
                                        </div>
                                    </div>
                                    {aprobatId === m._id ? (
                                        <div className="aproba-succes">✦ Cont aprobat cu succes!</div>
                                    ) : (
                                        <button className="btn-aproba" onClick={() => aproba(m._id)}>
                                            Aprobă cont ◆
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'programari' && (
                    <div className="fade-in">
                        <div className="section-heading">
                            <h2>Toate programările</h2>
                            <p>Vizualizare și gestionare completă a programărilor din sistem</p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                            {[
                                { key: 'toate',     label: 'Toate' },
                                { key: 'pending',   label: 'În așteptare' },
                                { key: 'anulata',   label: 'Anulate' },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFiltruStatus(f.key)} className={`filtru-btn ${filtruStatus === f.key ? 'activ' : ''}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {loadingProg && <div className="loading-row"><div className="mini-spinner" /></div>}
                        {!loadingProg && programariFiltrate.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">📅</span>
                                <p>Nu există programări pentru filtrul selectat</p>
                            </div>
                        )}
                        <div className="programari-list">
                            {programariFiltrate.map(p => (
                                <div key={p._id} className={`prog-card fade-in ${p.status === 'anulata' ? 'prog-card-dim' : ''}`}>
                                    <div className="prog-card-left">
                                        <div className="prog-avatar">{(p.pacient?.nume || 'P')[0].toUpperCase()}</div>
                                        <div className="prog-info">
                                            <strong className="prog-name">{p.pacient?.nume || 'Pacient necunoscut'}</strong>
                                            <span className="prog-email">{p.pacient?.email}</span>
                                            <span className="prog-email">👨‍⚕️ Dr. {p.medic?.nume} · {p.medic?.specialitate}</span>
                                        </div>
                                    </div>
                                    <div className="prog-card-right">
                                        <div className="prog-chips">
                                            <span className="prog-chip">📅 {formatData(p.data)}</span>
                                            <span className="prog-chip">🕐 {p.ora}</span>
                                        </div>
                                        <div className="prog-actions">
                                            <StatusBadge status={p.status} />
                                            {p.status !== 'anulata' && (
                                                <button
                                                    className={`btn-anuleaza ${anulareId === p._id ? 'loading' : ''}`}
                                                    onClick={() => anuleaza(p._id)}
                                                    disabled={anulareId === p._id}
                                                >
                                                    {anulareId === p._id ? 'Se anulează...' : 'Anulează'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   MEDIC VIEW
══════════════════════════════════════ */
function MedicView({ user, token }) {
    const [tab, setTab]               = useState('programari');
    const [programari, setProgramari] = useState([]);
    const [loadingProg, setLoadingProg] = useState(true);
    const [anulareId, setAnulareId]   = useState(null);
    const [medic, setMedic]           = useState(null);
    const [form, setForm]             = useState({});
    const [saving, setSaving]         = useState(false);
    const [savedOk, setSavedOk]       = useState(false);

    useEffect(() => {
        fetch(`${API}/programari/medic/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => { setProgramari(Array.isArray(d) ? d : []); setLoadingProg(false); })
            .catch(() => setLoadingProg(false));

        fetch(`${API}/medici/${user.id}`)
            .then(r => r.json())
            .then(d => {
                setMedic(d);
                setForm({
                    nume:            d.nume            || '',
                    email:           d.email           || '',
                    specialitate:    d.specialitate    || '',
                    locatie:         d.locatie         || '',
                    pretConsultatie: d.pretConsultatie || '',
                    oraStart:        d.program?.oraStart   || '',
                    oraSfarsit:      d.program?.oraSfarsit || '',
                    descriere:       d.descriere       || '',
                    telefon:         d.telefon         || '',
                    poza:            d.poza            || '',
                });
            });
    }, [user.id, token]);

    const anuleaza = async (id) => {
        if (!window.confirm('Ești sigur că vrei să anulezi această programare?')) return;
        setAnulareId(id);
        try {
            const res = await fetch(`${API}/programari/${id}/anuleaza-medic`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setProgramari(prev =>
                    prev.map(p => p._id === id ? { ...p, status: 'anulata' } : p)
                );
            }
        } catch (err) {
            console.error('Eroare anulare:', err);
        } finally {
            setAnulareId(null);
        }
    };

    const salveaza = async () => {
        setSaving(true);
        await fetch(`${API}/medici/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                nume:            form.nume,
                email:           form.email,
                specialitate:    form.specialitate,
                locatie:         form.locatie,
                pretConsultatie: form.pretConsultatie,
                descriere:       form.descriere,
                telefon:         form.telefon,
                poza:            form.poza,
                'program.oraStart':   form.oraStart,
                'program.oraSfarsit': form.oraSfarsit,
            }),
        });
        setSaving(false);
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 3000);
    };

    const progActiv   = programari.filter(p => ACTIVE_STATUSES.includes(p.status));
    const progIstoric = programari.filter(p => !ACTIVE_STATUSES.includes(p.status));

    return (
        <div className="profil-wrapper">
            <div className="profil-hero medic-hero">
                <div className="hero-ornament top-left" />
                <div className="hero-ornament bottom-right" />
                <div className="profil-hero-content">
                    <div className="profil-avatar-ring">
                        {form.poza ? (
                            <img src={form.poza} alt="Profil" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div className="profil-avatar">{(user.nume || 'M')[0].toUpperCase()}</div>
                        )}
                    </div>
                    <div className="profil-hero-info">
                        <span className="profil-role-badge">Medic</span>
                        <h1 className="profil-name">Dr. {user.nume}</h1>
                        <p className="profil-sub">
                            {medic?.specialitate || ''}
                            {medic?.locatie ? ` · ${medic.locatie}` : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="profil-tabs-bar">
                <button className={`profil-tab ${tab === 'programari' ? 'active' : ''}`} onClick={() => setTab('programari')}>
                    <span className="tab-icon">📅</span> Programări
                    {progActiv.length > 0 && <span className="tab-badge">{progActiv.length}</span>}
                </button>
                <button className={`profil-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
                    <span className="tab-icon">👤</span> Informații personale
                </button>
            </div>

            <div className="profil-content">
                {tab === 'programari' && (
                    <div className="fade-in">
                        {loadingProg && <div className="loading-row"><div className="mini-spinner" /></div>}

                        {progActiv.length > 0 && (
                            <>
                                <div className="section-heading">
                                    <h2>Programări active</h2>
                                    <p>Pacienții programați la tine</p>
                                </div>
                                <div className="programari-list">
                                    {progActiv.map(p => (
                                        <div key={p._id} className="prog-card fade-in">
                                            <div className="prog-card-left">
                                                <div className="prog-avatar">{(p.pacient?.nume || 'P')[0].toUpperCase()}</div>
                                                <div className="prog-info">
                                                    <strong className="prog-name">{p.pacient?.nume || 'Pacient anonim'}</strong>
                                                    <span className="prog-email">{p.pacient?.email}</span>
                                                </div>
                                            </div>
                                            <div className="prog-card-right">
                                                <div className="prog-chips">
                                                    <span className="prog-chip">📅 {formatData(p.data)}</span>
                                                    <span className="prog-chip">🕐 {p.ora}</span>
                                                    {p.motiv && <span className="prog-chip prog-motiv">💬 {p.motiv}</span>}
                                                </div>
                                                <div className="prog-actions">
                                                    <StatusBadge status={p.status} />
                                                    <button
                                                        className={`btn-anuleaza ${anulareId === p._id ? 'loading' : ''}`}
                                                        onClick={() => anuleaza(p._id)}
                                                        disabled={anulareId === p._id}
                                                    >
                                                        {anulareId === p._id ? 'Se anulează...' : 'Anulează'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {progIstoric.length > 0 && (
                            <>
                                <div className="section-heading" style={{ marginTop: progActiv.length ? '40px' : 0 }}>
                                    <h2>Istoric</h2>
                                    <p>Programări finalizate sau anulate</p>
                                </div>
                                <div className="programari-list">
                                    {progIstoric.map(p => (
                                        <div key={p._id} className="prog-card prog-card-dim fade-in">
                                            <div className="prog-card-left">
                                                <div className="prog-avatar dim">{(p.pacient?.nume || 'P')[0].toUpperCase()}</div>
                                                <div className="prog-info">
                                                    <strong className="prog-name">{p.pacient?.nume || 'Pacient anonim'}</strong>
                                                    <span className="prog-email">{p.pacient?.email}</span>
                                                </div>
                                            </div>
                                            <div className="prog-card-right">
                                                <div className="prog-chips">
                                                    <span className="prog-chip">📅 {formatData(p.data)}</span>
                                                    <span className="prog-chip">🕐 {p.ora}</span>
                                                </div>
                                                <StatusBadge status={p.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {!loadingProg && programari.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">📅</span>
                                <p>Nu ai nicio programare încă</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'info' && (
                    <div className="fade-in">
                        <div className="section-heading">
                            <h2>Informații personale</h2>
                            <p>Modifică datele profilului tău de medic</p>
                        </div>
                        <div className="info-card form-card">
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label>URL Fotografie Profil</label>
                                    <input value={form.poza} onChange={e => setForm({ ...form, poza: e.target.value })} placeholder="Introduceți link-ul pozei (ex: https://...)" />
                                </div>
                                <div className="form-group">
                                    <label>Nume complet</label>
                                    <input value={form.nume} onChange={e => setForm({ ...form, nume: e.target.value })} placeholder="Numele tău" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Specialitate</label>
                                    <input value={form.specialitate} onChange={e => setForm({ ...form, specialitate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Locație / Cabinet</label>
                                    <input value={form.locatie} onChange={e => setForm({ ...form, locatie: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Preț consultație (€)</label>
                                    <input type="number" value={form.pretConsultatie} onChange={e => setForm({ ...form, pretConsultatie: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Oră start program</label>
                                    <input type="time" value={form.oraStart} onChange={e => setForm({ ...form, oraStart: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Oră sfârșit program</label>
                                    <input type="time" value={form.oraSfarsit} onChange={e => setForm({ ...form, oraSfarsit: e.target.value })} />
                                </div>
                                <div className="form-group form-group-full">
                                    <label>Descriere / Bio</label>
                                    <textarea value={form.descriere} onChange={e => setForm({ ...form, descriere: e.target.value })} rows={4} placeholder="Scurtă descriere despre tine..." />
                                </div>
                            </div>
                            <div className="form-footer">
                                {savedOk && <span className="save-ok">✦ Modificările au fost salvate!</span>}
                                <button className={`btn-salveaza ${saving ? 'loading' : ''}`} onClick={salveaza} disabled={saving}>
                                    {saving ? 'Se salvează...' : 'Salvează modificările ◆'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   PACIENT VIEW
══════════════════════════════════════ */
function PacientView({ user, token }) {
    const [tab, setTab]               = useState('programari');
    const [programari, setProgramari] = useState([]);
    const [loadingProg, setLoadingProg] = useState(true);
    const [anulareId, setAnulareId]   = useState(null);
    const [form, setForm]             = useState({
        nume:    user.nume || '',
        email:   user.email || '',
        telefon: '',
        varsta:  '',
        adresa:  '',
    });
    const [saving, setSaving]   = useState(false);
    const [savedOk, setSavedOk] = useState(false);

    useEffect(() => {
        fetch(`${API}/programari/pacient/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => { setProgramari(Array.isArray(d) ? d : []); setLoadingProg(false); })
            .catch(() => setLoadingProg(false));

        // Fetch date pacient din baza de date
        fetch(`${API}/auth/utilizatori/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => {
                setForm({
                    nume:    d.nume    || '',
                    email:   d.email   || '',
                    telefon: d.telefon || '',
                    varsta:  d.varsta  || '',
                    adresa:  d.adresa  || '',
                });
            })
            .catch(err => console.error('Eroare fetch pacient:', err));
    }, [user.id, token]);

    const anuleaza = async (id) => {
        if (!window.confirm('Ești sigur că vrei să anulezi această programare?')) return;
        setAnulareId(id);
        try {
            const res = await fetch(`${API}/programari/${id}/anuleaza-pacient`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setProgramari(prev =>
                    prev.map(p => p._id === id ? { ...p, status: 'anulata' } : p)
                );
            }
        } catch (err) {
            console.error('Eroare anulare:', err);
        } finally {
            setAnulareId(null);
        }
    };

    const salveaza = async () => {
        setSaving(true);
        await fetch(`${API}/auth/utilizatori/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        setSaving(false);
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 3000);
    };

    const progActiv   = programari.filter(p => ACTIVE_STATUSES.includes(p.status));
    const progIstoric = programari.filter(p => !ACTIVE_STATUSES.includes(p.status));

    return (
        <div className="profil-wrapper">
            <div className="profil-hero pacient-hero">
                <div className="hero-ornament top-left" />
                <div className="hero-ornament bottom-right" />
                <div className="profil-hero-content">
                    <div className="profil-avatar-ring">
                        <div className="profil-avatar">{(user.nume || 'P')[0].toUpperCase()}</div>
                    </div>
                    <div className="profil-hero-info">
                        <span className="profil-role-badge">Pacient</span>
                        <h1 className="profil-name">{user.nume}</h1>
                        <p className="profil-sub">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="profil-tabs-bar">
                <button className={`profil-tab ${tab === 'programari' ? 'active' : ''}`} onClick={() => setTab('programari')}>
                    <span className="tab-icon">📅</span> Programările mele
                    {progActiv.length > 0 && <span className="tab-badge">{progActiv.length}</span>}
                </button>
                <button className={`profil-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
                    <span className="tab-icon">👤</span> Informații personale
                </button>
            </div>

            <div className="profil-content">
                {tab === 'programari' && (
                    <div className="fade-in">
                        {loadingProg && <div className="loading-row"><div className="mini-spinner" /></div>}

                        {progActiv.length > 0 && (
                            <>
                                <div className="section-heading">
                                    <h2>Programări active</h2>
                                    <p>Consultațiile tale viitoare</p>
                                </div>
                                <div className="programari-list">
                                    {progActiv.map(p => (
                                        <div key={p._id} className="prog-card fade-in">
                                            <div className="prog-card-left">
                                                <div className="prog-avatar medic-av">{(p.medic?.nume || 'M')[0].toUpperCase()}</div>
                                                <div className="prog-info">
                                                    <strong className="prog-name">Dr. {p.medic?.nume || '—'}</strong>
                                                    <span className="prog-email">{p.medic?.specialitate}</span>
                                                </div>
                                            </div>
                                            <div className="prog-card-right">
                                                <div className="prog-chips">
                                                    <span className="prog-chip">📅 {formatData(p.data)}</span>
                                                    <span className="prog-chip">🕐 {p.ora}</span>
                                                    {p.motiv && <span className="prog-chip prog-motiv">💬 {p.motiv}</span>}
                                                </div>
                                                <div className="prog-actions">
                                                    <StatusBadge status={p.status} />
                                                    <button
                                                        className={`btn-anuleaza ${anulareId === p._id ? 'loading' : ''}`}
                                                        onClick={() => anuleaza(p._id)}
                                                        disabled={anulareId === p._id}
                                                    >
                                                        {anulareId === p._id ? 'Se anulează...' : 'Anulează'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {progIstoric.length > 0 && (
                            <>
                                <div className="section-heading" style={{ marginTop: progActiv.length ? '40px' : 0 }}>
                                    <h2>Istoric</h2>
                                    <p>Consultații anterioare</p>
                                </div>
                                <div className="programari-list">
                                    {progIstoric.map(p => (
                                        <div key={p._id} className="prog-card prog-card-dim fade-in">
                                            <div className="prog-card-left">
                                                <div className="prog-avatar medic-av dim">{(p.medic?.nume || 'M')[0].toUpperCase()}</div>
                                                <div className="prog-info">
                                                    <strong className="prog-name">Dr. {p.medic?.nume || '—'}</strong>
                                                    <span className="prog-email">{p.medic?.specialitate}</span>
                                                </div>
                                            </div>
                                            <div className="prog-card-right">
                                                <div className="prog-chips">
                                                    <span className="prog-chip">📅 {formatData(p.data)}</span>
                                                    <span className="prog-chip">🕐 {p.ora}</span>
                                                </div>
                                                <StatusBadge status={p.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {!loadingProg && programari.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">📅</span>
                                <p>Nu ai nicio programare încă</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'info' && (
                    <div className="fade-in">
                        <div className="section-heading">
                            <h2>Informații personale</h2>
                            <p>Actualizează datele contului tău</p>
                        </div>
                        <div className="info-card form-card">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nume complet</label>
                                    <input value={form.nume} onChange={e => setForm({ ...form, nume: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Vârstă</label>
                                    <input type="number" value={form.varsta} onChange={e => setForm({ ...form, varsta: e.target.value })} />
                                </div>
                                <div className="form-group form-group-full">
                                    <label>Adresă</label>
                                    <input value={form.adresa} onChange={e => setForm({ ...form, adresa: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-footer">
                                {savedOk && <span className="save-ok">✦ Modificările au fost salvate!</span>}
                                <button className={`btn-salveaza ${saving ? 'loading' : ''}`} onClick={salveaza} disabled={saving}>
                                    {saving ? 'Se salvează...' : 'Salvează modificările ◆'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   ROUTER PRINCIPAL
══════════════════════════════════════ */
function ProfilPage() {
    const { user, token } = useAuth();
    if (!user) return <div className="loading-screen-profil"><div className="mini-spinner" /></div>;
    if (user.rol === 'admin')  return <AdminView token={token} />;
    if (user.rol === 'medic')  return <MedicView user={user} token={token} />;
    return <PacientView user={user} token={token} />;
}

export default ProfilPage;
