const { RealDebrid } = require('./_utils');

module.exports = async (req, res) => {
    const { apiKey, data } = req.query;

    if (!apiKey || !data) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(400).send(errorPage('Missing parameters'));
    }

    try {
        const decoded = JSON.parse(Buffer.from(data, 'base64url').toString());
        const rd = new RealDebrid(apiKey);

        console.log(`Download request for: ${decoded.title || decoded.hash}`);

        // Add magnet to RD
        const addResult = await rd.addMagnet(decoded.magnet);
        const torrentId = addResult.id;

        // Select all files
        await rd.selectFiles(torrentId);

        // Wait a moment for RD to process
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get torrent info with links
        const torrentInfo = await rd.getTorrentInfo(torrentId);

        if (torrentInfo.links && torrentInfo.links.length > 0) {
            // Unrestrict the first link (main video file)
            const unrestricted = await rd.unrestrict(torrentInfo.links[0]);
            const downloadUrl = unrestricted.download;
            const fileSizeGB = (unrestricted.filesize / (1024 * 1024 * 1024)).toFixed(2);

            res.setHeader('Content-Type', 'text/html');
            return res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>RD Download Ready</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            text-align: center;
            width: 100%;
        }
        h1 { color: #78ffd6; margin-bottom: 10px; }
        .filename { 
            color: #aaa; 
            word-break: break-all;
            margin: 15px 0;
            padding: 10px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            font-size: 0.9em;
        }
        .size { color: #78ffd6; font-size: 1.2em; margin: 15px 0; }
        .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #78ffd6 0%, #a8edea 100%);
            color: #1a1a2e;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1em;
            margin-top: 10px;
            transition: transform 0.2s;
        }
        .download-btn:hover { transform: scale(1.05); }
        .copy-btn {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 12px 30px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
            cursor: pointer;
            border: none;
            font-size: 1em;
        }
        .info { color: #888; margin-top: 20px; font-size: 0.85em; }
        .buttons { display: flex; flex-direction: column; gap: 10px; align-items: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Download Ready!</h1>
        <div class="filename">${unrestricted.filename}</div>
        <div class="size">📦 ${fileSizeGB} GB</div>
        <div class="buttons">
            <a href="${downloadUrl}" class="download-btn" download>⬇️ Download Now</a>
            <button class="copy-btn" onclick="copyLink()">📋 Copy Link</button>
        </div>
        <p class="info">Link expires in ~1 hour.<br>Download will start automatically...</p>
    </div>
    <script>
        function copyLink() {
            navigator.clipboard.writeText("${downloadUrl}").then(() => {
                document.querySelector('.copy-btn').textContent = '✅ Copied!';
                setTimeout(() => {
                    document.querySelector('.copy-btn').textContent = '📋 Copy Link';
                }, 2000);
            });
        }
        // Auto-start download after 2 seconds
        setTimeout(() => {
            window.location.href = "${downloadUrl}";
        }, 2000);
    </script>
</body>
</html>
            `);
        } else if (torrentInfo.status === 'waiting_files_selection' || torrentInfo.status === 'queued') {
            res.setHeader('Content-Type', 'text/html');
            return res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Processing...</title>
    <meta http-equiv="refresh" content="3">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.1);
            border-left-color: #78ffd6;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="spinner"></div>
    <h1>⏳ Processing...</h1>
    <p>Real-Debrid is preparing your download. Please wait...</p>
</body>
</html>
            `);
        } else if (torrentInfo.status === 'downloading') {
            const progress = torrentInfo.progress || 0;
            res.setHeader('Content-Type', 'text/html');
            return res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Downloading on RD...</title>
    <meta http-equiv="refresh" content="5">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
            padding: 20px;
            text-align: center;
        }
        .progress-bar {
            width: 80%;
            max-width: 400px;
            height: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #78ffd6, #a8edea);
            width: ${progress}%;
            transition: width 0.3s;
        }
    </style>
</head>
<body>
    <h1>📥 Downloading to Real-Debrid</h1>
    <p>This torrent wasn't cached. RD is downloading it now.</p>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <p><strong>${progress}%</strong> complete</p>
    <p style="color:#888;">This page will auto-refresh. Please wait...</p>
</body>
</html>
            `);
        } else {
            throw new Error(`Unexpected status: ${torrentInfo.status}`);
        }

    } catch (error) {
        console.error('Download error:', error);
        res.setHeader('Content-Type', 'text/html');
        return res.status(500).send(errorPage(error.message));
    }
};

function errorPage(message) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 40px;
            min-height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .error-box {
            background: rgba(255,0,0,0.1);
            border: 1px solid rgba(255,0,0,0.3);
            padding: 20px;
            border-radius: 10px;
            max-width: 500px;
        }
    </style>
</head>
<body>
    <h1>❌ Error</h1>
    <div class="error-box">
        <p>${message}</p>
    </div>
    <p style="color:#888;margin-top:20px;">Please try again or check your Real-Debrid account.</p>
</body>
</html>
    `;
}
