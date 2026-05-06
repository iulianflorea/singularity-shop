const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.FRONTEND_PORT || 4201;
const BACKEND = 'http://localhost:' + (process.env.BACKEND_PORT || 8091);
const STATIC_DIR = path.join(__dirname, 'dist/frontend/browser');

app.use('/api', createProxyMiddleware({ target: BACKEND, changeOrigin: true }));
app.use('/uploads', createProxyMiddleware({ target: BACKEND, changeOrigin: true }));

app.use(express.static(STATIC_DIR));
app.get('/{*splat}', (req, res) => res.sendFile(path.join(STATIC_DIR, 'index.html')));

app.listen(PORT, () => console.log(`Shop frontend running on port ${PORT}, proxying API to ${BACKEND}`));
