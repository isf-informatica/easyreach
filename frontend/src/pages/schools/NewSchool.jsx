import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSchool } from '../../api/schools'

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm border border-[#D4E8FF] bg-white text-[#1E3A5F] outline-none focus:border-[#60A5FA] placeholder-[#A0B8D0]"
const labelCls = "block text-xs font-medium text-[#5B7FA6] mb-1.5"

export default function NewSchool() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', code: '', institution_type: 'school',
    contact_name: '', contact_email: '',
    erp_domain: '', storage_domain: '', public_ip: '', lan_ip: '',
    storage_path: 'D:\\MediaStorage', nginx_port: 9006, https_port: 9000,
    ssl_thumbprint: '', sync_interval_min: 15, db_name: '',
  })

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      await createSchool(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const steps = ['Institution details', 'Server config', 'Review']
  const typeOptions = [
    { value: 'school', label: '🏫 School' },
    { value: 'college', label: '🎓 College' },
    { value: 'institute', label: '🏛️ Institute' },
  ]

  return (
    <div className="min-h-screen" style={{background:'#F0F7FF'}}>
      {/* Topbar */}
      <div className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-[#E0EEFF]">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">← Back</button>
        <div className="w-px h-4 bg-[#D4E8FF]" />
        <div className="text-sm font-medium text-[#1E3A5F]">New institution deployment</div>
      </div>

      <div className="max-w-xl mx-auto py-8 px-6">
        {/* Steps */}
        <div className="flex items-center mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step > i+1 ? 'bg-[#34D399] border-[#34D399] text-white' :
                  step === i+1 ? 'bg-[#60A5FA] border-[#60A5FA] text-white' :
                  'bg-white border-[#C7E6FF] text-[#A0B8D0]'
                }`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <span className={`text-xs font-medium ${step===i+1?'text-[#1D6FAD]':step>i+1?'text-[#1A6B4A]':'text-[#A0B8D0]'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-3 ${step>i+1?'bg-[#A7F0D4]':'bg-[#D4E8FF]'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#D4E8FF]" style={{boxShadow:'0 4px 20px rgba(96,165,250,0.08)'}}>

          {step === 1 && (
            <div>
              <div className="text-sm font-medium text-[#1E3A5F] mb-5">Institution details</div>
              <div className="mb-5">
                <label className={labelCls}>Institution type</label>
                <div className="flex gap-2">
                  {typeOptions.map(({ value, label }) => (
                    <button key={value} onClick={() => update('institution_type', value)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        form.institution_type === value
                          ? 'bg-[#EBF5FF] text-[#1D6FAD] border-[#60A5FA]'
                          : 'bg-[#F5F9FF] text-[#7BA7C7] border-[#D4E8FF] hover:border-[#A8D5FF]'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Institution name', 'name', 'MBSE School'],
                  ['Short code', 'code', 'mbse'],
                  ['Contact name', 'contact_name', 'IT Admin'],
                  ['Contact email', 'contact_email', 'admin@school.edu.in'],
                  ['ERP domain', 'erp_domain', 'mbse.easylearn.org.in'],
                  ['DB name', 'db_name', 'mbsc_easylearn'],
                ].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input value={form[key]} onChange={e => update(key, e.target.value)}
                      placeholder={placeholder} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-sm font-medium text-[#1E3A5F] mb-5">Server configuration</div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Public IP', 'public_ip', '118.185.90.46'],
                  ['LAN IP', 'lan_ip', '192.168.12.21'],
                  ['Storage domain', 'storage_domain', 'mbse-storage.easylearn.org.in'],
                  ['Storage path', 'storage_path', 'D:\\MediaStorage'],
                  ['SSL thumbprint', 'ssl_thumbprint', '3590B6261F...'],
                ].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input value={form[key]} onChange={e => update(key, e.target.value)}
                      placeholder={placeholder} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>Nginx port</label>
                  <input type="number" value={form.nginx_port}
                    onChange={e => update('nginx_port', parseInt(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>HTTPS port</label>
                  <input type="number" value={form.https_port}
                    onChange={e => update('https_port', parseInt(e.target.value))} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Sync interval</label>
                  <select value={form.sync_interval_min}
                    onChange={e => update('sync_interval_min', parseInt(e.target.value))} className={inputCls}>
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-sm font-medium text-[#1E3A5F] mb-5">Review & confirm</div>
              <div className="bg-[#F5F9FF] rounded-xl p-4 border border-[#D4E8FF]">
                {[
                  ['Type', form.institution_type],
                  ['Name', form.name],
                  ['Code', form.code],
                  ['Contact', `${form.contact_name} · ${form.contact_email}`],
                  ['ERP', form.erp_domain],
                  ['DB', form.db_name],
                  ['Server', `${form.public_ip} · ${form.lan_ip}`],
                  ['Storage', form.storage_domain],
                  ['Path', form.storage_path],
                  ['Ports', `Nginx :${form.nginx_port} · HTTPS :${form.https_port}`],
                  ['Sync', `Every ${form.sync_interval_min} min`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-[#E0EEFF] last:border-0">
                    <span className="text-xs text-[#7BA7C7]">{label}</span>
                    <span className="text-xs font-medium text-[#1E3A5F]">{value || '—'}</span>
                  </div>
                ))}
              </div>
              {error && (
                <div className="mt-4 rounded-xl px-4 py-3 text-xs bg-[#FFF0F0] border border-[#FFCDD2] text-[#C62828]">
                  ✗ {error}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#E0EEFF]">
            <button onClick={() => step > 1 ? setStep(step-1) : navigate('/dashboard')}
              className="text-sm text-[#7BA7C7] hover:text-[#1E3A5F]">
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(step+1)}
                disabled={step===1 && (!form.name || !form.code)}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer disabled:opacity-40"
                style={{background:'linear-gradient(135deg,#60A5FA,#34D399)'}}>
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer disabled:opacity-40"
                style={{background:'linear-gradient(135deg,#34D399,#60A5FA)'}}>
                {loading ? 'Deploying...' : '✓ Deploy institution'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}