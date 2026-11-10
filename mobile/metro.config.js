const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

const config = getDefaultConfig(__dirname);

// Enhance Metro middleware to transparently proxy all /api requests to Express backend on port 5000
const prevEnhance = config.server?.enhanceMiddleware;
config.server = config.server || {};
config.server.enhanceMiddleware = (metroMiddleware, server) => {
  const enhanced = prevEnhance ? prevEnhance(metroMiddleware, server) : metroMiddleware;

  return (req, res, next) => {
    const url = req.url || '';
    if (url.startsWith('/api')) {
      const proxyReq = http.request(
        {
          hostname: '127.0.0.1',
          port: 5000,
          path: url,
          method: req.method,
          headers: {
            ...req.headers,
            host: '127.0.0.1:5000'
          }
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        }
      );

      proxyReq.on('error', (err) => {
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Backend unreachable on port 5000: ' + err.message }));
        }
      });

      req.pipe(proxyReq);
      return;
    }

    return enhanced(req, res, next);
  };
};

module.exports = config;

