import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:!bg-dark-800 dark:!text-slate-100 dark:!border dark:!border-dark-600',
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
