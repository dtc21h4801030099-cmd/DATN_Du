import { useEffect, useState } from 'react'
import api from '../../api/axios'

const empty = { name: '', address: '', website: '', description: '' }

export default function AdminUniversities() {
  const [unis, setUnis] = useState([])
  const [majors, setMajors] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchAll = () => {
    api.get('/universities').then((r) => setUnis(r.data)).catch(() => {})
    api.get('/majors').then((r) => setMajors(r.data)).catch(() => {})
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setForm(empty); setEditing(null); setShowForm(true); setError('') }
  const openEdit = (u) => {
    setForm({ name: u.name, address: u.address || '', website: u.website || '', description: u.description || '' })
    setEditing(u.id); setShowForm(true); setError('')
  }
  const openView = (u) => { setViewing(u) }
  const closeView = () => setViewing(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) await api.put(`/universities/${editing}`, form)
      else await api.post('/universities', form)
      setShowForm(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.detail || 'Lỗi lưu dữ liệu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa trường này?')) return
    await api.delete(`/universities/${id}`)
    fetchAll()
  }

  const uniMajors = viewing ? majors.filter((m) => m.university_id === viewing.id) : []

  const filteredUnis = unis.filter((u) => {
    const q = search.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || (u.address || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-100 -mx-8 px-8 pt-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý trường đại học</h1>
          <button onClick={openCreate} className="btn-primary">+ Thêm trường</button>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            className="input-field pl-9"
            placeholder="Tìm theo tên trường hoặc địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 mt-4">
          <h2 className="font-semibold mb-4">{editing ? 'Sửa trường' : 'Thêm trường mới'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[['Tên trường *', 'name'], ['Địa chỉ', 'address'], ['Website', 'website']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input className="input-field" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key === 'name'} />
              </div>
            ))}
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

      <div className="space-y-3">
        {filteredUnis.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Không tìm thấy trường nào phù hợp.</p>
        ) : filteredUnis.map((u) => (
          <div key={u.id} className="card flex justify-between items-center">
            <div
              className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => openView(u)}
            >
              <p className="font-semibold">{u.name}</p>
              {u.address && <p className="text-sm text-gray-400">{u.address}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(u)} className="btn-secondary text-sm py-1">Sửa</button>
              <button onClick={() => handleDelete(u.id)} className="btn-danger text-sm py-1">Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeView}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewing.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Chi tiết trường đại học</p>
              </div>
              <button onClick={closeView} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Địa chỉ</p>
                  <p className="text-gray-800">{viewing.address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Website</p>
                  {viewing.website
                    ? <a href={viewing.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{viewing.website}</a>
                    : <p className="text-gray-800">—</p>
                  }
                </div>
              </div>

              {viewing.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mô tả</p>
                  <p className="text-gray-800 whitespace-pre-line">{viewing.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Ngành học ({uniMajors.length})
                </p>
                {uniMajors.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Chưa có ngành học nào</p>
                ) : (
                  <div className="space-y-2">
                    {uniMajors.map((m) => (
                      <div key={m.id} className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{m.name}</p>
                          {m.code && <p className="text-xs text-gray-400">Mã: {m.code}</p>}
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          {m.benchmark != null && <p>Điểm chuẩn: <span className="font-semibold">{m.benchmark}</span></p>}
                          {m.quota != null && <p>Chỉ tiêu: <span className="font-semibold">{m.quota}</span></p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 p-6 pt-0">
              <button onClick={() => { closeView(); openEdit(viewing) }} className="btn-primary text-sm">Sửa</button>
              <button onClick={closeView} className="btn-secondary text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
