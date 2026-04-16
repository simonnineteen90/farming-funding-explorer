# Farming Funding Explorer

A Node.js + Express service and GOV.UK-style frontend prototype that helps farmers find relevant funding schemes.

## Prerequisites

- Node.js 18+ (or current LTS)
- npm

## Install

```bash
npm ci
```

## Run locally

```bash
npm start
```

The app runs at `http://localhost:3000`.

## How it works

- The service loads scheme data from `data/formatted-data.json` at startup.
- `POST /search` returns matched schemes from the dataset, ranked by relevance to the submitted input.
- The frontend in `public/` submits the search text and renders results.

## API

### `POST /search`

Request body:

```json
{
  "input": "improving soil health"
}
```

Response:

```json
[
  {
    "name": "Scheme name",
    "description": "Short description",
    "keywords": ["soil health", "hedgerows"],
    "funding": "Up to £X",
    "dates": "Open now",
    "link": "https://www.gov.uk/..."
  }
]
```
