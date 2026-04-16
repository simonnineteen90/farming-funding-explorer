const express = require('express');
const searchService = require('../services/search.service');
const searchPresenter = require('../presenters/search.presenter');

const router = express.Router();

function parseSelectedStatuses(value) {
  if (Array.isArray(value)) {
    return value.filter((status) => typeof status === 'string').map((status) => status.toLowerCase());
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.toLowerCase()];
  }

  return [];
}

router.get('/', (_req, res) => {
  const viewModel = searchPresenter.presentSearchPage({
    input: '',
    schemes: [],
    errorMessage: ''
    availableStatuses: searchService.getAvailableStatuses(),
    selectedStatuses: [],
    searched: false
  });

  res.render('search', viewModel);
});

function wantsJsonResponse(req) {
  return req.accepts(['html', 'json']) === 'json';
}

router.post('/search', async (req, res, next) => {
  const input = typeof req.body.input === 'string' ? req.body.input : '';
  const returnJson = wantsJsonResponse(req);

  try {
    const result = await searchService.searchSchemesFromNaturalLanguage(input);
const MAX_INPUT_LENGTH = 1000;

router.post('/search', (req, res) => {
  let input = typeof req.body.input === 'string' ? req.body.input : '';
  input = input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
  const selectedStatuses = parseSelectedStatuses(req.body.status);
  const hasQuery = input.length > 0;
  const hasFilters = selectedStatuses.length > 0;
  const searched = hasQuery || hasFilters;
  const schemes = searched ? searchService.searchSchemes(input, { statuses: selectedStatuses }) : [];

  const viewModel = searchPresenter.presentSearchPage({
    input,
    schemes,
    availableStatuses: searchService.getAvailableStatuses(),
    selectedStatuses,
    searched
  });

    if (returnJson) {
      if (result.rejection) {
        return res.status(400).json({
          error: result.rejection.message,
          code: result.rejection.reasonCode,
          schemes: []
        });
      }

      return res.json(result.schemes);
    }

    const viewModel = searchPresenter.presentSearchPage({
      input,
      schemes: result.schemes,
      errorMessage: result.rejection ? result.rejection.message : ''
    });

    return res.render('search', viewModel);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
