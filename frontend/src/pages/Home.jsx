import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    api.get('/posts?post_type=notice').then((r) => setPosts(r.data.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Nền tảng Tư vấn & Tuyển sinh Đại học
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          Tra cứu ngành học, trường đại học và được tư vấn 24/7 bởi AI Chatbot thông minh.
        </p>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { title: 'Tra cứu ngành học', desc: 'Xem thông tin chi tiết về ngành học, điểm chuẩn, chỉ tiêu tuyển sinh.', link: '/majors' },
          { title: 'Tìm trường đại học', desc: 'Danh sách các trường đại học với thông tin tuyển sinh đầy đủ.', link: '/universities' },
          { title: 'Tư vấn AI chatbot', desc: 'Chat với AI để được tư vấn ngành học phù hợp theo điểm số và sở thích.', link: '/chat' },
        ].map((f) => (
          <Link key={f.title} to={f.link} className="card hover:shadow-md transition-shadow text-center">
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </Link>
        ))}
      </section>

      {/* Thông báo */}
      {posts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Thông báo mới nhất</h2>
            <Link to="/posts" className="text-blue-600 hover:underline text-sm">Xem tất cả →</Link>
          </div>
          <div className="space-y-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to={`/posts/${p.id}`}
                className="card flex justify-between items-center hover:shadow-md transition-shadow group"
              >
                <span className="font-medium group-hover:text-blue-600 transition-colors">{p.title}</span>
                <span className="text-sm text-gray-400 shrink-0 ml-4">{new Date(p.published_at).toLocaleDateString('vi-VN')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
