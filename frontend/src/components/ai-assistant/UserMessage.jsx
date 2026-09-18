export default function UserMessage({ message }) {
  const timeStr = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col items-end mb-4 animate-fade-in group">
      <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-900/20 text-[13px] leading-relaxed break-words font-normal">
        {message.text}
      </div>
      <span className="text-[10px] text-slate-500 mt-1 mr-1">
        {timeStr}
      </span>
    </div>
  )
}
