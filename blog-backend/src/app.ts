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

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
