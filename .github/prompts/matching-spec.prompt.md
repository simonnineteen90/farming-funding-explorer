# Farming Funding Matcher Spec

## Goal
Turn a farmer's free-text description into ranked funding schemes with clear reasons, eligibility checks, and confidence.

## Data Structure
All data files use the same canonical scheme IDs as a single source of truth.

### ID Standardization
- **Single canonical ID per scheme** used consistently across:
  - `data/formatted-data.json` — scheme status, dates, values, source URLs, descriptions
  - `data/scheme-keywords.json` — intent keywords and phrase hints
  - `test_cases.json` — labeled evaluation test data
- No mapping layer required—direct joins on ID
- IDs follow kebab-case: `sustainable-farming-incentive`, `capital-grants`, etc.

## Required Canonical Model
All matching should be done against one canonical scheme record per scheme.

Core fields:
- canonicalId
- displayName
- aliases.idAliases[]
- aliases.nameAliases[]
- status.currentStatus (open, closed, opening_soon, invitation_only, unknown)
- status.openDateIso (optional)
- status.closeDateIso (optional)
- eligibility.geography[]
- eligibility.requiresInvitation (boolean)
- eligibility.enterpriseTypes[]
- eligibility.livestockTypes[]
- eligibility.landFeatures[]
- eligibility.minAreaHectares (optional)
- eligibility.maxAreaHectares (optional)
- funding.minGrantGbp (optional)
- funding.maxGrantGbp (optional)
- keywords[]
- source.primaryUrl
- source.lastVerifiedAt

## Matching Pipeline
1. Normalize input
- Lowercase, remove punctuation noise, normalize units, singular/plural normalization.
- Expand synonyms (for example: hens -> poultry layers, river -> watercourse).

2. Feature extraction from farmer text
- Land size and units
- Geography and protected designations
- Enterprise type (arable, dairy, poultry, mixed, forestry)
- Livestock and crop entities
- Intent (productivity, housing upgrade, water management, animal welfare, woodland)
- Constraints (budget, timing, existing agreements, invitation status)

3. Candidate retrieval
- Keyword overlap score using weighted keywords.
- Optional semantic similarity score from description text.
- Keep top N candidates before rules (for example N=12).

4. Rule filtering and penalties
- Hard fail when scheme is closed, out of geography, or invitation-only without invitation.
- Hard fail on minimum area threshold where applicable.
- Soft penalty when data is missing or ambiguous.

5. Final scoring
Recommended score formula:
- finalScore = 0.45 * intentScore + 0.35 * eligibilityScore + 0.20 * timingScore

Score guidance:
- >= 0.75: Strong match
- 0.55-0.74: Possible match (ask follow-up)
- < 0.55: Low confidence (do not recommend by default)

6. Output contract
For each suggested scheme include:
- canonicalId
- name
- confidenceScore
- recommendationBand
- reasonsMatched[]
- failedChecks[]
- missingInfo[]
- currentStatus
- keyDates
- sourceUrl

## Follow-up Question Strategy
If any high-impact field is missing, ask targeted questions before final recommendations:
- Which county or location in England?
- Are you in a National Park or an Area of Outstanding Natural Beauty?
- Main farm enterprises and livestock types?
- Planned project type and approximate budget?
- Have you received an invitation for invitation-only schemes?

## Evaluation Plan
Build a labeled evaluation set with realistic farmer statements.

Metrics:
- Precision at 3
- Recall at 5
- Incorrect-open-rate (closed or ineligible schemes returned as recommended)
- Explainability completeness (recommendations with at least one reason and one eligibility check)

Suggested targets:
- Precision at 3 >= 0.80
- Incorrect-open-rate <= 0.02

## Iteration Roadmap
Phase 1:
- Canonical IDs and alias mapping.
- Rule engine for status, geography, invitation, and size limits.
- Explainable output with confidence bands.

Phase 2:
- Synonym dictionary and typo tolerance.
- Weighted keyword tuning from evaluation set.
- Better date parsing and schedule-awareness.

Phase 3:
- Add semantic retrieval.
- Feedback loop from accepted/rejected recommendations.
- Monthly refresh from GOV.UK updates.
