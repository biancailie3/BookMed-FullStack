import React from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="homepage-container">
      <section className="hero">
        <div className="hero-content">

          <div className="hero-logo">
            <svg width="120" height="140" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffe066"/>
                  <stop offset="40%" stopColor="#f5c518"/>
                  <stop offset="70%" stopColor="#c8960c"/>
                  <stop offset="100%" stopColor="#a0720a"/>
                </linearGradient>
                <linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffe066"/>
                  <stop offset="50%" stopColor="#f5c518"/>
                  <stop offset="100%" stopColor="#c8960c"/>
                </linearGradient>
                <circle id="sparkle" r="1.5" fill="#fff" opacity="0">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </defs>

              <g transform="translate(20, 10)">
                <rect x="37" y="18" width="6" height="80" rx="3" fill="url(#gold)"/>
                <circle cx="40" cy="14" r="7" fill="url(#gold)"/>
                <path d="M40 26 C28 18, 8 14, 4 22 C2 28, 14 30, 28 28 C20 32, 6 34, 6 40 C6 45, 18 42, 38 36" fill="url(#goldH)" opacity="0.95"/>
                <path d="M40 26 C52 18, 72 14, 76 22 C78 28, 66 30, 52 28 C60 32, 74 34, 74 40 C74 45, 62 42, 42 36" fill="url(#goldH)" opacity="0.95"/>
                <path d="M40 36 C30 40, 26 48, 32 54 C38 60, 44 58, 42 66 C40 74, 32 76, 34 84 C36 90, 40 92, 40 98" fill="none" stroke="url(#gold)" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M40 36 C50 40, 54 48, 48 54 C42 60, 36 58, 38 66 C40 74, 48 76, 46 84 C44 90, 40 92, 40 98" fill="none" stroke="url(#gold)" strokeWidth="3.5" strokeLinecap="round"/>
                <ellipse cx="37" cy="100" rx="4" ry="3" fill="url(#gold)"/>
                <ellipse cx="43" cy="100" rx="4" ry="3" fill="url(#gold)"/>
              </g>

              <g transform="translate(60, 60)">
                <use href="#sparkle" x="-30" y="-10">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="-10 -20" dur="1.5s" repeatCount="indefinite"/>
                </use>
                <use href="#sparkle" x="-25" y="10">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="-15 -10" dur="1.8s" begin="0.2s" repeatCount="indefinite"/>
                </use>
                <use href="#sparkle" x="30" y="-10">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="10 -20" dur="1.5s" begin="0.4s" repeatCount="indefinite"/>
                </use>
                <use href="#sparkle" x="25" y="15">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="15 -10" dur="1.9s" begin="0.6s" repeatCount="indefinite"/>
                </use>
                <use href="#sparkle" x="0" y="-35">
                  <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -15" dur="1.3s" begin="0.8s" repeatCount="indefinite"/>
                </use>
              </g>
            </svg>
          </div>

          <h1>BookMed</h1>
          <p>Găsește medicul potrivit pentru tine</p>
          <button className="hero-btn" onClick={() => navigate('/login')}>
            Începe acum
          </button>
        </div>
        <div className="scroll-hint">
  <span className="scroll-text">scroll</span>
  <div className="scroll-arrows">
    <span>&#8249;</span>
    <span>&#8249;</span>
  </div>
</div>
      </section>

      <div className="features">
        <h2>De ce BookMed?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">🩺</div>
            <h3>Medici verificați</h3>
            <p>Toți medicii sunt verificați și aprobați de administratorul platformei.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📅</div>
            <h3>Programare ușoară</h3>
            <p>Alege ziua și ora potrivită direct din calendarul medicului.</p>
          </div>
          <div className="feature-card">
            <div className="icon">⚡</div>
            <h3>Rapid și simplu</h3>
            <p>Programează-te în mai puțin de 2 minute, oricând și de oriunde.</p>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>© 2026 BookMed. Toate drepturile rezervate.</p>
      </div>
    </div>
  )
}

export default HomePage