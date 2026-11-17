import { defineConfig } from 'vite';

function attachApiMiddlewares(middlewares) {
  // 1. Google Photo / Drive Public Link Resolver
  middlewares.use('/api/resolve-google-photo', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      const urlObj = new URL(req.url, 'http://127.0.0.1');
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
        return;
      }

      // Direct image URL
      if (targetUrl.match(/\.(jpeg|jpg|png|webp|gif)($|\?)/i)) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, imageUrl: targetUrl, filename: 'photo.jpg' }));
        return;
      }

      // Google Drive file link
      const driveMatch = targetUrl.match(/\/d\/([a-zA-Z0-9_\-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        const highRes = `https://lh3.googleusercontent.com/d/${fileId}=s2400`;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, imageUrl: highRes, filename: `drive_${fileId}.jpg` }));
        return;
      }

      // Direct googleusercontent image link
      if (targetUrl.includes('googleusercontent.com')) {
        const base = targetUrl.replace(/=[swhpd0-9-]+$/, '');
        const highRes = `${base}=w2400-h2400`;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, imageUrl: highRes, filename: 'google_photo.jpg' }));
        return;
      }

      // Fetch page to extract og:image or high-res image tag
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow'
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.startsWith('image/')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, imageUrl: response.url || targetUrl, filename: 'photo.jpg' }));
        return;
      }

      const html = await response.text();
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      let imgUrl = ogMatch ? ogMatch[1] : null;

      if (!imgUrl) {
        const lh3Match = html.match(/(https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9_\-]+)/);
        if (lh3Match) {
          imgUrl = lh3Match[1];
        }
      }

      if (imgUrl) {
        const base = imgUrl.replace(/=[swhpd0-9-]+$/, '');
        const highRes = `${base}=w2400-h2400`;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, imageUrl: highRes, filename: 'google_photo.jpg' }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Could not extract photo from link. Make sure the photo sharing link is public.' }));
      }
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  });

  // 2. Authenticated Image Proxy for Google Photos & Google Drive
  middlewares.use('/api/proxy-image', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      const urlObj = new URL(req.url, 'http://127.0.0.1');
      const targetUrl = urlObj.searchParams.get('url');
      const token = urlObj.searchParams.get('token');

      if (!targetUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing url parameter' }));
        return;
      }

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(targetUrl, { headers, redirect: 'follow' });
      if (!response.ok) {
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        const errDetails = await response.text().catch(() => '');
        res.end(JSON.stringify({
          error: `Upstream returned HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errDetails.slice(0, 500)
        }));
        return;
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const arrayBuffer = await response.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    {
      name: 'google-photos-resolver',
      configureServer(server) {
        attachApiMiddlewares(server.middlewares);
      },
      configurePreviewServer(server) {
        attachApiMiddlewares(server.middlewares);
      }
    }
  ]
});
