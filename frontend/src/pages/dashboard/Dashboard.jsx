import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSchools } from '../../api/schools'
import useAuthStore from '../../store/authStore'

export default function Dashboard() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const data = await getAllSchools()
      setSchools(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">EasyReach</div>
            <div className="text-xs text-gray-500">ISF Media Server Control</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
            Logout
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Total schools</div>
            <div className="text-2xl font-semibold text-gray-900">{schools.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Active</div>
            <div className="text-2xl font-semibold text-green-600">
              {schools.filter(s => s.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Pending</div>
            <div className="text-2xl font-semibold text-amber-600">
              {schools.filter(s => s.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Killed</div>
            <div className="text-2xl font-semibold text-red-600">
              {schools.filter(s => s.status === 'killed').length}
            </div>
          </div>
        </div>

        {/* Schools */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">Schools</h2>
          <button
            onClick={() => navigate('/schools/new')}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add school
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : schools.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-sm mb-4">No schools added yet</div>
            <button
              onClick={() => navigate('/schools/new')}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add your first school
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {schools.map(school => (
              <div key={school.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{school.name}</div>
                    <div className="text-xs text-gray-500">{school.public_ip} · {school.storage_domain}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    school.status === 'active' ? 'bg-green-50 text-green-600' :
                    school.status === 'killed' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {school.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{school.storage_used_gb || 0} GB</div>
                    <div className="text-xs text-gray-500">Storage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{school.file_count || 0}</div>
                    <div className="text-xs text-gray-500">Files</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${school.agent_online ? 'text-green-600' : 'text-gray-400'}`}>
                      {school.agent_online ? 'Online' : 'Offline'}
                    </div>
                    <div className="text-xs text-gray-500">Agent</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/schools/${school.id}`)}
                    className="flex-1 text-xs border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => navigate(`/schools/${school.id}/kill`)}
                    className="text-xs border border-red-200 text-red-500 rounded-lg px-3 py-1.5 hover:bg-red-50"
                  >
                    Kill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}