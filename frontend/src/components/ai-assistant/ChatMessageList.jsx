import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import UserMessage from './UserMessage'
import AIMessage from './AIMessage'
import TypingIndicator from './TypingIndicator'

export default function ChatMessageList({
  messages,
  isLoading,
  onActionClick,
  isFloating = false
}) {
  const { isDark } = useTheme()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-3 scrollbar-thin space-y-1 ${
      isDark ? 'bg-[#070f22]' : 'bg-slate-50/50'
    }`}>
      {messages.map((msg, index) => {
        if (msg.sender === 'user') {
          return <UserMessage key={index} message={msg} />
        }
        return (
          <AIMessage
            key={index}
            message={msg}
            onActionClick={onActionClick}
            isFloating={isFloating}
          />
        )
      })}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} className="h-1" />
    </div>
  )
}
