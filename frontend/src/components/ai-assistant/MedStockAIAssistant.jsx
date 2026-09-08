import { useState } from 'react'
import FloatingAIButton from './FloatingAIButton'
import MedStockAIModal from './MedStockAIModal'

export default function MedStockAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Full-Screen MedStock AI Assistant Command Center (Matching Exact Mockup) */}
      <MedStockAIModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* Floating AI Assistant Button (when modal is closed) */}
      {!isOpen && (
        <FloatingAIButton
          onClick={() => setIsOpen(true)}
          isOpen={isOpen}
        />
      )}
    </>
  )
}
