module.exports = (req, res) => {
    const { apiKey } = req.query;
    
    const manifest = {
        id: 'com.rddownloader.stremio',
        version: '1.0.0',
        name: 'RD Downloader',
        description: 'Download movies and shows via Real-Debrid for offline viewing',
        logo: 'https://fcdn.real-debrid.com/0830/favicons/favicon.ico',
        resources: ['stream'],
        types: ['movie', 'series'],
        idPrefixes: ['tt'],
        catalogs: [],
        behaviorHints: {
            configurable: true,
            configurationRequired: false
        }
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.json(manifest);
};
