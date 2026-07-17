import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm border border-[#D4E8FF] bg-white text-[#1E3A5F] outline-none focus:border-[#60A5FA] placeholder-[#A0B8D0] transition-all"
const labelCls = "block text-xs font-medium text-[#5B7FA6] mb-1.5"

const Section = ({ title, icon, children }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-4">
      <i className={`ti ${icon} text-[#60A5FA] text-base`} aria-hidden="true"></i>
      <span className="text-sm font-medium text-[#1E3A5F]">{title}</span>
      <div className="flex-1 h-px bg-[#D4E8FF]" />
    </div>
    {children}
  </div>
)

const Field = ({ label, children, hint }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
    {hint && <p className="text-xs text-[#A0B8D0] mt-1">{hint}</p>}
  </div>
)

const steps = ['Institution', 'Server', 'AWS & Sync', 'Review & Download']

export default function SmartSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [schoolId, setSchoolId] = useState(null)

  const [form, setForm] = useState({
    // Institution
    name: '',
    code: '',
    institution_type: 'school',
    contact_name: '',
    contact_email: '',
    erp_domain: '',
    db_name: '',

    // Server
    public_ip: '',
    lan_ip: '',
    storage_domain: '',
    storage_path: 'D:\\MediaStorage',
    nginx_port: 9006,
    https_port: 9000,
    ssl_thumbprint: '',
    sync_interval_min: 15,

    // AWS
    aws_access_key: '',
    aws_secret_key: '',
    aws_bucket: 'easylearn1',
    aws_region: 'eu-north-1',
    aws_folders: 'easylearn-ncert,NCERT Course video,SAAR',

    // Backup
    ftp_host: '184.168.118.87',
    ftp_user: '',
    ftp_pass: '',

    easyreach_api: window.location.origin.includes('localhost')
      ? 'http://127.0.0.1:8000'
      : 'https://easylearn.org.in/mediasync/api',
  })

  const u = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const typeOptions = [
    { value: 'school', label: '🏫 School' },
    { value: 'college', label: '🎓 College' },
    { value: 'institute', label: '🏛️ Institute' },
  ]

  const canNext = () => {
    if (step === 1) return form.name && form.code
    if (step === 2) return form.public_ip && form.lan_ip && form.storage_domain && form.ssl_thumbprint
    if (step === 3) return form.aws_access_key && form.aws_secret_key
    return true
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        aws_folders: form.aws_folders.split(',').map(f => f.trim()).filter(Boolean),
      }
      const res = await api.post('/api/setup/generate-setup', payload, { responseType: 'blob' })

      // Get school_id from header if available
      const sid = res.headers['x-school-id']
      if (sid) setSchoolId(parseInt(sid))

      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `easyreach_${form.code}_setup.zip`
      a.click()
      window.URL.revokeObjectURL(url)
      setDownloaded(true)
    } catch (err) {
      alert(err.response?.data?.detail || 'Download failed. Check backend.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F0F7FF' }}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">← Back</button>
          <div className="w-px h-4 bg-[#D4E8FF]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
              <i className="ti ti-rocket text-white text-sm" aria-hidden="true"></i>
            </div>
            <div>
              <div className="text-sm font-medium text-[#1E3A5F]">One-click setup</div>
              <div className="text-xs text-[#7BA7C7]">Fill form → Download ZIP → Run installer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-6">
        {/* How it works banner */}
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-6 border border-[#C7E6FF]" style={{ background: 'linear-gradient(135deg,#EBF4FF,#E8FFF5)' }}>
          {['📋 Fill form', '⬇ Download ZIP', '▶ Run install.ps1', '✅ Auto setup done'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#1E3A5F]">{s}</span>
              {i < 3 && <i className="ti ti-arrow-right text-[#A0B8D0] text-xs" aria-hidden="true"></i>}
            </div>
          ))}
        </div>

        {/* Steps indicator */}
        <div className="flex items-center mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step > i + 1 ? 'bg-[#34D399] border-[#34D399] text-white' :
                  step === i + 1 ? 'bg-[#60A5FA] border-[#60A5FA] text-white' :
                  'bg-white border-[#C7E6FF] text-[#A0B8D0]'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  step === i + 1 ? 'text-[#1D6FAD]' : step > i + 1 ? 'text-[#1A6B4A]' : 'text-[#A0B8D0]'
                }`}>{label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px mx-2 ${step > i + 1 ? 'bg-[#A7F0D4]' : 'bg-[#D4E8FF]'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#D4E8FF]" style={{ boxShadow: '0 4px 20px rgba(96,165,250,0.08)' }}>

          {/* STEP 1: Institution */}
          {step === 1 && (
            <div>
              <Section title="Institution type" icon="ti-building-community">
                <div className="flex gap-2">
                  {typeOptions.map(({ value, label }) => (
                    <button key={value} onClick={() => u('institution_type', value)}
                      className={`flex-1 py-3 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                        form.institution_type === value
                          ? 'bg-[#EBF5FF] text-[#1D6FAD] border-[#60A5FA]'
                          : 'bg-[#F5F9FF] text-[#7BA7C7] border-[#D4E8FF] hover:border-[#A8D5FF]'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Basic details" icon="ti-id-badge">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Institution name *">
                    <input value={form.name} onChange={e => u('name', e.target.value)}
                      placeholder="MBSE School" className={inputCls} />
                  </Field>
                  <Field label="Short code *" hint="Lowercase, no spaces (used in filenames)">
                    <input value={form.code} onChange={e => u('code', e.target.value.toLowerCase())}
                      placeholder="mbse" className={inputCls} />
                  </Field>
                  <Field label="Contact person">
                    <input value={form.contact_name} onChange={e => u('contact_name', e.target.value)}
                      placeholder="Tapan Das" className={inputCls} />
                  </Field>
                  <Field label="Contact email">
                    <input type="email" value={form.contact_email} onChange={e => u('contact_email', e.target.value)}
                      placeholder="admin@school.edu.in" className={inputCls} />
                  </Field>
                  <Field label="ERP domain">
                    <input value={form.erp_domain} onChange={e => u('erp_domain', e.target.value)}
                      placeholder="mbse.easylearn.org.in" className={inputCls} />
                  </Field>
                  <Field label="Database name">
                    <input value={form.db_name} onChange={e => u('db_name', e.target.value)}
                      placeholder="mbsc_easylearn" className={inputCls} />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {/* STEP 2: Server */}
          {step === 2 && (
            <div>
              <Section title="Network" icon="ti-network">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Public IP *" hint="Router/firewall public IP">
                    <input value={form.public_ip} onChange={e => u('public_ip', e.target.value)}
                      placeholder="118.185.90.46" className={inputCls} />
                  </Field>
                  <Field label="LAN IP *" hint="Server's local network IP">
                    <input value={form.lan_ip} onChange={e => u('lan_ip', e.target.value)}
                      placeholder="192.168.12.21" className={inputCls} />
                  </Field>
                  <Field label="Storage subdomain *" hint="DNS must point to public IP">
                    <input value={form.storage_domain} onChange={e => u('storage_domain', e.target.value)}
                      placeholder="mbse-storage.easylearn.org.in" className={inputCls} />
                  </Field>
                  <Field label="Storage path" hint="Where files will be stored on server">
                    <input value={form.storage_path} onChange={e => u('storage_path', e.target.value)}
                      placeholder="D:\MediaStorage" className={inputCls} />
                  </Field>
                </div>
              </Section>

              <Section title="Ports & SSL" icon="ti-lock">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nginx internal port" hint="Nginx listens on this (e.g. 9006)">
                    <input type="number" value={form.nginx_port} onChange={e => u('nginx_port', parseInt(e.target.value))}
                      className={inputCls} />
                  </Field>
                  <Field label="HTTPS public port" hint="IIS proxies HTTPS on this (e.g. 9000)">
                    <input type="number" value={form.https_port} onChange={e => u('https_port', parseInt(e.target.value))}
                      className={inputCls} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="SSL certificate thumbprint *" hint="Get from: certlm.msc → Personal → Certificates">
                      <input value={form.ssl_thumbprint} onChange={e => u('ssl_thumbprint', e.target.value)}
                        placeholder="3590B6261F221EC7903D4D81BB988F877A1644BA" className={inputCls} />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* Info box */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#FFFBEA] border border-[#FFE082]">
                <i className="ti ti-info-circle text-[#D97706] mt-0.5" aria-hidden="true"></i>
                <div className="text-xs text-[#8A6000]">
                  Make sure ports {form.nginx_port} and {form.https_port} are open in Windows Firewall and router port forwarding is set up before running the installer.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AWS & Sync */}
          {step === 3 && (
            <div>
              <Section title="AWS S3 credentials" icon="ti-cloud">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="AWS Access Key *">
                    <input value={form.aws_access_key} onChange={e => u('aws_access_key', e.target.value)}
                      placeholder="AKIAZHYNS2LBCJ47RPHM" className={inputCls} />
                  </Field>
                  <Field label="AWS Secret Key *">
                    <input type="password" value={form.aws_secret_key} onChange={e => u('aws_secret_key', e.target.value)}
                      placeholder="••••••••••••••••" className={inputCls} />
                  </Field>
                  <Field label="S3 Bucket">
                    <input value={form.aws_bucket} onChange={e => u('aws_bucket', e.target.value)}
                      placeholder="easylearn1" className={inputCls} />
                  </Field>
                  <Field label="AWS Region">
                    <select value={form.aws_region} onChange={e => u('aws_region', e.target.value)} className={inputCls}>
                      <option value="eu-north-1">eu-north-1</option>
                      <option value="ap-south-1">ap-south-1</option>
                      <option value="us-east-1">us-east-1</option>
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="Folders to sync" icon="ti-folder">
                <Field label="S3 folder names (comma separated)" hint="These folders will sync from S3 bucket to local storage">
                  <input value={form.aws_folders} onChange={e => u('aws_folders', e.target.value)}
                    placeholder="easylearn-ncert,NCERT Course video,SAAR" className={inputCls} />
                </Field>
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.aws_folders.split(',').map(f => f.trim()).filter(Boolean).map(f => (
                    <span key={f} className="text-xs px-3 py-1 rounded-full bg-[#EBF5FF] text-[#1D6FAD] border border-[#C7E6FF]">
                      <i className="ti ti-folder text-xs mr-1" aria-hidden="true"></i>{f}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="Sync schedule" icon="ti-clock">
                <Field label="Auto-sync interval">
                  <select value={form.sync_interval_min} onChange={e => u('sync_interval_min', parseInt(e.target.value))} className={inputCls}>
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes (recommended)</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </Field>
              </Section>

              <Section title="GoDaddy FTP backup" icon="ti-database">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="FTP host">
                    <input value={form.ftp_host} onChange={e => u('ftp_host', e.target.value)}
                      placeholder="184.168.118.87" className={inputCls} />
                  </Field>
                  <Field label="FTP username">
                    <input value={form.ftp_user} onChange={e => u('ftp_user', e.target.value)}
                      placeholder="backup@fortimates.com" className={inputCls} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="FTP password">
                      <input type="password" value={form.ftp_pass} onChange={e => u('ftp_pass', e.target.value)}
                        placeholder="••••••••" className={inputCls} />
                    </Field>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* STEP 4: Review & Download */}
          {step === 4 && (
            <div>
              <Section title="Review configuration" icon="ti-list-check">
                <div className="bg-[#F5F9FF] rounded-xl p-4 border border-[#D4E8FF] space-y-0">
                  {[
                    ['Type', form.institution_type],
                    ['Name', form.name],
                    ['Code', form.code],
                    ['Contact', `${form.contact_name} · ${form.contact_email}`],
                    ['ERP', form.erp_domain],
                    ['DB', form.db_name],
                    ['Public IP', form.public_ip],
                    ['LAN IP', form.lan_ip],
                    ['Storage domain', form.storage_domain],
                    ['Storage path', form.storage_path],
                    ['Nginx port', form.nginx_port],
                    ['HTTPS port', form.https_port],
                    ['Sync interval', `Every ${form.sync_interval_min} min`],
                    ['AWS bucket', form.aws_bucket],
                    ['AWS folders', form.aws_folders],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-[#E0EEFF] last:border-0">
                      <span className="text-xs text-[#7BA7C7]">{label}</span>
                      <span className="text-xs font-medium text-[#1E3A5F] text-right max-w-xs truncate">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* What's in the ZIP */}
              <Section title="ZIP will contain" icon="ti-file-zip">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['ti-terminal-2', 'install.ps1', 'Master auto-installer'],
                    ['ti-file-settings', 'nginx.conf', 'Nginx web server config'],
                    ['ti-cloud', 'rclone.conf', 'AWS S3 credentials'],
                    ['ti-refresh', 'sync_aws.bat', 'AWS sync script'],
                    ['ti-database', 'backup.bat', 'GoDaddy FTP backup'],
                    ['ti-world', 'web.config', 'IIS HTTPS proxy config'],
                    ['ti-settings', 'config.json', 'Institution config'],
                  ].map(([icon, name, desc]) => (
                    <div key={name} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F5F9FF] border border-[#E0EEFF]">
                      <i className={`ti ${icon} text-[#60A5FA] text-sm`} aria-hidden="true"></i>
                      <div>
                        <div className="text-xs font-mono font-medium text-[#1E3A5F]">{name}</div>
                        <div className="text-xs text-[#7BA7C7]">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* After download instructions */}
              <div className="bg-[#E8FFF5] border border-[#A7F0D4] rounded-xl p-4 mb-5">
                <div className="text-xs font-medium text-[#1A6B4A] mb-2">After download — run on school server:</div>
                <div className="bg-[#1E3A5F] rounded-lg px-4 py-3">
                  <code className="text-xs text-[#34D399]">PowerShell -ExecutionPolicy Bypass -File install.ps1</code>
                </div>
                <div className="text-xs text-[#5BA88A] mt-2">Run as Administrator. Installer auto-sets up everything and registers with EasyReach dashboard.</div>
              </div>

              {downloaded && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm bg-[#E8FFF5] border border-[#A7F0D4] text-[#1A6B4A]">
                  <i className="ti ti-circle-check" aria-hidden="true"></i>
                  ZIP downloaded! Run install.ps1 on the school server.
                  {schoolId && (
                    <button onClick={() => navigate(`/schools/${schoolId}`)}
                      className="ml-auto text-xs underline cursor-pointer bg-transparent border-none text-[#1A6B4A]">
                      View in dashboard →
                    </button>
                  )}
                </div>
              )}

              <button onClick={handleDownload} disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)', boxShadow: '0 4px 16px rgba(96,165,250,0.3)' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ti ti-loader animate-spin" aria-hidden="true"></i> Generating ZIP...
                  </span>
                ) : downloaded ? (
                  '⬇ Download again'
                ) : (
                  '⬇ Generate & Download Setup ZIP'
                )}
              </button>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#E0EEFF]">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
              className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F] bg-transparent border-none cursor-pointer">
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            {step < 4 && (
              <button onClick={() => setStep(step + 1)} disabled={!canNext()}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#60A5FA,#34D399)' }}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}