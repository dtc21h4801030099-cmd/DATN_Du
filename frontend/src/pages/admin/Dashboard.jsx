import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const CARDS = [
  { key: 'users', label: 'Thí sinh', sub: 'Tài khoản đã đăng ký', from: 'from-blue-500', to: 'to-blue-600', link: '/admin/users' },
  { key: 'majors', label: 'Ngành học', sub: 'Ngành đang quản lý', from: 'from-emerald-500', to: 'to-emerald-600', link: '/admin/majors' },
  { key: 'universities', label: 'Trường ĐH', sub: 'Trường trong hệ thống', from: 'from-violet-500', to: 'to-violet-600', link: '/admin/universities' },
  { key: 'posts', label: 'Bài viết', sub: 'Tin tức & thông báo', from: 'from-orange-500', to: 'to-orange-600', link: '/admin/posts' },
]

const QUICK_LINKS = [
  { label: 'Thêm ngành học mới', link: '/admin/majors', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
  { label: 'Thêm trường đại học', link: '/admin/universities', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
  { label: 'Đăng bài viết mới', link: '/admin/posts', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
  { label: 'Quản lý AI Chatbot', link: '/admin/chatbot', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
  { label: 'Xem danh sách thí sinh', link: '/admin/users', color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, majors: 0, universities: 0, posts: 0 })

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/users'),
      api.get('/majors'),
      api.get('/universities'),
      api.get('/posts'),
    ]).then(([users, majors, unis, posts]) => {
      setStats({
        users: users.value?.data?.length ?? 0,
        majors: majors.value?.data?.length ?? 0,
        universities: unis.value?.data?.length ?? 0,
        posts: posts.value?.data?.length ?? 0,
      })
    })
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-sm text-gray-400 mt-1">Thống kê dữ liệu hiện tại trong hệ thống DUTA</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS.map((c) => (
          <Link
            key={c.key}
            to={c.link}
            className={`bg-gradient-to-br ${c.from} ${c.to} text-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Xem →</span>
            </div>
            <p className="text-4xl font-bold tracking-tight">{stats[c.key]}</p>
            <p className="text-sm font-medium mt-1">{c.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              to={q.link}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${q.color}`}
            >
              <span>{q.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
