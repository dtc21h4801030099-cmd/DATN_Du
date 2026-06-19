import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Universities() {
  const [universities, setUniversities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUnis = async (q = '') => {
    setLoading(true)
    try {
      const { data } = await api.get(`/universities?search=${q}`)
      setUniversities(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUnis() }, [])

  return (
    <div>
      <div className="sticky top-16 z-10 bg-gray-50 pb-3">
        <h1 className="text-2xl font-bold mb-4">Tra cứu trường đại học</h1>

        <form
          onSubmit={(e) => { e.preventDefault(); fetchUnis(search) }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Tìm kiếm tên trường..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">Tìm kiếm</button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universities.map((u) => (
            <Link key={u.id} to={`/universities/${u.id}`} className="card hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg">{u.name}</h3>
              {u.address && <p className="text-gray-500 text-sm mt-1">{u.address}</p>}
              {u.website && (
                <span className="text-blue-500 text-sm mt-1 inline-block">{u.website}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
