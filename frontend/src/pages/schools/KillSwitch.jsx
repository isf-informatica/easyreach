import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { killSchool, restoreSchool } from '../../api/kill'

export default function KillSwitch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeLevel, setActiveLevel] = useState(null)
  const [reason, setReason] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const levels = [
    {
      level: 1,
      name: 'Soft lock',
      color: 'amber',
      icon: '⚠️',
      description: 'AWS sync band karo. Naya content nahi aayega. Existing content accessible rahega.',
      impact: 'Low impact — students can still view existing content',
      actions: ['Disable MBSE-AWS-Sync task', 'Disable MediaStorage-AWS-Sync task'],
    },
    {
      level: 2,
      name: 'Data lock',
      color: 'orange',
      icon: '🔒',
      description: 'DB backup lo, sabh media files delete karo. Content accessible nahi hoga.',
      impact: 'High impact — all media gone, ERP still accessible',
      actions: ['Backup MediaStorage to AWS', 'Delete all files in MediaStorage', 'Nginx returns 503'],
    },
    {
      level: 3,
      name: 'Nuclear',
      color: 'red',
      icon: '☢️',
      description: 'Pura backup, DB tables drop, school ka poora data gone.',
      impact: 'Critical — ERP + media completely offline',
      actions: ['Full DB dump to AWS', 'Delete all media files', 'Drop all DB tables', 'Stop Nginx'],
    },
  ]

  const colorMap = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600', badge: 'bg-amber-100 text-amber-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600', badge: 'bg-orange-100 text-orange-700' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', btn: 'bg-red-600 hover:bg-red-700', badge: 'bg-red-100 text-red-700' },
  }

  const handleKill = async (level) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await killSchool(id, level, reason, level === 3 ? confirmCode : null)
      setSuccess(`Level ${level} kill switch activated successfully!`)
      setActiveLevel(null)
      setReason('')
      setConfirmCode('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (level) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await restoreSchool(id, level)
      setSuccess(`Level ${level} restore initiated successfully!`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(`/schools/${id}`)} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </button>
        <div>
          <div className="text-sm font-medium text-gray-900">Kill Switch</div>
          <div className="text-xs text-gray-500">School ID: {id}</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <div className="text-sm font-medium text-red-700">Danger zone</div>
            <div className="text-xs text-red-600 mt-1">These actions affect the school's live system. All actions are logged with your name and timestamp.</div>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Kill levels */}
        <div className="space-y-4">
          {levels.map(({ level, name, color, icon, description, impact, actions }) => {
            const c = colorMap[color]
            const isActive = activeLevel === level
            return (
              <div key={level} className={`bg-white rounded-xl border ${isActive ? c.border : 'border-gray-200'} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">Level {level}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>{name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveLevel(isActive ? null : level)}
                    className={`text-xs px-3 py-1.5 rounded-lg border ${isActive ? 'border-gray-200 text-gray-500' : `${c.border} ${c.text}`}`}
                  >
                    {isActive ? 'Cancel' : 'Expand'}
                  </button>
                </div>

                {/* Impact + actions */}
                <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${c.bg} ${c.text}`}>
                  {impact}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {actions.map(a => (
                    <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{a}</span>
                  ))}
                </div>

                {/* Expanded form */}
                {isActive && (
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Reason *</label>
                      <input
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Payment overdue since June 2026"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                    {level === 3 && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Type <code className="bg-gray-100 px-1 rounded">CONFIRM WIPE {id}</code> to confirm
                        </label>
                        <input
                          value={confirmCode}
                          onChange={e => setConfirmCode(e.target.value)}
                          placeholder={`CONFIRM WIPE ${id}`}
                          className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleKill(level)}
                        disabled={loading || !reason || (level === 3 && confirmCode !== `CONFIRM WIPE ${id}`)}
                        className={`flex-1 text-white text-sm py-2 rounded-lg disabled:opacity-50 ${c.btn}`}
                      >
                        {loading ? 'Processing...' : `⚡ Activate Level ${level} Kill`}
                      </button>
                      <button
                        onClick={() => handleRestore(level)}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : `↺ Restore Level ${level}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}