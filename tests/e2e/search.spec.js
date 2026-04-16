const { test, expect } = require('@playwright/test');

test.describe('Page load', () => {
  test('renders the search form with the correct heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find funding for your farm');
  });

  test('text input and submit button are present', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('What do you need funding for?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('no results section is shown on initial load', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('schemes found')).not.toBeVisible();
    await expect(page.getByText('No schemes found.')).not.toBeVisible();
  });
});

test.describe('Empty query submission', () => {
  test('submitting empty input does not show results', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('schemes found')).not.toBeVisible();
    await expect(page.getByText('No schemes found.')).not.toBeVisible();
  });
});

test.describe('Keyword search — positive match', () => {
  test('searching "slurry" returns matching results', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('What do you need funding for?').fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('heading', { level: 2 })).toContainText('schemes found');

    await expect(page.getByRole('link', { name: 'Slurry Infrastructure' })).toBeVisible();
  });
});

test.describe('Keyword search — no match', () => {
  test('searching nonsense term shows no results message', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('What do you need funding for?').fill('xyzzy123');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('No schemes found.')).toBeVisible();
  });
});

test.describe('Input persistence', () => {
  test('input field retains submitted value after search', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('What do you need funding for?').fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByLabel('What do you need funding for?')).toHaveValue('slurry');
  });
});

test.describe('Results structure', () => {
  test('each result has a scheme name link, status tag, and funding info', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('What do you need funding for?').fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    const firstResult = page.locator('main section').first();

    await expect(firstResult.getByRole('link')).toBeVisible();

    await expect(firstResult.locator('.govuk-tag')).toBeVisible();

    await expect(firstResult.getByText('Funding:')).toBeVisible();
  });
});
