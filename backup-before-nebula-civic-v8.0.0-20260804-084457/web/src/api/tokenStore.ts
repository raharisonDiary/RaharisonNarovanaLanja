const ACCESS_KEY = 'census.accessToken'
const REFRESH_KEY = 'census.refreshToken'
const USER_KEY = 'census.user'

export const tokenStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    const value = localStorage.getItem(USER_KEY)
    return value ? JSON.parse(value) : null
  },
  save: (accessToken: string, refreshToken: string, user: unknown) => {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
