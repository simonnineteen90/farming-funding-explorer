'use strict';

const INJECTION_PATTERNS = [
  /^\s*ignore\s+(all\s+)?previous\s+instructions/i,
  /^\s*system\s*:/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|endoftext\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i
];

function sanitiseForMatching(input) {
  if (!input || typeof input !== 'string') return '';

  let text = input;

  // Strip markdown formatting
  text = text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1');

  // Detect and strip prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      console.warn('Prompt injection pattern detected in search input');
      text = text.replace(pattern, '');
    }
  }

  return text.trim();
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeInput(text) {
  if (!text || typeof text !== 'string') return [];
  return normalizeText(text)
    .split(' ')
    .filter(token => token.length > 1);
}

function scoreScheme(tokens, keywordEntry) {
  if (!keywordEntry.keywords || !Array.isArray(keywordEntry.keywords)) {
    return { score: 0, matchedKeywords: [] };
  }

  const normalizedInput = tokens.join(' ');
  const tokenSet = new Set(tokens);
  // Pre-filter tokens long enough for prefix matching (avoids false positives)
  const prefixTokens = tokens.filter(t => t.length >= 4);
  const matched = [];
  // Track which input tokens have already contributed a point, so a single
  // token cannot inflate a scheme's score by matching multiple keywords.
  const usedInputTokens = new Set();

  for (const keyword of keywordEntry.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    const kwTokens = normalizedKeyword.split(' ').filter(t => t.length > 1);
    if (kwTokens.length === 0) continue;

    let isMatch = false;
    let contributingToken = null;

    if (kwTokens.length === 1) {
      const kw = kwTokens[0];
      if (tokenSet.has(kw)) {
        isMatch = true;
        contributingToken = kw;
      } else {
        const t = prefixTokens.find(t => kw.startsWith(t) || t.startsWith(kw));
        if (t) { isMatch = true; contributingToken = t; }
      }
    } else {
      isMatch = normalizedInput.includes(normalizedKeyword);
      // Multi-word phrases use the full phrase as the dedup key
      if (isMatch) contributingToken = normalizedKeyword;
    }

    if (isMatch && !usedInputTokens.has(contributingToken)) {
      matched.push(keyword);
      usedInputTokens.add(contributingToken);
    }
  }

  return { score: matched.length, matchedKeywords: matched };
}

const STATUS_PRIORITY = { open: 0, by_invitation: 1, closed: 3 };

function getStatusRank(status) {
  const key = typeof status === 'string' ? status.toLowerCase() : '';
  return Object.hasOwn(STATUS_PRIORITY, key) ? STATUS_PRIORITY[key] : 2;
}

function matchToSchemes(input, keywordSchemes, formattedSchemes, limit = 5) {
  if (!input || typeof input !== 'string' || input.trim() === '') return [];

  const sanitised = sanitiseForMatching(input);
  if (!sanitised) return [];

  const tokens = normalizeInput(sanitised);
  if (tokens.length === 0) return [];

  const schemeMap = {};
  for (const scheme of formattedSchemes) {
    schemeMap[scheme.id] = scheme;
  }

  const results = [];

  for (const keywordEntry of keywordSchemes) {
    const formattedScheme = schemeMap[keywordEntry.id];
    if (!formattedScheme) continue;
    const { score, matchedKeywords } = scoreScheme(tokens, keywordEntry);
    if (score === 0) continue;

    results.push({
      id: formattedScheme.id,
      name: formattedScheme.name,
      status: formattedScheme.status,
      description: formattedScheme.description,
      grantValue: formattedScheme.grantValue || null,
      openDate: formattedScheme.openDate || null,
      closingDate: formattedScheme.closingDate || null,
      url: formattedScheme.url,
      score,
      matchedKeywords
    });
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const statusDiff = getStatusRank(a.status) - getStatusRank(b.status);
    if (statusDiff !== 0) return statusDiff;
    return (a.name || '').localeCompare(b.name || '');
  });

  return results.slice(0, limit);
}

module.exports = { sanitiseForMatching, normalizeInput, scoreScheme, matchToSchemes };
