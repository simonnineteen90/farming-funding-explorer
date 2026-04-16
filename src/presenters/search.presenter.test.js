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
