import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm border border-[#D4E8FF] bg-white text-[#1E3A5F] outline-none focus:border-[#60A5FA] placeholder-[#A0B8D0]"
const labelCls = "block text-xs font-medium text-[#5B7FA6] mb-1.5"

export default function DefaultTemplate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    institution_name: '',
    institution_code: '',
    institution_type: 'school',
    public_ip: '',
    lan_ip: '',
    storage_domain: '',
    storage_path: 'D:\\MediaStorage',
    nginx_port: 9006,
    https_port: 9000,
    ssl_thumbprint: '',
    sync_interval_min: 15,
    aws_folders: 'easylearn-ncert,NCERT Course video,SAAR',
    godaddy_ftp_host: '184.168.118.87',
    godaddy_ftp_user: '',
    db_name: '',
    erp_domain: '',
    contact_name: '',
    contact_email: '',
  })

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const generateFiles = () => {
    const folders = form.aws_folders.split(',').map(f => f.trim())
    const storagePath = form.storage_path

    // nginx.conf
    const nginxConf = `worker_processes  1;
events { worker_connections 1024; }
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;
    server {
        listen ${form.nginx_port};
        root ${storagePath.replace(/\\/g, '/')};
        autoindex off;
        location / {
            limit_except GET HEAD OPTIONS { deny all; }
            add_header Accept-Ranges bytes;
            add_header Cache-Control "public, max-age=3600";
            add_header Access-Control-Allow-Origin "*";
            try_files $uri $uri/ =404;
        }
        location ~* \\.(mp4|webm|avi|mov|mkv)$ {
            limit_except GET HEAD OPTIONS { deny all; }
            add_header Accept-Ranges bytes;
            add_header Access-Control-Allow-Origin "*";
            mp4;
            mp4_buffer_size 1m;
            mp4_max_buffer_size 5m;
        }
        location ~* \\.pdf$ {
            limit_except GET HEAD OPTIONS { deny all; }
            add_header Content-Type application/pdf;
            add_header Accept-Ranges bytes;
            add_header Access-Control-Allow-Origin "*";
            add_header Content-Disposition inline;
        }
    }
}`

    // sync_aws.bat
    const syncBat = `@echo off
echo ======================================== >> ${storagePath}\\sync_log.txt
echo Sync Started: %date% %time% >> ${storagePath}\\sync_log.txt
${folders.map(f => `
REM ${f} sync
D:\\MinIO\\rclone.exe --config "C:\\Users\\admin\\AppData\\Roaming\\rclone\\rclone.conf" sync "aws-s3:easylearn1/${f}" "${storagePath}\\${f}" --log-file=${storagePath}\\sync_log.txt --log-level INFO --transfers 5 --retries 3`).join('\n')}
echo Sync Complete: %date% %time% >> ${storagePath}\\sync_log.txt`

    // backup.bat
    const backupBat = `@echo off
echo ======================================== >> ${storagePath}\\backup_log.txt
echo Backup Started: %date% %time% >> ${storagePath}\\backup_log.txt
D:\\MinIO\\rclone.exe --config "C:\\Users\\admin\\AppData\\Roaming\\rclone\\rclone.conf" copy "${storagePath}" "godaddy-backup:/" ^
  --log-file=${storagePath}\\backup_log.txt ^
  --log-level INFO ^
  --transfers 3 ^
  --tpslimit 2 ^
  --checkers 4 ^
  --retries 10 ^
  --retries-sleep 30s
echo Backup Complete: %date% %time% >> ${storagePath}\\backup_log.txt`

    // start_nginx.bat
    const startNginx = `@echo off
timeout /t 30 /nobreak
taskkill /F /IM nginx.exe 2>nul
timeout /t 2 /nobreak
D:\\nginx\\nginx.exe -p D:\\nginx`

    // web.config
    const webConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <proxy enabled="true" />
    <rewrite>
      <rules>
        <rule name="Nginx Proxy" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:${form.nginx_port}/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>`

    // setup_tasks.ps1
    const taskScript = `# EasyReach Task Scheduler Setup
# Institution: ${form.institution_name} (${form.institution_code})
# Run as Administrator

Write-Host "Setting up scheduled tasks..."

# Nginx Auto Start
$action1 = New-ScheduledTaskAction -Execute "D:\\nginx\\start_nginx.bat" -WorkingDirectory "D:\\nginx"
$trigger1 = New-ScheduledTaskTrigger -AtStartup
$principal1 = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$settings1 = New-ScheduledTaskSettingsSet -ExecutionTimeLimit 0 -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 2)
Register-ScheduledTask -TaskName "Nginx-MediaStart" -Action $action1 -Trigger $trigger1 -Principal $principal1 -Settings $settings1 -Force
$task1 = Get-ScheduledTask -TaskName "Nginx-MediaStart"
$task1.Triggers[0].Delay = "PT2M"
Set-ScheduledTask -InputObject $task1

# AWS Sync Every ${form.sync_interval_min} Minutes
$action2 = New-ScheduledTaskAction -Execute "${storagePath}\\sync_aws.bat"
$trigger2 = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes ${form.sync_interval_min}) -Once -At (Get-Date)
$principal2 = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$settings2 = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes ${form.sync_interval_min - 1})
Register-ScheduledTask -TaskName "MediaStorage-AWS-Sync" -Action $action2 -Trigger $trigger2 -Principal $principal2 -Settings $settings2 -Force

# Backup AM 2:00
$action3 = New-ScheduledTaskAction -Execute "D:\\MinIO\\backup.bat"
$trigger3 = New-ScheduledTaskTrigger -Daily -At "2:00AM"
Register-ScheduledTask -TaskName "MediaBackup-AM" -Action $action3 -Trigger $trigger3 -Principal $principal2 -Force

# Backup PM 2:00
$trigger4 = New-ScheduledTaskTrigger -Daily -At "2:00PM"
Register-ScheduledTask -TaskName "MediaBackup-PM" -Action $action3 -Trigger $trigger4 -Principal $principal2 -Force

Write-Host "All tasks created successfully!"`

    // README.txt
    const readme = `EasyReach Setup Guide
Institution: ${form.institution_name} (${form.institution_code})
Type: ${form.institution_type}
Generated: ${new Date().toLocaleDateString()}
ISF Analytica & Informatica Pvt. Ltd.

============================================================
SERVER DETAILS
============================================================
Public IP:      ${form.public_ip || 'YOUR_PUBLIC_IP'}
LAN IP:         ${form.lan_ip || 'YOUR_LAN_IP'}
Storage Domain: ${form.storage_domain || 'YOUR_STORAGE_DOMAIN'}
Storage Path:   ${storagePath}
Nginx Port:     ${form.nginx_port} (internal)
HTTPS Port:     ${form.https_port} (public)
Sync Interval:  Every ${form.sync_interval_min} minutes
ERP Domain:     ${form.erp_domain || 'YOUR_ERP_DOMAIN'}
DB Name:        ${form.db_name || 'YOUR_DB_NAME'}

============================================================
STEP 1 - FOLDER SETUP
============================================================
Run in Admin CMD:
  mkdir ${storagePath}
${folders.map(f => `  mkdir "${storagePath}\\${f}"`).join('\n')}

============================================================
STEP 2 - COPY CONFIG FILES
============================================================
  copy nginx.conf D:\\nginx\\conf\\nginx.conf
  copy sync_aws.bat ${storagePath}\\sync_aws.bat
  copy backup.bat D:\\MinIO\\backup.bat
  copy start_nginx.bat D:\\nginx\\start_nginx.bat

============================================================
STEP 3 - IIS SETUP
============================================================
  Copy web.config to: C:\\inetpub\\nginx-proxy\\web.config
  SSL Thumbprint: ${form.ssl_thumbprint || 'YOUR_SSL_THUMBPRINT'}

============================================================
STEP 4 - TASK SCHEDULER
============================================================
  Run in Admin PowerShell:
  PowerShell -ExecutionPolicy Bypass -File setup_tasks.ps1

============================================================
STEP 5 - FIRST SYNC
============================================================
  Run in Admin CMD:
  ${storagePath}\\sync_aws.bat
  (Wait for "Sync Complete")

============================================================
STEP 6 - START NGINX
============================================================
  D:\\nginx\\nginx.exe -p D:\\nginx -t
  D:\\nginx\\nginx.exe -p D:\\nginx

============================================================
STEP 7 - VERIFY
============================================================
  Test URL: https://${form.storage_domain || 'YOUR_DOMAIN'}:${form.https_port}/[folder]/[file].pdf
  Dashboard: Check institution shows "active" in EasyReach

Support: support@easylearn.org.in
============================================================`

    return { nginxConf, syncBat, backupBat, startNginx, webConfig, taskScript, readme }
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const files = generateFiles()

      // Create ZIP using JSZip
      const JSZip = (await import('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')).default
      const zip = new JSZip()
      zip.file('nginx.conf', files.nginxConf)
      zip.file('sync_aws.bat', files.syncBat)
      zip.file('backup.bat', files.backupBat)
      zip.file('start_nginx.bat', files.startNginx)
      zip.file('web.config', files.webConfig)
      zip.file('setup_tasks.ps1', files.taskScript)
      zip.file('README.txt', files.readme)

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `easyreach_${form.institution_code || 'template'}_config.zip`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch (err) {
      // Fallback: download README only
      const files = generateFiles()
      const blob = new Blob([files.readme], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `easyreach_${form.institution_code || 'template'}_README.txt`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } finally { setLoading(false) }
  }

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
        <div>
          <div className="text-sm font-medium text-[#1E3A5F]">General config template</div>
          <div className="text-xs text-[#7BA7C7]">Generate setup files for any institution</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl mb-6 border border-[#C7E6FF]" style={{background:'linear-gradient(135deg,#EBF4FF,#E8FFF5)'}}>
          <i className="ti ti-info-circle text-[#1D6FAD] text-lg mt-0.5" aria-hidden="true"></i>
          <div>
            <div className="text-sm font-medium text-[#1E3A5F]">Fill details → Download ZIP</div>
            <div className="text-xs text-[#5B7FA6] mt-1">ZIP will contain: nginx.conf, sync_aws.bat, backup.bat, start_nginx.bat, web.config, setup_tasks.ps1, README.txt</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#D4E8FF]" style={{boxShadow:'0 4px 20px rgba(96,165,250,0.08)'}}>
          {/* Institution type */}
          <div className="mb-5">
            <label className={labelCls}>Institution type</label>
            <div className="flex gap-2">
              {typeOptions.map(({ value, label }) => (
                <button key={value} onClick={() => update('institution_type', value)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    form.institution_type === value
                      ? 'bg-[#EBF5FF] text-[#1D6FAD] border-[#60A5FA]'
                      : 'bg-[#F5F9FF] text-[#7BA7C7] border-[#D4E8FF] hover:border-[#A8D5FF]'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Basic info */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-[#1D6FAD]">Basic info</span>
            <div className="flex-1 h-px bg-[#D4E8FF]" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              ['Institution name', 'institution_name', 'MBSE School'],
              ['Short code', 'institution_code', 'mbse'],
              ['ERP domain', 'erp_domain', 'mbse.easylearn.org.in'],
              ['DB name', 'db_name', 'mbsc_easylearn'],
              ['Contact name', 'contact_name', 'IT Admin'],
              ['Contact email', 'contact_email', 'admin@school.edu.in'],
            ].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input value={form[key]} onChange={e => update(key, e.target.value)}
                  placeholder={placeholder} className={inputCls} />
              </div>
            ))}
          </div>

          {/* Section: Server */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-[#1D6FAD]">Server config</span>
            <div className="flex-1 h-px bg-[#D4E8FF]" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
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
              <label className={labelCls}>Sync interval (min)</label>
              <select value={form.sync_interval_min}
                onChange={e => update('sync_interval_min', parseInt(e.target.value))} className={inputCls}>
                <option value={5}>Every 5 min</option>
                <option value={15}>Every 15 min</option>
                <option value={30}>Every 30 min</option>
                <option value={60}>Every hour</option>
              </select>
            </div>
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
          </div>

          {/* Section: AWS Folders */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-[#1D6FAD]">AWS folders to sync</span>
            <div className="flex-1 h-px bg-[#D4E8FF]" />
          </div>
          <div className="mb-5">
            <label className={labelCls}>Folder names (comma separated)</label>
            <input value={form.aws_folders} onChange={e => update('aws_folders', e.target.value)}
              placeholder="easylearn-ncert,NCERT Course video,SAAR" className={inputCls} />
            <p className="text-xs text-[#A0B8D0] mt-1.5">These folders will be synced from easylearn1 S3 bucket</p>
          </div>

          {/* Section: Backup */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-[#1D6FAD]">Backup config</span>
            <div className="flex-1 h-px bg-[#D4E8FF]" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              ['GoDaddy FTP host', 'godaddy_ftp_host', '184.168.118.87'],
              ['GoDaddy FTP user', 'godaddy_ftp_user', 'backup@fortimates.com'],
            ].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input value={form[key]} onChange={e => update(key, e.target.value)}
                  placeholder={placeholder} className={inputCls} />
              </div>
            ))}
          </div>

          {done && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm bg-[#E8FFF5] border border-[#A7F0D4] text-[#1A6B4A]">
              <i className="ti ti-circle-check" aria-hidden="true"></i>
              Config files downloaded! Now follow the setup guide.
            </div>
          )}

          <button onClick={handleDownload} disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-60"
            style={{background:'linear-gradient(135deg,#60A5FA,#34D399)',boxShadow:'0 4px 12px rgba(96,165,250,0.25)'}}>
            {loading ? 'Generating...' : '⬇ Download config ZIP'}
          </button>
        </div>
      </div>
    </div>
  )
}