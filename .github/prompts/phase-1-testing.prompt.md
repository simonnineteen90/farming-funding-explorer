You are helping add automated testing to a hackathon prototype. Create a plan for adding Vitest unit tests to the existing codebase.

## Context

We have a minimal Express app that serves a GOV.UK-styled frontend for finding farming funding schemes. The current implementation has no tests. We need to add Vitest configuration and unit tests covering the existing backend logic.

### Current project structure

```
farming-funding-explorer/
├── server.js                  # Express server
├── package.json               # Node.js manifest (Express dependency only)
├── data/
│   └── formatted-data.json    # 17 funding schemes (static JSON)
├── public/
│   ├── index.html             # GOV.UK-styled search page
│   └── main.js                # Client-side fetch + result rendering
└── .gitignore
```

### Current backend code (`server.js`)

```js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data', 'formatted-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

app.post('/search', (req, res) => {
  res.json(data.schemes);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### Current `package.json`

```json
{
  "name": "farming-funding-explorer",
  "version": "1.0.0",
  "description": "A tool to help farmers find relevant funding schemes",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0"
  }
}
```

## Requirements

### 1. Vitest configuration

* Install `vitest` and `supertest` as dev dependencies
* Add a `vitest.config.js` at the project root
* Add a `"test"` script to `package.json`

### 2. Refactor `server.js` for testability

The current `server.js` mixes app creation with `app.listen()`. To make the Express app testable with `supertest`, extract the app setup into a separate module so tests can import the app without starting the server.

Suggested approach:
* Create `app.js` — exports the configured Express app (middleware, routes)
* Update `server.js` — imports `app` from `app.js` and calls `app.listen()`

### 3. Unit tests to write

Create a test file at `tests/server.test.js` (or `tests/app.test.js`) covering:

* **POST /search returns 200** — verify the endpoint responds with HTTP 200
* **POST /search returns JSON array** — verify the response body is an array
* **POST /search returns all schemes** — verify the response contains all 17 schemes from the dataset
* **Each scheme has required fields** — verify every returned scheme has `name`, `url`, and `id`
* **POST /search accepts JSON body** — verify the endpoint works when sent `{ "input": "hedgerows" }`
* **GET / serves the HTML page** — verify the static file serving returns the index page with 200

### 4. Implementation notes

* Use `supertest` to make HTTP requests against the Express app without starting the server
* Use `describe` / `it` blocks for clear test organisation
* Keep tests simple — no mocking of the JSON data file needed (it's static and always available)
* Tests should pass with `npm test` and exit cleanly

## Goal

By the end, I should be able to run `npm test` and see all tests pass. The refactor should not change any user-facing behaviour — `node server.js` must still work exactly as before.

Generate all required files and modifications.
