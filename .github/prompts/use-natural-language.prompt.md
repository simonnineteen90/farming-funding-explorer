# Overview 
AI integration with github copilot sdk. The ui now accepts a natural language input from the user. This needs to be processed and passed to copilot to convert in keywords that can be matched against the dataset.

## Example copilot integration
Use this as a start point for integrating with copilot sdk.
The service needs to accept a .env with a copilot token and use that to authenticate with the copilot sdk. The service should then be able to send a prompt to copilot and receive a response.

```
const { CopilotClient, approveAll } = require('@github/copilot-sdk')

let client

function getGithubToken() {
  return (
    process.env.COPILOT_GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.COPILOT_KEY
  )
}
```

## Tasks
1. setup copilot sdk client with authentication
2. create a function that accepts the user input.
3. validate the user input. This needs to be validate that is not trying to call any disallowed functions or access any disallowed data. This is important to prevent any malicious use of the copilot integration. It must not allow prompts that try to override the copilot agents behaviour.
4. define a base system prompt for copilot and set the model to gpt5-mini 
5. handle the response from copilot, this should be in an explicit format of an array of keywords. Any response that do not match should be rejected.
6. once keywords are extracted, pass them to the matching function to get the relevant schemes and return those to the frontend.
7. write tests for the copilot integration, this should include tests for the validation function to ensure that disallowed prompts are rejected and tests for the overall integration to ensure that valid prompts return the expected keywords.
8. edge cases are handled eg blank entries, irrelevant entries, attempts to access disallowed functions or data.

## e2e example
1. user enters a natural language prompt in the frontend, for example "I am a farmer looking for funding to help me transition to organic farming, what schemes are available?"
2. the prompt is sent to the backend and passed to the copilot integration function.
3. the copilot integration function validates the prompt and sends it to copilot.
4. copilot processes the prompt and returns an array of keywords, for example ["organic farming", "transition", "funding"].
5. the keywords are passed to the matching function which returns a list of relevant schemes from the dataset.
6. the relevant schemes are returned to the frontend