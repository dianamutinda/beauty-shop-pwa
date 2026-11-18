
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('shop-theme') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme

    localStorage.setItem('shop-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current =>
      current === 'light' ? 'dark' : 'light'
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error(
      'useTheme must be used within ThemeProvider'
    )
  }

  return context
}
