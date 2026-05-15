import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios'

const GENDER_LABEL = { male: 'Nam', female: 'Nữ', other: 'Khác' }

function UserDetailModal({ userId, onClose, onToggleLock }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const [pwForm, setPwForm] = useState({ new_password: '', confirm_password: '' })
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwShow, setPwShow] = useState({ new_password: false, confirm_password: false })

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then(({ data }) => setUser(data))
      .finally(() => setLoading(false))
  }, [userId])

  const handleToggleLock = async () => {
    setToggling(true)
    try {
      await api.patch(`/admin/users/${userId}/lock`)
      setUser((u) => ({ ...u, is_locked: !u.is_locked }))
      onToggleLock(userId)
    } finally {
      setToggling(false)
    }
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Mật khẩu xác nhận không khớp')
      return
    }
    setPwLoading(true)
    try {
      await api.put(`/admin/users/${userId}/password`, { new_password: pwForm.new_password })
      setPwSuccess('Đặt lại mật khẩu thành công!')
      setPwForm({ new_password: '', confirm_password: '' })
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Đặt lại mật khẩu thất bại')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Thông tin thí sinh</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Đang tải...</div>
        ) : !user ? (
          <div className="py-16 text-center text-red-400">Không tìm thấy thí sinh</div>
        ) : (
          <>
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Avatar + tên */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg leading-tight">{user.full_name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.is_locked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {user.is_locked ? 'Đã khóa' : 'Hoạt động'}
                  </span>
                </div>
              </div>

              {/* Thông tin cơ bản */}
              <Section title="Thông tin cơ bản">
                <Row label="Họ và tên" value={user.full_name} />
                <Row label="Ngày sinh" value={user.date_of_birth
                  ? new Date(user.date_of_birth).toLocaleDateString('vi-VN')
                  : null} />
                <Row label="Giới tính" value={GENDER_LABEL[user.gender] || null} />
              </Section>

              {/* Thông tin liên lạc */}
              <Section title="Thông tin liên lạc">
                <Row label="Số điện thoại" value={user.phone} />
                <Row label="Email" value={user.email} />
                <Row label="Địa chỉ" value={user.address} />
              </Section>

              {/* Sở thích */}
              {user.interests && (
                <Section title="Sở thích">
                  <p className="text-sm text-gray-700">{user.interests}</p>
                </Section>
              )}

              {/* Tài khoản */}
              <Section title="Tài khoản">
                <Row label="Ngày đăng ký" value={new Date(user.created_at).toLocaleDateString('vi-VN')} />
                <Row label="Vai trò" value={user.role === 'admin' ? 'Quản trị viên' : 'Thí sinh'} />
              </Section>

              {/* Đặt lại mật khẩu */}
              <Section title="Đặt lại mật khẩu">
                {pwSuccess && (
                  <div className="bg-green-50 text-green-600 p-2 rounded-lg mb-3 text-sm">{pwSuccess}</div>
                )}
                {pwError && (
                  <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-3 text-sm">{pwError}</div>
                )}
                <form onSubmit={handlePwSubmit} className="space-y-3 mt-2">
                  {[
                    { name: 'new_password', label: 'Mật khẩu mới', placeholder: 'Nhập mật khẩu mới' },
                    { name: 'confirm_password', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
                  ].map(({ name, label, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type={pwShow[name] ? 'text' : 'password'}
                          className="input-field text-sm pr-9"
                          placeholder={placeholder}
                          value={pwForm[name]}
                          onChange={(e) => setPwForm(p => ({ ...p, [name]: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setPwShow(s => ({ ...s, [name]: !s[name] }))}
                          tabIndex={-1}
                        >
                          {pwShow[name] ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {pwLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </button>
                </form>
              </Section>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
              <button onClick={onClose} className="btn-secondary">Đóng</button>
              <button
                onClick={handleToggleLock}
                disabled={toggling}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  user.is_locked
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {toggling ? '...' : user.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex text-sm">
      <span className="w-36 shrink-0 text-gray-500">{label}</span>
      <span className="text-gray-800">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const fetchUsers = useCallback(async (q = '') => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/admin/users?search=${encodeURIComponent(q)}`)
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Không tải được danh sách thí sinh')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleLock = async (user) => {
    if (togglingId === user.id) return
    setTogglingId(user.id)
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, is_locked: !u.is_locked } : u)
    )
    try {
      await api.patch(`/admin/users/${user.id}/lock`)
      await fetchUsers(search)
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, is_locked: user.is_locked } : u)
      )
      setError(err.response?.data?.detail || 'Thao tác thất bại, vui lòng thử lại')
    } finally {
      setTogglingId(null)
    }
  }

  // Đồng bộ trạng thái lock từ modal về danh sách
  const handleModalToggle = (userId) => {
    setUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, is_locked: !u.is_locked } : u)
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(search)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý thí sinh</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang tải...' : 'Tìm kiếm'}
        </button>
        {search && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setSearch(''); fetchUsers('') }}
          >
            Xóa lọc
          </button>
        )}
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Họ tên', 'Email', 'Điện thoại', 'Ngày tạo', 'Trạng thái', 'Hành động'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">Đang tải...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  {search ? `Không tìm thấy thí sinh với từ khóa "${search}"` : 'Chưa có thí sinh nào'}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isToggling = togglingId === u.id
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-gray-50 cursor-pointer ${isToggling ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td className="px-4 py-3 font-medium">{u.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.is_locked
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {u.is_locked ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleLock(u)}
                        disabled={isToggling}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          u.is_locked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {isToggling ? '...' : u.is_locked ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {loading && users.length > 0 && (
          <div className="text-center py-2 text-xs text-gray-400 border-t bg-gray-50">
            Đang cập nhật...
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onToggleLock={handleModalToggle}
        />
      )}
    </div>
  )
}
