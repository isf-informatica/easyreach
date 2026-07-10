import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSchool, getSchoolLogs, generateConfig } from '../../api/schools'

export default function SchoolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [school, setSchool] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [schoolData, logsData] = await Promise.all([
        getSchool(id),
        getSchoolLogs(id)
      ])
      setSchool(schoolData)
      setLogs(logsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadConfig = async () => {
    try {
      const blob = await generateConfig(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `easyreach_${school.code}_setup.zip`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to generate config')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
  if (!school) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">School not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back
          </button>
          <div>
            <div className="text-sm font-medium text-gray-900">{school.name}</div>
            <div className="text-xs text-gray-500">{school.code} · {school.public_ip}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadConfig}
            className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            ⬇ Download config
          </button>
          <button
            onClick={() => navigate(`/schools/${id}/kill`)}
            className="text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 hover:bg-red-100"
          >
            ⚡ Kill switch
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-6">
        {/* Status cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              school.status === 'active' ? 'bg-green-50 text-green-600' :
              school.status === 'killed' ? 'bg-red-50 text-red-600' :
              'bg-amber-50 text-amber-600'
            }`}>
              {school.status}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Kill level</div>
            <div className="text-sm font-medium text-gray-900">Level {school.kill_level}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Nginx port</div>
            <div className="text-sm font-medium text-gray-900">{school.nginx_port}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">Sync interval</div>
            <div className="text-sm font-medium text-gray-900">{school.sync_interval_min} min</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {['overview', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-1.5 rounded-lg capitalize ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">School details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                ['School name', school.name],
                ['School code', school.code],
                ['Contact name', school.contact_name],
                ['Contact email', school.contact_email],
                ['ERP domain', school.erp_domain],
                ['Storage domain', school.storage_domain],
                ['Public IP', school.public_ip],
                ['LAN IP', school.lan_ip],
                ['Storage path', school.storage_path],
                ['DB name', school.db_name],
                ['HTTPS port', school.https_port],
                ['SSL thumbprint', school.ssl_thumbprint],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-medium text-gray-900 text-right max-w-xs truncate">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Activity logs</h3>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No logs yet</div>
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-100">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      log.log_type === 'kill' ? 'bg-red-500' :
                      log.log_type === 'restore' ? 'bg-green-500' :
                      log.log_type === 'error' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-xs text-gray-900">{log.message}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{log.log_type}</span>
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