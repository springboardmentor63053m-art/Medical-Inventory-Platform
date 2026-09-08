import { useEffect, useRef } from 'react'
import UserMessage from './UserMessage'
import AIMessage from './AIMessage'
import TypingIndicator from './TypingIndicator'

export default function ChatMessageList({
  messages,
  isLoading,
  onActionClick
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin space-y-1">
      {messages.map((msg, index) => {
        if (msg.sender === 'user') {
          return <UserMessage key={index} message={msg} />
        }
        return (
          <AIMessage
            key={index}
            message={msg}
            onActionClick={onActionClick}
          />
        )
      })}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} className="h-1" />
    </div>
  )
}
