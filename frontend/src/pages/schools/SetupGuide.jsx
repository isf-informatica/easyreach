import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const steps = [
  {
    id: 1,
    title: 'Extract the ZIP file',
    icon: 'ti-file-zip',
    color: '#60A5FA',
    bg: '#EBF5FF',
    border: '#C7E6FF',
    desc: 'Extract the downloaded ZIP on the school/college server PC.',
    commands: [],
    notes: ['Right click ZIP → Extract All', 'You will get: nginx.conf, sync_aws.bat, backup.bat, install_agent.ps1, README.txt'],
  },
  {
    id: 2,
    title: 'Copy Nginx config',
    icon: 'ti-file-settings',
    color: '#34D399',
    bg: '#E8FFF5',
    border: '#A7F0D4',
    desc: 'Copy nginx.conf to the Nginx installation folder.',
    commands: ['copy nginx.conf D:\\nginx\\conf\\nginx.conf'],
    notes: ['If D:\\nginx does not exist, install Nginx first (nginx-1.26.2)', 'Backup old nginx.conf before replacing'],
  },
  {
    id: 3,
    title: 'Copy sync & backup scripts',
    icon: 'ti-refresh',
    color: '#A78BFA',
    bg: '#F3F0FF',
    border: '#DDD6FE',
    desc: 'Copy the sync and backup batch files to their locations.',
    commands: [
      'copy sync_aws.bat D:\\MediaStorage\\sync_aws.bat',
      'copy backup.bat D:\\MinIO\\backup.bat',
    ],
    notes: ['Create D:\\MediaStorage if it does not exist: mkdir D:\\MediaStorage', 'rclone must already be configured with AWS credentials'],
  },
  {
    id: 4,
    title: 'Run install_agent.ps1',
    icon: 'ti-terminal-2',
    color: '#F59E0B',
    bg: '#FFFBEA',
    border: '#FFE082',
    desc: 'Run the installer as Administrator — this sets up the EasyReach agent.',
    commands: ['PowerShell -ExecutionPolicy Bypass -File install_agent.ps1'],
    notes: ['Right click PowerShell → Run as Administrator', 'Agent installs to D:\\EasyReachAgent\\', 'Saves school token + central API URL automatically'],
  },
  {
    id: 5,
    title: 'Start Nginx',
    icon: 'ti-player-play',
    color: '#34D399',
    bg: '#E8FFF5',
    border: '#A7F0D4',
    desc: 'Start Nginx to begin serving media files.',
    commands: ['D:\\nginx\\nginx.exe -p D:\\nginx -t', 'D:\\nginx\\nginx.exe -p D:\\nginx'],
    notes: ['First command tests config — must say "syntax is ok"', 'Second command starts Nginx in background', 'Verify: netstat -ano | findstr ":9006"'],
  },
  {
    id: 6,
    title: 'Setup IIS HTTPS proxy',
    icon: 'ti-lock',
    color: '#60A5FA',
    bg: '#EBF5FF',
    border: '#C7E6FF',
    desc: 'Configure IIS to proxy HTTPS requests to Nginx.',
    commands: [
      'iisreset /stop',
      'iisreset /start',
    ],
    notes: ['IIS site must be configured on port 9000 (HTTPS)', 'web.config should proxy to http://127.0.0.1:9006', 'SSL cert thumbprint must match the one entered in EasyReach'],
  },
  {
    id: 7,
    title: 'Run first AWS sync',
    icon: 'ti-cloud-download',
    color: '#A78BFA',
    bg: '#F3F0FF',
    border: '#DDD6FE',
    desc: 'Download all media content from AWS S3 to local storage.',
    commands: ['D:\\MediaStorage\\sync_aws.bat'],
    notes: ['First sync may take 30–90 minutes depending on content size', 'Check log: type D:\\MediaStorage\\sync_log.txt', 'Look for "Sync Complete" at the end'],
  },
  {
    id: 8,
    title: 'Setup Task Scheduler',
    icon: 'ti-clock',
    color: '#F59E0B',
    bg: '#FFFBEA',
    border: '#FFE082',
    desc: 'Schedule auto-sync, auto-backup, and auto-start tasks.',
    commands: [],
    notes: [
      'Nginx auto-start: Task → AtStartup → D:\\nginx\\start_nginx.bat',
      'AWS Sync: Task → Every 15 min → D:\\MediaStorage\\sync_aws.bat',
      'Backup AM: Task → Daily 2AM → D:\\MinIO\\backup.bat',
      'Backup PM: Task → Daily 2PM → D:\\MinIO\\backup.bat',
    ],
  },
  {
    id: 9,
    title: 'Verify setup',
    icon: 'ti-circle-check',
    color: '#34D399',
    bg: '#E8FFF5',
    border: '#A7F0D4',
    desc: 'Test that everything is working correctly.',
    commands: [],
    notes: [
      'Open in browser: https://[storage-domain]:9000/[folder]/[filename].pdf',
      'Check EasyReach dashboard — institution should show "active"',
      'Agent status should show "Online"',
      'Test a video: open .mp4 URL in browser — should stream smoothly',
    ],
  },
]

export default function SetupGuide() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [completed, setCompleted] = useState([])
  const [expanded, setExpanded] = useState(1)

  const toggle = (stepId) => {
    setCompleted(prev =>
      prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId]
    )
  }

  const progress = Math.round((completed.length / steps.length) * 100)

  return (
    <div className="min-h-screen" style={{background:'#F0F7FF'}}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/schools/${id}`)} className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">← Back</button>
          <div className="w-px h-4 bg-[#D4E8FF]" />
          <div>
            <div className="text-sm font-medium text-[#1E3A5F]">Setup guide</div>
            <div className="text-xs text-[#7BA7C7]">Step-by-step on-premise deployment</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#5B7FA6]">{completed.length}/{steps.length} steps done</div>
          <div className="w-32 h-2 bg-[#E0EEFF] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{width:`${progress}%`, background:'linear-gradient(90deg,#60A5FA,#34D399)'}} />
          </div>
          <div className="text-xs font-medium text-[#1D6FAD]">{progress}%</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-6">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-2xl mb-6 border border-[#C7E6FF]" style={{background:'linear-gradient(135deg,#EBF4FF,#E8FFF5)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#60A5FA,#34D399)'}}>
              <i className="ti ti-file-download text-white text-lg" aria-hidden="true"></i>
            </div>
            <div>
              <div className="text-sm font-medium text-[#1E3A5F]">Config ZIP downloaded</div>
              <div className="text-xs text-[#5BA88A] mt-0.5">Follow these steps on the institution's Windows server</div>
            </div>
          </div>
          <span className="text-xs text-[#1D6FAD] bg-[#D9EDFF] border border-[#A8D5FF] px-3 py-1.5 rounded-full font-medium">
            {steps.length} steps total
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const isDone = completed.includes(step.id)
            const isOpen = expanded === step.id

            return (
              <div key={step.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${isDone ? 'border-[#A7F0D4]' : 'border-[#D4E8FF]'}`}
                style={{boxShadow: isOpen ? '0 4px 16px rgba(96,165,250,0.08)' : 'none'}}>

                {/* Step header */}
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : step.id)}>

                  {/* Number/check */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={{
                      background: isDone ? '#34D399' : step.bg,
                      border: `1px solid ${isDone ? '#A7F0D4' : step.border}`,
                      color: isDone ? '#fff' : step.color
                    }}>
                    {isDone ? <i className="ti ti-check text-sm" aria-hidden="true"></i> : step.id}
                  </div>

                  {/* Icon + title */}
                  <div className="flex items-center gap-2 flex-1">
                    <i className={`ti ${step.icon} text-base`} style={{color: step.color}} aria-hidden="true"></i>
                    <span className="text-sm font-medium text-[#1E3A5F]">{step.title}</span>
                  </div>

                  {/* Status + toggle */}
                  <div className="flex items-center gap-2">
                    {isDone && (
                      <span className="text-xs bg-[#E8FFF5] text-[#1A6B4A] border border-[#A7F0D4] px-2.5 py-1 rounded-full font-medium">Done</span>
                    )}
                    <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'} text-[#A0B8D0] text-sm`} aria-hidden="true"></i>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-[#E0EEFF]">
                    <div className="pt-4">
                      <p className="text-xs text-[#5B7FA6] mb-4">{step.desc}</p>

                      {/* Commands */}
                      {step.commands.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-medium text-[#5B7FA6] mb-2">
                            <i className="ti ti-terminal text-xs mr-1" aria-hidden="true"></i>Commands (Admin CMD/PowerShell)
                          </div>
                          <div className="space-y-2">
                            {step.commands.map((cmd, i) => (
                              <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A5F]">
                                <span className="text-[#34D399] text-xs font-mono select-none">$</span>
                                <code className="text-xs text-[#A8D5FF] font-mono flex-1 select-all">{cmd}</code>
                                <button
                                  onClick={() => navigator.clipboard.writeText(cmd)}
                                  className="text-[#60A5FA] hover:text-white bg-transparent border-none cursor-pointer p-0"
                                  title="Copy">
                                  <i className="ti ti-copy text-sm" aria-hidden="true"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="space-y-2 mb-5">
                        {step.notes.map((note, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[#5B7FA6]">
                            <span className="text-[#60A5FA] mt-0.5 flex-shrink-0">•</span>
                            {note}
                          </div>
                        ))}
                      </div>

                      {/* Mark done button */}
                      <button onClick={() => { toggle(step.id); if(!isDone) setExpanded(step.id + 1) }}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                          isDone
                            ? 'bg-[#F5F9FF] text-[#7BA7C7] border border-[#D4E8FF]'
                            : 'text-white'
                        }`}
                        style={!isDone ? {background:'linear-gradient(135deg,#60A5FA,#34D399)'} : {}}>
                        {isDone ? '↩ Mark as pending' : '✓ Mark as done — next step →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* All done */}
        {completed.length === steps.length && (
          <div className="mt-6 px-6 py-5 rounded-2xl text-center border border-[#A7F0D4]" style={{background:'linear-gradient(135deg,#E8FFF5,#EBF5FF)'}}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{background:'linear-gradient(135deg,#34D399,#60A5FA)'}}>
              <i className="ti ti-circle-check text-white text-2xl" aria-hidden="true"></i>
            </div>
            <div className="text-sm font-medium text-[#1A6B4A] mb-1">Setup complete!</div>
            <div className="text-xs text-[#5BA88A] mb-4">Institution is now live on EasyReach</div>
            <button onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer"
              style={{background:'linear-gradient(135deg,#60A5FA,#34D399)'}}>
              Back to dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}