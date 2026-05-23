import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? '/home' : '/login'} className="text-xl font-bold tracking-wide">
          DUTA
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/majors" className="hover:text-blue-200 transition-colors">Ngành học</Link>
          <Link to="/universities" className="hover:text-blue-200 transition-colors">Trường Đại học</Link>
          <Link to="/posts" className="hover:text-blue-200 transition-colors">Nội dung</Link>

          {user ? (
            <>
              <Link to="/chat" className="hover:text-blue-200 transition-colors">Tư vấn AI</Link>
              {isAdmin && (
                <Link to="/admin" className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-300 transition-colors">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <Link to="/profile" className="hover:text-blue-200 transition-colors">
                  {user.full_name}
                </Link>
                <button onClick={handleLogout} className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors text-xs">
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hover:text-blue-200 transition-colors">Đăng nhập</Link>
              <Link to="/register" className="bg-white text-blue-700 px-3 py-1 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
