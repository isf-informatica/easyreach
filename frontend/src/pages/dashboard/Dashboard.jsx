import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSchools } from '../../api/schools'
import useAuthStore from '../../store/authStore'

const getStatus = (school) => typeof school.status === 'string' ? school.status : 'pending'

const typeIcon = (type) => {
  if (type === 'college') return '🎓'
  if (type === 'institute') return '🏛️'
  return '🏫'
}

const typeLabel = (type) => {
  if (type === 'college') return 'College'
  if (type === 'institute') return 'Institute'
  return 'School'
}

export default function Dashboard() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSchools()
    const interval = setInterval(fetchSchools, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSchools = async () => {
    try { setSchools(await getAllSchools()) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const stats = [
    { label: 'Total', icon: 'ti-building-community', value: schools.length, cls: 's0' },
    { label: 'Active', icon: 'ti-circle-check', value: schools.filter(s => getStatus(s) === 'active').length, cls: 's1' },
    { label: 'Pending', icon: 'ti-clock', value: schools.filter(s => getStatus(s) === 'pending').length, cls: 's2' },
    { label: 'Killed', icon: 'ti-bolt-off', value: schools.filter(s => getStatus(s) === 'killed').length, cls: 's3' },
  ]

  const statusBadge = (status) => {
    const map = {
      active: 'bg-[#E8FFF5] text-[#1A6B4A] border border-[#A7F0D4]',
      killed: 'bg-[#FFF0F0] text-[#C62828] border border-[#FFCDD2]',
      pending: 'bg-[#FFFBEA] text-[#8A6000] border border-[#FFE082]',
    }
    return map[status] || map.pending
  }

  const statCls = {
    s0: 'bg-white border-[#D4E8FF] text-[#1E3A5F]',
    s1: 'bg-[#E8FFF5] border-[#A7F0D4] text-[#1A6B4A]',
    s2: 'bg-[#FFFBEA] border-[#FFE082] text-[#8A6000]',
    s3: 'bg-[#FFF0F0] border-[#FFCDD2] text-[#C62828]',
  }

  return (
    <div className="min-h-screen" style={{ background: '#F0F7FF' }}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
            <i className="ti ti-server-2 text-white text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <div className="text-sm font-medium text-[#1E3A5F]">EasyReach</div>
            <div className="text-xs text-[#7BA7C7]">ISF Media Server Control</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ background: 'linear-gradient(135deg,#A78BFA,#60A5FA)' }}>
            {user?.name?.[0]}
          </div>
          <span className="text-sm text-[#5B7FA6]">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }}
            className="text-xs text-[#E05C5C] bg-[#FFF0F0] border border-[#FFCDD2] px-3 py-1.5 rounded-full cursor-pointer">
            Sign out
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* Hero banner */}
        <div className="flex items-center justify-between px-5 py-4 rounded-2xl mb-6 border border-[#C7E6FF]"
          style={{ background: 'linear-gradient(135deg,#EBF4FF,#E8FFF5)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></div>
            <div>
              <div className="text-sm font-medium text-[#1A6B4A]">All systems running</div>
              <div className="text-xs text-[#5BA88A] mt-0.5">Auto-refreshes every 30 seconds</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#1D6FAD] bg-[#D9EDFF] border border-[#A8D5FF] px-3 py-1 rounded-full">
              <i className="ti ti-refresh text-xs mr-1" aria-hidden="true"></i>Auto sync on
            </span>
            <button onClick={fetchSchools}
              className="text-xs text-[#5B7FA6] bg-white border border-[#D4E8FF] px-3 py-1 rounded-full cursor-pointer">
              <i className="ti ti-refresh text-xs mr-1" aria-hidden="true"></i>Refresh
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-lg font-medium text-[#1E3A5F]">Deployments</h1>
            <p className="text-xs text-[#7BA7C7] mt-1">Manage all institution on-premise media servers</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/schools/setup')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)', boxShadow: '0 2px 8px rgba(96,165,250,0.3)' }}>
              <i className="ti ti-rocket" aria-hidden="true"></i> One-click setup
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, icon, value, cls }) => (
            <div key={label} className={`rounded-xl p-4 border ${statCls[cls]}`}>
              <div className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <i className={`ti ${icon} text-xs`} aria-hidden="true"></i>{label}
              </div>
              <div className="text-3xl font-medium">{value}</div>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-[#7BA7C7]">Institutions</span>
          <div className="flex-1 h-px bg-[#D4E8FF]"></div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-[#7BA7C7]">Loading...</div>
        ) : schools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D4E8FF] p-14 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#EBF5FF] border border-[#C7E6FF]">
              <i className="ti ti-building-community text-2xl text-[#60A5FA]" aria-hidden="true"></i>
            </div>
            <div className="text-sm font-medium text-[#1E3A5F] mb-1">No deployments yet</div>
            <div className="text-xs text-[#7BA7C7] mb-5">Set up your first institution's on-premise media server</div>
            <button onClick={() => navigate('/schools/setup')}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
              <i className="ti ti-rocket mr-1" aria-hidden="true"></i> One-click setup →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {schools.map(school => {
              const status = getStatus(school)
              const isActive = status === 'active'
              return (
                <div key={school.id}
                  className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${isActive ? 'border-[#A7F0D4] bg-[#FAFFFC]' : 'border-[#D4E8FF]'}`}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(96,165,250,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-semibold text-white"
                        style={{ background: isActive ? 'linear-gradient(135deg,#34D399,#60A5FA)' : 'linear-gradient(135deg,#60A5FA,#818CF8)' }}>
                        {school.name?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1E3A5F]">{school.name}</div>
                        <div className="text-xs text-[#7BA7C7] font-mono mt-0.5">{school.public_ip || 'not set'}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{status}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs text-[#5B7FA6] bg-[#F0F7FF] border border-[#C7E6FF] px-2.5 py-1 rounded-full mb-3">
                    {typeIcon(school.institution_type)} {typeLabel(school.institution_type)}
                  </span>

                  {school.storage_domain && (
                    <div className="text-xs font-mono text-[#1D6FAD] bg-[#EBF5FF] border border-[#C7E6FF] px-3 py-2 rounded-lg mb-3">
                      {school.storage_domain}:{school.https_port}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Storage', value: `${school.storage_used_gb || 0} GB` },
                      { label: 'Files', value: school.file_count || 0 },
                      { label: 'Agent', value: school.agent_online ? 'Online' : 'Offline', color: school.agent_online ? '#1A6B4A' : '#A0B8D0' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#F5F9FF] border border-[#E0EEFF] rounded-lg py-2 text-center">
                        <div className="text-xs font-medium text-[#1E3A5F]" style={color ? { color } : {}}>
                          {label === 'Agent' && <i className={`ti ${school.agent_online ? 'ti-wifi' : 'ti-wifi-off'} text-xs mr-0.5`} aria-hidden="true"></i>}
                          {value}
                        </div>
                        <div className="text-xs text-[#7BA7C7] mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/schools/${school.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[#1D6FAD] bg-[#F0F7FF] border border-[#C7E6FF] cursor-pointer"
                      onMouseEnter={e => e.currentTarget.style.background = '#D9EDFF'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F0F7FF'}>
                      <i className="ti ti-info-circle" aria-hidden="true"></i> View details
                    </button>
                    <button onClick={() => navigate(`/schools/${school.id}/kill`)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-[#C62828] bg-[#FFF0F0] border border-[#FFCDD2] cursor-pointer"
                      onMouseEnter={e => e.currentTarget.style.background = '#FFCDD2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#FFF0F0'}>
                      <i className="ti ti-bolt-off" aria-hidden="true"></i> Kill
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}