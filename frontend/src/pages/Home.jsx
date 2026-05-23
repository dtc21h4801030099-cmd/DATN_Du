import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ universities: 0, majors: 0, posts: 0 })

  useEffect(() => {
    api.get('/posts').then((r) => {
      const all = r.data
      setPosts(all.slice(0, 3))
      setStats((s) => ({ ...s, posts: all.length }))
    }).catch(() => {})

    api.get('/universities').then((r) => {
      setStats((s) => ({ ...s, universities: r.data.length }))
    }).catch(() => {})

    api.get('/majors').then((r) => {
      setStats((s) => ({ ...s, majors: r.data.length }))
    }).catch(() => {})
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

      {/* Features + Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            title: 'Tra cứu ngành học',
            desc: 'Xem thông tin chi tiết về ngành học, điểm chuẩn, chỉ tiêu tuyển sinh.',
            link: '/majors',
            count: stats.majors,
            countLabel: 'ngành học',
            countTop: true,
          },
          {
            title: 'Tra cứu trường học',
            desc: 'Danh sách các trường đại học với thông tin tuyển sinh đầy đủ.',
            link: '/universities',
            count: stats.universities,
            countLabel: 'trường đại học',
            countTop: true,
          },
          {
            title: 'Tư vấn AI chatbot',
            desc: 'Chat với AI để được tư vấn ngành học phù hợp theo điểm số và sở thích.',
            link: '/chat',
            count: 0,
            countLabel: '',
            countTop: false,
          },
        ].map((f) => (
          <Link key={f.title} to={f.link} className="card hover:shadow-md transition-shadow text-center">
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            {f.countTop && f.count > 0 && (
              <p className="mb-2 text-blue-600 text-sm font-medium">
                Hiện có {f.count} {f.countLabel}
              </p>
            )}
            <p className="text-gray-500 text-sm">{f.desc}</p>
            {!f.countTop && f.count > 0 && (
              <p className="mt-3 text-blue-600 text-sm font-medium">
                Hiện có {f.count} {f.countLabel}
              </p>
            )}
          </Link>
        ))}
      </section>

      {/* Thông báo & Tin tức mới nhất */}
      {posts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Nội dung mới nhất</h2>
              {stats.posts > 0 && (
                <p className="text-sm text-blue-600 font-medium mt-0.5">Hiện có {stats.posts} nội dung</p>
              )}
            </div>
            <Link to="/posts" className="text-blue-600 hover:underline text-sm shrink-0 ml-4">Xem tất cả →</Link>
          </div>
          <div className="space-y-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to={`/posts/${p.id}`}
                className="card flex justify-between items-center hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    p.type === 'notice'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.type === 'notice' ? 'Thông báo' : 'Tin tức'}
                  </span>
                  <span className="font-medium group-hover:text-blue-600 transition-colors truncate">{p.title}</span>
                </div>
                <span className="text-sm text-gray-400 shrink-0 ml-4">
                  {new Date(p.published_at).toLocaleDateString('vi-VN')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
