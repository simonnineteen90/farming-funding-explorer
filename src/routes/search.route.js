const express = require('express');
const searchService = require('../services/search.service');
const searchPresenter = require('../presenters/search.presenter');

const router = express.Router();

router.get('/', (_req, res) => {
  const viewModel = searchPresenter.presentSearchPage({
    input: '',
    schemes: [],
    errorMessage: ''
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
