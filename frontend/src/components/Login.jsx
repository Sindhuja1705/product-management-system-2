import { useState } from 'react'
import { authApi } from '../services/authApi'
import { authStore } from '../services/authStore'
import './Login.css'

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await authApi.login(email, password)
      authStore.login(token, email)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await authApi.register(email, password)
      authStore.login(token, email)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h2>Sign in</h2>
        <p className="login-hint">
          Use your email and password. Default admin: <strong>admin@system.com</strong> / <strong>admin123</strong>
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleRegister}
          >
            {loading ? 'Registering...' : 'Register & sign in'}
          </button>
          <button
            type="button"
            className="btn-dev-skip"
            onClick={() => { authStore.setDevMode(); onSuccess?.() }}
          >
            Continue without login (dev)
          </button>
        </form>
      </div>
    </div>
  )
}
