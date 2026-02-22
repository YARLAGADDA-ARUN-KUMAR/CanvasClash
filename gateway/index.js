import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import http from 'http';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

const TARGET_SERVER = 'http://server:3001';

app.use(
  '/socket.io',
  createProxyMiddleware({
    target: TARGET_SERVER,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',
  }),
);

app.use(
  '/api',
  createProxyMiddleware({
    target: TARGET_SERVER,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  }),
);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Gateway running on ${PORT}`);
});
