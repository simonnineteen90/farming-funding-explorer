const express = require('express');
const searchService = require('../services/search.service');
const searchPresenter = require('../presenters/search.presenter');
const { summariseResults } = require('../services/summary.service');

const router = express.Router();

const MAX_INPUT_LENGTH = 1000;

function parseSelectedStatuses(value) {
  if (Array.isArray(value)) {
    return value.filter((s) => typeof s === 'string').map((s) => s.toLowerCase());
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
  let input = typeof req.body.input === 'string' ? req.body.input : '';
  input = input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
  const selectedStatuses = parseSelectedStatuses(req.body.status);
  const returnJson = wantsJsonResponse(req);

  try {
    const result = await searchService.searchSchemesFromNaturalLanguage(input);

    const schemes =
      selectedStatuses.length > 0
        ? result.schemes.filter((scheme) =>
            selectedStatuses.includes((scheme.status || '').toLowerCase())
          )
        : result.schemes;

    const searched = input.length > 0 || selectedStatuses.length > 0;

    if (returnJson) {
      if (result.rejection) {
        return res.status(400).json({
          error: result.rejection.message,
          code: result.rejection.reasonCode,
          schemes: []
        });
      }

      return res.json(schemes);
    }

    const summary = searched && !result.rejection ? summariseResults(input, schemes) : null;

    const viewModel = searchPresenter.presentSearchPage({
      input,
      schemes,
      availableStatuses: searchService.getAvailableStatuses(),
      selectedStatuses,
      searched,
      errorMessage: result.rejection ? result.rejection.message : '',
      summary
    });

    return res.render('search', viewModel);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
