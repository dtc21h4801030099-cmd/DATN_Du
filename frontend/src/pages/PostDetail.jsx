import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const typeLabel = { news: 'Tin tức', notice: 'Thông báo' }
const typeBadge = {
  notice: 'bg-yellow-100 text-yellow-700',
  news: 'bg-blue-100 text-blue-700',
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then((r) => setPost(r.data))
      .catch(() => navigate('/posts', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="text-gray-400 text-center py-16">Đang tải...</p>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/posts" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 mb-6">
        ← Quay lại danh sách thông báo
      </Link>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[post.type]}`}>
            {typeLabel[post.type]}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(post.published_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-6 leading-snug">{post.title}</h1>

        <div className="border-t pt-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </div>
  )
}
