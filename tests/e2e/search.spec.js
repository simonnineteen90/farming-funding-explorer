const { test, expect } = require('@playwright/test');

const searchLabel = 'Describe your farm and what you need funding for';

test.describe('Page load', () => {
  test('renders the search form with the correct heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find funding for your farm');
  });

  test('text input and submit button are present', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel(searchLabel)).toBeVisible();
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

    await page.getByLabel(searchLabel).fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('heading', { name: /schemes found/i })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Slurry Infrastructure' })).toBeVisible();
  });
});

test.describe('Keyword search — no match', () => {
  test('searching nonsense term shows no results message', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(searchLabel).fill('xyzzy123');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('No schemes found.')).toBeVisible();
  });
});

test.describe('Input persistence', () => {
  test('input field retains submitted value after search', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(searchLabel).fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByLabel(searchLabel)).toHaveValue('slurry');
  });
});

test.describe('Results structure', () => {
  test('each result has a scheme name link, status tag, and funding info', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(searchLabel).fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    const firstResult = page.locator('main section').first();

    await expect(firstResult.getByRole('link')).toBeVisible();

    await expect(firstResult.locator('.govuk-tag')).toBeVisible();

    await expect(firstResult.getByText('Funding:')).toBeVisible();
  });
});

test.describe('Status controls', () => {
  test('results are sorted by status with open first and closed last', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(searchLabel).fill('farm');
    await page.getByRole('button', { name: 'Search' }).click();

    const statuses = await page.locator('main section .govuk-tag').allTextContents();
    const statusPriority = {
      Open: 0,
      'By invitation': 1,
      Closed: 2
    };

    const priorities = statuses.map((status) => statusPriority[status.trim()] ?? 1);

    for (let i = 1; i < priorities.length; i += 1) {
      expect(priorities[i - 1]).toBeLessThanOrEqual(priorities[i]);
    }
  });

  test('status filters return only selected statuses', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(searchLabel).fill('farm');
    await page.evaluate(() => {
      const openStatusInput = document.querySelector('input[name="status"][value="open"]');

      if (openStatusInput) {
        openStatusInput.checked = true;
      }
    });
    await page.getByRole('button', { name: 'Search' }).click();

    const statuses = await page.locator('main section .govuk-tag').allTextContents();

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every((status) => status.trim() === 'Open')).toBeTruthy();
    await expect(page.getByLabel('Open')).toBeChecked();
  });
});
