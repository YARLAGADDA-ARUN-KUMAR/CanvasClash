import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

const PORT = process.env.PORT || 3000;
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
    pathRewrite: {
      '^/api': '',
    },
  }),
);

app.get('/gateway-health', (req, res) => {
  res.send('Gateway is running and routing traffic.');
});

app.listen(PORT, () => {
  console.log('Gateway is running on port: 3000');
});
