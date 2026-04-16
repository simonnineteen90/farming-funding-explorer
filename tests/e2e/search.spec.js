const { test, expect } = require('@playwright/test');

test.describe('Page load', () => {
  test('renders the search form with the correct heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find funding for your farm');
  });

  test('text input and submit button are present', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('Describe your farm and what you need funding for')).toBeVisible();
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

    await page.getByLabel('Describe your farm and what you need funding for').fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('heading', { name: 'schemes found' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Slurry Infrastructure' })).toBeVisible();
  });
});

test.describe('Keyword search — no match', () => {
  test('searching nonsense term shows no results message', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Describe your farm and what you need funding for').fill('xyzzy123');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('No schemes found.')).toBeVisible();
  });
});

test.describe('Input persistence', () => {
  test('input field retains submitted value after search', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Describe your farm and what you need funding for').fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByLabel('Describe your farm and what you need funding for')).toHaveValue('slurry');
  });
});

test.describe('Results structure', () => {
  test('each result has a scheme name link, status tag, and funding info', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Describe your farm and what you need funding for').fill('slurry');
    await page.getByRole('button', { name: 'Search' }).click();

    const firstResult = page.locator('main section').first();

    await expect(firstResult.getByRole('link')).toBeVisible();

    await expect(firstResult.locator('.govuk-tag')).toBeVisible();

    await expect(firstResult.getByText('Funding:')).toBeVisible();
  });
});

test.describe('Edge cases', () => {
  test('XSS input is reflected as escaped text', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Describe your farm and what you need funding for').fill('<img src=x onerror=alert(1)>');
    await page.getByRole('button', { name: 'Search' }).click();

    const textareaValue = await page.getByLabel('Describe your farm and what you need funding for').inputValue();
    expect(textareaValue).toContain('<img');

    const html = await page.content();
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img');
  });

  test('very long input is truncated to 1000 characters', async ({ page }) => {
    await page.goto('/');

    const longInput = 'a'.repeat(5000);
    await page.getByLabel('Describe your farm and what you need funding for').fill(longInput);
    await page.getByRole('button', { name: 'Search' }).click();

    const textareaValue = await page.getByLabel('Describe your farm and what you need funding for').inputValue();
    expect(textareaValue.length).toBeLessThanOrEqual(1000);
  });

  test('special characters only shows no schemes found', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Describe your farm and what you need funding for').fill('!!!@@@###$$$');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('No schemes found.')).toBeVisible();
  });

  test('rapid repeated submissions all succeed', async ({ page }) => {
    await page.goto('/');

    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Describe your farm and what you need funding for').fill('soil');
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('heading', { name: 'schemes found' })).toBeVisible();
    }
  });

  test('404 page shows friendly error', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');

    expect(response.status()).toBe(404);
    await expect(page.getByText('There is a problem')).toBeVisible();
    await expect(page.getByText('Page not found.')).toBeVisible();
  });
});
