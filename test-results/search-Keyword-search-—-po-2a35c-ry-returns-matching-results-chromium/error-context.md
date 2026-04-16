# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.js >> Keyword search — positive match >> searching "slurry" returns matching results
- Location: tests/e2e/search.spec.js:39:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('heading', { level: 2 })
Expected substring: "schemes found"
Error: strict mode violation: getByRole('heading', { level: 2 }) resolved to 2 elements:
    1) <h2 class="govuk-heading-l">2 schemes found</h2> aka getByRole('heading', { name: 'schemes found' })
    2) <h2 class="govuk-visually-hidden">Prototype information</h2> aka getByRole('heading', { name: 'Prototype information' })

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('heading', { level: 2 })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "GOV.UK" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "GOV.UK" [ref=e6]
      - link "Farming funding explorer" [ref=e20] [cursor=pointer]:
        - /url: /
  - main [ref=e22]:
    - heading "Find funding for your farm" [level=1] [ref=e23]
    - paragraph [ref=e24]: Describe what you need funding for and we will show you relevant schemes.
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]: Describe your farm and what you need funding for
        - generic [ref=e28]: "You can use natural language. For example: 'I have 100 acres of farm with hens and need help improving housing' or 'Mixed farm looking to plant hedgerows and improve soil health'"
        - textbox "Describe your farm and what you need funding for" [ref=e29]: slurry
      - button "Search" [ref=e30] [cursor=pointer]
    - heading "2 schemes found" [level=2] [ref=e31]
    - generic [ref=e32]:
      - heading "Farming Equipment and Technology Fund (FETF)" [level=3] [ref=e33]:
        - link "Farming Equipment and Technology Fund (FETF)" [ref=e34] [cursor=pointer]:
          - /url: https://www.gov.uk/government/collections/farming-investment-fund-fif#farming-equipment-and-technology-fund-(fetf)
      - strong [ref=e35]: Open
      - paragraph [ref=e36]: "The Farming Equipment and Technology Fund (FETF) has 3 grants to help you buy items to:"
      - paragraph [ref=e37]: "Funding: between £1,000 and £25,000 for each grant theme"
      - separator [ref=e38]
    - generic [ref=e39]:
      - heading "Slurry Infrastructure grant (round 2)" [level=3] [ref=e40]:
        - link "Slurry Infrastructure grant (round 2)" [ref=e41] [cursor=pointer]:
          - /url: https://www.gov.uk/government/collections/farming-investment-fund-fif#slurry-infrastructure-grant
      - strong [ref=e42]: Closed
      - paragraph [ref=e43]: Slurry Infrastructure grant.
      - paragraph [ref=e44]: "Funding: between £25,000 and £250,000"
      - separator [ref=e45]
  - contentinfo [ref=e46]:
    - generic [ref=e58]:
      - generic [ref=e59]:
        - heading "Prototype information" [level=2] [ref=e60]
        - list [ref=e61]:
          - listitem [ref=e62]:
            - link "Built for a hackathon prototype" [ref=e63] [cursor=pointer]:
              - /url: "#"
        - img [ref=e64]
        - generic [ref=e66]:
          - text: All content is available under the
          - link "Open Government Licence v3.0" [ref=e67] [cursor=pointer]:
            - /url: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
          - text: ", except where otherwise stated"
      - link "© Crown copyright" [ref=e69] [cursor=pointer]:
        - /url: https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | const INPUT_LABEL = /Describe your farm and what you need funding for/i;
  4  | 
  5  | test.describe('Page load', () => {
  6  |   test('renders the search form with the correct heading', async ({ page }) => {
  7  |     await page.goto('/');
  8  | 
  9  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find funding for your farm');
  10 |   });
  11 | 
  12 |   test('text input and submit button are present', async ({ page }) => {
  13 |     await page.goto('/');
  14 | 
  15 |     await expect(page.getByLabel(INPUT_LABEL)).toBeVisible();
  16 |     await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  17 |   });
  18 | 
  19 |   test('no results section is shown on initial load', async ({ page }) => {
  20 |     await page.goto('/');
  21 | 
  22 |     await expect(page.getByText('schemes found')).not.toBeVisible();
  23 |     await expect(page.getByText('No schemes found.')).not.toBeVisible();
  24 |   });
  25 | });
  26 | 
  27 | test.describe('Empty query submission', () => {
  28 |   test('submitting empty input does not show results', async ({ page }) => {
  29 |     await page.goto('/');
  30 | 
  31 |     await page.getByRole('button', { name: 'Search' }).click();
  32 | 
  33 |     await expect(page.getByText('schemes found')).not.toBeVisible();
  34 |     await expect(page.getByText('No schemes found.')).not.toBeVisible();
  35 |   });
  36 | });
  37 | 
  38 | test.describe('Keyword search — positive match', () => {
  39 |   test('searching "slurry" returns matching results', async ({ page }) => {
  40 |     await page.goto('/');
  41 | 
  42 |     await page.getByLabel(INPUT_LABEL).fill('slurry');
  43 |     await page.getByRole('button', { name: 'Search' }).click();
  44 | 
> 45 |     await expect(page.getByRole('heading', { level: 2 })).toContainText('schemes found');
     |                                                           ^ Error: expect(locator).toContainText(expected) failed
  46 | 
  47 |     await expect(page.getByRole('link', { name: 'Slurry Infrastructure' })).toBeVisible();
  48 |   });
  49 | });
  50 | 
  51 | test.describe('Keyword search — no match', () => {
  52 |   test('searching nonsense term shows no results message', async ({ page }) => {
  53 |     await page.goto('/');
  54 | 
  55 |     await page.getByLabel(INPUT_LABEL).fill('xyzzy123');
  56 |     await page.getByRole('button', { name: 'Search' }).click();
  57 | 
  58 |     await expect(page.getByText('No schemes found.')).toBeVisible();
  59 |   });
  60 | });
  61 | 
  62 | test.describe('Input persistence', () => {
  63 |   test('input field retains submitted value after search', async ({ page }) => {
  64 |     await page.goto('/');
  65 | 
  66 |     await page.getByLabel(INPUT_LABEL).fill('slurry');
  67 |     await page.getByRole('button', { name: 'Search' }).click();
  68 | 
  69 |     await expect(page.getByLabel(INPUT_LABEL)).toHaveValue('slurry');
  70 |   });
  71 | });
  72 | 
  73 | test.describe('Results structure', () => {
  74 |   test('each result has a scheme name link, status tag, and funding info', async ({ page }) => {
  75 |     await page.goto('/');
  76 | 
  77 |     await page.getByLabel(INPUT_LABEL).fill('slurry');
  78 |     await page.getByRole('button', { name: 'Search' }).click();
  79 | 
  80 |     const firstResult = page.locator('main section').first();
  81 | 
  82 |     await expect(firstResult.getByRole('link')).toBeVisible();
  83 | 
  84 |     await expect(firstResult.locator('.govuk-tag')).toBeVisible();
  85 | 
  86 |     await expect(firstResult.getByText('Funding:')).toBeVisible();
  87 |   });
  88 | });
  89 | 
```