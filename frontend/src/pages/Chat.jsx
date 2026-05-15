import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', text: input, time: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/chatbot/chat', { message: input })
      setMessages((prev) => [...prev, { role: 'ai', text: data.response, time: data.created_at }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Xin lỗi, AI đang gặp sự cố. Vui lòng thử lại.', time: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tư vấn với AI Chatbot</h1>

      <div className="card p-0 flex flex-col" style={{ height: '65vh' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
                <p>Xin chào! Tôi là trợ lý tư vấn tuyển sinh DUTA.</p>
              <p className="text-sm mt-1">Hãy hỏi tôi về ngành học, điểm chuẩn hoặc trường đại học.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm text-sm text-gray-500">
                AI đang trả lời...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Nhập câu hỏi về tuyển sinh..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            Gửi
          </button>
        </form>
      </div>
    </div>
  )
}
