const fs = require('node:fs');
const path = require('node:path');
const { matchToSchemes } = require('./match-to-schemes');
const {
  extractKeywordsWithCopilot,
  validateNaturalLanguageInput,
  getGithubToken,
  ERROR_CODES
} = require('./copilot.service');

const dataDir = path.join(__dirname, '..', 'data');
const formattedData = JSON.parse(fs.readFileSync(path.join(dataDir, 'formatted-data.json'), 'utf-8'));
const keywordData = JSON.parse(fs.readFileSync(path.join(dataDir, 'scheme-keywords.json'), 'utf-8'));

const formattedSchemes = Array.isArray(formattedData.schemes) ? formattedData.schemes : [];
const keywordSchemes = Array.isArray(keywordData.schemes) ? keywordData.schemes : [];

function searchSchemes(input) {
  return matchToSchemes(input, keywordSchemes, formattedSchemes);
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

  if (!isCopilotEnabled()) {
    return { schemes: searchSchemes(normalizedInput), source: 'direct', rejection: null };
  }

  const validation = validateNaturalLanguageInput(normalizedInput);
  if (!validation.valid) {
    if (validation.reasonCode === ERROR_CODES.DISALLOWED_INPUT) {
      return { schemes: [], source: 'rejected', rejection: buildRejection(validation) };
    }
    return { schemes: [], source: 'invalid', rejection: null };
  }

  if (!getGithubToken()) {
    return {
      schemes: searchSchemes(normalizedInput),
      source: 'fallback',
      fallbackReason: ERROR_CODES.MISSING_TOKEN,
      rejection: null
    };
  }

  try {
    const keywords = await extractKeywordsWithCopilot(normalizedInput);
    const schemes = matchToSchemes(keywords.join(' '), keywordSchemes, formattedSchemes);
    return {
      schemes,
      source: 'copilot',
      keywords,
      rejection: null
    };
  } catch (error) {
    if (error && error.code === ERROR_CODES.DISALLOWED_INPUT) {
      return {
        schemes: [],
        source: 'rejected',
        rejection: {
          reasonCode: error.code,
          message: error.message
        }
      };
    }

    return {
      schemes: searchSchemes(normalizedInput),
      source: 'fallback',
      fallbackReason: error && error.code ? error.code : ERROR_CODES.RUNTIME_FAILURE,
      rejection: null
    };
  }
}

module.exports = {
  searchSchemes,
  searchSchemesFromNaturalLanguage
};
