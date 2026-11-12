const http = require('http');

const PORT = 8082;
const TARGET_PORT = 8081;

const server = http.createServer((req, res) => {
  req.on('error', () => {});
  res.on('error', () => {});

  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    proxyRes.on('error', () => {});
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Cannot reach Metro on port ${TARGET_PORT}: ${err.message}` }));
    }
  });

  req.pipe(proxyReq);
});

server.on('upgrade', (req, socket, head) => {
  socket.on('error', () => {});

  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    proxySocket.on('error', () => {});
    socket.on('error', () => {});
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      `\r\n\r\n`
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    try { socket.destroy(); } catch (_) {}
  });

  proxyReq.end();
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Metro Port Bridge active: Port ${PORT} -> Port ${TARGET_PORT}`);
});
