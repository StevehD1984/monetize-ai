const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      };
      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(data);
        });
      });
      proxyReq.on('error', e => {
        res.writeHead(500);
        res.end(JSON.stringify({error: e.message}));
      });
      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
