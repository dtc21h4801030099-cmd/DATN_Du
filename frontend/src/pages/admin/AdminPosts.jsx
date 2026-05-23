import { useEffect, useState } from 'react'
import api from '../../api/axios'

const empty = { title: '', content: '', type: 'news' }

export default function AdminPosts() {
  const [allPosts, setAllPosts] = useState([])
  const [search, setSearch] = useState('')
  const [tabFilter, setTabFilter] = useState('')
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [error, setError] = useState('')

  const fetchPosts = () => api.get('/posts').then((r) => setAllPosts(r.data)).catch(() => {})
  useEffect(() => { fetchPosts() }, [])

  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true); setError('') }
  const openEdit = (p) => { setForm({ title: p.title, content: p.content, type: p.type }); setEditing(p.id); setShowForm(true); setError('') }
  const openView = (p) => setViewing(p)
  const closeView = () => setViewing(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) await api.put(`/posts/${editing}`, form)
      else await api.post('/posts', form)
      setShowForm(false)
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Lỗi lưu bài viết')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài viết này?')) return
    await api.delete(`/posts/${id}`)
    fetchPosts()
  }

  const typeLabel = { news: 'Tin tức', notice: 'Thông báo' }
  const typeBadge = {
    notice: 'bg-yellow-100 text-yellow-700',
    news: 'bg-blue-100 text-blue-700',
  }

  const TABS = [
    { key: '', label: 'Tất cả' },
    { key: 'notice', label: 'Thông báo' },
    { key: 'news', label: 'Tin tức' },
  ]

  const posts = allPosts.filter((p) => {
    const matchTab = !tabFilter || p.type === tabFilter
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <button onClick={openCreate} className="btn-primary">+ Thêm bài viết</button>
      </div>

      {/* Tìm kiếm & lọc */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Tìm kiếm theo tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTabFilter(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                tabFilter === t.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại</label>
                <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="news">Tin tức</option>
                  <option value="notice">Thông báo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung *</label>
              <textarea className="input-field" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Lưu</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((p) => (
          <div
            key={p.id}
            className="card cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
            onClick={() => openView(p)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[p.type] || 'bg-gray-100 text-gray-600'}`}>
                    {typeLabel[p.type] || p.type}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(p.published_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.content}</p>
              </div>
              <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(p)} className="btn-secondary text-sm py-1">Sửa</button>
                <button onClick={() => handleDelete(p.id)} className="btn-danger text-sm py-1">Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeView}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-6 border-b">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[viewing.type] || 'bg-gray-100 text-gray-600'}`}>
                    {typeLabel[viewing.type] || viewing.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(viewing.published_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{viewing.title}</h2>
              </div>
              <button onClick={closeView} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6">
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">{viewing.content}</p>
            </div>

            <div className="flex gap-2 p-6 pt-0">
              <button onClick={() => { closeView(); openEdit(viewing) }} className="btn-primary text-sm">Sửa</button>
              <button onClick={closeView} className="btn-secondary text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
