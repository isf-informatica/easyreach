import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDevices, addDevice, deleteDevice } from '../../api/devices'
import { sendCommand } from '../../api/commands'

const actions = [
  { icon: 'ti-terminal-2', label: 'Network Info', cmd: 'NETWORK_INFO', color: '#60A5FA' },
  { icon: 'ti-device-floppy', label: 'Disk Info', cmd: 'DISK_INFO', color: '#34D399' },
  { icon: 'ti-apps', label: 'Processes', cmd: 'PROCESS_LIST', color: '#A78BFA' },
  { icon: 'ti-info-circle', label: 'System Info', cmd: 'SYSTEM_INFO', color: '#F59E0B' },
  { icon: 'ti-refresh', label: 'Restart', cmd: 'RESTART', color: '#F59E0B', confirm: true },
  { icon: 'ti-power', label: 'Shutdown', cmd: 'SHUTDOWN', color: '#C62828', confirm: true },
  { icon: 'ti-player-play', label: 'Nginx Start', cmd: 'NGINX_START', color: '#34D399' },
  { icon: 'ti-player-stop', label: 'Nginx Stop', cmd: 'NGINX_STOP', color: '#F59E0B' },
  { icon: 'ti-reload', label: 'Nginx Restart', cmd: 'NGINX_RESTART', color: '#60A5FA' },
  { icon: 'ti-cloud-download', label: 'Sync Now', cmd: 'SYNC_NOW', color: '#A78BFA' },
  { icon: 'ti-lock', label: 'Lock PC', cmd: 'LOCK', color: '#7BA7C7' },
  { icon: 'ti-code', label: 'Run Script', cmd: 'RUN_SCRIPT', color: '#34D399', hasInput: true },
]

export default function Devices() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState({ server: [], systems: [] })
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [connectedId, setConnectedId] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [cmdLoading, setCmdLoading] = useState(null)
  const [cmdResult, setCmdResult] = useState(null)
  const [scriptInput, setScriptInput] = useState('')
  const [showScript, setShowScript] = useState(false)
  const [form, setForm] = useState({
    name: '', device_type: 'system',
    ip_address: '', mac_address: '', os: '', notes: ''
  })

  useEffect(() => { fetchDevices() }, [id])

  const fetchDevices = async () => {
    try {
      const res = await getDevices(id)
      setData(res)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    try {
      await addDevice(id, form)
      setShowAdd(false)
      setForm({ name: '', device_type: 'system', ip_address: '', mac_address: '', os: '', notes: '' })
      fetchDevices()
    } catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const handleDelete = async (deviceId) => {
    if (!confirm('Delete this device?')) return
    try {
      await deleteDevice(id, deviceId)
      fetchDevices()
    } catch { alert('Failed to delete') }
  }

  const handleConnect = (device) => {
    setConnecting(device.id)
    setTimeout(() => {
      setConnecting(null)
      setConnectedId(device.id)
      setCmdResult(null)
    }, 1200)
  }

  const handleDisconnect = () => {
    setConnectedId(null)
    setCmdResult(null)
  }

  const handleAction = async (action) => {
    if (action.confirm && !confirm(`Are you sure you want to ${action.label}?`)) return
    if (action.hasInput) { setShowScript(true); return }

    setCmdLoading(action.cmd)
    setCmdResult(null)
    try {
      const res = await sendCommand(id, action.cmd)
      setCmdResult({ type: 'success', message: `Command "${action.label}" queued! (ID: ${res.id}) — agent will execute in ~30 sec` })
    } catch (err) {
      setCmdResult({ type: 'error', message: err.response?.data?.detail || 'Failed to send command' })
    } finally {
      setCmdLoading(null)
    }
  }

  const handleRunScript = async () => {
    if (!scriptInput.trim()) return
    setCmdLoading('RUN_SCRIPT')
    setCmdResult(null)
    setShowScript(false)
    try {
      const res = await sendCommand(id, 'RUN_SCRIPT', { script: scriptInput })
      setCmdResult({ type: 'success', message: `Script queued! (ID: ${res.id}) — agent will execute in ~30 sec` })
      setScriptInput('')
    } catch (err) {
      setCmdResult({ type: 'error', message: 'Failed to send script' })
    } finally {
      setCmdLoading(null)
    }
  }

  const connectedDevice = [...(data.server || []), ...(data.systems || [])].find(d => d.id === connectedId)
  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border border-[#D4E8FF] bg-white text-[#1E3A5F] outline-none focus:border-[#60A5FA] placeholder-[#A0B8D0]"
  const labelCls = "block text-xs font-medium text-[#5B7FA6] mb-1.5"

  return (
    <div className="min-h-screen" style={{ background: '#F0F7FF' }}>
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/schools/${id}`)} className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">← Back</button>
          <div className="w-px h-4 bg-[#D4E8FF]" />
          <div>
            <div className="text-sm font-medium text-[#1E3A5F]">Devices</div>
            <div className="text-xs text-[#7BA7C7]">{(data.server || []).length} server · {(data.systems || []).length} systems</div>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
          <i className="ti ti-plus" aria-hidden="true"></i> Add system
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-6">
        {loading ? (
          <div className="text-center py-16 text-sm text-[#7BA7C7]">Loading...</div>
        ) : (
          <>
            {/* SERVER */}
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-lock text-[#7C3AED] text-xs" aria-hidden="true"></i>
              <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Server</span>
            </div>

            {(data.server || []).length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#DDD6FE] rounded-2xl p-8 text-center mb-6">
                <div className="text-xs text-[#A0B8D0] mb-3">No server added yet</div>
                <button onClick={() => { setForm(f => ({...f, device_type:'server'})); setShowAdd(true) }}
                  className="text-xs text-[#7C3AED] bg-[#F3F0FF] border border-[#DDD6FE] px-4 py-2 rounded-lg cursor-pointer">
                  + Add server
                </button>
              </div>
            ) : (
              <div className="bg-white border-2 border-[#DDD6FE] rounded-2xl p-5 flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#A78BFA)' }}>
                  <i className="ti ti-server-2 text-white text-lg" aria-hidden="true"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#1E3A5F]">{data.server[0].name}</div>
                  <div className="text-xs text-[#7BA7C7] font-mono mt-0.5">{data.server[0].ip_address || 'IP not set'}</div>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#F3F0FF] text-[#7C3AED] border border-[#DDD6FE] px-2 py-0.5 rounded-full mt-1">
                    <i className="ti ti-infinity text-xs" aria-hidden="true"></i> Always connected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-[#1A6B4A] bg-[#E8FFF5] border border-[#A7F0D4] px-3 py-1.5 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span> Online
                  </span>
                  <button onClick={() => handleConnect(data.server[0])}
                    className="flex items-center gap-1.5 text-xs text-[#7C3AED] bg-[#F3F0FF] border border-[#DDD6FE] px-3 py-2 rounded-lg cursor-pointer">
                    <i className="ti ti-terminal-2" aria-hidden="true"></i> Access
                  </button>
                  <button onClick={() => handleDelete(data.server[0].id)}
                    className="text-xs text-[#C62828] bg-[#FFF0F0] border border-[#FFCDD2] px-3 py-2 rounded-lg cursor-pointer">
                    <i className="ti ti-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            )}

            {/* SYSTEMS */}
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-device-desktop text-[#1D6FAD] text-xs" aria-hidden="true"></i>
              <span className="text-xs font-semibold text-[#1D6FAD] uppercase tracking-wider">Systems</span>
              <span className="text-xs text-[#7BA7C7] font-normal normal-case tracking-normal">(on-demand)</span>
            </div>

            {(data.systems || []).length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#C7E6FF] rounded-2xl p-10 text-center">
                <i className="ti ti-device-desktop text-3xl text-[#A0B8D0] mb-3 block" aria-hidden="true"></i>
                <div className="text-sm font-medium text-[#1E3A5F] mb-1">No systems added</div>
                <div className="text-xs text-[#7BA7C7] mb-4">Add PCs to access them on-demand</div>
                <button onClick={() => setShowAdd(true)}
                  className="text-xs text-[#1D6FAD] bg-[#EBF5FF] border border-[#C7E6FF] px-4 py-2 rounded-lg cursor-pointer">
                  + Add system
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(data.systems || []).map(device => {
                  const isConn = connectedId === device.id
                  const isConning = connecting === device.id
                  return (
                    <div key={device.id}
                      className={`bg-white rounded-2xl p-4 border transition-all ${isConn ? 'border-[#A7F0D4] bg-[#FAFFFC]' : 'border-[#D4E8FF]'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EBF5FF] flex items-center justify-center">
                          <i className="ti ti-device-desktop text-[#1D6FAD] text-base" aria-hidden="true"></i>
                        </div>
                        <div className={`w-2 h-2 rounded-full mt-1 ${isConn ? 'bg-[#34D399]' : 'bg-[#CBD5E1]'}`}></div>
                      </div>
                      <div className="text-sm font-medium text-[#1E3A5F]">{device.name}</div>
                      <div className="text-xs text-[#7BA7C7] font-mono mt-0.5">{device.ip_address || '—'}</div>
                      {device.os && (
                        <span className="inline-block text-xs text-[#5B7FA6] bg-[#F5F9FF] border border-[#E0EEFF] px-2 py-0.5 rounded mt-2">{device.os}</span>
                      )}
                      <div className="flex gap-2 mt-3">
                        {isConn ? (
                          <button onClick={() => document.getElementById('apanel').scrollIntoView({behavior:'smooth'})}
                            className="flex-1 text-xs text-[#1A6B4A] bg-[#E8FFF5] border border-[#A7F0D4] py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1">
                            <i className="ti ti-plug-connected" aria-hidden="true"></i> Full access
                          </button>
                        ) : (
                          <button onClick={() => handleConnect(device)} disabled={isConning}
                            className="flex-1 text-xs text-white py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 border-none disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
                            <i className={`ti ${isConning ? 'ti-loader' : 'ti-plug'}`} aria-hidden="true"></i>
                            {isConning ? 'Connecting...' : 'Connect'}
                          </button>
                        )}
                        <button onClick={() => handleDelete(device.id)}
                          className="text-xs text-[#C62828] bg-[#FFF0F0] border border-[#FFCDD2] px-3 py-2 rounded-lg cursor-pointer">
                          <i className="ti ti-trash" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div onClick={() => setShowAdd(true)}
                  className="bg-[#F5F9FF] border-2 border-dashed border-[#C7E6FF] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer min-height-36 transition-all hover:border-[#60A5FA] hover:bg-[#EBF5FF]"
                  style={{minHeight:'144px'}}>
                  <i className="ti ti-plus text-2xl text-[#A0B8D0]" aria-hidden="true"></i>
                  <span className="text-xs text-[#A0B8D0]">Add system</span>
                </div>
              </div>
            )}

            {/* ACCESS PANEL */}
            {connectedId && connectedDevice && (
              <div id="apanel" className="mt-6 rounded-2xl p-5" style={{ background: '#1E3A5F' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Full access — {connectedDevice.name}
                    </div>
                    <div className="text-xs text-[#7BA7C7] mt-0.5">
                      Session active · Commands go to school server agent
                    </div>
                  </div>
                  <button onClick={handleDisconnect}
                    className="text-xs text-[#F87171] bg-[#2D0A0A] border border-[#7F1D1D] px-4 py-2 rounded-lg cursor-pointer">
                    ✕ Break connection
                  </button>
                </div>

                {/* Command result */}
                {cmdResult && (
                  <div className={`mb-4 px-4 py-3 rounded-xl text-xs ${cmdResult.type === 'success' ? 'bg-[#E8FFF5] text-[#1A6B4A] border border-[#A7F0D4]' : 'bg-[#FFF0F0] text-[#C62828] border border-[#FFCDD2]'}`}>
                    {cmdResult.message}
                  </div>
                )}

                <div className="grid grid-cols-4 gap-3">
                  {actions.map(({ icon, label, cmd, color, confirm: needConfirm, hasInput }) => (
                    <div key={cmd}
                      onClick={() => !cmdLoading && handleAction({ icon, label, cmd, color, confirm: needConfirm, hasInput })}
                      className="rounded-xl p-3 text-center cursor-pointer transition-all relative"
                      style={{ background: cmdLoading === cmd ? '#1a3a5c' : '#25476E', border: '1px solid #2D5A8A', opacity: cmdLoading && cmdLoading !== cmd ? 0.6 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#2D5A8A'}>
                      {cmdLoading === cmd ? (
                        <i className="ti ti-loader text-xl block mb-1" style={{ color }} aria-hidden="true"></i>
                      ) : (
                        <i className={`ti ${icon} text-xl block mb-1`} style={{ color }} aria-hidden="true"></i>
                      )}
                      <span className="text-xs text-[#A8D5FF]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SCRIPT MODAL */}
      {showScript && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(30,58,95,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#D4E8FF]">
            <div className="text-sm font-medium text-[#1E3A5F] mb-3">Run PowerShell Script</div>
            <textarea
              value={scriptInput}
              onChange={e => setScriptInput(e.target.value)}
              placeholder="Get-Process | Where-Object {$_.CPU -gt 100}"
              className="w-full h-32 rounded-xl px-3 py-2.5 text-xs font-mono border border-[#D4E8FF] bg-[#1E3A5F] text-[#A8D5FF] outline-none resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowScript(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-[#7BA7C7] border border-[#D4E8FF] bg-white cursor-pointer">
                Cancel
              </button>
              <button onClick={handleRunScript} disabled={!scriptInput.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white border-none cursor-pointer disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
                Run Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(30,58,95,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#D4E8FF]">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm font-medium text-[#1E3A5F]">Add new device</div>
              <button onClick={() => setShowAdd(false)} className="text-[#7BA7C7] hover:text-[#1E3A5F] bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>
            <div className="flex gap-2 mb-4">
              {['server', 'system'].map(t => (
                <button key={t} onClick={() => setForm(f => ({...f, device_type: t}))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium border cursor-pointer capitalize transition-all ${
                    form.device_type === t
                      ? t === 'server' ? 'bg-[#F3F0FF] text-[#7C3AED] border-[#DDD6FE]' : 'bg-[#EBF5FF] text-[#1D6FAD] border-[#C7E6FF]'
                      : 'bg-[#F5F9FF] text-[#7BA7C7] border-[#D4E8FF]'
                  }`}>
                  <i className={`ti ${t === 'server' ? 'ti-server-2' : 'ti-device-desktop'} mr-1`} aria-hidden="true"></i>{t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Device name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder={form.device_type === 'server' ? 'EasyLearningERP-SRV' : 'PC-01'} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>IP address</label>
                <input value={form.ip_address} onChange={e => setForm(f => ({...f, ip_address: e.target.value}))}
                  placeholder="192.168.12.21" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>MAC address</label>
                <input value={form.mac_address} onChange={e => setForm(f => ({...f, mac_address: e.target.value}))}
                  placeholder="AA:BB:CC:DD:EE:FF" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>OS</label>
                <input value={form.os} onChange={e => setForm(f => ({...f, os: e.target.value}))}
                  placeholder="Windows 11 Pro" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Optional" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-[#7BA7C7] border border-[#D4E8FF] bg-white cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!form.name}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white border-none cursor-pointer disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
                Add device ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}