import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const links = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/users', label: 'Thí sinh' },
  { to: '/admin/majors', label: 'Ngành học' },
  { to: '/admin/universities', label: 'Trường Đại học' },
  { to: '/admin/posts', label: 'Bài viết' },
  { to: '/admin/chatbot', label: 'AI Chatbot' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <p className="font-bold text-lg">DUTA Admin</p>
          <p className="text-gray-400 text-xs mt-1">{user?.full_name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-gray-400 hover:text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
