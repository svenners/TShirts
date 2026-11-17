import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    {
      name: 'google-photos-resolver',
      configureServer(server) {
        server.middlewares.use('/api/resolve-google-photo', async (req, res) => {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
              return;
            }

            // Direct image URL
            if (targetUrl.match(/\.(jpeg|jpg|png|webp)($|\?)/i)) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, imageUrl: targetUrl, filename: 'photo.jpg' }));
              return;
            }

            // Direct lh3.googleusercontent.com link
            if (targetUrl.includes('googleusercontent.com')) {
              const base = targetUrl.replace(/=[swhpd0-9-]+$/, '');
              const highRes = `${base}=w2400-h2400`;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, imageUrl: highRes, filename: 'google_photo.jpg' }));
              return;
            }

            // Fetch page with standard browser headers to follow redirects
            const response = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              },
              redirect: 'follow'
            });

            // Check if response is directly an image
            const contentType = response.headers.get('content-type') || '';
            if (contentType.startsWith('image/')) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, imageUrl: response.url || targetUrl, filename: 'photo.jpg' }));
              return;
            }

            const html = await response.text();

            // Check for og:image
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

        // Authenticated Image Proxy for Google Photos & Google Drive
        server.middlewares.use('/api/proxy-image', async (req, res) => {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const targetUrl = urlObj.searchParams.get('url');
            const token = urlObj.searchParams.get('token');

            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url parameter');
              return;
            }

            const headers = {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(targetUrl, { headers });
            if (!response.ok) {
              res.statusCode = response.status;
              res.end(`Upstream error: ${response.statusText}`);
              return;
            }

            const contentType = response.headers.get('content-type') || 'image/jpeg';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=86400');

            const arrayBuffer = await response.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err) {
            res.statusCode = 500;
            res.end(err.message);
          }
        });
      }
    }
  ]
});
