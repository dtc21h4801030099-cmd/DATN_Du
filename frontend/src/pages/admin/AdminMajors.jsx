import { useEffect, useState } from 'react'
import api from '../../api/axios'

const empty = { name: '', code: '', description: '', subject_group: '', benchmark: '', quota: '', university_id: '' }

const STATUS_LABEL = {
  pending: { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
  rejected: { text: 'Từ chối', cls: 'bg-red-100 text-red-700' },
}

function RegBadge({ counts }) {
  if (!counts || counts.total === 0) {
    return <span className="text-gray-300 text-xs">—</span>
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
        {counts.total} đăng ký
      </span>
      {counts.pending > 0 && (
        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full border border-yellow-200">
          {counts.pending} chờ duyệt
        </span>
      )}
      {counts.approved > 0 && (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {counts.approved} duyệt
        </span>
      )}
    </div>
  )
}

export default function AdminMajors() {
  const [majors, setMajors] = useState([])
  const [unis, setUnis] = useState([])
  const [counts, setCounts] = useState({})       // { major_id: { total, pending, approved, rejected } }
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [registrations, setRegistrations] = useState([])
  const [regLoading, setRegLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = () => {
    api.get('/majors').then((r) => setMajors(r.data)).catch(() => {})
    api.get('/universities').then((r) => setUnis(r.data)).catch(() => {})
    api.get('/registrations/counts').then((r) => setCounts(r.data)).catch(() => {})
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true); setError('') }
  const openEdit = (m) => {
    setForm({ name: m.name, code: m.code || '', description: m.description || '', subject_group: m.subject_group || '', benchmark: m.benchmark ?? '', quota: m.quota ?? '', university_id: m.university_id })
    setEditing(m.id); setShowForm(true); setError('')
  }

  const openView = (m) => {
    setViewing(m)
    setActiveTab('info')
    setRegistrations([])
  }
  const closeView = () => { setViewing(null); setRegistrations([]) }

  const loadRegistrations = async (majorId) => {
    setRegLoading(true)
    try {
      const res = await api.get(`/registrations/major/${majorId}`)
      setRegistrations(res.data)
    } catch {
      setRegistrations([])
    } finally {
      setRegLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'registrations' && viewing) {
      loadRegistrations(viewing.id)
    }
  }

  const handleStatusChange = async (regId, newStatus) => {
    try {
      await api.put(`/registrations/${regId}/status`, { status: newStatus })
      if (viewing) loadRegistrations(viewing.id)
      api.get('/registrations/counts').then((r) => setCounts(r.data)).catch(() => {})
    } catch (err) {
      const msg = err.response?.data?.detail || 'Không thể cập nhật trạng thái'
      alert(msg)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { ...form, benchmark: form.benchmark ? parseFloat(form.benchmark) : null, quota: form.quota ? parseInt(form.quota) : null, university_id: parseInt(form.university_id) }
    try {
      if (editing) await api.put(`/majors/${editing}`, payload)
      else await api.post('/majors', payload)
      setShowForm(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.detail || 'Lỗi lưu dữ liệu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa ngành này?')) return
    await api.delete(`/majors/${id}`)
    fetchAll()
  }

  // Tổng số đăng ký đang chờ duyệt trên toàn hệ thống
  const totalPending = Object.values(counts).reduce((sum, c) => sum + (c.pending || 0), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý ngành học</h1>
          {totalPending > 0 && (
            <p className="text-sm text-yellow-700 mt-1">
              Có <span className="font-bold">{totalPending}</span> đăng ký đang chờ duyệt
            </p>
          )}
        </div>
        <button onClick={openCreate} className="btn-primary">+ Thêm ngành</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Sửa ngành học' : 'Thêm ngành mới'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên ngành *</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mã ngành</label>
              <input className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Khối thi</label>
              <input className="input-field" placeholder="A00, A01, D01..." value={form.subject_group} onChange={(e) => setForm({ ...form, subject_group: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Điểm chuẩn</label>
              <input type="number" step="0.25" min="0" max="30" className="input-field" value={form.benchmark} onChange={(e) => setForm({ ...form, benchmark: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chỉ tiêu</label>
              <input type="number" min="0" className="input-field" value={form.quota} onChange={(e) => setForm({ ...form, quota: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trường đại học *</label>
              <select className="input-field" value={form.university_id} onChange={(e) => setForm({ ...form, university_id: e.target.value })} required>
                <option value="">-- Chọn trường --</option>
                {unis.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Lưu</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Tên ngành', 'Trường', 'Khối', 'Điểm chuẩn', 'Chỉ tiêu', 'Đăng ký', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {majors.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => openView(m)}
              >
                <td className="px-4 py-3 font-medium text-blue-700 hover:underline">{m.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{m.university_name}</td>
                <td className="px-4 py-3 text-gray-500">{m.subject_group || '—'}</td>
                <td className="px-4 py-3">{m.benchmark ?? '—'}</td>
                <td className="px-4 py-3">{m.quota ?? '—'}</td>
                <td className="px-4 py-3">
                  <RegBadge counts={counts[m.id]} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="btn-secondary text-xs py-1">Sửa</button>
                    <button onClick={() => handleDelete(m.id)} className="btn-danger text-xs py-1">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeView}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewing.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{viewing.university_name || '—'}</p>
                {counts[viewing.id] && counts[viewing.id].total > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                      {counts[viewing.id].total} thí sinh đăng ký
                    </span>
                    {counts[viewing.id].pending > 0 && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 font-medium px-2.5 py-1 rounded-full border border-yellow-200">
                        {counts[viewing.id].pending} chờ duyệt
                      </span>
                    )}
                    {counts[viewing.id].approved > 0 && (
                      <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full">
                        {counts[viewing.id].approved} đã duyệt
                      </span>
                    )}
                    {counts[viewing.id].rejected > 0 && (
                      <span className="text-xs bg-red-50 text-red-700 font-medium px-2.5 py-1 rounded-full">
                        {counts[viewing.id].rejected} từ chối
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button onClick={closeView} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b flex-shrink-0">
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabChange('info')}
              >
                Thông tin ngành
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'registrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabChange('registrations')}
              >
                Thí sinh đăng ký
                {counts[viewing.id]?.pending > 0 && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {counts[viewing.id].pending}
                  </span>
                )}
                {viewing.quota != null && viewing.quota > 0 && counts[viewing.id] &&
                  counts[viewing.id].approved >= viewing.quota && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    Đủ CT
                  </span>
                )}
              </button>
            </div>

            {/* Tab content */}
            <div className="overflow-y-auto flex-1">
              {activeTab === 'info' && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mã ngành</p>
                      <p className="text-gray-800">{viewing.code || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Khối thi</p>
                      <p className="text-gray-800">{viewing.subject_group || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Điểm chuẩn</p>
                      <p className="text-2xl font-bold text-blue-600">{viewing.benchmark ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Chỉ tiêu</p>
                      <p className="text-2xl font-bold text-green-600">{viewing.quota ?? '—'}</p>
                    </div>
                  </div>
                  {viewing.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mô tả</p>
                      <p className="text-gray-800 whitespace-pre-line">{viewing.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'registrations' && (
                <div className="p-6">
                  {regLoading ? (
                    <p className="text-center text-gray-400 py-8">Đang tải...</p>
                  ) : registrations.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">Chưa có thí sinh nào đăng ký ngành này.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl flex-wrap">
                        <span className="text-sm text-gray-600">
                          Tổng: <strong className="text-gray-900">{registrations.length}</strong>
                        </span>
                        <span className="text-yellow-700 text-sm">
                          Chờ duyệt: <strong>{registrations.filter(r => r.status === 'pending').length}</strong>
                        </span>
                        <span className="text-green-700 text-sm">
                          Đã duyệt: <strong>{registrations.filter(r => r.status === 'approved').length}</strong>
                        </span>
                        <span className="text-red-600 text-sm">
                          Từ chối: <strong>{registrations.filter(r => r.status === 'rejected').length}</strong>
                        </span>
                      </div>

                      {registrations.map((reg) => (
                        <div key={reg.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{reg.user_name || '—'}</p>
                              <p className="text-sm text-gray-500">{reg.user_email || '—'}</p>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_LABEL[reg.status]?.cls}`}>
                              {STATUS_LABEL[reg.status]?.text}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm">
                            {reg.expected_score != null && (
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                                Điểm dự kiến: <strong>{reg.expected_score}</strong>
                              </span>
                            )}
                            {reg.subject_group && (
                              <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md">
                                Khối: <strong>{reg.subject_group}</strong>
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                              {new Date(reg.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {reg.notes && (
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                              {reg.notes}
                            </p>
                          )}
                          {reg.status === 'pending' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleStatusChange(reg.id, 'approved')}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleStatusChange(reg.id, 'rejected')}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                          {reg.status !== 'pending' && (
                            <div className="mt-3">
                              <button
                                onClick={() => handleStatusChange(reg.id, 'pending')}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Đặt lại chờ duyệt
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-6 border-t flex-shrink-0">
              {activeTab === 'info' && (
                <button onClick={() => { closeView(); openEdit(viewing) }} className="btn-primary text-sm">Sửa</button>
              )}
              <button onClick={closeView} className="btn-secondary text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
