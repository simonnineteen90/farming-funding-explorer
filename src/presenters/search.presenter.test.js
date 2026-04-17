'use strict';

const { presentSearchPage, presentScheme } = require('./search.presenter');

describe('presentScheme URL allowlisting', () => {
  test('preserves valid gov.uk URL', () => {
    const result = presentScheme({
      name: 'Test',
      description: 'Desc',
      grantValue: '£1000',
      url: 'https://www.gov.uk/guidance/funding',
      status: 'open'
    });
    expect(result.url).toBe('https://www.gov.uk/guidance/funding');
  });

  test('replaces javascript: URI with #', () => {
    const result = presentScheme({
      name: 'Test',
      url: 'javascript:alert(1)',
      status: 'open'
    });
    expect(result.url).toBe('#');
  });

  test('replaces external URL with #', () => {
    const result = presentScheme({
      name: 'Test',
      url: 'https://evil.com/phish',
      status: 'open'
    });
    expect(result.url).toBe('#');
  });

  test('replaces data: URI with #', () => {
    const result = presentScheme({
      name: 'Test',
      url: 'data:text/html,<script>alert(1)</script>',
      status: 'open'
    });
    expect(result.url).toBe('#');
  });

  test('defaults to # when URL is missing', () => {
    const result = presentScheme({
      name: 'Test',
      status: 'open'
    });
    expect(result.url).toBe('#');
  });

  test('defaults to # when URL is empty string', () => {
    const result = presentScheme({
      name: 'Test',
      url: '',
      status: 'open'
    });
    expect(result.url).toBe('#');
  });
});

describe('presentScheme matchedKeywords', () => {
  test('passes through matchedKeywords array', () => {
    const result = presentScheme({
      name: 'Test',
      url: 'https://www.gov.uk/test',
      status: 'open',
      matchedKeywords: ['soil', 'hedgerows']
    });
    expect(result.matchedKeywords).toEqual(['soil', 'hedgerows']);
  });

  test('defaults matchedKeywords to empty array when missing', () => {
    const result = presentScheme({ name: 'Test', status: 'open' });
    expect(result.matchedKeywords).toEqual([]);
  });

  test('defaults matchedKeywords to empty array when not an array', () => {
    const result = presentScheme({ name: 'Test', status: 'open', matchedKeywords: 'soil' });
    expect(result.matchedKeywords).toEqual([]);
  });
});

describe('presentSearchPage summary', () => {
  test('passes summary through to view model', () => {
    const summary = { bestMatch: { name: 'SFI', reason: 'Matches soil.' }, overallSummary: 'We found 1 scheme.' };
    const result = presentSearchPage({ input: 'soil', schemes: [], summary });
    expect(result.summary).toEqual(summary);
  });

  test('summary defaults to null when not provided', () => {
    const result = presentSearchPage({ input: 'soil', schemes: [] });
    expect(result.summary).toBeNull();
  });
});

describe('presentSearchPage', () => {
  test('handles non-string input gracefully', () => {
    const result = presentSearchPage({ input: 123, schemes: [] });
    expect(result.input).toBe('');
    expect(result.searched).toBe(false);
  });

  test('handles non-array schemes gracefully', () => {
    const result = presentSearchPage({ input: 'test', schemes: null });
    expect(result.schemes).toEqual([]);
    expect(result.resultCount).toBe(0);
  });
});
