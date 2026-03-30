
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function MedicDashboard() {
  const { user, token } = useAuth()
  const [programari, setProgramari] = useState([])

  const fetchProgramari = () => {
    fetch(`http://localhost:4000/api/programari/medic/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgramari(data))
      .catch(err => console.error("Eroare:", err))
  }

  useEffect(() => { fetchProgramari() }, [user.id, token])

  const anuleazaProgramare = async (id) => {
    if (!window.confirm("Anulezi această programare?")) return;
    try {
      await fetch(`http://localhost:4000/api/programari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'anulata_de_medic' })
      });
      fetchProgramari(); // Refresh listă
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Programările mele</h1>
      {programari.map(p => (
        <div key={p._id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>Pacient: {p.pacient.nume}</h3>
          <p>Data: {new Date(p.data).toLocaleDateString('ro-RO')} | Ora: {p.ora}</p>
          <p>Status: <strong>{p.status}</strong></p>
          
          {p.status === 'activa' && (
            <button 
              onClick={() => anuleazaProgramare(p._id)}
              style={{ background: '#c0392b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
            >
              Anulează Programarea
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default MedicDashboard;