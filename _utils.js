const fetch = require('node-fetch');

class RealDebrid {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.real-debrid.com/rest/1.0';
    }

    async request(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        if (body) {
            options.body = new URLSearchParams(body).toString();
        }
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`RD API Error: ${response.status} - ${error}`);
        }
        return response.json();
    }

    async checkInstantAvailability(hashes) {
        if (!hashes.length) return {};
        const hashList = hashes.join('/');
        try {
            return await this.request(`/torrents/instantAvailability/${hashList}`);
        } catch (e) {
            console.error('Error checking instant availability:', e.message);
            return {};
        }
    }

    async addMagnet(magnet) {
        return await this.request('/torrents/addMagnet', 'POST', { magnet });
    }

    async getTorrentInfo(id) {
        return await this.request(`/torrents/info/${id}`);
    }

    async selectFiles(id, files = 'all') {
        return await this.request(`/torrents/selectFiles/${id}`, 'POST', { files });
    }

    async unrestrict(link) {
        return await this.request('/unrestrict/link', 'POST', { link });
    }
}

async function fetchFromTorrentio(type, id) {
    try {
        const url = `https://torrentio.strem.fun/stream/${type}/${id}.json`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Stremio-RD-Downloader/1.0' }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.streams || [];
    } catch (e) {
        console.error('Error fetching from Torrentio:', e.message);
        return [];
    }
}

function extractInfoHash(stream) {
    if (stream.infoHash) return stream.infoHash.toLowerCase();
    
    if (stream.behaviorHints?.bingeGroup) {
        const match = stream.behaviorHints.bingeGroup.match(/([a-fA-F0-9]{40})/);
        if (match) return match[1].toLowerCase();
    }
    
    if (stream.url) {
        const match = stream.url.match(/([a-fA-F0-9]{40})/i);
        if (match) return match[1].toLowerCase();
    }
    
    return null;
}

function parseStreamInfo(stream) {
    const title = stream.title || stream.name || '';
    return {
        title: title,
        quality: title.match(/(\d{3,4}p)/i)?.[1] || 'Unknown',
        size: title.match(/💾\s*([\d.]+\s*[GMKT]B)/i)?.[1] || '',
        source: title.split('\n')[0] || 'Unknown'
    };
}

module.exports = { RealDebrid, fetchFromTorrentio, extractInfoHash, parseStreamInfo };
