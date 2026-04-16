## MVP 
Problem

Farmers and landowners struggle to find relevant funding schemes because http://GOV.UK  search requires specific terminology they may not know.

Target User

Farmers / land managers in England

Limited familiarity with http://GOV.UK  terminology

Have a goal (e.g. improve biodiversity, invest in equipment) but don’t know scheme names

User Journey

User enters:

List of keywords describing goals (e.g. “soil health”, “hedgerows” “cattle” “pigs”)

System matches input against funding schemes dataset

User sees a ranked list of relevant schemes with key details and links

Must Have (MVP)

Input form (farm or land type free text)

Backend endpoint /search

Static dataset of schemes (JSON)

Matching logic (tag-based)

Results page:

Scheme name

Short description

Key info (dates / funding)

Link to http://GOV.UK 

Follow ons / Nice to have

Smarter ranking/scoring

Filters (e.g. “open now”)

Better input guidance (checkboxes or suggestions)

Accessibility enhancements beyond defaults

Definition of Done

A user can complete the UI by entering a range of keywords and be returned schemes that match these

At least 3–5 schemes are returned based on input

Demo works reliably with seeded example inputs



## Roadmap
Phase 0 - organise dataset

dataset refined to ~ 10 schemes

schema defined and relevant keywords attached to each scheme

schema fields: 
- 

Phase 1 – Setup (Goal: working skeleton ASAP)

Basic Node + Express server

Simple HTML page using http://GOV.UK  Frontend

Submitting form to/search endpoint returning all schemes

Phase 2 – Core Flow

Build form (keyword entry)

Display results on page

Phase 3 – Matching Logic

Implement simple keyword extraction (fallback)

Add tags to dataset

Filter + rank schemes based on tags

Phase 4 – AI Integration

Integrate Copilot SDK (if available)

Replace or augment keyword extraction

Log/visualise extracted keywords (for demo clarity)

Phase 5 – Data Improvements

Refine scheme dataset (dates, funding, links)

Optional: integrate http://GOV.UK  Content API

Phase 6 – Polish & Demo

Improve layout and readability

Add seeded example inputs

Ensure full journey works reliably

Prepare demo walkthrough

## Architecture

Overview

A simple web application that converts user input into keywords and matches them against funding schemes.

Components

Frontend:

HTML + http://GOV.UK  Frontend

Vanilla JavaScript

Form input + results rendering

Backend:

Node.js + Express

API endpoint: POST /search

Data:

Static JSON dataset (schemes.json)

Optional: http://GOV.UK  Content API

AI Layer:

Copilot SDK (optional)

Fallback keyword extraction logic

Data Flow

User submits form

Frontend sends POST /search with input

Backend:

Extracts keywords (AI or fallback)

Matches against dataset

Ranks results

Backend returns results

Frontend renders results list

Key Design Decisions

No database (use static JSON)

AI is optional, not required for core flow

Matching is simple and explainable (tag-based)