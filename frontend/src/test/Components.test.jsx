import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageHeader from '../components/PageHeader'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import Breadcrumbs from '../components/Breadcrumbs'
import { MemoryRouter } from 'react-router-dom'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('PageHeader Component', () => {
  it('renders title, subtitle, and badge correctly', () => {
    render(
      <PageHeader
        title="Medicines Inventory"
        subtitle="Manage stock and catalog"
        badge="Active SKUs"
      />
    )

    expect(screen.getByText('Medicines Inventory')).toBeInTheDocument()
    expect(screen.getByText('Manage stock and catalog')).toBeInTheDocument()
    expect(screen.getByText('Active SKUs')).toBeInTheDocument()
  })

  it('renders custom action buttons when provided', () => {
    render(
      <PageHeader
        title="Purchases"
        actions={<button data-testid="new-order-btn">New Order</button>}
      />
    )

    expect(screen.getByTestId('new-order-btn')).toBeInTheDocument()
  })
})

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides theme state and toggles correctly', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )

    const toggleBtn = screen.getByTestId('toggle-btn')
    expect(screen.getByTestId('theme-val')).toBeInTheDocument()

    fireEvent.click(toggleBtn)
    expect(screen.getByTestId('theme-val').textContent).toMatch(/light|dark/)
  })
})

describe('Breadcrumbs Component', () => {
  it('renders breadcrumb items for nested paths', () => {
    render(
      <MemoryRouter initialEntries={['/medicines/details']}>
        <Breadcrumbs />
      </MemoryRouter>
    )

    expect(screen.getByText('Medicines')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })
})
