'use strict';

const { presentSearchPage } = require('./search.presenter');

describe('presentSearchPage', () => {
  test('sets result links to open in a new tab with safe rel attributes', () => {
    const viewModel = presentSearchPage({
      input: 'slurry',
      schemes: [
        {
          name: 'Slurry Infrastructure',
          description: 'A scheme for slurry infrastructure',
          grantValue: 'Up to £250,000',
          url: 'https://www.gov.uk/example',
          status: 'open'
        }
      ]
    });

    expect(viewModel.schemes).toHaveLength(1);
    expect(viewModel.schemes[0].linkTarget).toBe('_blank');
    expect(viewModel.schemes[0].linkRel).toBe('noopener noreferrer');
  });
});
