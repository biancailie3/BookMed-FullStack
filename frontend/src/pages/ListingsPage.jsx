import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ListingsPage.css'

function ListingsPage() {
  const { user, token } = useAuth()
  const [medici, setMedici] = useState([])
  const [specialitateSelectata, setSpecialitateSelectata] = useState('toate')

  useEffect(() => {
    const url = specialitateSelectata === 'toate'
      ? 'http://localhost:4000/api/medici'
      : `http://localhost:4000/api/medici/specialitate/${specialitateSelectata}`
    fetch(url)
      .then(res => res.json())
      .then(data => setMedici(data))
      .catch(err => console.error("Eroare:", err))
  }, [specialitateSelectata])

  const stergeMedic = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest medic definitiv?')) return
    try {
      const res = await fetch(`http://localhost:4000/api/medici/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setMedici(prev => prev.filter(m => m._id !== id))
      }
    } catch (err) {
      console.error("Eroare stergere:", err)
    }
  }

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(r)) {
        stars.push(
          <span key={i} style={{ color: '#f5c518' }}>★</span>
        );
      } else if (i === Math.ceil(r) && r % 1 !== 0) {
        stars.push(
          <span key={i} className="half-star-container">
            <span className="star-base">★</span>
            <span className="star-half">★</span>
          </span>
        );
      } else {
        stars.push(
          <span key={i} style={{ color: '#ddd' }}>★</span>
        );
      }
    }
    return stars;
  };

  const specialitati = ['toate', 'Cardiologie', 'Dermatologie', 'Neurologie',
    'Pediatrie', 'Ortopedie', 'Oftalmologie', 'Ginecologie',
    'Psihiatrie', 'Endocrinologie', 'Urologie', 'Reumatologie',
    'Gastroenterologie', 'Alergologie']

  return (
    <div className="listings-container">
      <header className="listings-header">
        <h1>Găsește medicul potrivit</h1>
        <div className="filter-section">
          <select className="specialitate-select" onChange={(e) => setSpecialitateSelectata(e.target.value)}>
            {specialitati.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>
      <div className="medici-grid">
        {medici.map(medic => (
          <div key={medic._id} className="medic-card">
            <div className="medic-avatar">
              <img
                src={medic.poza || '/placeholder-medic.jpg'}
                alt={medic.nume}
                className="medic-img"
              />
            </div>
            <div className="medic-info">
              <span className="specialitate-tag">{medic.specialitate}</span>
              <Link to={`/medic/${medic._id}`} className="medic-name-link">
                <h2>{medic.nume}</h2>
              </Link>
              <div className="medic-rating">
                <span className="stars-emoji">{renderStars(medic.rating)}</span>
                <span className="rating-number">{medic.rating || "5.0"}</span>
                <span className="rating-count">({medic.numarReviewuri || 0} recenzii)</span>
              </div>
              <p className="locatie">📍 {medic.locatie}</p>
              <div className="medic-footer">
                <span className="pret">{medic.pretConsultatie} €</span>
                <Link to={`/medic/${medic._id}`} className="view-btn">Vezi profil</Link>
              </div>
              {user?.rol === 'admin' && (
                <button
                  onClick={() => stergeMedic(medic._id)}
                  style={{
                    marginTop: 10,
                    width: '100%',
                    padding: '8px 0',
                    border: '1px solid #c62828',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#c62828',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🗑 Șterge doctor
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListingsPage
