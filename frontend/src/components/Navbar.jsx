import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const peLoginPage = location.pathname === '/login'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user ? "/listings" : "/"} className="navbar-logo">
          BookMed
        </Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-greeting">Bună, {user.nume}!</span>
            <Link to="/profile" className="navbar-link">Profilul meu</Link>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          !peLoginPage && (
            <Link to="/login" className="navbar-link-btn">Login</Link>
          )
        )}
      </div>
    </nav>
  )
}

export default Navbar
