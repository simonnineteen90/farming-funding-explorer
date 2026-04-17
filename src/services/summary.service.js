'use strict';

const MAX_SUMMARY_KEYWORDS = 4;
const MAX_REASON_KEYWORDS = 3;

function deduplicateKeywords(schemes) {
  const seen = new Set();
  const result = [];
  for (const scheme of schemes) {
    for (const kw of scheme.matchedKeywords || []) {
      const normalised = kw.toLowerCase();
      if (!seen.has(normalised)) {
        seen.add(normalised);
        result.push(kw);
      }
    }
  }
  return result;
}

function formatKeywordList(keywords, max) {
  const limited = keywords.slice(0, max);
  if (limited.length === 0) return null;
  if (limited.length === 1) return limited[0];
  const last = limited[limited.length - 1];
  const rest = limited.slice(0, -1);
  return `${rest.join(', ')} and ${last}`;
}

function buildBestMatchReason(scheme, userInput) {
  const keywords = (scheme.matchedKeywords || []).slice(0, MAX_REASON_KEYWORDS);
  const keywordPhrase = formatKeywordList(keywords, MAX_REASON_KEYWORDS);

  if (keywordPhrase) {
    return `This scheme closely matches your interest in ${keywordPhrase}. ${scheme.description || ''}`.trim();
  }

  // Fallback when there are no matched keywords (e.g. status-filter-only search)
  return `This scheme is the closest match to your search. ${scheme.description || ''}`.trim();
}

function buildOverallSummary(userInput, schemes) {
  const count = schemes.length;
  const schemeWord = count === 1 ? 'scheme' : 'schemes';

  const allKeywords = deduplicateKeywords(schemes);
  const keywordPhrase = formatKeywordList(allKeywords, MAX_SUMMARY_KEYWORDS);

  if (keywordPhrase) {
    return `We found ${count} ${schemeWord} that may help with ${keywordPhrase}.`;
  }

  return `We found ${count} ${schemeWord} that may be relevant to your search.`;
}

/**
 * Generates a plain-English summary of search results.
 *
 * @param {string} userInput - The original search query.
 * @param {Array} schemes - Ranked scheme results, each optionally containing matchedKeywords[].
 * @returns {{ bestMatch: { name: string, reason: string } | null, overallSummary: string } | null}
 */
function summariseResults(userInput, schemes) {
  if (!Array.isArray(schemes) || schemes.length === 0) {
    return null;
  }

  const best = schemes[0];

  return {
    bestMatch: {
      name: best.name || 'Unknown scheme',
      reason: buildBestMatchReason(best, userInput)
    },
    overallSummary: buildOverallSummary(userInput, schemes)
  };
}

module.exports = { summariseResults };
