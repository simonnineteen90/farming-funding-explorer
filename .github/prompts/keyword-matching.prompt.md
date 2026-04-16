# Overview
Implement matching logic when a user submits keywords from the frontend so that they are returned with the 5 most relevant funding schemes from the dataset.

## Reference 
Use the matching-spec.prompt.md for the matching logic and the generate-instructions.prompt.md for the overall architecture and data flow.

## Implementation Steps
1. create a new services folder with a `match-to-schemes.js` file
2. extract the keywords from the post request and pass them to the matching function
3. implement the matching logic as per the matching-spec.prompt.md
4. return the matched schemes to the frontend
5. write tests for the matching spec prompt.md
