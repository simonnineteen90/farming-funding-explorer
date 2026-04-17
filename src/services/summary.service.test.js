'use strict';

const { summariseResults } = require('./summary.service');

const schemeA = {
  name: 'Sustainable Farming Incentive (SFI)',
  description: 'SFI pays farmers to take up sustainable farming practices.',
  matchedKeywords: ['soil', 'hedgerows', 'biodiversity'],
  score: 3
};

const schemeB = {
  name: 'Farming Equipment and Technology Fund (FETF)',
  description: 'Helps you buy equipment to improve productivity.',
  matchedKeywords: ['equipment', 'productivity'],
  score: 2
};

const schemeC = {
  name: 'Landscape Recovery',
  description: 'Pays groups of farmers for large-scale nature recovery.',
  matchedKeywords: ['nature', 'rewilding'],
  score: 1
};

describe('summariseResults', () => {
  test('returns null for empty schemes array', () => {
    expect(summariseResults('soil health', [])).toBeNull();
  });

  test('returns null for non-array schemes', () => {
    expect(summariseResults('soil health', null)).toBeNull();
    expect(summariseResults('soil health', undefined)).toBeNull();
  });

  test('identifies first scheme as best match', () => {
    const result = summariseResults('soil and hedgerows', [schemeA, schemeB]);
    expect(result.bestMatch.name).toBe('Sustainable Farming Incentive (SFI)');
  });

  test('reason includes matched keywords for best match', () => {
    const result = summariseResults('soil health', [schemeA, schemeB]);
    expect(result.bestMatch.reason).toContain('soil');
    expect(result.bestMatch.reason).toContain('hedgerows');
  });

  test('reason includes description excerpt', () => {
    const result = summariseResults('soil health', [schemeA]);
    expect(result.bestMatch.reason).toContain('SFI pays farmers');
  });

  test('overall summary includes correct scheme count (plural)', () => {
    const result = summariseResults('soil', [schemeA, schemeB, schemeC]);
    expect(result.overallSummary).toMatch(/We found 3 schemes/);
  });

  test('overall summary uses singular for one result', () => {
    const result = summariseResults('soil', [schemeA]);
    expect(result.overallSummary).toMatch(/We found 1 scheme that/);
  });

  test('overall summary includes deduplicated keywords', () => {
    const result = summariseResults('soil', [schemeA, schemeB]);
    expect(result.overallSummary).toContain('soil');
  });

  test('limits overall summary to 4 unique keywords', () => {
    const schemeWithMany = {
      ...schemeA,
      matchedKeywords: ['soil', 'hedgerows', 'biodiversity', 'carbon', 'water', 'wildlife']
    };
    const result = summariseResults('many keywords', [schemeWithMany]);
    // Should only list up to 4 keywords
    const keywordMatch = result.overallSummary.match(/that may help with (.+)\./);
    expect(keywordMatch).not.toBeNull();
    // 4 keywords = at most 3 commas + 1 "and"
    const phrase = keywordMatch[1];
    expect(phrase).toContain('soil');
    expect(phrase).not.toContain('water');
  });

  test('falls back gracefully when matchedKeywords is empty', () => {
    const noKeywordScheme = { name: 'Some Scheme', description: 'A scheme.', matchedKeywords: [] };
    const result = summariseResults('something', [noKeywordScheme]);
    expect(result.bestMatch.reason).toContain('closest match');
    expect(result.overallSummary).toContain('may be relevant');
  });

  test('falls back gracefully when matchedKeywords is missing', () => {
    const noKeywordScheme = { name: 'Some Scheme', description: 'A scheme.' };
    const result = summariseResults('something', [noKeywordScheme]);
    expect(result.bestMatch.reason).toContain('closest match');
    expect(result.overallSummary).toContain('may be relevant');
  });

  test('deduplicates keywords across multiple schemes in overall summary', () => {
    const s1 = { name: 'A', description: '', matchedKeywords: ['soil', 'carbon'] };
    const s2 = { name: 'B', description: '', matchedKeywords: ['soil', 'water'] };
    const result = summariseResults('soil carbon water', [s1, s2]);
    // 'soil' should appear only once
    const soilCount = (result.overallSummary.match(/soil/g) || []).length;
    expect(soilCount).toBe(1);
  });

  test('reason caps at 3 matched keywords', () => {
    const s = {
      name: 'Scheme',
      description: '',
      matchedKeywords: ['soil', 'hedgerows', 'biodiversity', 'carbon']
    };
    const result = summariseResults('test', [s]);
    // Should mention first 3 but not the 4th
    expect(result.bestMatch.reason).toContain('soil');
    expect(result.bestMatch.reason).toContain('hedgerows');
    expect(result.bestMatch.reason).toContain('biodiversity');
    expect(result.bestMatch.reason).not.toContain('carbon');
  });
});
