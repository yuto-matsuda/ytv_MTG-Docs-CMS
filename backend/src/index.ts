import { Hono } from 'hono';
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { docsRoutes } from "./routes/docs";
import { imagesRoutes } from './routes/images';
import { usersRoutes } from "./routes/users";

const app = new Hono<{ Bindings: any }>();

// CORS
app.use('*', cors({
  // origin: ['http://localhost:5173',],
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/health', async (c) => {
  return c.json({
    success: true,
    data: { status: 'ok', reqId: crypto.randomUUID() },
  });
});

app.route('/', authRoutes);
app.route('/users', usersRoutes);
app.route('/docs', docsRoutes);
app.route('/images', imagesRoutes);

export default app;
