const { RealDebrid, fetchFromTorrentio, extractInfoHash, parseStreamInfo } = require('./_utils');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const { apiKey, type, id } = req.query;
    
    // Clean up the id (remove .json if present)
    const cleanId = id?.replace('.json', '') || '';
    
    console.log(`Stream request: ${type} ${cleanId}`);

    if (!apiKey || apiKey === 'undefined') {
        return res.json({ streams: [{
            name: '⚠️ Setup Required',
            title: 'Configure addon with your RD API key',
            externalUrl: `https://${req.headers.host}/configure`
        }]});
    }

    const rd = new RealDebrid(apiKey);
    const baseUrl = `https://${req.headers.host}`;

    try {
        // Fetch available torrents from Torrentio
        const torrentioStreams = await fetchFromTorrentio(type, cleanId);
        
        if (!torrentioStreams.length) {
            return res.json({ streams: [{
                name: '❌ No Results',
                title: 'No torrents found for this content',
                externalUrl: 'about:blank'
            }]});
        }

        // Extract info hashes
        const hashMap = new Map();
        for (const stream of torrentioStreams) {
            const hash = extractInfoHash(stream);
            if (hash && !hashMap.has(hash)) {
                hashMap.set(hash, stream);
            }
        }
        
        const hashes = Array.from(hashMap.keys());

        // Check which are cached on RD
        const availability = await rd.checkInstantAvailability(hashes);
        
        const cachedHashes = Object.keys(availability).filter(h => {
            const data = availability[h];
            return data && data.rd && data.rd.length > 0;
        });

        // Build download streams
        const downloadStreams = [];

        for (const hash of cachedHashes.slice(0, 15)) {
            const originalStream = hashMap.get(hash);
            const info = parseStreamInfo(originalStream);
            const magnet = `magnet:?xt=urn:btih:${hash}`;
            
            const downloadData = Buffer.from(JSON.stringify({
                hash,
                magnet,
                title: info.title
            })).toString('base64url');

            downloadStreams.push({
                name: `⬇️ RD Download`,
                title: `${info.quality} ${info.size}\n${info.source}`,
                externalUrl: `${baseUrl}/download/${apiKey}/${downloadData}`,
                behaviorHints: {
                    notWebReady: true,
                    bingeGroup: `rd-dl-${hash}`
                }
            });
        }

        // Add uncached torrents
        const uncachedHashes = hashes.filter(h => !cachedHashes.includes(h));
        for (const hash of uncachedHashes.slice(0, 5)) {
            const originalStream = hashMap.get(hash);
            const info = parseStreamInfo(originalStream);
            const magnet = `magnet:?xt=urn:btih:${hash}`;
            
            const downloadData = Buffer.from(JSON.stringify({
                hash,
                magnet,
                title: info.title,
                uncached: true
            })).toString('base64url');

            downloadStreams.push({
                name: `📥 RD (Not Cached)`,
                title: `${info.quality} ${info.size}\n⏳ Will need to download first\n${info.source}`,
                externalUrl: `${baseUrl}/download/${apiKey}/${downloadData}`,
                behaviorHints: {
                    notWebReady: true
                }
            });
        }

        if (downloadStreams.length === 0) {
            return res.json({ streams: [{
                name: '❌ No Cached Results',
                title: 'No cached torrents found on Real-Debrid',
                externalUrl: 'about:blank'
            }]});
        }

        return res.json({ streams: downloadStreams });

    } catch (error) {
        console.error('Error:', error);
        return res.json({ streams: [{
            name: '❌ Error',
            title: error.message,
            externalUrl: 'about:blank'
        }]});
    }
};
