# Plan: Natural Language Input via Copilot SDK

## Problem

The app currently does direct keyword tokenisation against the scheme dataset. The prompt requires integrating the GitHub Copilot SDK so the user's free-text natural-language input is first sent to Copilot, which extracts a structured keyword array. Those keywords are then fed into the existing `matchToSchemes` function. A plain-keyword fallback must be preserved.

## Approach

- Add `@github/copilot-sdk` and `dotenv` as dependencies
- Create a dedicated `copilot.service.js` with: token helper, input validator, keyword extractor
- Feature-flag the Copilot path behind `USE_COPILOT=true` env var
- Make the search route async; use `searchSchemesFromNaturalLanguage` which tries Copilot then falls back
- Add unit tests for validation and the Copilot service (mocking the SDK)
- Add `.env.example` documenting required env vars
- Verify all existing tests still pass

---

## Todos

1. `install-deps` — Install `@github/copilot-sdk` and `dotenv`
2. `env-example` — Create `.env.example` documenting `COPILOT_GITHUB_TOKEN`, `GH_TOKEN`, `GITHUB_TOKEN`, `COPILOT_KEY`, `USE_COPILOT`
3. `copilot-service` — Create `src/services/copilot.service.js`
   - `getGithubToken()` — reads from env vars in priority order
   - `validateInput(input)` — rejects blank, non-string, and prompt-injection attempts (override/ignore/forget/disregard/jailbreak, attempts to call functions or access data outside scope). Returns `{ valid: boolean, reason?: string }`
   - `extractKeywords(input)` — authenticates Copilot client, sends validated input with a fixed system prompt instructing it to return ONLY a JSON array of keyword strings (model: `gpt-4.1-mini` — note: "gpt5-mini" in the prompt is treated as `gpt-4.1-mini`, the current small GPT model in the SDK). Parses and validates the response is a string[]. Returns `string[]` on success, throws on failure.
   - Export: `{ validateInput, extractKeywords, getGithubToken }`
4. `copilot-service-test` — Create `src/services/copilot.service.test.js`
   - Tests for `validateInput`: blank, non-string, injection phrases, valid input
   - Tests for `extractKeywords`: mock SDK — valid response returns keyword array, non-array response rejected, Copilot unavailable falls through gracefully
5. `search-service-update` — Add `searchSchemesFromNaturalLanguage(input)` async function to `search.service.js`
   - If `USE_COPILOT=true` and token available: call `extractKeywords(input)`, join keywords back to a string, pass to `matchToSchemes`
   - Fallback: call `matchToSchemes(input, ...)` directly (existing behaviour)
   - Export alongside existing `searchSchemes`
6. `route-update` — Update `src/routes/search.route.js` `POST /search` handler to be async, call `searchSchemesFromNaturalLanguage`
7. `verify-tests` — Run `npm test` and confirm all existing + new tests pass

---

## Notes

- The `approveAll` export from the SDK is used for tool-call approval; include it per the prompt example
- System prompt must be explicit: "Return ONLY a JSON array of lowercase keyword strings. Do not include any other text."
- Response validation: `JSON.parse` the content, assert it is an `Array` where every element is a `string`. Reject anything else.
- Injection guard: check for phrases like `ignore`, `forget`, `override`, `disregard`, `jailbreak`, `system prompt`, `pretend`, `act as`, `bypass` — case-insensitive
- The existing `searchSchemes` sync export remains unchanged (used by existing unit tests)
- `dotenv` should be loaded in `server.js` at startup only (not in service files)
