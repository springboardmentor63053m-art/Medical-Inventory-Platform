import { useState, useEffect } from 'react'
import FloatingAIButton from './FloatingAIButton'
import AIChatHeader from './AIChatHeader'
import SuggestedPrompts from './SuggestedPrompts'
import ChatMessageList from './ChatMessageList'
import ChatInput from './ChatInput'
import { AIService } from './AIService'

const INITIAL_MESSAGE = {
  sender: 'ai',
  text: `## Hello! I'm your MedStock AI Assistant 🤖
I'm here as your intelligent copilot for pharmacy operations, live inventory management, and general knowledge.

You can ask me anything about:
* **Live MedStock Data**: Low stock items, reorder recommendations, batch expiries, sales revenue, supplier lead times, and active alerts.
* **General Knowledge**: Programming (Java, Python, JS, React), mathematics, science, business email drafting, and career advice.

Select a quick question below or type your custom query!`,
  mode: 'MEDSTOCK',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [
    { label: 'Which medicines need reordering?', route: '/inventory', icon: 'ShoppingCart' },
    { label: 'Show Demand Forecast', route: '/ai-insights', icon: 'Sparkles' }
  ]
}

export default function MedStockAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    } else if (isMinimized) {
      setIsMinimized(false)
    } else {
      setIsOpen(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(prev => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleClear = () => {
    setMessages([INITIAL_MESSAGE])
  }

  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      // Pass session conversation history for memory and follow-up understanding
      const response = await AIService.sendMessage(text.trim(), updatedMessages)

      const aiMsg = {
        sender: 'ai',
        text: response.text,
        mode: response.mode || 'GENERAL',
        actions: response.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error('[MedStockAIAssistant] Error processing query:', err)
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm sorry, I couldn't process that request right now. Please try again.",
          mode: 'GENERAL',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 z-50 transition-all duration-300 ease-out flex flex-col
                     bg-slate-900/95 border border-cyan-900/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.18)]
                     backdrop-blur-xl overflow-hidden
                     ${
                       isMinimized
                         ? 'bottom-24 w-[340px] max-w-[calc(100vw-32px)] h-[58px]'
                         : 'bottom-24 w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-120px)]'
                     }`}
        >
          {/* Header */}
          <AIChatHeader
            isMinimized={isMinimized}
            onMinimize={handleMinimize}
            onClose={handleClose}
            onClear={handleClear}
          />

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Optional Suggestion Chips on initial session */}
              {messages.length <= 1 && (
                <SuggestedPrompts onSelectPrompt={handleSendMessage} />
              )}

              {/* Scrollable Message History */}
              <ChatMessageList
                messages={messages}
                isLoading={isLoading}
                onActionClick={() => {
                  // Optional action handler (navigation is handled within AIMessage)
                }}
              />

              {/* Multi-line Chat Input */}
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      )}

      {/* Floating AI Assistant Button */}
      <FloatingAIButton
        onClick={handleToggleOpen}
        isOpen={isOpen}
        isMinimized={isMinimized}
      />
    </>
  )
}
