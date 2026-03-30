import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ListingsPage from './pages/ListingsPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoutes'
import MedicPage from './pages/MedicPage'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/listings" element={
            <ProtectedRoute>
              <ListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/medic/:id" element={
            <ProtectedRoute>
              <MedicPage />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
