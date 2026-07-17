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
      level: 1, name: 'Soft lock', icon: 'ti-alert-triangle',
      colors: { card:'bg-[#FFFBEA] border-[#FFE082]', badge:'bg-[#FFF3C4] text-[#8A6000] border-[#FFE082]', text:'text-[#8A6000]', kill:'bg-[#FBBF24] text-white', restore:'bg-[#34D399] text-white', impact:'bg-[#FFFDE7] border-[#FFE082] text-[#8A6000]' },
      description: 'Stop AWS sync. No new content arrives. Existing content still accessible.',
      impact: 'Low impact — students can still view existing content',
      actions: ['Disable AWS sync task', 'Disable MediaStorage sync task'],
    },
    {
      level: 2, name: 'Data lock', icon: 'ti-lock',
      colors: { card:'bg-[#FFF3E0] border-[#FFCC80]', badge:'bg-[#FFE0B2] text-[#8A4A00] border-[#FFCC80]', text:'text-[#8A4A00]', kill:'bg-[#F97316] text-white', restore:'bg-[#34D399] text-white', impact:'bg-[#FFF8F0] border-[#FFCC80] text-[#8A4A00]' },
      description: 'Backup media, then delete all local files. Content becomes inaccessible.',
      impact: 'High impact — all media gone, ERP site still up',
      actions: ['Backup MediaStorage → AWS S3', 'Delete all local files', 'Nginx returns 503'],
    },
    {
      level: 3, name: 'Nuclear', icon: 'ti-nuclear',
      colors: { card:'bg-[#FFF0F0] border-[#FFCDD2]', badge:'bg-[#FFCDD2] text-[#C62828] border-[#FFCDD2]', text:'text-[#C62828]', kill:'bg-[#EF4444] text-white', restore:'bg-[#34D399] text-white', impact:'bg-[#FFF5F5] border-[#FFCDD2] text-[#C62828]' },
      description: 'Full wipe. Database dropped, all files deleted, server offline.',
      impact: 'Critical — ERP + media completely offline',
      actions: ['Full DB dump → AWS S3', 'Drop all EasyLearn tables', 'Delete all media', 'Stop Nginx'],
    },
  ]

  const handleKill = async (level) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await killSchool(id, level, reason, level === 3 ? confirmCode : null)
      setSuccess(`Level ${level} kill activated. Command queued for school agent.`)
      setActiveLevel(null); setReason(''); setConfirmCode('')
    } catch (err) { setError(err.response?.data?.detail || 'Command failed') }
    finally { setLoading(false) }
  }

  const handleRestore = async (level) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await restoreSchool(id, level)
      setSuccess(`Level ${level} restore initiated.`)
    } catch (err) { setError(err.response?.data?.detail || 'Restore failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen" style={{background:'#F0F7FF'}}>
      {/* Topbar */}
      <div className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <button onClick={() => navigate(`/schools/${id}`)} className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">← Back</button>
        <div className="w-px h-4 bg-[#D4E8FF]" />
        <div>
          <div className="text-sm font-medium text-[#1E3A5F]">Kill switch</div>
          <div className="text-xs text-[#7BA7C7]">Institution ID: {id} — all actions are logged</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-6">
        {/* Warning */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl mb-6 bg-[#FFF0F0] border border-[#FFCDD2]">
          <i className="ti ti-alert-triangle text-[#C62828] text-lg mt-0.5" aria-hidden="true"></i>
          <div>
            <div className="text-sm font-medium text-[#C62828]">Danger zone</div>
            <div className="text-xs text-[#E57373] mt-1">These commands execute on the live server. Every action is timestamped and attributed to your account.</div>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4 text-sm bg-[#E8FFF5] border border-[#A7F0D4] text-[#1A6B4A]">
            <i className="ti ti-circle-check" aria-hidden="true"></i> {success}
          </div>
        )}
        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4 text-sm bg-[#FFF0F0] border border-[#FFCDD2] text-[#C62828]">
            ✗ {error}
          </div>
        )}

        <div className="space-y-4">
          {levels.map(({ level, name, icon, colors, description, impact, actions }) => {
            const isActive = activeLevel === level
            return (
              <div key={level} className={`rounded-2xl overflow-hidden border transition-all ${colors.card} ${isActive ? 'shadow-lg' : ''}`}>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white border ${colors.card.split(' ')[1]}`}>
                      <i className={`ti ${icon} text-lg ${colors.text}`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1E3A5F]">Level {level}</span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${colors.badge}`}>{name}</span>
                      </div>
                      <div className="text-xs text-[#7BA7C7] mt-0.5">{description}</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveLevel(isActive ? null : level)}
                    className={`text-xs px-4 py-2 rounded-xl border font-medium cursor-pointer transition-all bg-white ${colors.card.split(' ')[1]} ${colors.text}`}>
                    {isActive ? 'Collapse' : 'Expand →'}
                  </button>
                </div>

                {/* Impact + action pills */}
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full border ${colors.impact}`}>{impact}</span>
                  {actions.map(a => (
                    <span key={a} className="text-xs px-3 py-1 rounded-full bg-white border border-[#D4E8FF] text-[#5B7FA6] font-mono">{a}</span>
                  ))}
                </div>

                {/* Expanded form */}
                {isActive && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/50">
                    <div className="pt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#5B7FA6] mb-1.5">Reason *</label>
                        <input value={reason} onChange={e => setReason(e.target.value)}
                          placeholder="e.g. Contract expired — payment overdue"
                          className="w-full rounded-xl px-4 py-2.5 text-sm border border-[#D4E8FF] bg-white text-[#1E3A5F] outline-none placeholder-[#A0B8D0] focus:border-[#60A5FA]" />
                      </div>

                      {level === 3 && (
                        <div>
                          <label className="block text-xs font-medium text-[#C62828] mb-1.5">
                            Type <code className="bg-[#FFF0F0] text-[#C62828] px-1.5 py-0.5 rounded text-xs">CONFIRM WIPE {id}</code> to unlock
                          </label>
                          <input value={confirmCode} onChange={e => setConfirmCode(e.target.value)}
                            placeholder={`CONFIRM WIPE ${id}`}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-[#FFCDD2] bg-white text-[#C62828] outline-none font-mono focus:border-[#EF4444]" />
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleKill(level)}
                          disabled={loading || !reason || (level===3 && confirmCode!==`CONFIRM WIPE ${id}`)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-40 ${colors.kill}`}>
                          {loading ? 'Executing...' : `⚡ Activate Level ${level}`}
                        </button>
                        <button onClick={() => handleRestore(level)}
                          disabled={loading}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-40 bg-[#34D399]">
                          {loading ? 'Processing...' : `↺ Restore Level ${level}`}
                        </button>
                      </div>
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