---
description: "Use when building, modifying, or extending the farming-funding-explorer app. Covers architecture decisions, stack conventions, data schema, and GOV.UK Frontend patterns."
applyTo: "**"
---
# Farming Funding Explorer – Project Instructions

## Overview

A Node.js web app that helps farmers and land managers in England find relevant funding schemes by entering keywords describing their goals. It matches input against a static JSON dataset and returns ranked results.

## Stack

- **Backend**: Node.js + Express
- **Frontend**: GOV.UK Frontend (Nunjucks templates or plain HTML), Vanilla JavaScript only — no frontend frameworks
- **Data**: Static JSON file (`data/formatted-data.json`) — no database
- **AI layer**: Copilot SDK (optional augmentation, not required for core flow)

## Architecture Rules

- Never introduce a database; always read from the static JSON dataset
- AI/Copilot SDK is an optional layer that augments keyword extraction — always implement a plain keyword fallback first
- Keep AI integration behind a flag or clearly separated so the app works without it
- Matching logic must be simple and explainable: tag-based filtering and ranking

## API

- Single search endpoint: `POST /search`
- Request body: `{ "input": "<free text from user>" }`
- Response: array of matched schemes, ranked by relevance

## Data Schema

Each scheme in the JSON dataset must include:

```json
{
  "name": "Scheme name",
  "description": "Short description (1–2 sentences)",
  "keywords": ["soil health", "hedgerows", "biodiversity"],
  "funding": "Up to £X / rate info",
  "dates": "Opening / closing dates or 'Open now'",
  "link": "https://www.gov.uk/..."
}
```

- `keywords` is the primary matching field — always keep it populated and accurate
- Links must point to GOV.UK

## Frontend Conventions

- Use GOV.UK Frontend components and typography classes
- Form input must be a free-text field (keywords / goals)
- Results page must show: scheme name, short description, key info (dates / funding), and a GOV.UK link
- Use progressive enhancement — core form submission must work without JavaScript

## Matching Logic

1. Normalise user input to lowercase tokens
2. Score each scheme by counting token matches against `keywords`
3. Return schemes with score > 0, sorted descending by score
4. Always return at least 3–5 results for well-formed queries against the seeded dataset

## Target User

Farmers and land managers in England with limited GOV.UK terminology. Write UI copy in plain English — avoid jargon, explain acronyms, and keep labels concise.
