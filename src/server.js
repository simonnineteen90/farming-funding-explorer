const express = require('express');
const path = require('node:path');
const nunjucks = require('nunjucks');
const searchRoute = require('./routes/search.route');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'njk');
app.set('views', path.join(__dirname, 'views'));

nunjucks.configure(
  [
    path.join(__dirname, 'views'),
    path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist')
  ],
  {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production'
  }
);

app.use('/govuk', express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist', 'govuk')));
app.use('/assets', express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets')));

app.use('/', searchRoute);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
