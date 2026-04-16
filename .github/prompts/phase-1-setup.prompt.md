You are helping build a simple prototype for a hackathon. The goal is to create a working skeleton of a web app as quickly as possible.

## Context

We are building a funding finder tool for farmers. In this phase, we are NOT implementing any matching logic yet. We only need a basic end-to-end flow working.

## Requirements (Phase 1 – Setup)

Build a minimal full-stack application with:

### Backend

* Use Node.js with Express
* Create a server running on port 3000
* Add a POST endpoint at `/search`
* The endpoint should return a static list of funding schemes from a local JSON file (`formatted-data.json`)
* Do NOT filter or process input yet
* Just return all schemes

### Data

For data use the `formatted-data.json` file with 3–5 example schemes.

### Frontend

* Use a simple HTML page using nunjucks components where possible.
* Use GOV.UK Frontend styles (CDN is fine)
* Page should include:

  * A form with:

    * A text input (for keywords)
    * A submit button
* On submit:

  * Send a POST request to `/search`
  * Display all the schemes on the returned page

### Results Display

For each scheme, show:

* Title
* Description
* Funding info
* Link

### Structure

Keep the project simple and clear:

* server.js (Express server)
* formatted-data.json (mock data)
* public/

  * index.html
  * main.js (handles form submission and rendering)

### Implementation Notes

* Use `express.json()` middleware
* Serve static files from `/public`
* Use fetch in the frontend to call `/search`
* Keep code simple and readable (no complex patterns)
* Add brief comments where helpful

## Goal

By the end, I should be able to:

1. Run `node server.js`
2. Open the browser
3. Submit the form
4. See a list of schemes returned from the backend

Generate all required files with complete code.
