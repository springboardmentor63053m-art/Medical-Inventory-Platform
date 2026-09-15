import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import FloatingAIButton from './FloatingAIButton'
import AIChatHeader from './AIChatHeader'
import SuggestedPrompts from './SuggestedPrompts'
import ChatMessageList from './ChatMessageList'
import ChatInput from './ChatInput'
import { AIService } from './AIService'

const INITIAL_MESSAGE = {
  sender: 'ai',
  text: `I'm your dedicated conversational pharmacy copilot. I analyze live inventory levels, FEFO batch expiry dates, demand forecasting, sales revenue, and supplier fulfillment in real-time.

Select a quick question below or ask me anything about your pharmacy!`,
  mode: 'MEDSTOCK',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actions: [
    { label: 'Which medicines need reordering?', route: '/inventory', icon: 'ShoppingCart' },
    { label: 'Show Demand Forecast', route: '/ai-insights', icon: 'Sparkles' }
  ]
}

export default function MedStockAIAssistant() {
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showPrompts, setShowPrompts] = useState(true)
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

  const handleToggleMaximize = () => {
    setIsMaximized(prev => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setIsMaximized(false)
  }

  const handleClear = () => {
    setMessages([INITIAL_MESSAGE])
    setShowPrompts(true)
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
    setShowPrompts(false) // Auto-hide prompts once user engages in active conversation

    try {
      const response = await AIService.sendMessage(text.trim(), updatedMessages)

      const aiMsg = {
        sender: 'ai',
        text: response.text,
        mode: response.mode || 'MEDSTOCK',
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
      {/* Dedicated Floating Conversational AI Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col rounded-3xl backdrop-blur-2xl overflow-hidden ${
            isDark
              ? 'bg-[#070f22] border border-cyan-500/35 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.18)] text-slate-200'
              : 'bg-white border border-slate-200 shadow-2xl text-slate-800'
          } ${
                       isMinimized
                         ? 'bottom-24 right-4 sm:right-6 w-[340px] max-w-[calc(100vw-32px)] h-[60px]'
                         : isMaximized
                         ? 'inset-4 sm:inset-8 w-auto h-auto max-w-5xl max-h-[90vh] mx-auto'
                         : 'bottom-24 right-4 sm:right-6 w-[480px] max-w-[calc(100vw-32px)] h-[680px] max-h-[calc(100vh-110px)]'
                     }`}
        >
          {/* Header */}
          <AIChatHeader
            isMinimized={isMinimized}
            isMaximized={isMaximized}
            showPrompts={showPrompts}
            onMinimize={handleMinimize}
            onToggleMaximize={handleToggleMaximize}
            onTogglePrompts={() => setShowPrompts(!showPrompts)}
            onClose={handleClose}
            onClear={handleClear}
          />

          {/* Body when not minimized */}
          {!isMinimized && (
            <div className={`flex-1 flex flex-col min-h-0 relative ${
              isDark ? 'bg-[#070f22]' : 'bg-white'
            }`}>
              {/* Suggested Questions: Pills when prompts false (Image 1), Grid Drawer when true (Image 2) */}
              <SuggestedPrompts
                onSelectPrompt={handleSendMessage}
                onClose={() => setShowPrompts(false)}
                variant={showPrompts ? 'grid' : 'pills'}
              />

              {/* Scrollable Message History */}
              <ChatMessageList
                messages={messages}
                isLoading={isLoading}
                onActionClick={() => {
                  // Handled within AIMessage navigation
                }}
                isFloating={true}
              />

              {/* Conversational Input Bar: Universal (Image 1) or Clinical (Image 2) */}
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                variant={showPrompts ? 'clinical' : 'universal'}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating AI Assistant Button (visible at bottom-right) */}
      <FloatingAIButton
        onClick={handleToggleOpen}
        isOpen={isOpen}
        isMinimized={isMinimized}
      />
    </>
  )
}
