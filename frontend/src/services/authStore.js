const TOKEN_KEY = 'jwt_token'
const USER_KEY = 'username'
const DEV_MODE_KEY = 'dev_mode'

export const authStore = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  getUser() {
    return localStorage.getItem(USER_KEY) || (this.isDevMode() ? 'Guest' : null)
  },
  setUser(username) {
    localStorage.setItem(USER_KEY, username)
  },
  setDevMode() {
    localStorage.setItem(DEV_MODE_KEY, '1')
  },
  isDevMode() {
    return !!localStorage.getItem(DEV_MODE_KEY)
  },
  login(token, username) {
    localStorage.removeItem(DEV_MODE_KEY)
    this.setToken(token)
    this.setUser(username)
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(DEV_MODE_KEY)
  },
  isAuthenticated() {
    return !!this.getToken() || this.isDevMode()
  },
}
