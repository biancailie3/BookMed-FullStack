import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [esteLogin, setEsteLogin] = useState(true)
  const [nume, setNume] = useState('')
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [rol, setRol] = useState('pacient')
  const [eroare, setEroare] = useState('')
  const [specialitate, setSpecialitate] = useState('')
  const [locatie, setLocatie] = useState('')
  const [pretConsultatie, setPretConsultatie] = useState('')
  const [programZile, setProgramZile] = useState({
    Luni:     { start: "09:00", sfarsit: "17:00" },
    Marti:    { start: "09:00", sfarsit: "17:00" },
    Miercuri: { start: "09:00", sfarsit: "17:00" },
    Joi:      { start: "09:00", sfarsit: "17:00" },
    Vineri:   { start: "09:00", sfarsit: "17:00" },
    Sambata:  { start: "09:00", sfarsit: "17:00" },
    Duminica: { start: "09:00", sfarsit: "17:00" }
  })
  const [zileActive, setZileActive] = useState(["Luni", "Marti", "Miercuri", "Joi", "Vineri"])

  const toggleZi = (zi) => {
    if (zileActive.includes(zi)) {
      setZileActive(zileActive.filter(z => z !== zi))
    } else {
      setZileActive([...zileActive, zi])
    }
  }

  const modificaOra = (zi, tip, valoare) => {
    setProgramZile({ ...programZile, [zi]: { ...programZile[zi], [tip]: valoare } })
  }

  // Când se schimbă rolul, dacă e admin forțăm modul login
  const handleRolChange = (e) => {
    const newRol = e.target.value
    setRol(newRol)
    if (newRol === 'admin') {
      setEsteLogin(true)
      setEroare('')
    }
  }

  const handleSubmit = async () => {
    const url = esteLogin
      ? 'http://localhost:4000/api/auth/login'
      : 'http://localhost:4000/api/auth/register'

    const body = esteLogin
      ? { email, parola, rol }
      : { nume, email, parola, rol, specialitate, locatie, pretConsultatie, programZile, zileActive }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (esteLogin) {
        if (data.token) {
          login(data.utilizator, data.token)
          navigate('/listings')
        } else {
          setEroare(data.mesaj)
        }
      } else {
        if (data.mesaj === 'Cont creat cu succes!') {
          setEroare('')
          setEsteLogin(true)
          if (rol === 'medic') {
            alert('Felicitări! ✅ Contul tău a fost trimis către admin pentru aprobare.\nVei putea să te loghezi după ce contul este aprobat.')
          } else {
            alert('Cont creat cu succes! ✅ Te poți loga acum.')
          }
        } else {
          setEroare(data.mesaj)
        }
      }
    } catch (err) {
      console.error("Eroare:", err)
      setEroare('A apărut o problemă. Încearcă din nou.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">
            {esteLogin ? 'Bine ai revenit' : 'Creează cont'}
          </h1>
          <p className="login-subtitle">
            {esteLogin ? 'Loghează-te în contul tău BookMed' : 'Alătură-te platformei BookMed'}
          </p>
        </div>

        {/* Selector rol */}
        <div className="login-field">
          <label className="login-label">Rol</label>
          <select className="login-select" onChange={handleRolChange} value={rol}>
            <option value="pacient">Pacient</option>
            <option value="medic">Medic</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Nume - doar la inregistrare, doar pentru non-admin */}
        {!esteLogin && rol !== 'admin' && (
          <div className="login-field">
            <label className="login-label">Nume complet</label>
            <input
              className="login-input"
              type="text"
              placeholder="ex: Ion Popescu"
              value={nume}
              onChange={(e) => setNume(e.target.value)}
            />
          </div>
        )}

        {/* Campuri medic */}
        {!esteLogin && rol === 'medic' && (
          <div className="medic-fields">
            <div className="login-field">
              <label className="login-label">Specialitate</label>
              <input
                className="login-input"
                type="text"
                placeholder="ex: Cardiologie"
                value={specialitate}
                onChange={(e) => setSpecialitate(e.target.value)}
              />
            </div>
            <div className="login-field">
              <label className="login-label">Locație</label>
              <input
                className="login-input"
                type="text"
                placeholder="ex: București"
                value={locatie}
                onChange={(e) => setLocatie(e.target.value)}
              />
            </div>
            <div className="login-field">
              <label className="login-label">Preț consultație (€)</label>
              <input
                className="login-input"
                type="number"
                placeholder="ex: 150"
                value={pretConsultatie}
                onChange={(e) => setPretConsultatie(e.target.value)}
              />
            </div>

            <div className="program-section">
              <p className="program-title">Zile de lucru și program</p>
              {["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"].map(zi => (
                <div key={zi} className="zi-row">
                  <label className="zi-label">
                    <input
                      type="checkbox"
                      className="zi-checkbox"
                      checked={zileActive.includes(zi)}
                      onChange={() => toggleZi(zi)}
                    />
                    <span>{zi}</span>
                  </label>
                  {zileActive.includes(zi) && (
                    <div className="ora-selectors">
                      <select
                        className="ora-select"
                        value={programZile[zi].start}
                        onChange={(e) => modificaOra(zi, 'start', e.target.value)}
                      >
                        {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(ora => (
                          <option key={ora} value={ora}>{ora}</option>
                        ))}
                      </select>
                      <span className="ora-separator">—</span>
                      <select
                        className="ora-select"
                        value={programZile[zi].sfarsit}
                        onChange={(e) => modificaOra(zi, 'sfarsit', e.target.value)}
                      >
                        {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(ora => (
                          <option key={ora} value={ora}>{ora}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        <div className="login-field">
          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="ex: ion@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Parola */}
        <div className="login-field">
          <label className="login-label">Parolă</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
          />
        </div>

        {eroare && <p className="login-eroare">{eroare}</p>}

        <button className="login-btn" onClick={handleSubmit}>
          {esteLogin ? 'Loghează-te' : 'Creează cont'}
        </button>

        {/* Toggle login/register - ascuns pentru admin */}
        {rol !== 'admin' && (
          <p className="login-toggle" onClick={() => { setEsteLogin(!esteLogin); setEroare('') }}>
            {esteLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai cont? Loghează-te'}
          </p>
        )}


      </div>
    </div>
  )
}

export default LoginPage
