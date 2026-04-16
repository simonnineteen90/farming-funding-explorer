You are helping add Playwright end-to-end tests to an existing Express web app. Set up Playwright and write tests that cover the current UI and search behaviour.

## Context

This is a Node.js + Express app that serves a GOV.UK-styled frontend for finding farming funding schemes in England. It has no frontend framework — just Nunjucks templates rendered server-side.

### Current project structure

```
farming-funding-explorer/
├── src/
│   ├── server.js                    # Express entry point (port 3000)
│   ├── routes/
│   │   └── search.route.js          # GET / and POST /search
│   ├── services/
│   │   └── search.service.js        # Keyword matching against JSON data
│   ├── presenters/
│   │   └── search.presenter.js      # Maps raw schemes to view model
│   ├── views/
│   │   └── search.njk               # GOV.UK-styled Nunjucks template
│   └── data/
│       └── formatted-data.json      # Static list of funding schemes
├── package.json
└── test_cases.json                  # Labelled test cases with expectedMatches
```

### Routes

| Method | Path      | Behaviour                                                                 |
|--------|-----------|---------------------------------------------------------------------------|
| GET    | `/`       | Renders search page with empty input and no results                       |
| POST   | `/search` | Accepts `input` (form field), runs keyword match, renders results on same page |

### Search behaviour (`search.service.js`)

- Normalises input and each scheme's `name`, `description`, `category`, `notes`, `status`, and `grantValue` fields to lowercase
- Returns all schemes when input is empty
- Filters schemes where any field contains the query string as a substring
- No scoring or ranking — simple substring filter

### View model (`search.presenter.js`)

The template receives:

```js
{
  pageTitle: 'Find farming funding',
  input: '<user input>',
  searched: true | false,       // true only when input is non-empty
  resultCount: Number,
  schemes: [
    {
      name: String,
      description: String,
      funding: String,          // from grantValue field
      url: String,
      statusText: String,       // e.g. 'Open', 'Closed', 'By invitation'
      statusClasses: String     // e.g. 'govuk-tag--green'
    }
  ]
}
```

### Key UI elements (from `search.njk`)

- Page title: `Find funding for your farm` (h1 with class `govuk-heading-xl`)
- Form: `method="post" action="/search"`
- Input: `id="search-input"`, `name="input"`, label text `"What do you need funding for?"`
- Submit button: text `"Search"`
- Results heading: `govuk-heading-l` — `"{N} schemes found"`
- No results message: `"No schemes found."`
- Each scheme: `<section>` with an `<h3>` link to `scheme.url`, a GOV.UK tag for status, description paragraph, and funding paragraph
- Results are only shown when `searched` is true (i.e. a non-empty query was submitted)

## Task

### 1. Install and configure Playwright

- Install `@playwright/test` as a dev dependency
- Create a `playwright.config.js` at the project root with:
  - `testDir: './tests/e2e'`
  - `baseURL: 'http://localhost:3000'`
  - A `webServer` block that runs `npm start` and waits for `http://localhost:3000`
  - Use the Chromium browser only for now
- Add a `"test:e2e"` script to `package.json` that runs `playwright test`

### 2. Write end-to-end tests

Create `tests/e2e/search.spec.js` with tests covering:

#### Page load

- `GET /` renders the search form with the correct h1 heading
- The text input and submit button are present
- No results section is shown on initial load (i.e. `searched` is false)

#### Empty query submission

- Submitting the form with an empty input returns all schemes (no filter applied)
- The results section is shown and `resultCount` is greater than 0

#### Keyword search — positive match

- Use the query `"hedgerow"` (or a term present in the dataset)
- Verify the results heading appears with a count > 0
- Verify at least one scheme name or description is visible in the results

#### Keyword search — no match

- Use a query unlikely to match any scheme (e.g. `"xyzzy123"`)
- Verify the "No schemes found." message is shown

#### Input persistence

- After submitting a search, the input field retains the submitted value

#### Results structure

- Each result has a visible scheme name as a link
- Each result has a visible GOV.UK status tag
- Each result has a funding paragraph containing "Funding:"

### 3. Conventions to follow

- Use `page.getByRole`, `page.getByLabel`, `page.getByText` locators in preference to CSS selectors
- Do not start the server manually in tests — rely on the `webServer` config
- Keep tests independent — do not share state between tests
- Do not mock the data layer; test against the real static JSON dataset
