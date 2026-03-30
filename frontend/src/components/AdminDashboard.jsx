import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './AdminDashboard.css'

function AdminDashboard() {
  const { token } = useAuth()
  const [mediciNeaprobati, setMediciNeaprobati] = useState([])
  const [programari, setProgramari] = useState([])
  const [tabActiv, setTabActiv] = useState('medici') // 'medici' | 'programari'
  const [filtruStatus, setFiltruStatus] = useState('toate')

  // ── Fetch medici neaprobați ──
  useEffect(() => {
    fetch('http://localhost:4000/api/medici/neaprobati', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMediciNeaprobati(Array.isArray(data) ? data : []))
      .catch(err => console.error("Eroare medici:", err))
  }, [token])

  // ── Fetch toate programările ──
  useEffect(() => {
    fetch('http://localhost:4000/api/programari/toate', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgramari(Array.isArray(data) ? data : []))
      .catch(err => console.error("Eroare programări:", err))
  }, [token])

  // ── Aprobă medic ──
  const aprobaMediac = async (id) => {
    await fetch(`http://localhost:4000/api/medici/aproba/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setMediciNeaprobati(prev => prev.filter(m => m._id !== id))
  }

  // ── Anulează programare (admin) ──
  const anuleazaProgramare = async (id) => {
    if (!window.confirm('Ești sigur că vrei să anulezi această programare?')) return
    try {
      const res = await fetch(`http://localhost:4000/api/programari/${id}/anuleaza-admin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setProgramari(prev =>
          prev.map(p => p._id === id ? { ...p, status: 'anulata' } : p)
        )
      }
    } catch (err) {
      console.error("Eroare anulare:", err)
    }
  }

  // ── Helpers ──
  const formatData = (dataStr) =>
    new Date(dataStr).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })

  const badgeStatus = (status) => {
    const map = {
      pending:    { label: 'În așteptare', color: '#b8860b' , bg: '#fff8e1' },
      confirmata: { label: 'Confirmată',   color: '#2e7d32', bg: '#e8f5e9' },
      anulata:    { label: 'Anulată',      color: '#c62828', bg: '#ffebee' },
    }
    const s = map[status] || map.pending
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '3px 10px', borderRadius: '100px',
        fontSize: '0.78rem', fontWeight: 600
      }}>
        {s.label}
      </span>
    )
  }

  const programariFiltrate = programari.filter(p =>
    filtruStatus === 'toate' ? true : p.status === filtruStatus
  )

  return (
    <div style={{ maxWidth: 900, margin: '80px auto 60px', padding: '0 24px', fontFamily: 'Jost, sans-serif' }}>

      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 400, color: '#4e5c43', marginBottom: 8 }}>
        Panou Admin
      </h1>
      <p style={{ color: '#8a8a7a', marginBottom: 32, fontSize: '0.95rem' }}>
        Gestionează medicii și programările din platformă
      </p>

      {/* ── Tab-uri ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid #e0ddd6', paddingBottom: 0 }}>
        {[
          { key: 'medici',     label: `Medici neaprobați (${mediciNeaprobati.length})` },
          { key: 'programari', label: `Programări (${programari.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setTabActiv(tab.key)} style={{
            padding: '10px 22px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'Jost, sans-serif', fontSize: '0.92rem', fontWeight: tabActiv === tab.key ? 600 : 400,
            color: tabActiv === tab.key ? '#4e5c43' : '#8a8a7a',
            borderBottom: tabActiv === tab.key ? '2px solid #c9a84c' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: MEDICI NEAPROBAȚI ══ */}
      {tabActiv === 'medici' && (
        <div>
          {mediciNeaprobati.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ color: '#8a8a7a', textAlign: 'center', padding: '24px 0' }}>
                ✓ Nu sunt medici care așteaptă aprobare.
              </p>
            </div>
          ) : (
            mediciNeaprobati.map(medic => (
              <div key={medic._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#2c2c2c' }}>
                    Dr. {medic.nume}
                  </strong>
                  <p style={metaStyle}>📧 {medic.email}</p>
                  <p style={metaStyle}>🩺 {medic.specialitate} &nbsp;·&nbsp; 📍 {medic.locatie}</p>
                </div>
                <button onClick={() => aprobaMediac(medic._id)} style={btnAprobStyle}>
                  Aprobă contul
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ TAB: PROGRAMĂRI ══ */}
      {tabActiv === 'programari' && (
        <div>
          {/* Filtru status - Am eliminat 'confirmata' de aici */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['toate', 'pending', 'anulata'].map(s => (
              <button key={s} onClick={() => setFiltruStatus(s)} style={{
                padding: '6px 16px', borderRadius: '100px', border: '1px solid',
                borderColor: filtruStatus === s ? '#4e5c43' : '#ddd',
                background: filtruStatus === s ? '#4e5c43' : 'transparent',
                color: filtruStatus === s ? '#fff' : '#666',
                fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
                {{ toate: 'Toate', pending: 'În așteptare', anulata: 'Anulate' }[s]}
              </button>
            ))}
          </div>

          {programariFiltrate.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ color: '#8a8a7a', textAlign: 'center', padding: '24px 0' }}>
                Nu există programări pentru filtrul selectat.
              </p>
            </div>
          ) : (
            programariFiltrate.map(p => (
              <div key={p._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#2c2c2c' }}>
                      {p.pacient?.nume || 'Pacient necunoscut'}
                    </strong>
                    {badgeStatus(p.status)}
                  </div>
                  <p style={metaStyle}>👨‍⚕️ Dr. {p.medic?.nume} &nbsp;·&nbsp; 🩺 {p.medic?.specialitate}</p>
                  <p style={metaStyle}>📅 {formatData(p.data)} &nbsp;·&nbsp; 🕐 {p.ora}</p>
                  <p style={metaStyle}>📧 {p.pacient?.email}</p>
                </div>
                {p.status !== 'anulata' && (
                  <button onClick={() => anuleazaProgramare(p._id)} style={btnAnuleazaStyle}>
                    Anulează
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Stiluri inline ──
const cardStyle = {
  background: '#fff',
  border: '1px solid rgba(201,168,76,0.15)',
  borderRadius: 16,
  padding: '20px 24px',
  marginBottom: 12,
  boxShadow: '0 4px 16px rgba(78,92,67,0.08)',
}

const metaStyle = {
  fontSize: '0.87rem',
  color: '#5a5a4a',
  margin: '3px 0',
  fontWeight: 300,
}

const btnAprobStyle = {
  padding: '10px 22px',
  borderRadius: '100px',
  border: 'none',
  background: 'linear-gradient(135deg, #8a9c78, #4e5c43)',
  color: '#fff',
  fontFamily: 'Jost, sans-serif',
  fontSize: '0.88rem',
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 12px rgba(78,92,67,0.25)',
}

const btnAnuleazaStyle = {
  padding: '10px 22px',
  borderRadius: '100px',
  border: '1px solid #c62828',
  background: 'transparent',
  color: '#c62828',
  fontFamily: 'Jost, sans-serif',
  fontSize: '0.88rem',
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.18s',
}

export default AdminDashboard