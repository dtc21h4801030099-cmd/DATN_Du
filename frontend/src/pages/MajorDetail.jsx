import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

const STATUS_LABEL = {
  pending: { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
  rejected: { text: 'Từ chối', cls: 'bg-red-100 text-red-700' },
}

export default function MajorDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [major, setMajor] = useState(null)
  const [myReg, setMyReg] = useState(null)   // đăng ký của user hiện tại cho ngành này
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ expected_score: '', subject_group: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get(`/majors/${id}`).then((r) => setMajor(r.data)).catch(() => navigate('/majors', { replace: true }))
  }, [id])

  useEffect(() => {
    if (user && user.role !== 'admin') {
      api.get('/registrations/my')
        .then((r) => {
          const found = r.data.find((reg) => reg.major_id === parseInt(id))
          setMyReg(found || null)
        })
        .catch(() => {})
    }
  }, [user, id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.expected_score && major.benchmark != null) {
      if (parseFloat(form.expected_score) < major.benchmark) {
        setError(`Điểm dự kiến (${form.expected_score}) thấp hơn điểm chuẩn của ngành (${major.benchmark} điểm). Bạn không thể đăng ký ngành này.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        major_id: parseInt(id),
        expected_score: form.expected_score ? parseFloat(form.expected_score) : null,
        subject_group: form.subject_group || null,
        notes: form.notes || null,
      }
      const res = await api.post('/registrations', payload)
      setMyReg(res.data)
      setShowForm(false)
      setSuccess('Đăng ký ngành học thành công!')
      setForm({ expected_score: '', subject_group: '', notes: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký ngành này?')) return
    try {
      await api.delete(`/registrations/${myReg.id}`)
      setMyReg(null)
      setSuccess('Đã hủy đăng ký.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể hủy đăng ký')
    }
  }

  if (!major) return <div className="text-center py-20 text-gray-400">Đang tải...</div>

  const statusInfo = myReg ? STATUS_LABEL[myReg.status] : null
  const quotaFull = major.quota != null && (major.quota === 0 || major.approved_count >= major.quota)

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/majors" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← Quay lại</Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <h1 className="text-2xl font-bold">{major.name}</h1>
          {quotaFull && (
            <span className="bg-orange-100 text-orange-700 border border-orange-300 text-sm font-semibold px-3 py-1 rounded-full shrink-0">
              Đã đủ chỉ tiêu
            </span>
          )}
        </div>
        {major.university_name && (
          <p className="text-blue-600 mb-4">{major.university_name}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {major.code && <Info label="Mã ngành" value={major.code} />}
          {major.subject_group && <Info label="Khối thi" value={major.subject_group} />}
          {major.benchmark != null && <Info label="Điểm chuẩn" value={`${major.benchmark} điểm`} />}
          {major.quota != null && <Info label="Chỉ tiêu" value={`${major.quota} sinh viên`} />}
        </div>

        {major.description && (
          <div>
            <h3 className="font-semibold mb-2">Mô tả ngành</h3>
            <p className="text-gray-600 leading-relaxed">{major.description}</p>
          </div>
        )}
      </div>

      {/* Khu vực đăng ký — chỉ hiện với user đã đăng nhập, không phải admin */}
      {user && user.role !== 'admin' && (
        <div className="card mt-4">
          <h2 className="text-lg font-semibold mb-3">Đăng ký ngành học</h2>

          {success && (
            <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-3 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 mb-3 text-sm">
              {error}
            </div>
          )}

          {myReg ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg flex-wrap">
                <span className="text-sm text-gray-600">Trạng thái đăng ký:</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo?.cls}`}>
                  {statusInfo?.text}
                </span>
                {quotaFull && myReg.status === 'pending' && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                    Ngành đã đủ chỉ tiêu
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {myReg.expected_score != null && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Điểm dự kiến</p>
                    <p className="font-semibold">{myReg.expected_score}</p>
                  </div>
                )}
                {myReg.subject_group && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Khối thi</p>
                    <p className="font-semibold">{myReg.subject_group}</p>
                  </div>
                )}
              </div>
              {myReg.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ghi chú</p>
                  <p className="text-gray-700">{myReg.notes}</p>
                </div>
              )}
              {myReg.status === 'pending' && (
                <button onClick={handleCancel} className="btn-danger text-sm">
                  Hủy đăng ký
                </button>
              )}
            </div>
          ) : quotaFull ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-4 text-center">
              <p className="text-orange-700 font-semibold text-sm">Ngành học này đã đủ chỉ tiêu tuyển sinh</p>
              <p className="text-orange-600 text-xs mt-1">Không thể nhận thêm hồ sơ đăng ký</p>
            </div>
          ) : (
            <>
              {!showForm ? (
                <button onClick={() => { setShowForm(true); setError(''); setSuccess('') }} className="btn-primary">
                  Đăng ký ngành này
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Điểm thi dự kiến</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="30"
                        className="input-field"
                        placeholder="VD: 24.5"
                        value={form.expected_score}
                        onChange={(e) => setForm({ ...form, expected_score: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Khối thi</label>
                      <input
                        className="input-field"
                        placeholder="VD: A00, A01, D01..."
                        value={form.subject_group}
                        onChange={(e) => setForm({ ...form, subject_group: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú (tùy chọn)</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="Thông tin thêm bạn muốn gửi..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Đang gửi...' : 'Xác nhận đăng ký'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setError('') }}>
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {!user && (
        <div className="card mt-4 text-center py-4">
          <p className="text-gray-500 text-sm">
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link> để đăng ký ngành học này.
          </p>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  )
}
