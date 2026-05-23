import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'notice', label: 'Thông báo' },
  { key: 'news', label: 'Tin tức' },
]

const typeLabel = { news: 'Tin tức', notice: 'Thông báo' }
const typeBadge = {
  notice: 'bg-yellow-100 text-yellow-700',
  news: 'bg-blue-100 text-blue-700',
}

export default function Posts() {
  const [allPosts, setAllPosts] = useState([])
  const [tab, setTab] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get('/posts')
      .then((r) => setAllPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = allPosts.filter((p) => {
    const matchTab = !tab || p.type === tab
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thông báo & Tin tức tuyển sinh</h1>

      {/* Tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          className="input-field w-full"
          placeholder="Tìm kiếm theo tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          {search ? `Không tìm thấy bài viết nào với tiêu đề "${search}".` : 'Chưa có bài viết nào.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/posts/${p.id}`}
              className="card block hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[p.type]}`}>
                      {typeLabel[p.type]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(p.published_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="font-semibold group-hover:text-blue-600 transition-colors truncate">
                    {p.title}
                  </p>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.content}</p>
                </div>
                <span className="text-blue-400 text-sm shrink-0 mt-1">Xem →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
