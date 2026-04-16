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
    availableStatuses: searchService.getAvailableStatuses(),
    selectedStatuses: [],
    searched: false
  });

  res.render('search', viewModel);
});

router.post('/search', (req, res) => {
  const input = typeof req.body.input === 'string' ? req.body.input : '';
  const selectedStatuses = parseSelectedStatuses(req.body.status);
  const hasQuery = input.trim().length > 0;
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

  res.render('search', viewModel);
});

module.exports = router;
