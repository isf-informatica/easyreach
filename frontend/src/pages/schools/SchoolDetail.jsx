import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSchool, getSchoolLogs, generateConfig } from '../../api/schools'

const logColor = (type) => {
  const map = { kill:'#C62828', restore:'#1A6B4A', error:'#D97706', command:'#1D6FAD', info:'#5B7FA6' }
  return map[type] || '#7BA7C7'
}
const logBg = (type) => {
  const map = { kill:'#FFF0F0', restore:'#E8FFF5', error:'#FFFBEA', command:'#EBF5FF', info:'#F5F9FF' }
  return map[type] || '#F5F9FF'
}

export default function SchoolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [school, setSchool] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      const [schoolData, logsData] = await Promise.all([getSchool(id), getSchoolLogs(id)])
      setSchool(schoolData); setLogs(logsData)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDownloadConfig = async () => {
    try {
      const blob = await generateConfig(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `easyreach_${school.code}_setup.zip`
      a.click(); window.URL.revokeObjectURL(url)
    } catch { alert('Failed to generate config') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:'#F0F7FF'}}><div className="text-sm text-[#7BA7C7]">Loading...</div></div>
  if (!school) return <div className="min-h-screen flex items-center justify-center" style={{background:'#F0F7FF'}}><div className="text-sm text-[#7BA7C7]">Not found</div></div>

  const status = typeof school.status === 'string' ? school.status : 'pending'
  const statusStyle = {
    active: 'bg-[#E8FFF5] text-[#1A6B4A] border-[#A7F0D4]',
    killed: 'bg-[#FFF0F0] text-[#C62828] border-[#FFCDD2]',
    pending: 'bg-[#FFFBEA] text-[#8A6000] border-[#FFE082]',
  }

  return (
    <div className="min-h-screen" style={{background:'#F0F7FF'}}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">← Back</button>
          <div className="w-px h-4 bg-[#D4E8FF]" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
              style={{background:'linear-gradient(135deg,#60A5FA,#34D399)'}}>
              {school.name?.[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-[#1E3A5F]">{school.name}</div>
              <div className="text-xs text-[#7BA7C7] font-mono">{school.code}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/schools/${id}/devices`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#5B7FA6] bg-[#F5F9FF] border border-[#D4E8FF] cursor-pointer">
            <i className="ti ti-device-desktop text-sm" aria-hidden="true"></i> Devices
          </button>
          <button onClick={handleDownloadConfig}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#1D6FAD] bg-[#EBF5FF] border border-[#C7E6FF] cursor-pointer">
            <i className="ti ti-download" aria-hidden="true"></i> Config ZIP
          </button>
          <button onClick={() => navigate(`/schools/${id}/kill`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#C62828] bg-[#FFF0F0] border border-[#FFCDD2] cursor-pointer">
            <i className="ti ti-bolt-off" aria-hidden="true"></i> Kill switch
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-6">
        {/* Status cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Status', content: <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle[status] || statusStyle.pending}`}>{status}</span> },
            { label: 'Kill level', content: <span className="text-sm font-medium text-[#1E3A5F]">Level {school.kill_level || 0}</span> },
            { label: 'Nginx port', content: <span className="text-sm font-medium text-[#1D6FAD] font-mono">:{school.nginx_port}</span> },
            { label: 'Sync', content: <span className="text-sm font-medium text-[#1E3A5F]">{school.sync_interval_min} min</span> },
          ].map(({ label, content }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-[#D4E8FF]">
              <div className="text-xs text-[#7BA7C7] mb-2">{label}</div>
              {content}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit bg-white border border-[#D4E8FF]">
          {['overview', 'logs'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm px-5 py-2 rounded-lg capitalize font-medium transition-all border-none cursor-pointer ${
                activeTab === tab ? 'text-white' : 'text-[#7BA7C7] bg-transparent'
              }`}
              style={activeTab === tab ? {background:'linear-gradient(135deg,#60A5FA,#34D399)'} : {}}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl p-6 border border-[#D4E8FF]" style={{boxShadow:'0 4px 20px rgba(96,165,250,0.06)'}}>
            <div className="text-sm font-medium text-[#1E3A5F] mb-5">Deployment details</div>
            <div className="grid grid-cols-2 gap-x-8">
              {[
                ['Institution name', school.name],
                ['Code', school.code],
                ['Type', school.institution_type || 'school'],
                ['Contact', school.contact_name],
                ['Email', school.contact_email],
                ['ERP domain', school.erp_domain],
                ['Storage domain', school.storage_domain],
                ['Public IP', school.public_ip],
                ['LAN IP', school.lan_ip],
                ['Storage path', school.storage_path],
                ['DB name', school.db_name],
                ['HTTPS port', school.https_port],
                ['SSL thumbprint', school.ssl_thumbprint ? school.ssl_thumbprint.slice(0,16)+'...' : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-[#E0EEFF]">
                  <span className="text-xs text-[#7BA7C7]">{label}</span>
                  <span className="text-xs text-[#1E3A5F] font-medium text-right max-w-xs truncate">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl p-6 border border-[#D4E8FF]" style={{boxShadow:'0 4px 20px rgba(96,165,250,0.06)'}}>
            <div className="text-sm font-medium text-[#1E3A5F] mb-5">Activity log</div>
            {logs.length === 0 ? (
              <div className="text-center py-10 text-sm text-[#A0B8D0]">No activity yet</div>
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{background: logBg(log.log_type), borderColor: '#E0EEFF'}}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background: logColor(log.log_type)}} />
                    <div className="flex-1">
                      <div className="text-xs text-[#1E3A5F]">{log.message}</div>
                      <div className="text-xs mt-0.5 text-[#7BA7C7]">{new Date(log.created_at).toLocaleString()}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-lg font-mono flex-shrink-0 bg-white border border-[#D4E8FF]" style={{color: logColor(log.log_type)}}>
                      {log.log_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}