import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

const STATUS_CONFIG = {
  pending:  { text: 'Đã đăng ký · Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  approved: { text: 'Đã đăng ký · Được duyệt', cls: 'bg-green-100  text-green-700  border border-green-200'  },
  rejected: { text: 'Đã đăng ký · Bị từ chối', cls: 'bg-red-100    text-red-600    border border-red-200'    },
}

export default function Majors() {
  const { user } = useAuth()
  const [majors, setMajors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [regMap, setRegMap] = useState({})   // { major_id: registration }

  const fetchMajors = async (q = '') => {
    setLoading(true)
    try {
      const { data } = await api.get(`/majors?search=${q}`)
      setMajors(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMajors()
    if (user && user.role !== 'admin') {
      api.get('/registrations/my')
        .then(({ data }) => {
          const map = {}
          data.forEach((r) => { map[r.major_id] = r })
          setRegMap(map)
        })
        .catch(() => {})
    }
  }, [user])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchMajors(search)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tra cứu ngành học</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Tìm kiếm tên ngành..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-primary">Tìm kiếm</button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : majors.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Không tìm thấy ngành học nào</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {majors.map((m) => {
            const reg = regMap[m.id]
            const sc = reg ? STATUS_CONFIG[reg.status] : null
            const quotaFull = m.quota != null && m.quota > 0 && m.approved_count >= m.quota
            return (
              <Link key={m.id} to={`/majors/${m.id}`} className="card hover:shadow-md transition-shadow block">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg leading-snug">{m.name}</h3>
                    {m.university_name && <p className="text-sm text-blue-600">{m.university_name}</p>}
                    {m.subject_group && <p className="text-sm text-gray-500">Khối: {m.subject_group}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {m.benchmark && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {m.benchmark} điểm
                      </span>
                    )}
                    {quotaFull && (
                      <span className="bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        Đã đủ chỉ tiêu
                      </span>
                    )}
                    {sc && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${sc.cls}`}>
                        {sc.text}
                      </span>
                    )}
                  </div>
                </div>
                {m.description && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{m.description}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
