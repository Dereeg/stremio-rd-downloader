# RD Downloader - Stremio Addon

Download movies and TV shows via Real-Debrid for offline viewing.

## 🚀 One-Click Deploy

Deploy your own instance to Vercel (free):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/stremio-rd-downloader)

After deploying:
1. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
2. Enter your Real-Debrid API key
3. Click "Install in Stremio"

## 📱 Quick Setup (Without Deploying)

If someone has already deployed this addon and shared the URL with you:

1. Open the addon URL in your browser
2. Enter your Real-Debrid API key (from https://real-debrid.com/apitoken)
3. Click **"Install in Stremio"**
4. Done! You'll see "⬇️ RD Download" options in Stremio

## ✨ Features

- 🔍 Searches Torrentio for available torrents
- ☁️ Checks Real-Debrid cache for instant availability  
- ⬇️ Generates direct download links
- 📱 Works on Android, iOS, Windows, Mac, Linux
- 🔒 Your API key stays in the URL (not stored on server)

## 🛠️ Manual Deployment

### Vercel (Recommended)

1. Fork this repository
2. Create a [Vercel account](https://vercel.com)
3. Import your fork
4. Deploy!

### Local Development

```bash
npm install
npm install -g vercel
vercel dev
```

## 📖 How It Works

1. When you search for content in Stremio, the addon:
   - Fetches available torrents from Torrentio
   - Checks which ones are cached on Real-Debrid
   - Shows them as download options

2. When you select a download:
   - Adds the torrent to your Real-Debrid account
   - Gets the unrestricted direct download link
   - Opens a page to download the file

3. Download and watch offline anytime!

## 🔒 Privacy

- Your API key is embedded in the manifest URL
- Nothing is stored on the server
- All processing happens on-demand

## ⚠️ Disclaimer

This addon is for personal use. Make sure you have the rights to download any content.

## 📝 License

MIT
