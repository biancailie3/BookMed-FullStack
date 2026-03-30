
import React, { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    // ── Citim din localStorage la start — persistăm sesiunea între refresh-uri ──
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('bookmed_user')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    const [token, setToken] = useState(() => {
        return localStorage.getItem('bookmed_token') || null
    })

    const login = (userData, tokenData) => {
        setUser(userData)
        setToken(tokenData)
        // Salvăm în localStorage ca să supraviețuiască refresh-ului
        localStorage.setItem('bookmed_user', JSON.stringify(userData))
        localStorage.setItem('bookmed_token', tokenData)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('bookmed_user')
        localStorage.removeItem('bookmed_token')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
