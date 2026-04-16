const express = require('express');
const path = require('node:path');
const nunjucks = require('nunjucks');
const rateLimit = require('express-rate-limit');
const searchRoute = require('./routes/search.route');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Prototype pollution guard — strip dangerous keys from request bodies
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    delete req.body.__proto__;
    delete req.body.constructor;
    delete req.body.prototype;
  }
  next();
});

app.set('view engine', 'njk');
app.set('views', path.join(__dirname, 'views'));

nunjucks.configure(
  [
    path.join(__dirname, 'views'),
    path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist')
  ],
  {
    // Security: autoescape prevents XSS by HTML-encoding all template variables
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production'
  }
);

app.use('/govuk', express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist', 'govuk')));
app.use('/assets', express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets')));

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  handler: (_req, res) => {
    res.status(429).render('search', {
      pageTitle: 'Find farming funding',
      input: '',
      searched: false,
      resultCount: 0,
      schemes: [],
      rateLimited: true
    });
  }
});
app.use('/search', searchLimiter);

app.use('/', searchRoute);

// 404 handler
app.use((_req, res) => {
  res.status(404).render('search', {
    pageTitle: 'Find farming funding',
    input: '',
    searched: false,
    resultCount: 0,
    schemes: [],
    error: 'Page not found.'
  });
});

// 500 catch-all error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).render('search', {
    pageTitle: 'Find farming funding',
    input: '',
    searched: false,
    resultCount: 0,
    schemes: [],
    error: 'Something went wrong. Please try again.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
