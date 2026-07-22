// Must run before any validator schema is constructed (see docs/setup.ts).
// Keep this as the FIRST import so `.openapi()` is available on every schema.
import './docs/setup';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import errorMiddleware from './middlewares/error.middleware';
import passport from './config/passport';
import { buildOpenApiSpec } from './docs/openapi';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// API documentation. Spec is built once at startup from the zod validators.
// Helmet's default CSP blocks Swagger UI's inline scripts/styles, so relax it
// for the docs routes only (the rest of the API keeps the strict default).
const openApiSpec = buildOpenApiSpec();
const docsCsp = helmet.contentSecurityPolicy({
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:'],
  },
});
app.get('/docs.json', (req, res) => res.json(openApiSpec));
app.use('/docs', docsCsp, swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'Blog API docs' }));

// Root landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Blog API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', system-ui, sans-serif;
          background: #0f0f13;
          color: #e2e8f0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          background: #1a1a2e;
          border: 1px solid #2d2d4e;
          border-radius: 16px;
          padding: 48px 56px;
          text-align: center;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .badge {
          display: inline-block;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.4);
          color: #818cf8;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 14px;
          border-radius: 999px;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #a5b4fc, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
        }
        p {
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .links {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        a:hover { opacity: 0.8; }
        .btn-primary {
          background: #6366f1;
          color: #fff;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid #2d2d4e;
          color: #94a3b8;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #4ade80;
          margin-bottom: 20px;
        }
        .dot {
          width: 8px; height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">REST API</div>
        <h1>Blog Backend</h1>
        <div class="status"><span class="dot"></span> Server is running</div>
        <p>The Blog Express API is live and ready to accept requests.<br/>Use the links below to explore the API.</p>
        <div class="links">
          <a href="/api/health" class="btn-primary">&#10003; Health Check</a>
          <a href="/docs" class="btn-outline">&#128196; API Docs</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
