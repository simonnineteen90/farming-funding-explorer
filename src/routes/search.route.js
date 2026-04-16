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

const MAX_INPUT_LENGTH = 1000;

router.post('/search', (req, res) => {
  let input = typeof req.body.input === 'string' ? req.body.input : '';
  input = input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
  const schemes = searchService.searchSchemes(input);

  const viewModel = searchPresenter.presentSearchPage({
    input,
    schemes
  });

  res.render('search', viewModel);
});

module.exports = router;
