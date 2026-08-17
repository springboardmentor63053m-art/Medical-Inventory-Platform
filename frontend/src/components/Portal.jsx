import { createPortal } from 'react-dom'

/**
 * Renders children directly into document.body using a React Portal.
 * This ensures modals are never clipped by parent overflow:hidden containers.
 */
export default function Portal({ children }) {
  return createPortal(children, document.body)
}
