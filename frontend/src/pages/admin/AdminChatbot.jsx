import { useEffect, useState } from 'react'
import api from '../../api/axios'

const emptyFaq = { question: '', answer: '' }

export default function AdminChatbot() {
  const [tab, setTab] = useState('stats')

  // --- History & Stats ---
  const [stats, setStats] = useState({ total: 0, today: 0, unique_users: 0 })
  const [allHistory, setAllHistory] = useState([])
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [filterUserId, setFilterUserId] = useState('')
  const [topQuestions, setTopQuestions] = useState([])
  const [topQDate, setTopQDate] = useState('')
  const [topQLoading, setTopQLoading] = useState(false)

  // --- Question Detail Modal ---
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [questionAnswers, setQuestionAnswers] = useState([])
  const [answersLoading, setAnswersLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [addFaqStatus, setAddFaqStatus] = useState('')

  // --- FAQ ---
  const [faqs, setFaqs] = useState([])
  const [faqForm, setFaqForm] = useState(emptyFaq)
  const [editingFaq, setEditingFaq] = useState(null)
  const [showFaqForm, setShowFaqForm] = useState(false)
  const [faqError, setFaqError] = useState('')

  useEffect(() => {
    api.get('/chatbot/admin/stats').then((r) => setStats(r.data)).catch(() => {})
    api.get('/chatbot/admin/history')
      .then((r) => { setHistory(r.data); setAllHistory(r.data) })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
    api.get('/faq').then((r) => setFaqs(r.data)).catch(() => {})
    api.get('/chatbot/admin/top-questions').then((r) => setTopQuestions(r.data)).catch(() => {})
  }, [])

  const fetchHistory = (uid = filterUserId) => {
    setHistoryLoading(true)
    const params = uid ? `?user_id=${uid}` : ''
    api.get(`/chatbot/admin/history${params}`)
      .then((r) => setHistory(r.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }

  const handleUserFilter = (e) => {
    const raw = e.target.value
    const num = parseInt(raw, 10)
    if (raw === '' || num <= 0) {
      setFilterUserId('')
      fetchHistory('')
    } else {
      setFilterUserId(String(num))
      fetchHistory(String(num))
    }
  }

  const handleQuestionClick = (message) => {
    setSelectedQuestion(message)
    setSelectedAnswer(null)
    setAddFaqStatus('')
    setAnswersLoading(true)
    api.get(`/chatbot/admin/question-answers?message=${encodeURIComponent(message)}`)
      .then((r) => setQuestionAnswers(r.data))
      .catch(() => setQuestionAnswers([]))
      .finally(() => setAnswersLoading(false))
  }

  const handleAddToFaqFromModal = async () => {
    if (!selectedAnswer) return
    setAddFaqStatus('loading')
    try {
      await api.post('/faq', { question: selectedQuestion, answer: selectedAnswer })
      setAddFaqStatus('success')
      fetchFaqs()
    } catch {
      setAddFaqStatus('error')
    }
  }

  const fetchTopQuestions = (d = topQDate) => {
    setTopQLoading(true)
    const params = d ? `?filter_date=${d}` : ''
    api.get(`/chatbot/admin/top-questions${params}`)
      .then((r) => setTopQuestions(r.data))
      .catch(() => {})
      .finally(() => setTopQLoading(false))
  }

  // --- Stats computed from unfiltered allHistory ---
  const uniqueUsers = [...new Set(allHistory.map((h) => h.user_id))]
  const totalMessages = allHistory.length
  const userMsgCount = uniqueUsers.map((uid) => ({
    uid,
    count: allHistory.filter((h) => h.user_id === uid).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5)

  // --- FAQ handlers ---
  const fetchFaqs = () => api.get('/faq').then((r) => setFaqs(r.data)).catch(() => {})

  const openCreateFaq = () => { setFaqForm(emptyFaq); setEditingFaq(null); setShowFaqForm(true); setFaqError('') }
  const openEditFaq = (f) => { setFaqForm({ question: f.question, answer: f.answer }); setEditingFaq(f.id); setShowFaqForm(true); setFaqError('') }

  const handleFaqSubmit = async (e) => {
    e.preventDefault()
    setFaqError('')
    try {
      if (editingFaq) await api.put(`/faq/${editingFaq}`, faqForm)
      else await api.post('/faq', faqForm)
      setShowFaqForm(false)
      fetchFaqs()
    } catch (err) {
      setFaqError(err.response?.data?.detail || 'Lỗi lưu FAQ')
    }
  }

  const handleDeleteFaq = async (id) => {
    if (!confirm('Xóa FAQ này?')) return
    await api.delete(`/faq/${id}`)
    fetchFaqs()
  }

  const tabs = [
    { key: 'stats', label: 'Thống kê' },
    { key: 'history', label: 'Lịch sử' },
    { key: 'faq', label: 'Quản lý FAQ' },
  ]

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-100 -mx-8 px-8 pt-4 pb-2">
        <h1 className="text-2xl font-bold mb-1">Quản lý AI Chatbot</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.key
                ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      </div>

      {/* ===== TAB: THỐNG KÊ ===== */}
      {tab === 'stats' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1">Tổng hội thoại</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">{stats.today}</p>
              <p className="text-sm text-gray-500 mt-1">Hôm nay</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.unique_users}</p>
              <p className="text-sm text-gray-500 mt-1">Người dùng đã chat</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Top người dùng hoạt động nhất</h3>
            {userMsgCount.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {userMsgCount.map(({ uid, count }, idx) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  return (
                    <div key={uid}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">
                          {`${idx + 1}.`} User #{uid}
                        </span>
                        <span className="font-medium">{count} tin nhắn ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Top 10 câu hỏi được hỏi nhiều nhất</h3>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="input-field py-1 text-sm"
                  value={topQDate}
                  onChange={(e) => { setTopQDate(e.target.value); fetchTopQuestions(e.target.value) }}
                />
                {topQDate && (
                  <button
                    className="btn-secondary text-sm py-1"
                    onClick={() => { setTopQDate(''); fetchTopQuestions('') }}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>
            {topQLoading ? (
              <p className="text-gray-400 text-sm italic">Đang tải...</p>
            ) : topQuestions.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Chưa có dữ liệu</p>
            ) : (
              <ol className="space-y-1">
                {topQuestions.map(({ message, count }, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm cursor-pointer rounded-lg px-2 py-1.5 hover:bg-blue-50 transition-colors group"
                    onClick={() => handleQuestionClick(message)}
                  >
                    <span className="w-5 shrink-0 font-bold text-blue-500">{idx + 1}.</span>
                    <span className="flex-1 text-gray-700 group-hover:text-blue-700">{message}</span>
                    <span className="shrink-0 font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                      {count} lần
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="card mt-4 bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-blue-700 mb-2">Thông tin AI</h3>
            <p className="text-sm text-gray-600">Context AI được tổng hợp từ <strong>{uniqueUsers.length > 0 ? 'ngành học + trường ĐH + FAQ' : 'ngành học + trường ĐH'}</strong> trong hệ thống.</p>
            <p className="text-sm text-gray-500 mt-1">
              Hiện có <strong>{faqs.length} FAQ</strong> — Cập nhật dữ liệu tại tab <em>Quản lý FAQ</em> hoặc mục <em>Ngành học / Trường ĐH</em>.
            </p>
          </div>
        </div>
      )}

      {/* ===== TAB: LỊCH SỬ ===== */}
      {tab === 'history' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Lọc theo User ID:</label>
            <input
              type="number"
              className="input-field w-40"
              placeholder="Tất cả"
              min="1"
              value={filterUserId}
              onChange={handleUserFilter}
            />
            {filterUserId && (
              <button
                className="btn-secondary text-sm py-1"
                onClick={() => { setFilterUserId(''); fetchHistory('') }}
              >
                Xóa lọc
              </button>
            )}
            <span className="text-sm text-gray-400 ml-auto">{history.length} kết quả</span>
          </div>

          {historyLoading ? (
            <div className="text-center py-8 text-gray-400">Đang tải...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Chưa có hội thoại nào</div>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.id} className="card">
                  <div className="flex justify-between text-xs text-gray-400 mb-3">
                    <span className="font-medium text-gray-600">User #{h.user_id}</span>
                    <span>{new Date(h.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Người dùng hỏi:</p>
                      <p className="text-sm">{h.message}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-400 mb-1">AI trả lời:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{h.response}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: FAQ ===== */}
      {tab === 'faq' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">
                FAQ được inject trực tiếp vào context AI — AI sẽ dùng để trả lời chính xác hơn.
              </p>
            </div>
            <button onClick={openCreateFaq} className="btn-primary">+ Thêm FAQ</button>
          </div>

          {showFaqForm && (
            <div className="card mb-5">
              <h2 className="font-semibold mb-4">{editingFaq ? 'Sửa FAQ' : 'Thêm FAQ mới'}</h2>
              {faqError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 text-sm">{faqError}</div>}
              <form onSubmit={handleFaqSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Câu hỏi *</label>
                  <input
                    className="input-field"
                    placeholder="VD: Ngành CNTT cần thi khối gì?"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Câu trả lời *</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="VD: Ngành CNTT thường xét tuyển khối A00, A01, D01..."
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Lưu</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowFaqForm(false)}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          {faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Chưa có FAQ nào. Thêm câu hỏi thường gặp để AI trả lời chính xác hơn.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <div key={f.id} className="card">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        <span className="text-blue-500 mr-2">Q{idx + 1}.</span>{f.question}
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-line pl-6">{f.answer}</p>
                      <p className="text-xs text-gray-300 mt-2 pl-6">
                        {new Date(f.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditFaq(f)} className="btn-secondary text-sm py-1">Sửa</button>
                      <button onClick={() => handleDeleteFaq(f.id)} className="btn-danger text-sm py-1">Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* ===== MODAL: CHI TIẾT CÂU HỎI ===== */}
      {selectedQuestion && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b gap-4">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Câu hỏi</p>
                <p className="font-semibold text-gray-900">{selectedQuestion}</p>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5">
              {answersLoading ? (
                <p className="text-gray-400 text-sm italic text-center py-8">Đang tải câu trả lời...</p>
              ) : questionAnswers.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center py-8">Chưa có câu trả lời nào được ghi nhận.</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Chọn 1 câu trả lời để thêm vào FAQ
                    <span className="ml-2 text-gray-400 font-normal">({questionAnswers.length} câu trả lời duy nhất)</span>
                  </p>
                  <div className="space-y-3">
                    {questionAnswers.map((a, idx) => (
                      <label
                        key={idx}
                        className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAnswer === a.response
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          className="mt-1 shrink-0 accent-blue-600"
                          checked={selectedAnswer === a.response}
                          onChange={() => { setSelectedAnswer(a.response); setAddFaqStatus('') }}
                        />
                        <p className="flex-1 text-sm text-gray-700 whitespace-pre-wrap min-w-0">{a.response}</p>
                        <span className="shrink-0 self-start text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {a.count} lần
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t flex items-center gap-3">
              {addFaqStatus === 'success' && (
                <span className="text-green-600 text-sm font-medium">Đã thêm vào FAQ thành công!</span>
              )}
              {addFaqStatus === 'error' && (
                <span className="text-red-600 text-sm font-medium">Lỗi khi lưu, vui lòng thử lại.</span>
              )}
              <div className="ml-auto flex gap-2">
                <button className="btn-secondary" onClick={() => setSelectedQuestion(null)}>Đóng</button>
                <button
                  className="btn-primary"
                  disabled={!selectedAnswer || addFaqStatus === 'loading' || addFaqStatus === 'success'}
                  onClick={handleAddToFaqFromModal}
                >
                  {addFaqStatus === 'loading' ? 'Đang lưu...' : '+ Thêm vào FAQ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
