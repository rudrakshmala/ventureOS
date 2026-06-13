// 📄 src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
// @ts-ignore
import archiver from 'archiver'; // 📦 Ensure you run: npm install archiver @types/archiver
import { runMNCCorporateGrid } from './mastra/services/mncOrchestrator.js';
import { runAutonomousEmpireCycle, runScoutOnly } from './mastra/services/autonomousEmpireOrchestrator.js';
import { prisma } from './db.js'; // 💾 Centralized relational database connection
import { startReplyMonitor } from './outreach/inbox/monitor.js'
import { OutreachPipeline } from './outreach/pipeline.js'
import { memoryBus } from './memory/index.js'

// Initialize configuration layers early
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware Array Matrix
app.use('/api/v1', cors({
  origin: process.env.DASHBOARD_URL || '*',
  methods: ['GET', 'POST']
}));
app.use(cors());
app.use(express.json());

// Add our new additive layers
app.use(express.static(path.join(process.cwd(), 'workspaces/landing')));



const walkDirectoryTree = (dirPath: string, rootDir: string, fileList: any[] = []) => {
  if (!fs.existsSync(dirPath)) return fileList;
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    // Exclude heavy packages or tracking vectors from code views
    if (file === 'node_modules' || file === '.git' || file === 'package-lock.json') return;

    if (fs.statSync(fullPath).isDirectory()) {
      walkDirectoryTree(fullPath, rootDir, fileList);
    } else {
      fileList.push({
        fileName: path.relative(rootDir, fullPath).replace(/\\/g, '/'), // Match browser slash standards
        content: fs.readFileSync(fullPath, 'utf-8')
      });
    }
  });
  return fileList;
};

/**
 * 🖥️ LIVE STREAMING VISUAL TELEMETRY CONSOLE
 */
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>VentureOS Agent Telemetry Grid</title>
      <style>
        body { background: #0f172a; color: #38bdf8; font-family: monospace; padding: 20px; margin: 0; }
        h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-top: 0; display: flex; justify-content: space-between; align-items: center; }
        .nav-btn { background: #334155; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; }
        .nav-btn:hover { background: #475569; }
        .control-panel { background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 15px; margin-bottom: 15px; display: flex; gap: 10px; align-items: center; }
        input { background: #020617; border: 1px solid #475569; color: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 14px; }
        .flex-grow { flex-grow: 1; }
        button { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: monospace; font-weight: bold; }
        button:hover { background: #1d4ed8; }
        #terminal { background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 15px; height: 60vh; overflow-y: auto; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
        .log-line { margin-bottom: 6px; color: #e2e8f0; border-left: 3px solid #38bdf8; padding-left: 10px; }
        .log-init { color: #22c55e; font-weight: bold; margin-bottom: 10px; font-size: 16px; }
        .log-complete { color: #eab308; font-weight: bold; white-space: pre-wrap; margin-top: 15px; border-top: 1px dashed #eab308; padding-top: 10px; }
        .log-crash { color: #ef4444; font-weight: bold; margin-top: 15px; }
      </style>
    </head>
    <body>
      <h2>
        <span>🏢 VentureOS SaaS Client Telemetry Console</span>
        <a class="nav-btn" href="/vault">📦 Open Vault History</a>
      </h2>
      
      <div class="control-panel">
        <input id="projInput" type="text" value="Notification_Engine" placeholder="Project Name" style="width: 180px;">
        <input id="dirInput" type="text" class="flex-grow" value="Build a simple email alert dispatcher using node-mailer." placeholder="Corporate Directive...">
        <button id="dispatchBtn" onclick="triggerAgentStream()">🚀 Dispatch Agents</button>
      </div>

      <div id="terminal">📡 System Standby. Press "Dispatch Agents" to engage multi-agent cluster matrix...</div>

      <script>
        const terminal = document.getElementById('terminal');
        let eventSource = null;

        function triggerAgentStream() {
          if (eventSource) eventSource.close();

          const projectName = document.getElementById('projInput').value;
          const corporateDirective = document.getElementById('dirInput').value;
          const tenantId = "stream_user_" + Math.floor(Math.random() * 1000); 

          terminal.innerHTML = '<div class="log-init">⏳ Contacting system gateway orchestration layers...</div>';

          const url = \`/api/v1/stream-directive?tenantId=\${tenantId}&projectName=\${encodeURIComponent(projectName)}&corporateDirective=\${encodeURIComponent(corporateDirective)}\`;
          eventSource = new EventSource(url);

          eventSource.addEventListener('INITIALIZATION', (e) => {
            const data = JSON.parse(e.data);
            terminal.innerHTML = '<div class="log-init">⚡ ' + data.message + '</div>';
          });

          eventSource.addEventListener('AGENT_LOG', (e) => {
            const data = JSON.parse(e.data);
            const div = document.createElement('div');
            div.className = 'log-line';
            div.textContent = data.log;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight; 
          });

          eventSource.addEventListener('COMPLETE', (e) => {
            const div = document.createElement('div');
            div.className = 'log-complete';
            div.textContent = '\\n🎉 COMPILATION SUCCESSFUL!\\nStatus: SUCCESS\\nWorkspace saved inside relational persistence.';
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
            eventSource.close();
          });

          eventSource.addEventListener('CRASH', (e) => {
            const data = JSON.parse(e.data);
            const div = document.createElement('div');
            div.className = 'log-crash';
            div.textContent = '\\n❌ ERROR: ' + data.message;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
            eventSource.close();
          });
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * 📦 SINGLE PROJECT LIVE SYNC ENDPOINT
 * Serves active pooling updates directly to active drawer widgets
 */
app.get('/api/v1/project/:id', async (req, res) => {
  try {
    const data = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { audits: true }
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query individual record state.' });
  }
});

/**
 * 📦 VAULT HISTORY RECORDS DATABASE QUERY
 */
app.get('/api/v1/vault', async (req, res) => {
  try {
    const historicalRecords = await prisma.project.findMany({
      include: { audits: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(historicalRecords);
  } catch (error: any) {
    return res.status(500).json({ error: 'Database Lookup Failure' });
  }
});

/**
 * 📁 WORKSPACE FILESYSTEM EXPLORER
 */
app.get('/api/v1/workspace-files', async (req, res) => {
  const { workspacePath } = req.query as { workspacePath: string };
  if (!workspacePath) return res.status(400).json({ error: 'Missing workspacePath variable.' });

  const targetDir = path.resolve(process.cwd(), workspacePath);
  if (!fs.existsSync(targetDir)) {
    return res.status(200).json({ files: [], warning: 'Directory structure not instantiated.' });
  }

  try {
    const dynamicFiles = walkDirectoryTree(targetDir, targetDir);
    return res.status(200).json({ files: dynamicFiles });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to crawl nested directories safely.' });
  }
});

/**
 * 🚀 SEPARATE APPLICATION TEST RUNTIME SHELL
 * Spawns an isolated thread for the app, leaving the core engine fully responsive
 */

import { spawn } from 'child_process';

// A simple global store to track active workspace execution terminals
const activeTerminals = new Map<string, any>();

app.post('/api/v1/test-workspace', async (req, res) => {
  const { workspacePath, entryFile } = req.body;
  if (!workspacePath) {
    return res.status(400).json({ error: 'Missing baseline runtime setup configuration.' });
  }

  try {
    const rootWorkspace = path.resolve(process.cwd(), workspacePath);
    let cleanedEntryFile = entryFile || 'index.js';
    
    if (cleanedEntryFile.startsWith('src/')) {
      cleanedEntryFile = cleanedEntryFile.replace(/^src\//, '');
    }

    let targetScript = path.join(rootWorkspace, cleanedEntryFile);
    if (!fs.existsSync(targetScript)) {
      targetScript = path.join(rootWorkspace, 'src', cleanedEntryFile);
    }

    const runtimeWorkingDirectory = fs.existsSync(path.join(rootWorkspace, cleanedEntryFile)) 
      ? rootWorkspace 
      : path.join(rootWorkspace, 'src');

    const runtimeTargetFilename = path.basename(targetScript);

    // 🧹 Kill any previous running instance of this workspace so ports don't clash
    if (activeTerminals.has(workspacePath)) {
      console.log(`Killing previous shell process for ${workspacePath}`);
      activeTerminals.get(workspacePath).kill();
    }

    console.log(`📠 [Terminal Subsystem] Spawning isolated process: node ${runtimeTargetFilename}`);

    // 🚀 SPAWN an independent process instead of exec
    const childShell = spawn('node', [runtimeTargetFilename], {
      cwd: runtimeWorkingDirectory,
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Save process reference to global tracker
    activeTerminals.set(workspacePath, childShell);

    let terminalOutputBuffer = '';

    // Capture streaming standard output
    childShell.stdout.on('data', (data) => {
      const chunk = data.toString();
      terminalOutputBuffer += chunk;
      // 💡 TIP: If using Socket.io or WebSockets, emit chunk directly to UI here:
      // io.to(workspacePath).emit('terminal:data', chunk);
    });

    // Capture streaming runtime / syntax errors instantly
    childShell.stderr.on('data', (data) => {
      const chunk = data.toString();
      terminalOutputBuffer += chunk;
      // io.to(workspacePath).emit('terminal:data', chunk);
    });

    // Handle process exits safely without taking down Express
    childShell.on('close', async (code) => {
      console.log(`⏹️ Shell process exited with status code ${code}`);
      activeTerminals.delete(workspacePath);
      
      try {
        await prisma.project.updateMany({
          where: { workspacePath },
          data: { status: code === 0 ? 'SUCCESS' : 'FAILED' }
        });
      } catch (dbErr) {
        // Safe logging
      }
    });

    // Immediately respond to the UI that the terminal shell has booted up successfully
    return res.status(200).json({
      success: true,
      message: 'Terminal execution environment spawned successfully.',
      initialLogs: '⚡ Booting terminal subsystem wrapper...\n'
    });

  } catch (criticalErr) {
    console.error('🔴 Terminal Subsystem critical crash:', criticalErr);
    return res.status(500).json({ error: 'Failed to provision dedicated process thread.' });
  }
});
/**
 * 📥 WORKSPACE EXPORTER COMPRESSION TUNNEL
 * Bundles the deep tree directories into high-compression downloadable files
 */
app.get('/api/v1/download-workspace', async (req, res) => {
  const { workspacePath, projectName } = req.query as { workspacePath: string; projectName: string };
  if (!workspacePath) return res.status(400).json({ error: 'Missing workspace target reference.' });

  const rootWorkspace = path.resolve(process.cwd(), workspacePath);
  if (!fs.existsSync(rootWorkspace)) {
    return res.status(404).json({ error: 'Target workspace directory array does not exist.' });
  }

  const archiveFileName = (projectName || 'workspace').toLowerCase().replace(/\s+/g, '_');
  res.attachment(`${archiveFileName}.zip`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(rootWorkspace, false);
  archive.finalize();
});

/**
 * 🗑️ VAULT RETENTION MANAGEMENT PURGE HOOK
 */
app.post('/api/v1/clear-vault', async (req, res) => {
  try {
    await prisma.project.deleteMany({});
    return res.status(200).json({ success: true, message: 'Vault registries completely reset.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to initialize system logging drop tables.' });
  }
});

/**
 * 🎨 THE WORKSPACE VAULT WORKBENCH PLATFORM VIEW
 */
app.get('/vault', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>VentureOS Historical Execution Vault</title>
      <style>
        body { background: #0f172a; color: #cbd5e1; font-family: monospace; padding: 20px; margin: 0; overflow-x: hidden; }
        h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-top: 0; display: flex; justify-content: space-between; align-items: center; }
        .nav-btn { background: #334155; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; }
        .nav-btn:hover { background: #475569; }
        .danger-btn { background: #7f1d1d; color: #f87171; border: 1px solid #b91c1c; padding: 6px 12px; border-radius: 4px; font-family: monospace; cursor: pointer; font-size: 13px; margin-left: 10px; }
        .danger-btn:hover { background: #991b1b; }
        .vault-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #020617; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; }
        .vault-table th, .vault-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #1e293b; }
        .vault-table th { background: #1e293b; color: #38bdf8; font-size: 14px; }
        .status-badge { padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .status-success { background: #14532d; color: #4ade80; }
        .status-pending { background: #713f12; color: #facc15; animation: pulse 1.5s infinite ease-in-out; }
        .status-failed { background: #7f1d1d; color: #f87171; }
        .view-btn { background: #2563eb; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-family: monospace; }
        .view-btn:hover { background: #1d4ed8; }
        
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* Side Window Component */
        #drawer { display: none; position: fixed; top: 0; right: 0; width: 720px; height: 100%; background: #0f172a; border-left: 2px solid #334155; box-shadow: -10px 0 20px rgba(0,0,0,0.5); padding: 20px; box-sizing: border-box; overflow-y: auto; z-index: 999; }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px; }
        .close-btn { background: #ef4444; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .download-btn { background: #10b981; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 5px; }
        .download-btn:hover { background: #059669; }

        /* Integrated Tabs Styles */
        .tabs-row { display: flex; gap: 4px; border-bottom: 1px solid #334155; margin-top: 15px; padding-bottom: 1px; }
        .tab-btn { background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-bottom: none; padding: 8px 16px; cursor: pointer; border-radius: 4px 4px 0 0; font-family: monospace; font-size: 12px; }
        .tab-btn.active { background: #0f172a; color: #38bdf8; border-bottom: 2px solid #0f172a; font-weight: bold; position: relative; z-index: 2; height: 34px; margin-bottom: -1px; }
        .tab-content { display: none; padding-top: 15px; }
        .tab-content.active { display: block; }

        /* Rendering Blocks */
        .audit-block { background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
        .audit-dept { color: #facc15; font-weight: bold; margin-bottom: 4px; }
        .audit-text { font-size: 12px; color: #94a3b8; white-space: pre-wrap; }
        .code-container { background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
        .code-filename { color: #4ade80; font-weight: bold; font-size: 13px; margin-bottom: 6px; border-bottom: 1px dashed #334155; padding-bottom: 4px; }
        .code-view { font-size: 12px; color: #e2e8f0; background: #090d16; padding: 8px; border-radius: 4px; overflow-x: auto; max-height: 400px; white-space: pre; }
        .compiler-box { background: #020617; border: 1px solid #eab308; border-radius: 6px; padding: 15px; }
        .compile-btn { background: #eab308; color: #020617; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-family: monospace; }
        .terminal-output { background: #000; color: #22c55e; font-size: 12px; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; height: 250px; overflow-y: auto; white-space: pre-wrap; border-left: 3px solid #22c55e; }
        .terminal-error { color: #ef4444; border-left-color: #ef4444; }
      </style>
    </head>
    <body>
      <h2>
        <span>📦 VentureOS Historical Workspace Vault</span>
        <div>
          <a class="nav-btn" href="/dashboard">◀ Back To Console</a>
          <button class="danger-btn" onclick="clearVaultHistory()">🗑️ Wipe Archive Logs</button>
        </div>
      </h2>

      <table class="vault-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Project Name</th>
            <th>Tenant ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="vaultBody">
          <tr><td colspan="5" style="text-align:center; color:#64748b;">📡 Fetching historic agent records from database grid...</td></tr>
        </tbody>
      </table>

      <div id="drawer">
        <div class="drawer-header">
          <div>
            <h3 id="drawerProjTitle" style="margin:0; color:#38bdf8;">Project Details</h3>
            <a id="downloadZipLink" class="download-btn" href="#">📥 Download Code Bundle (.ZIP)</a>
          </div>
          <button class="close-btn" onclick="closeDrawer()">✕ Close</button>
        </div>
        <div id="drawerDirective" style="font-size:13px; color:#e2e8f0; margin-bottom:10px; font-style:italic;"></div>
        <div id="drawerHealingCounter" style="font-size:12px; color:#eab308; font-weight:bold; margin-bottom:15px;"></div>

        <div class="tabs-row">
          <button class="tab-btn active" onclick="switchTab('filesTab')">📁 Code Workspace Explorer</button>
          <button class="tab-btn" onclick="switchTab('compilerTab')">🚀 Testing Execution Canvas</button>
          <button class="tab-btn" onclick="switchTab('auditsTab')">🏢 Agent Security Audits</button>
        </div>

        <div id="filesTab" class="tab-content active">
          <div id="drawerFiles"><p style="color:#64748b; font-size:12px;">Scanning disk arrays...</p></div>
        </div>

        <div id="compilerTab" class="tab-content">
          <div class="compiler-box">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; color:#94a3b8;">Entry Target File:</span>
              <input id="entryFileInput" type="text" value="index.js" style="background:#090d16; color:#fff; border:1px solid #334155; padding:4px 8px; border-radius:4px; font-size:12px; width:140px; font-family:monospace;">
              <button class="compile-btn" onclick="runWorkspaceVerification()">Trigger Runtime Execution</button>
            </div>
            <div id="testOutputConsole" class="terminal-output">📡 Terminal payload state ready. Click execution trigger to check validity...</div>
          </div>
        </div>

        <div id="auditsTab" class="tab-content">
          <div id="drawerContent"></div>
        </div>
      </div>

      <script>
        let localData = [];
        let pollingInterval = null;
        let currentActiveProjectId = null;

        async function fetchVault() {
          try {
            const res = await fetch('/api/v1/vault');
            const data = await res.json();
            localData = data;
            
            const tbody = document.getElementById('vaultBody');
            if (data.length === 0) {
              tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748b;">No projects found in the database vault yet.</td></tr>';
              return;
            }

            tbody.innerHTML = '';
            data.forEach((proj) => {
              const row = document.createElement('tr');
              const date = new Date(proj.createdAt).toLocaleString();
              const statusClass = proj.status === 'SUCCESS' ? 'status-success' : (proj.status === 'PENDING' ? 'status-pending' : 'status-failed');
              
              row.innerHTML = \`
                <td>\${date}</td>
                <td style="color:#f8fafc; font-weight:bold;">\${proj.projectName}</td>
                <td>\${proj.tenantId}</td>
                <td><span class="status-badge \${statusClass}" id="badge-\${proj.id}">\${proj.status}</span></td>
                <td><button class="view-btn" onclick="openDrawer('\${proj.id}')">🔍 Inspect</button></td>
              \`;
              tbody.appendChild(row);
            });
          } catch (err) { console.error('Lookup failure:', err); }
        }

        function switchTab(tabId) {
          document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

          document.getElementById(tabId).classList.add('active');
          event.currentTarget.classList.add('active');
        }

        function startLiveUpdatePoller(projectId) {
          if (pollingInterval) clearInterval(pollingInterval);
          
          pollingInterval = setInterval(async () => {
            try {
              const res = await fetch('/api/v1/project/' + projectId);
              const project = await res.json();
              
              const badge = document.getElementById('badge-' + projectId);
              if (badge) {
                badge.textContent = project.status;
                badge.className = 'status-badge ' + (project.status === 'SUCCESS' ? 'status-success' : (project.status === 'PENDING' ? 'status-pending' : 'status-failed'));
              }

              if (document.getElementById('drawer').style.display === 'block' && currentActiveProjectId === projectId) {
                document.getElementById('drawerHealingCounter').textContent = '🔄 Self-Correction Healing Attempts: ' + project.healingAttempts;
                renderAuditBlocks(project.audits);
                loadFilesystemTree(project.workspacePath);
                
                if (project.status !== 'PENDING') {
                  clearInterval(pollingInterval);
                }
              }
            } catch (err) { console.error('Poller connection block:', err); }
          }, 3000);
        }

        function renderAuditBlocks(audits) {
          const content = document.getElementById('drawerContent');
          if (!audits || audits.length === 0) {
            content.innerHTML = '<p style="color:#64748b; font-size:13px;">No department audits recorded for this workspace run.</p>';
            return;
          }
          content.innerHTML = '';
          audits.forEach(audit => {
            const div = document.createElement('div');
            div.className = 'audit-block';
            div.innerHTML = \`
              <div class="audit-dept">🏢 Department: \${audit.department}</div>
              <div style="font-size:12px; margin-bottom:6px; color:#4ade80;">Status: \${audit.statusMessage}</div>
              <div class="audit-text">\${audit.metricsText}</div>
            \`;
            content.appendChild(div);
          });
        }

        async function loadFilesystemTree(workspacePath) {
          const fileExplorerView = document.getElementById('drawerFiles');
          try {
            const fileRes = await fetch(\`/api/v1/workspace-files?workspacePath=\${encodeURIComponent(workspacePath)}\`);
            const fileData = await fileRes.json();

            if (!fileData.files || fileData.files.length === 0) {
              fileExplorerView.innerHTML = '<p style="color:#eab308; font-size:12px;">⚠️ No source code assets generated inside this path configuration yet.</p>';
              return;
            }
            fileExplorerView.innerHTML = '';
            fileData.files.forEach(file => {
              const container = document.createElement('div');
              container.className = 'code-container';
              const escapedContent = file.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

              container.innerHTML = \`
                <div class="code-filename">📄 \${file.fileName}</div>
                <pre class="code-view">\${escapedContent}</pre>
              \`;
              fileExplorerView.appendChild(container);
            });
          } catch (err) { fileExplorerView.innerHTML = '<p style="color:#ef4444; font-size:12px;">❌ System failed to resolve workspace mapping layouts.</p>'; }
        }

        async function runWorkspaceVerification() {
          const proj = localData.find(p => p.id === currentActiveProjectId);
          const entryFile = document.getElementById('entryFileInput').value;
          const consoleUI = document.getElementById('testOutputConsole');

          consoleUI.textContent = "⏳ Spawning active script isolation matrix layers...";
          consoleUI.classList.remove('terminal-error');

          try {
            const res = await fetch('/api/v1/test-workspace', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workspacePath: proj.workspacePath, entryFile })
            });
            const runLogs = await res.json();
            
            if (!runLogs.success) {
              consoleUI.classList.add('terminal-error');
              consoleUI.textContent = "❌ COMPILER BREAKDOWN TERMINAL THROW:\\n\\n" + runLogs.stderr;
            } else {
              consoleUI.textContent = runLogs.stdout;
            }
          } catch (err) { consoleUI.textContent = "❌ Failed to connect to core runner compilation loops."; }
        }

        async function clearVaultHistory() {
          if (!confirm("Are you sure you want to permanently clear all logs? This wipes the relational tables.")) return;
          try {
            await fetch('/api/v1/clear-vault', { method: 'POST' });
            fetchVault();
          } catch (err) { alert('Clear command fail.'); }
        }

        async function openDrawer(projectId) {
          currentActiveProjectId = projectId;
          const proj = localData.find(p => p.id === projectId);
          
          document.getElementById('drawerProjTitle').textContent = proj.projectName;
          document.getElementById('drawerDirective').textContent = 'Directive: "' + proj.corporateDirective + '"';
          document.getElementById('drawerHealingCounter').textContent = '🔄 Self-Correction Healing Attempts: ' + (proj.healingAttempts || 0);
          document.getElementById('testOutputConsole').textContent = "📡 Terminal payload state ready. Click execution trigger to check validity...";

          document.getElementById('downloadZipLink').href = \`/api/v1/download-workspace?workspacePath=\${encodeURIComponent(proj.workspacePath)}&projectName=\${encodeURIComponent(proj.projectName)}\`;

          switchTab('filesTab');
          renderAuditBlocks(proj.audits);
          await loadFilesystemTree(proj.workspacePath);

          document.getElementById('drawer').style.display = 'block';
          
          if (proj.status === 'PENDING') {
            startLiveUpdatePoller(projectId);
          }
        }

        function closeDrawer() {
          document.getElementById('drawer').style.display = 'none';
          if (pollingInterval) clearInterval(pollingInterval);
          fetchVault();
        }

        fetchVault();
      </script>
    </body>
    </html>
  `);
});

/**
 * 📻 REAL-TIME SSE GATEWAY GRID + AUTONOMOUS HEALING CORE INTERACTION CIRCUIT
 */
app.get('/api/v1/stream-directive', async (req, res) => {
  const { tenantId, projectName, corporateDirective } = req.query as any;

  if (!tenantId || !projectName || !corporateDirective) {
    res.status(400).write(JSON.stringify({ message: 'Missing core identity tracking parameters.' }));
    return res.end();
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform', 
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',                  
    'Access-Control-Allow-Origin': '*',
  });

  let isClientDisconnected = false;
  req.on('close', () => {
    isClientDisconnected = true;
    res.end();
  });

  const sendPacket = (eventStage: string, payload: any) => {
    if (isClientDisconnected || res.writableEnded) return;
    res.write(`event: ${eventStage}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendPacket('INITIALIZATION', { message: 'Secure Handshake Established. Initializing Core Pipelines.' });

  await prisma.tenant.upsert({ where: { id: tenantId }, update: {}, create: { id: tenantId } });

  const projectWorkspacePath = `workspaces/${tenantId}_${projectName.toLowerCase().replace(/\s+/g, '_')}`;
  const projectRecord = await prisma.project.create({
    data: { tenantId, projectName, corporateDirective, workspacePath: projectWorkspacePath, status: 'PENDING' }
  });

  let executionSuccess = false;
  let selfHealingLoopsCount = 0;
  const MAX_HEALING_LIMIT = 3;
  let dynamicDirectiveModifier = corporateDirective;

  try {
    while (!executionSuccess && selfHealingLoopsCount <= MAX_HEALING_LIMIT) {
      if (selfHealingLoopsCount > 0) {
        sendPacket('AGENT_LOG', { log: `\n✨ [Self-Healing Feedback Cycle #${selfHealingLoopsCount}] Injecting crash trace outputs to coder agent clusters...` });
      }

      if (isClientDisconnected) break;

      const result = await runMNCCorporateGrid({
        tenantId,
        projectName,
        corporateDirective: dynamicDirectiveModifier,
        onLogBroadcast: (liveAgentLog: string) => {
          sendPacket('AGENT_LOG', { log: liveAgentLog });
        }
      });

      if (selfHealingLoopsCount > 0) {
        await prisma.audit.deleteMany({ where: { projectId: projectRecord.id } });
      }

      for (const item of result.executionAudit as any[]) {
        await prisma.audit.create({
          data: {
            projectId: projectRecord.id,
            department: item.department,
            statusMessage: item.status,
            savedFiles: JSON.stringify(item.files || [item.file]),
            metricsText: item.securityMetrics || 'Product Requirements Document Compiled Asset Successfully.'
          }
        });
      }

      const rootDir = path.resolve(process.cwd(), projectWorkspacePath);
      const targetScript = path.join(rootDir, 'index.js');

      if (!fs.existsSync(targetScript)) {
        executionSuccess = true; 
        break;
      }

      const runValidationCheck = (): Promise<{ success: boolean; errorMsg: string }> => {
        return new Promise((resolve) => {
          exec('node index.js', { cwd: rootDir, timeout: 5000 }, (error, stdout, stderr) => {
            if (error || stderr) {
              resolve({ success: false, errorMsg: stderr || error?.message || 'Process compilation breakdown error' });
            } else {
              resolve({ success: true, errorMsg: '' });
            }
          });
        });
      };

      const testResult = await runValidationCheck();

      if (testResult.success) {
        sendPacket('AGENT_LOG', { log: `\n✅ [Validation Verification Clean] Entry point file scripts executed smoothly.` });
        executionSuccess = true;
      } else {
        selfHealingLoopsCount++;
        if (selfHealingLoopsCount > MAX_HEALING_LIMIT) {
          throw new Error(`Self-Correction limit broken. Continuous script exceptions reported: ${testResult.errorMsg}`);
        }

        sendPacket('AGENT_LOG', { log: `\n⚠️ [Runtime Exception Caught] Redirecting stack log down context layers:\n${testResult.errorMsg}` });
        
        dynamicDirectiveModifier = `
          YOUR PREVIOUS IMPLEMENTATION CRASHED THE SYSTEM COMPILER.
          CRITICAL TRACE LOG REPORTED BY UNIFIED ERROR CATCH:
          "${testResult.errorMsg}"

          Refactor code loops carefully. Ensure everything resolves successfully while satisfying the user request parameters: "${corporateDirective}"
        `;

        await prisma.project.update({
          where: { id: projectRecord.id },
          data: { healingAttempts: selfHealingLoopsCount }
        });
      }
    }

    await prisma.project.update({ where: { id: projectRecord.id }, data: { status: 'SUCCESS' } });
    sendPacket('COMPLETE', { status: 'SUCCESS' });
    return res.end();

  } catch (error: any) {
    console.error(`🔴 [Stream Gateway Exception Handled]:`, error);
    await prisma.project.update({ where: { id: projectRecord.id }, data: { status: 'FAILED' } });
    sendPacket('CRASH', { message: error?.message || 'Pipeline Infrastructure Interrupted.' });
    return res.end();
  }
});

/**
 * 👑 THE EMPIRE COMMAND CENTER (DASHBOARD)
 */
app.get('/empire', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>VentureOS 76-Agent Empire</title>
      <style>
        body { background: #050505; color: #f1f5f9; font-family: monospace; padding: 20px; margin: 0; }
        h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-top: 0; display: flex; justify-content: space-between; align-items: center; }
        .nav-btn { background: #334155; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; }
        .nav-btn:hover { background: #475569; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 15px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #38bdf8; margin-top: 10px; }
        .stat-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
        .control-panel { background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 15px; margin-bottom: 15px; display: flex; gap: 10px; align-items: center; justify-content: space-between; }
        button { background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-family: monospace; font-weight: bold; font-size: 14px; }
        button:hover { background: #1d4ed8; }
        button.scout-btn { background: #10b981; }
        button.scout-btn:hover { background: #059669; }
        #terminal { background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 15px; height: 50vh; overflow-y: auto; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <h2>
        <span>👑 VentureOS Autonomous Empire Command Center</span>
        <div>
          <a class="nav-btn" href="/dashboard">◀ Back To Dev Console</a>
        </div>
      </h2>
      
      <div class="stats-grid" id="statsGrid">
        <div class="stat-card"><div class="stat-label">Total Leads Found</div><div class="stat-value" id="statLeads">0</div></div>
        <div class="stat-card"><div class="stat-label">Pitches Sent</div><div class="stat-value" id="statPitches">0</div></div>
        <div class="stat-card"><div class="stat-label">Deals Won</div><div class="stat-value" id="statDeals">0</div></div>
        <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value" id="statRevenue">$0.00</div></div>
      </div>

      <div class="control-panel">
        <div>
          <button class="scout-btn" onclick="triggerScoutSweep()">🔍 Run Intelligence Sweep</button>
          <button onclick="triggerEmpireCycle()">👑 Launch Full Empire Cycle (All 76 Agents)</button>
        </div>
        <div style="font-size:12px; color:#94a3b8;">Status: <span id="sysStatus" style="color:#22c55e;">Online</span></div>
      </div>

      <div id="terminal">📡 Empire Command Center Standby.</div>

      <script>
        const terminal = document.getElementById('terminal');
        
        async function fetchStats() {
          try {
            const res = await fetch('/api/v1/empire/stats');
            const data = await res.json();
            document.getElementById('statLeads').innerText = data.totalLeads;
            document.getElementById('statPitches').innerText = data.pitchesSent;
            document.getElementById('statDeals').innerText = data.dealsWon;
            document.getElementById('statRevenue').innerText = '$' + data.totalRevenue.toFixed(2);
          } catch (e) {
            console.error('Failed to load stats');
          }
        }
        
        function appendLog(logText) {
          const div = document.createElement('div');
          div.textContent = logText;
          terminal.appendChild(div);
          terminal.scrollTop = terminal.scrollHeight;
        }

        let eventSource = null;

        function startStream(url) {
          if (eventSource) eventSource.close();
          terminal.innerHTML = '<div style="color:#eab308; margin-bottom: 10px;">⚡ Connecting to Empire Grid...</div>';
          document.getElementById('sysStatus').innerText = 'Running Cycle...';
          document.getElementById('sysStatus').style.color = '#eab308';
          
          eventSource = new EventSource(url);
          
          eventSource.addEventListener('EMPIRE_LOG', (e) => {
            const data = JSON.parse(e.data);
            appendLog(data.log);
          });
          
          eventSource.addEventListener('COMPLETE', (e) => {
            appendLog('\n✅ CYCLE COMPLETE. Refreshing stats...');
            fetchStats();
            document.getElementById('sysStatus').innerText = 'Standby';
            document.getElementById('sysStatus').style.color = '#22c55e';
            eventSource.close();
          });
          
          eventSource.addEventListener('CRASH', (e) => {
            const data = JSON.parse(e.data);
            appendLog('\n❌ EMPIRE FAULT: ' + data.message);
            document.getElementById('sysStatus').innerText = 'Faulted';
            document.getElementById('sysStatus').style.color = '#ef4444';
            eventSource.close();
          });
        }

        function triggerScoutSweep() {
          startStream('/api/v1/empire/run-scout');
        }

        function triggerEmpireCycle() {
          if (!confirm("Launch all 4 corporate divisions? This will consume AI tokens and send emails (if in LIVE mode).")) return;
          startStream('/api/v1/empire/run-cycle');
        }

        // Init
        fetchStats();
      </script>
    </body>
    </html>
  `);
});

/**
 * 📊 EMPIRE STATS ENDPOINT
 */
app.get('/api/v1/empire/stats', async (req, res) => {
  try {
    const totalLeads = await prisma.lead.count();
    const pitchesSent = await prisma.outreachCampaign.count({ where: { status: 'SENT' } });
    const dealsWon = await prisma.deal.count({ where: { status: 'WON' } });
    const invoices = await prisma.invoice.findMany({ where: { status: 'PAID' } });
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    res.json({ totalLeads, pitchesSent, dealsWon, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * 🔍 RUN SCOUT SWEEP (SSE)
 */
app.get('/api/v1/empire/run-scout', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendLog = (log: string) => {
    res.write(`event: EMPIRE_LOG\n`);
    res.write(`data: ${JSON.stringify({ log })}\n\n`);
  };

  try {
    await runScoutOnly(sendLog);
    res.write(`event: COMPLETE\n`);
    res.write(`data: {}\n\n`);
    res.end();
  } catch (error: any) {
    res.write(`event: CRASH\n`);
    res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
});

/**
 * 👑 RUN FULL EMPIRE CYCLE (SSE)
 */
app.get('/api/v1/empire/run-cycle', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendLog = (log: string) => {
    res.write(`event: EMPIRE_LOG\n`);
    res.write(`data: ${JSON.stringify({ log })}\n\n`);
  };

  try {
    await runAutonomousEmpireCycle({ onEvent: sendLog });
    res.write(`event: COMPLETE\n`);
    res.write(`data: {}\n\n`);
    res.end();
  } catch (error: any) {
    res.write(`event: CRASH\n`);
    res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
});

// ═══════════════════════════════════════
// PAYMENT ROUTES — append to server.ts
// ═══════════════════════════════════════

// PAYMENT: Client intake form — this is how projects start
app.post('/api/v1/intake', async (req, res) => {
  try {
    const { email, name, company, brief, budget } = req.body
    if (!email || !brief) return res.status(400).json({ error: 'email and brief are required' })

    const project = await prisma.salesProject.create({
      data: { clientEmail: email, clientName: name ?? null, brief, status: 'intake' }
    })

    // Best-effort memory write — don't fail the response if this errors
    try {
      const { memoryBus } = await import('./memory/index.js')
      await memoryBus.setProjectContext(project.id, { email, name, company, brief, budget, status: 'intake' })
    } catch (memErr) {
      console.warn('[MemoryBus] setProjectContext failed (non-fatal):', memErr)
    }

    res.json({ projectId: project.id, message: 'Brief received - we will be in touch within 2 hours' })
  } catch (err: any) {
    console.error('[intake] Error:', err)
    res.status(500).json({ error: 'Internal server error. Please try again.' })
  }
})


// PAYMENT: Generate payment link for a project
app.post('/api/v1/payments/create', async (req, res) => {
  const { projectId, amount } = req.body
  const project = await prisma.salesProject.findUnique({ where: { id: projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })

  const { createPaymentLink } = await import('./payments/razorpay.js')
  const result = await createPaymentLink(
    Math.floor(amount / 2),  // 50% upfront
    projectId,
    project.clientEmail,
    project.brief.substring(0, 100)
  )

  if (!result) return res.status(500).json({ error: 'Payment link creation failed' })

  await prisma.payment.create({
    data: {
      projectId,
      razorpayOrderId: result.orderId,
      amount: Math.floor(amount / 2) * 100,
      status: 'pending',
      type: '50_upfront'
    }
  })

  res.json({ paymentUrl: result.paymentUrl, orderId: result.orderId })
})

// PAYMENT: Razorpay webhook — fires when payment succeeds
app.post('/api/v1/payments/webhook', async (req, res) => {
  const { verifyWebhookSignature } = await import('./payments/razorpay.js')
  const signature = req.headers['x-razorpay-signature'] as string
  
  if (!verifyWebhookSignature(JSON.stringify(req.body), signature)) {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const { event, payload } = req.body
  
  if (event === 'payment_link.paid') {
    const orderId = payload.payment_link?.entity?.id
    const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: orderId } })
    
    if (payment) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'paid' } })
      await prisma.salesProject.update({ where: { id: payment.projectId }, data: { status: 'scoping', paidAmount: payment.amount } })
      
      // Trigger the 76-agent delivery machine
      const { memoryBus } = await import('./memory/index.js')
      await memoryBus.write('payment', `paid:${payment.projectId}`, { paid: true, amount: payment.amount }, 'global')
      console.log(`[Payment] 💰 Payment received for project ${payment.projectId}`)
    }
  }
  
  res.json({ received: true })
})

// Unsubscribe endpoint — required for CAN-SPAM compliance
app.get('/api/v1/unsubscribe', async (req, res) => {
  const { email } = req.query
  if (email) {
    await prisma.salesLead.updateMany({
      where: { email: email as string },
      data: { status: 'closed_lost' }
    })
  }
  res.send('<html><body><h2>You have been unsubscribed.</h2></body></html>')
})

// Memory bus API — consumed by dashboard
app.get('/api/v1/memory/:scope', async (req, res) => {
  const { memoryBus } = await import('./memory/index.js')
  const scope = req.params.scope as any
  const data = await memoryBus.readScope(scope)
  res.json(data)
})

// Projects list API — consumed by dashboard
app.get('/api/v1/projects', async (req, res) => {
  try {
    const projects = await prisma.salesProject.findMany({
      select: {
        id: true,
        clientEmail: true,
        clientName: true,
        brief: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    res.json(projects);
  } catch (err: any) {
    console.error('[projects] Error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
})

// Outreach stats — consumed by dashboard
app.get('/api/v1/outreach/stats', async (req, res) => {
  const stats = await prisma.salesLead.groupBy({
    by: ['status'],
    _count: { status: true }
  })
  const formatted = Object.fromEntries(stats.map(s => [s.status, s._count.status]))
  res.json(formatted)
})

// Start outreach pipeline manually (for testing)
app.post('/api/v1/outreach/start', async (req, res) => {
  const { OutreachPipeline } = await import('./outreach/pipeline.js')
  const pipeline = new OutreachPipeline(prisma)
  pipeline.runDailyCycle()
  res.json({ message: 'Pipeline started' })
})

// SSE stream for real-time dashboard updates
app.get('/api/v1/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`)
  
  send({ type: 'connected', timestamp: new Date().toISOString() })

  const interval = setInterval(async () => {
    const stats = await prisma.salesLead.groupBy({ by: ['status'], _count: { status: true } })
    const formatted = Object.fromEntries(stats.map(s => [s.status, s._count.status]))
    send({ type: 'stats_update', data: formatted, timestamp: new Date().toISOString() })
  }, 10000)

  req.on('close', () => clearInterval(interval))
})

// Wake up the VentureOS Engine Grid
app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`🏢 [VentureOS SaaS Core] Active and compiling on port ${PORT} at 0.0.0.0`);
  console.log(`🖥️ Visual Dashboard UI: http://localhost:${PORT}/dashboard`);
  console.log(`📦 Historical Workspace Vault: http://localhost:${PORT}/vault`);
  console.log(`👑 Autonomous Empire Center: http://localhost:${PORT}/empire`);

  // 🧹 DATABASE SANITIZATION ENGINE
  try {
    await prisma.project.updateMany({ where: { status: 'PENDING' }, data: { status: 'FAILED' } });
  } catch (err) {}

  // Start reply monitoring
  startReplyMonitor(prisma as any)

  // Start outreach pipeline scheduler
  const pipeline = new OutreachPipeline(prisma as any)
  pipeline.startScheduler()

  console.log(`
╔═══════════════════════════════════════════════╗
║           VentureOS is running                ║
║   Express:   http://localhost:${PORT}           ║
║   Dashboard: http://localhost:3001             ║
║   Landing:   http://localhost:${PORT}           ║
╚═══════════════════════════════════════════════╝
  `)
});
