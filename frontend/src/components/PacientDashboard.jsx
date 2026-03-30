import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function PacientDashboard() {
  const { user, token } = useAuth()
  const [programari, setProgramari] = useState([])

  useEffect(() => {
    fetch(`http://localhost:4000/api/programari/pacient/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgramari(data))
      .catch(err => console.error("Eroare:", err))
},[user.id, token])
  return (
    <div>
      <h1>Programările mele</h1>
      {programari.length === 0 && <p>Nu ai nicio programare încă.</p>}
      {programari.map(p => (
        <div key={p._id}>
          <h3>{p.medic.nume}</h3>
          <p>Specialitate: {p.medic.specialitate}</p>
          <p>Data: {new Date(p.data).toLocaleDateString('ro-RO')}</p>
          <p>Ora: {p.ora}</p>
          <p>Status: {p.status}</p>
        </div>
      ))}
    </div>
  )
}

export default PacientDashboard