import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { initDb } from './db.js';
import { initSocket } from './socket.js';
import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import tableRoutes from './routes/table.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';


const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());


app.get('/health', (_req, res) => res.json({ ok: true }));


app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/tables', tableRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);


const server = http.createServer(app);
initSocket(server);


const PORT = process.env.SERVER_PORT || 4000;
await initDb();
server.listen(PORT, () => console.log(`API running on :${PORT}`));