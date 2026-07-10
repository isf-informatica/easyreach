import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSchool } from '../../api/schools'

export default function NewSchool() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    code: '',
    contact_name: '',
    contact_email: '',
    erp_domain: '',
    storage_domain: '',
    public_ip: '',
    lan_ip: '',
    storage_path: 'D:\\MediaStorage',
    nginx_port: 9006,
    https_port: 9000,
    ssl_thumbprint: '',
    sync_interval_min: 15,
    db_name: '',
  })

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await createSchool(form)
      navigate('/dashboard')
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
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          ← Back
        </button>
        <div className="text-sm font-medium text-gray-900">Add new school</div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-6">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['School details', 'Server config', 'Review'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900 mb-4">School details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">School name *</label>
                  <input value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="MBSE School"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">School code *</label>
                  <input value={form.code} onChange={e => update('code', e.target.value)}
                    placeholder="mbse"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Contact name</label>
                  <input value={form.contact_name} onChange={e => update('contact_name', e.target.value)}
                    placeholder="IT Admin"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Contact email</label>
                  <input value={form.contact_email} onChange={e => update('contact_email', e.target.value)}
                    placeholder="admin@school.edu.in"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ERP domain</label>
                  <input value={form.erp_domain} onChange={e => update('erp_domain', e.target.value)}
                    placeholder="mbse.easylearn.org.in"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">DB name</label>
                  <input value={form.db_name} onChange={e => update('db_name', e.target.value)}
                    placeholder="mbsc_easylearn"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Server configuration</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Public IP</label>
                  <input value={form.public_ip} onChange={e => update('public_ip', e.target.value)}
                    placeholder="118.185.90.46"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">LAN IP</label>
                  <input value={form.lan_ip} onChange={e => update('lan_ip', e.target.value)}
                    placeholder="192.168.12.21"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Storage domain</label>
                  <input value={form.storage_domain} onChange={e => update('storage_domain', e.target.value)}
                    placeholder="mbse-storage.easylearn.org.in"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Storage path</label>
                  <input value={form.storage_path} onChange={e => update('storage_path', e.target.value)}
                    placeholder="D:\MediaStorage"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nginx port</label>
                  <input type="number" value={form.nginx_port} onChange={e => update('nginx_port', parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">HTTPS port</label>
                  <input type="number" value={form.https_port} onChange={e => update('https_port', parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">SSL thumbprint</label>
                  <input value={form.ssl_thumbprint} onChange={e => update('ssl_thumbprint', e.target.value)}
                    placeholder="3590B6261F221EC7..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sync interval (min)</label>
                  <select value={form.sync_interval_min} onChange={e => update('sync_interval_min', parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Review */}
          {step === 3 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-4">Review & confirm</h2>
              <div className="space-y-3">
                {[
                  ['School name', form.name],
                  ['School code', form.code],
                  ['Contact', `${form.contact_name} (${form.contact_email})`],
                  ['ERP domain', form.erp_domain],
                  ['DB name', form.db_name],
                  ['Public IP', form.public_ip],
                  ['LAN IP', form.lan_ip],
                  ['Storage domain', form.storage_domain],
                  ['Storage path', form.storage_path],
                  ['Nginx port', form.nginx_port],
                  ['HTTPS port', form.https_port],
                  ['Sync interval', `${form.sync_interval_min} minutes`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-900">{value || '—'}</span>
                  </div>
                ))}
              </div>
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!form.name || !form.code)}
                className="bg-blue-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create school ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}