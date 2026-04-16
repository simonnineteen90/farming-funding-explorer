const fs = require('node:fs');
const path = require('node:path');
const { matchToSchemes } = require('./match-to-schemes');
const {
  extractKeywordsWithCopilot,
  validateNaturalLanguageInput,
  getGithubToken,
  ERROR_CODES
} = require('./copilot.service');
const logger = require('../logger');

const dataDir = path.join(__dirname, '..', 'data');
const formattedData = JSON.parse(fs.readFileSync(path.join(dataDir, 'formatted-data.json'), 'utf-8'));
const keywordData = JSON.parse(fs.readFileSync(path.join(dataDir, 'scheme-keywords.json'), 'utf-8'));

const allSchemes = Array.isArray(formattedData.schemes) ? formattedData.schemes : [];

const statusPriority = {
  open: 0,
  by_invitation: 1,
  closed: 3
};

function normalize(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function getStatusRank(status) {
  const key = normalize(status);

  if (Object.hasOwn(statusPriority, key)) {
    return statusPriority[key];
  }

  return 2;
}

function compareSchemes(a, b) {
  const rankA = getStatusRank(a.status);
  const rankB = getStatusRank(b.status);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  const nameA = typeof a.name === 'string' ? a.name : '';
  const nameB = typeof b.name === 'string' ? b.name : '';

  return nameA.localeCompare(nameB);
}

function normalizeStatuses(statuses) {
  if (!Array.isArray(statuses)) {
    return [];
  }

  return [...new Set(statuses.map((status) => normalize(status)).filter(Boolean))];
}

function searchSchemes(input, options = {}) {
  const query = normalize(input).trim();
  const selectedStatuses = normalizeStatuses(options.statuses);
  const filterByStatus = selectedStatuses.length > 0;

  const filteredSchemes = allSchemes.filter((scheme) => {
    const status = normalize(scheme.status);

    if (filterByStatus && !selectedStatuses.includes(status)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      scheme.name,
      scheme.description,
      scheme.category,
      scheme.notes,
      scheme.status,
      scheme.grantValue
    ]
      .map(normalize)
      .join(' ');

    return haystack.includes(query);
  });

  return filteredSchemes.sort(compareSchemes);
}

function getAvailableStatuses() {
  return [...new Set(allSchemes.map((scheme) => normalize(scheme.status)).filter(Boolean))].sort(
    (a, b) => getStatusRank(a) - getStatusRank(b) || a.localeCompare(b)
  );
}

function isCopilotEnabled() {
  return String(process.env.USE_COPILOT).toLowerCase() === 'true';
}

function buildRejection(validation) {
  return {
    reasonCode: validation.reasonCode,
    message: validation.message
  };
}

async function searchSchemesFromNaturalLanguage(input) {
  const normalizedInput = typeof input === 'string' ? input : '';

  if (normalizedInput.trim() === '') {
    return { schemes: [], source: 'empty', rejection: null };
  }

  const enabled = isCopilotEnabled();
  logger.info('search', 'search.copilot.status', { enabled });

  if (!enabled) {
    const schemes = matchToSchemes(normalizedInput, keywordData.schemes, allSchemes);
    const result = { schemes, source: 'direct', rejection: null };
    logger.info('search', 'search.source', { source: result.source });
    return result;
  }

  const validation = validateNaturalLanguageInput(normalizedInput);
  if (!validation.valid) {
    if (validation.reasonCode === ERROR_CODES.DISALLOWED_INPUT) {
      logger.info('search', 'search.source', { source: 'rejected' });
      return { schemes: [], source: 'rejected', rejection: buildRejection(validation) };
    }
    logger.info('search', 'search.source', { source: 'invalid' });
    return { schemes: [], source: 'invalid', rejection: null };
  }

  if (!getGithubToken()) {
    logger.info('search', 'search.source', { source: 'fallback', fallbackReason: ERROR_CODES.MISSING_TOKEN });
    return {
      schemes: matchToSchemes(normalizedInput, keywordData.schemes, allSchemes),
      source: 'fallback',
      fallbackReason: ERROR_CODES.MISSING_TOKEN,
      rejection: null
    };
  }

  try {
    const keywords = await extractKeywordsWithCopilot(normalizedInput);
    const schemes = matchToSchemes(keywords.join(' '), keywordData.schemes, allSchemes);
    logger.info('search', 'search.source', { source: 'copilot' });
    return {
      schemes,
      source: 'copilot',
      keywords,
      rejection: null
    };
  } catch (error) {
    if (error && error.code === ERROR_CODES.DISALLOWED_INPUT) {
      logger.info('search', 'search.source', { source: 'rejected' });
      return {
        schemes: [],
        source: 'rejected',
        rejection: {
          reasonCode: error.code,
          message: error.message
        }
      };
    }

    const fallbackReason = error && error.code ? error.code : ERROR_CODES.RUNTIME_FAILURE;
    logger.info('search', 'search.source', { source: 'fallback', fallbackReason });
    return {
      schemes: matchToSchemes(normalizedInput, keywordData.schemes, allSchemes),
      source: 'fallback',
      fallbackReason,
      rejection: null
    };
  }
}

module.exports = {
  searchSchemes,
  searchSchemesFromNaturalLanguage,
  getAvailableStatuses
};
