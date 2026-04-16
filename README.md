# Farming Funding Explorer

A web app that helps farmers and land managers in England find relevant government funding schemes by describing their goals in plain English.

## The problem

Farmers and landowners struggle to find relevant funding schemes because [GOV.UK](https://www.gov.uk) search requires specific terminology they may not know. A farmer who wants to "improve biodiversity" or "invest in equipment" shouldn't need to know the name of every grant programme to find what's available to them.

### Target user

- Farmers and land managers in England
- Limited familiarity with GOV.UK terminology
- Have a goal (e.g. improve biodiversity, reduce slurry runoff, plant trees) but don't know scheme names

## How it works

1. The user describes their farm and what they need funding for in a free-text textarea
2. The app tokenises the input and scores it against 21 curated GOV.UK funding schemes using keyword matching
3. The top 5 matching schemes are returned, each showing the scheme name, status (open/closed/by invitation), description, funding amount, and a direct link to GOV.UK

## Tech stack

| Component      | Technology                          |
| -------------- | ----------------------------------- |
| Backend        | Node.js + Express                   |
| Templating     | Nunjucks                            |
| Frontend       | GOV.UK Frontend v5 (vanilla JS)     |
| Data           | Static JSON (no database)           |
| Unit tests     | Jest                                |
| E2E tests      | Playwright                          |

No frontend frameworks, no build step, no database. Progressive enhancement — the form works without JavaScript.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended)

### Install and run

```bash
npm install
npm start
```

Visit [http://localhost:3000](http://localhost:3000).

### Run tests

```bash
# Unit tests (matching logic)
npm test

# End-to-end tests (requires the server to be running, or Playwright starts it)
npm run test:e2e
```

## Project structure

```
src/
├── server.js                        # Express server, Nunjucks config
├── routes/
│   └── search.route.js              # GET / and POST /search
├── services/
│   ├── search.service.js            # Loads data, delegates to matcher
│   ├── match-to-schemes.js          # Core matching algorithm
│   └── match-to-schemes.test.js     # Unit tests for matching
├── presenters/
│   └── search.presenter.js          # Formats results for display
├── views/
│   └── search.njk                   # GOV.UK Frontend template
└── data/
    ├── formatted-data.json          # 21 funding schemes
    └── scheme-keywords.json         # Keyword mappings per scheme
tests/
└── e2e/
    └── search.spec.js               # Playwright E2E tests
test_cases.json                      # 10 labeled test cases with expected matches
```

## Data

The dataset contains **21 funding schemes** sourced from the [GOV.UK Funding for Farmers](https://www.gov.uk/guidance/funding-for-farmers) guidance page (snapshot: 31 March 2026).

Each scheme includes:

| Field          | Description                                      |
| -------------- | ------------------------------------------------ |
| `id`           | URL-friendly identifier                          |
| `name`         | Scheme name                                      |
| `category`     | Grouping (e.g. "Manage your land")               |
| `status`       | `open`, `closed`, or `by_invitation`             |
| `description`  | Short summary                                    |
| `url`          | Direct link to GOV.UK                            |
| `grantValue`   | Funding amount or "amounts vary"                 |
| `openDate`     | When applications open (if known)                |
| `closingDate`  | Application deadline (if known)                  |

Each scheme also has a curated set of 15–45 keywords in `scheme-keywords.json`, covering the language farmers actually use (e.g. "hedgerows", "slurry", "dairy", "tree planting").

## Architecture

### Request flow

```
User input → POST /search → searchService → matchToSchemes() → presenter → Nunjucks template → HTML
```

**Route** receives the form submission, **Service** loads data and delegates to the matcher, **Presenter** transforms results for display (status tag colours, formatting), **View** renders GOV.UK-styled HTML.

### Matching algorithm

The core logic lives in `src/services/match-to-schemes.js`:

1. **Normalise** — input is lowercased, punctuation stripped, split into tokens (single-character tokens filtered out)
2. **Score** — each scheme is scored by counting token matches against its keyword set:
   - Exact match for single-word keywords
   - Phrase matching for multi-word keywords (e.g. "soil health")
   - Prefix matching for keywords ≥ 4 characters (e.g. "river" matches "riverbank")
3. **Deduplicate** — each input token contributes a maximum of 1 point to prevent score inflation
4. **Rank** — schemes are sorted by score descending; top 5 returned

## Environment variables

| Variable   | Default | Description       |
| ---------- | ------- | ----------------- |
| `PORT`     | `3000`  | Server port       |
| `NODE_ENV` | —       | Set to `production` to enable template caching |

No `.env` file needed — the app works out of the box.

## Hackathon prototype

This was built as a hackathon prototype. It is a working MVP but is not production-hardened — there is no authentication, no analytics, no rate limiting, and the dataset is a static snapshot.
