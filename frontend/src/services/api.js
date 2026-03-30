// services/api.js
const BASE_URL = 'http://localhost:5000/api'

export const getListings = async () => {
  const response = await fetch(`${BASE_URL}/listings`)
  const data = await response.json()
  return data
}

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return await response.json()
}