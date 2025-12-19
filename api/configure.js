module.exports = (req, res) => {
    const host = req.headers.host;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>RD Downloader - Stremio Addon</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 550px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #78ffd6;
            font-size: 1.8em;
            margin-bottom: 5px;
        }
        .subtitle {
            text-align: center;
            color: #aaa;
            margin-bottom: 25px;
        }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 25px;
            margin: 20px 0;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #78ffd6;
            font-weight: 500;
        }
        input[type="text"] {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            background: rgba(255,255,255,0.9);
            color: #333;
        }
        input[type="text"]:focus {
            outline: 2px solid #78ffd6;
        }
        .btn {
            display: block;
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 30px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s, opacity 0.2s;
            text-align: center;
            text-decoration: none;
        }
        .btn:hover { transform: scale(1.02); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-primary {
            background: linear-gradient(135deg, #78ffd6 0%, #a8edea 100%);
            color: #1a1a2e;
        }
        .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        .btn-stremio {
            background: linear-gradient(135deg, #7b5bf5 0%, #9d7aff 100%);
            color: white;
        }
        .help {
            color: #999;
            font-size: 0.85em;
            margin-top: 10px;
        }
        .help a { color: #78ffd6; }
        .install-section {
            display: none;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .install-section.show { display: block; }
        .url-box {
            background: rgba(0,0,0,0.3);
            padding: 12px;
            border-radius: 8px;
            word-break: break-all;
            font-family: monospace;
            font-size: 0.85em;
            margin: 10px 0;
            color: #78ffd6;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin: 12px 0;
        }
        .step-num {
            background: #78ffd6;
            color: #1a1a2e;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.85em;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .features {
            display: grid;
            gap: 10px;
        }
        .feature {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .feature-icon {
            font-size: 1.3em;
        }
        .success-msg {
            background: rgba(120, 255, 214, 0.1);
            border: 1px solid #78ffd6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⬇️ RD Downloader</h1>
        <p class="subtitle">Download movies & shows via Real-Debrid for offline viewing</p>
        
        <div class="card">
            <div class="features">
                <div class="feature">
                    <span class="feature-icon">🔍</span>
                    <span>Searches Torrentio for available content</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">☁️</span>
                    <span>Checks Real-Debrid cache for instant downloads</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">⬇️</span>
                    <span>Direct download links for offline viewing</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <label for="apiKey">Real-Debrid API Key</label>
            <input type="text" id="apiKey" placeholder="Paste your API key here...">
            <p class="help">
                Get your API key from <a href="https://real-debrid.com/apitoken" target="_blank">real-debrid.com/apitoken</a>
            </p>
            
            <button class="btn btn-primary" onclick="generateUrl()">Generate Install Link</button>
            
            <div id="installSection" class="install-section">
                <div class="success-msg">✅ Your addon is ready!</div>
                
                <label>Manifest URL:</label>
                <div id="manifestUrl" class="url-box"></div>
                
                <a id="stremioBtn" class="btn btn-stremio" href="#">
                    🚀 Install in Stremio
                </a>
                
                <button class="btn btn-secondary" onclick="copyUrl()">
                    📋 Copy Manifest URL
                </button>
                
                <p class="help" style="margin-top:15px;">
                    <strong>On Android:</strong> Click "Install in Stremio" button above.<br>
                    <strong>Manual install:</strong> Copy the URL and paste it in Stremio's addon search.
                </p>
            </div>
        </div>
        
        <div class="card">
            <h3 style="color:#78ffd6;margin-top:0;">📱 How to Use</h3>
            <div class="step">
                <div class="step-num">1</div>
                <div>Enter your Real-Debrid API key above</div>
            </div>
            <div class="step">
                <div class="step-num">2</div>
                <div>Click "Install in Stremio" or copy the manifest URL</div>
            </div>
            <div class="step">
                <div class="step-num">3</div>
                <div>In Stremio, search for any movie or show</div>
            </div>
            <div class="step">
                <div class="step-num">4</div>
                <div>Look for "⬇️ RD Download" streams</div>
            </div>
            <div class="step">
                <div class="step-num">5</div>
                <div>Tap to get direct download link!</div>
            </div>
        </div>
    </div>
    
    <script>
        const serverUrl = 'https://${host}';
        let currentManifestUrl = '';
        
        function generateUrl() {
            const apiKey = document.getElementById('apiKey').value.trim();
            if (!apiKey) {
                alert('Please enter your Real-Debrid API key');
                return;
            }
            
            if (apiKey.length < 20) {
                alert('That API key looks too short. Please check and try again.');
                return;
            }
            
            currentManifestUrl = serverUrl + '/' + encodeURIComponent(apiKey) + '/manifest.json';
            const stremioUrl = 'stremio://' + currentManifestUrl.replace('https://', '').replace('http://', '');
            
            document.getElementById('manifestUrl').textContent = currentManifestUrl;
            document.getElementById('stremioBtn').href = stremioUrl;
            document.getElementById('installSection').classList.add('show');
            
            // Scroll to show the install section
            document.getElementById('installSection').scrollIntoView({ behavior: 'smooth' });
        }
        
        function copyUrl() {
            navigator.clipboard.writeText(currentManifestUrl).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = currentManifestUrl;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('URL copied to clipboard!');
            });
        }
        
        // Check for API key in URL hash (for sharing configured links)
        if (window.location.hash) {
            const hashKey = window.location.hash.substring(1);
            if (hashKey.length > 20) {
                document.getElementById('apiKey').value = hashKey;
                generateUrl();
            }
        }
    </script>
</body>
</html>
    `);
};
