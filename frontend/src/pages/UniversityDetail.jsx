import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function UniversityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [uni, setUni] = useState(null)
  const [majors, setMajors] = useState([])

  useEffect(() => {
    api.get(`/universities/${id}`).then((r) => setUni(r.data)).catch(() => navigate('/universities', { replace: true }))
    api.get(`/majors?university_id=${id}`).then((r) => setMajors(r.data)).catch(() => {})
  }, [id])

  if (!uni) return <div className="text-center py-20 text-gray-400">Đang tải...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/universities" className="text-blue-600 hover:underline text-sm mb-4 inline-block">← Quay lại</Link>

      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-2">{uni.name}</h1>
        {uni.address && <p className="text-gray-500 mb-1">{uni.address}</p>}
        {uni.website && (
          <a href={uni.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
            {uni.website}
          </a>
        )}
        {uni.description && <p className="text-gray-600 mt-4 leading-relaxed">{uni.description}</p>}
      </div>

      {majors.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">Ngành học ({majors.length})</h2>
          <div className="space-y-3">
            {majors.map((m) => (
              <Link key={m.id} to={`/majors/${m.id}`} className="card flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium">{m.name}</p>
                  {m.subject_group && <p className="text-sm text-gray-400">Khối: {m.subject_group}</p>}
                </div>
                {m.benchmark && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {m.benchmark} điểm
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
