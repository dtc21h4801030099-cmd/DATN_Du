import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

const GENDER_LABEL = { male: 'Nam', female: 'Nữ', other: 'Khác' }

function getDaysInMonth(month, year) {
  if (!month) return 31
  const m = parseInt(month)
  const y = parseInt(year) || 2000
  return new Date(y, m, 0).getDate()
}

const STATUS_CONFIG = {
  pending:  { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  approved: { text: 'Đã duyệt',  cls: 'bg-green-100  text-green-700  border border-green-200'  },
  rejected: { text: 'Từ chối',   cls: 'bg-red-100    text-red-600    border border-red-200'    },
}

function isQuotaFull(reg) {
  return (
    reg.status === 'pending' &&
    reg.major_quota != null &&
    reg.major_quota > 0 &&
    reg.major_approved_count != null &&
    reg.major_approved_count >= reg.major_quota
  )
}
const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

function InfoRow({ label, value }) {
  return (
    <div className="flex text-sm py-2 border-b border-gray-100 last:border-0">
      <span className="w-44 shrink-0 text-gray-500">{label}</span>
      <span className="text-gray-800">{value || <span className="text-gray-300 italic">Chưa cập nhật</span>}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</h2>
      <div className="bg-gray-50 rounded-lg px-4 py-1">{children}</div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN')
}

export default function Profile() {
  const { user, login } = useAuth()

  const [profileData, setProfileData] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [registrations, setRegistrations] = useState([])
  const [regLoading, setRegLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwShow, setPwShow] = useState({ old_password: false, new_password: false, confirm_password: false })

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setProfileData(data)
        login(sessionStorage.getItem('token'), data)
      })
      .catch(() => { setProfileData(user) })
      .finally(() => setLoadingProfile(false))

    api.get('/registrations/my')
      .then(({ data }) => setRegistrations(data))
      .catch(() => setRegistrations([]))
      .finally(() => setRegLoading(false))
  }, []) // eslint-disable-line

  const handleCancelReg = async (regId) => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký này?')) return
    try {
      await api.delete(`/registrations/${regId}`)
      setRegistrations((prev) => prev.filter((r) => r.id !== regId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Không thể hủy đăng ký')
    }
  }

  const startEdit = () => {
    const src = profileData || user
    const dob = src?.date_of_birth || ''
    const [dobY, dobM, dobD] = dob ? dob.split('-') : ['', '', '']
    setForm({
      full_name: src?.full_name || '',
      phone: src?.phone || '',
      dob_day: dobD ? String(parseInt(dobD)) : '',
      dob_month: dobM ? String(parseInt(dobM)) : '',
      dob_year: dobY || '',
      gender: src?.gender || '',
      address: src?.address || '',
      interests: src?.interests || '',
    })
    setSuccess('')
    setError('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError('')
  }

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm(prev => ({ ...prev, [name]: value }))
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
      await api.put('/auth/me/password', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      })
      setPwSuccess('Đổi mật khẩu thành công!')
      setPwForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Đổi mật khẩu thất bại')
    } finally {
      setPwLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'dob_month' || name === 'dob_year') {
        const maxDays = getDaysInMonth(
          name === 'dob_month' ? value : prev.dob_month,
          name === 'dob_year' ? value : prev.dob_year
        )
        if (next.dob_day && parseInt(next.dob_day) > maxDays) {
          next.dob_day = String(maxDays)
        }
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { dob_day, dob_month, dob_year } = form
    if (dob_year && dob_month && dob_day) {
      const d = parseInt(dob_day), m = parseInt(dob_month), y = parseInt(dob_year)
      const checked = new Date(y, m - 1, d)
      if (checked.getDate() !== d || checked.getMonth() !== m - 1 || checked.getFullYear() !== y) {
        setError('Ngày sinh không hợp lệ (tháng không có ngày này)')
        return
      }
    }
    setLoading(true)
    try {
      const date_of_birth = (dob_year && dob_month && dob_day)
        ? `${dob_year}-${String(dob_month).padStart(2, '0')}-${String(dob_day).padStart(2, '0')}`
        : null
      const payload = {
        full_name: form.full_name || null,
        phone: form.phone || null,
        date_of_birth,
        gender: form.gender || null,
        address: form.address || null,
        interests: form.interests || null,
      }
      await api.put('/auth/me', payload)

      // Fetch lại từ server để đảm bảo hiển thị đúng dữ liệu đã lưu
      const { data: fresh } = await api.get('/auth/me')
      setProfileData(fresh)
      login(sessionStorage.getItem('token'), fresh)

      setEditing(false)
      setSuccess('Cập nhật thông tin thành công!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const p = profileData || user // nguồn dữ liệu hiển thị

  if (loadingProfile) {
    return <div className="text-center py-20 text-gray-400">Đang tải hồ sơ...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ thí sinh</h1>

      <div className="card">
        {/* Avatar + tên */}
        <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
              {p?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{p?.full_name}</p>
              <p className="text-gray-500 text-sm">{p?.email}</p>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="btn-primary text-sm">
              Chỉnh sửa
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* ===== CHẾ ĐỘ XEM ===== */}
        {!editing && (
          <div className="space-y-5">
            <Section title="Thông tin cơ bản">
              <InfoRow label="Họ và tên" value={p?.full_name} />
              <InfoRow label="Ngày sinh" value={formatDate(p?.date_of_birth)} />
              <InfoRow label="Giới tính" value={GENDER_LABEL[p?.gender]} />
            </Section>
            <Section title="Thông tin liên lạc">
              <InfoRow label="Số điện thoại" value={p?.phone} />
              <InfoRow label="Email" value={p?.email} />
              <InfoRow label="Địa chỉ thường trú" value={p?.address} />
            </Section>
            <Section title="Sở thích & định hướng">
              <InfoRow label="Sở thích" value={p?.interests} />
            </Section>
          </div>
        )}

        {/* ===== CHẾ ĐỘ SỬA ===== */}
        {editing && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b">Thông tin cơ bản</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="full_name" className="input-field"
                    value={form.full_name} onChange={handleChange} required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                  <div className="flex gap-2">
                    <select
                      name="dob_day" className="input-field w-1/3"
                      value={form.dob_day} onChange={handleChange}
                    >
                      <option value="">Ngày</option>
                      {Array.from({ length: getDaysInMonth(form.dob_month, form.dob_year) }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      name="dob_month" className="input-field w-1/3"
                      value={form.dob_month} onChange={handleChange}
                    >
                      <option value="">Tháng</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                    <input
                      type="number" name="dob_year" className="input-field w-1/3"
                      placeholder="Năm" min={1900} max={new Date().getFullYear()}
                      value={form.dob_year} onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giới tính</label>
                  <select name="gender" className="input-field" value={form.gender} onChange={handleChange}>
                    <option value="">-- Chọn giới tính --</option>
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b">Thông tin liên lạc</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input
                    type="tel" name="phone" className="input-field"
                    value={form.phone} onChange={handleChange}
                    placeholder="0xxxxxxxxx" maxLength={10}
                    pattern="^0[0-9]{9}$"
                    title="Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email" className="input-field bg-gray-50 cursor-not-allowed"
                    value={p?.email || ''} readOnly
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Địa chỉ thường trú</label>
                  <input
                    type="text" name="address" className="input-field"
                    value={form.address} onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b">Sở thích & định hướng</h2>
              <textarea
                name="interests" className="input-field resize-none" rows={3}
                value={form.interests} onChange={handleChange}
                placeholder="Ví dụ: lập trình, thiết kế đồ họa, kinh doanh..."
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={cancelEdit} className="btn-secondary flex-1">Hủy</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===== ĐỔI MẬT KHẨU ===== */}
      {!editing && (
        <div className="card mt-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">Đổi mật khẩu</h2>
          {pwSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{pwSuccess}</div>
          )}
          {pwError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{pwError}</div>
          )}
          <form onSubmit={handlePwSubmit} className="space-y-4">
            {[
              { name: 'old_password', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
              { name: 'new_password', label: 'Mật khẩu mới', placeholder: 'Nhập mật khẩu mới' },
              { name: 'confirm_password', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={pwShow[name] ? 'text' : 'password'}
                    name={name} className="input-field pr-10"
                    value={pwForm[name]} onChange={handlePwChange} required
                    placeholder={placeholder}
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
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={pwLoading}>
                {pwLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== NGÀNH ĐÃ ĐĂNG KÝ ===== */}
      {!editing && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Ngành học đã đăng ký</h2>
            {registrations.length > 0 && (
              <span className="text-xs text-gray-500">{registrations.length} ngành</span>
            )}
          </div>

          {regLoading ? (
            <p className="text-center text-gray-400 py-6 text-sm">Đang tải...</p>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">Bạn chưa đăng ký ngành học nào.</p>
              <Link to="/majors" className="inline-block btn-primary text-sm">
                Khám phá ngành học
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap mb-2">
                {['pending', 'approved', 'rejected'].map((s) => {
                  const cnt = registrations.filter(r => r.status === s).length
                  if (!cnt) return null
                  return (
                    <span key={s} className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_CONFIG[s].cls}`}>
                      {STATUS_CONFIG[s].text}: {cnt}
                    </span>
                  )
                })}
              </div>

              {registrations.map((reg) => {
                const sc = STATUS_CONFIG[reg.status]
                const quotaFull = isQuotaFull(reg)
                return (
                  <div key={reg.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/majors/${reg.major_id}`}
                          className="font-semibold text-blue-700 hover:underline truncate block"
                        >
                          {reg.major_name || `Ngành #${reg.major_id}`}
                        </Link>
                        {reg.university_name && (
                          <p className="text-sm text-gray-500 mt-0.5">{reg.university_name}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.cls}`}>
                          {sc.text}
                        </span>
                        {quotaFull && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            Ngành đã đủ chỉ tiêu
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {reg.expected_score != null && (
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                          Điểm dự kiến: {reg.expected_score}
                        </span>
                      )}
                      {reg.subject_group && (
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-medium">
                          Khối: {reg.subject_group}
                        </span>
                      )}
                      <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                        Đăng ký: {new Date(reg.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {reg.notes && (
                      <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-1.5">
                        "{reg.notes}"
                      </p>
                    )}

                    {reg.status === 'pending' && (
                      <button
                        onClick={() => handleCancelReg(reg.id)}
                        className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Hủy đăng ký
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
