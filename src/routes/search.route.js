const express = require('express');
const searchService = require('../services/search.service');
const searchPresenter = require('../presenters/search.presenter');

const router = express.Router();

router.get('/', (_req, res) => {
  const viewModel = searchPresenter.presentSearchPage({
    input: '',
    schemes: []
  });

  res.render('search', viewModel);
});

router.post('/search', (req, res) => {
  const input = typeof req.body.input === 'string' ? req.body.input : '';
  const schemes = searchService.searchSchemes(input);

  const viewModel = searchPresenter.presentSearchPage({
    input,
    schemes
  });

  res.render('search', viewModel);
});

module.exports = router;
