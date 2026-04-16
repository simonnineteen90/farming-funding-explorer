'use strict';

const { CopilotClient, approveAll } = require('@github/copilot-sdk');
const logger = require('../logger');

const ERROR_CODES = Object.freeze({
  INVALID_INPUT: 'INVALID_INPUT',
  DISALLOWED_INPUT: 'DISALLOWED_INPUT',
  MISSING_TOKEN: 'MISSING_TOKEN',
  INVALID_RESPONSE_FORMAT: 'INVALID_RESPONSE_FORMAT',
  RUNTIME_FAILURE: 'RUNTIME_FAILURE',
  SESSION_DISCONNECT_FAILED: 'SESSION_DISCONNECT_FAILED'
});

const DISALLOWED_PATTERNS = [
  /\b(ignore|forget|override|disregard|bypass)\b.{0,50}\b(instruction|rule|guardrail|system|policy|prompt)\b/i,
  /\b(jailbreak|prompt injection)\b/i,
  /\b(system prompt|developer message)\b/i,
  /\b(act as|pretend to be)\b.{0,40}\b(system|developer|admin)\b/i,
  /\b(call|invoke|execute|run)\b.{0,40}\b(function|tool|command|api)\b/i,
  /\b(show|reveal|print|dump|expose|read|access)\b.{0,60}\b(secret|token|password|credential|api key|environment variable|env var|private data|filesystem)\b/i
];

const MAX_INPUT_LENGTH = 1500;
const RESPONSE_TIMEOUT_MS = 30000;

const BASE_SYSTEM_PROMPT = [
  'You extract search keywords for farming and land management funding in England.',
  'Return only a JSON array of lowercase keyword strings.',
  'Do not include markdown, explanations, or any text outside the JSON array.',
  'Do not request tools, files, or external data.'
].join(' ');

class CopilotServiceError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.name = 'CopilotServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
  }
}

let client;
let activeToken;

function getGithubToken() {
  return (
    process.env.COPILOT_GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.COPILOT_KEY
  );
}

function getCopilotModel() {
  return process.env.COPILOT_MODEL || 'gpt-5-mini';
}

function validateNaturalLanguageInput(input) {
  if (typeof input !== 'string') {
    return {
      valid: false,
      reasonCode: ERROR_CODES.INVALID_INPUT,
      message: 'Enter what you need funding for.'
    };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      reasonCode: ERROR_CODES.INVALID_INPUT,
      message: 'Enter what you need funding for.'
    };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      reasonCode: ERROR_CODES.INVALID_INPUT,
      message: 'Enter a shorter request (up to 1500 characters).'
    };
  }

  const isDisallowed = DISALLOWED_PATTERNS.some(pattern => pattern.test(trimmed));
  if (isDisallowed) {
    return {
      valid: false,
      reasonCode: ERROR_CODES.DISALLOWED_INPUT,
      message: 'Your request includes disallowed instructions and cannot be processed.'
    };
  }

  return { valid: true };
}

function buildKeywordPrompt(input) {
  return [
    'Extract concise search keywords from this farmer request.',
    'Return ONLY a JSON array of 3 to 8 lowercase strings.',
    'Include only terms useful for matching funding schemes.',
    '',
    'Farmer request:',
    input
  ].join('\n');
}

function parseKeywordArrayResponse(content) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const payload = fencedMatch ? fencedMatch[1].trim() : trimmed;

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    throw new CopilotServiceError(
      ERROR_CODES.INVALID_RESPONSE_FORMAT,
      'Copilot response was not valid JSON.',
      error
    );
  }

  if (!Array.isArray(parsed) || parsed.some(item => typeof item !== 'string')) {
    throw new CopilotServiceError(
      ERROR_CODES.INVALID_RESPONSE_FORMAT,
      'Copilot response must be a JSON array of strings.'
    );
  }

  const keywords = parsed
    .map(keyword => keyword.trim().toLowerCase().replace(/\s+/g, ' '))
    .filter(Boolean);

  if (keywords.length === 0) {
    throw new CopilotServiceError(
      ERROR_CODES.INVALID_RESPONSE_FORMAT,
      'Copilot response must include at least one keyword.'
    );
  }

  return [...new Set(keywords)];
}

function getCopilotClient(token) {
  if (!client || activeToken !== token) {
    client = new CopilotClient({
      githubToken: token,
      useLoggedInUser: false,
      logLevel: 'error'
    });
    activeToken = token;
  }

  return client;
}

function getAssistantContent(response) {
  const content = response && response.data && response.data.content;
  if (typeof content !== 'string' || content.trim() === '') {
    throw new CopilotServiceError(
      ERROR_CODES.INVALID_RESPONSE_FORMAT,
      'Copilot did not return message content.'
    );
  }

  return content;
}

function asCopilotServiceError(error) {
  if (error instanceof CopilotServiceError) {
    return error;
  }

  return new CopilotServiceError(
    ERROR_CODES.RUNTIME_FAILURE,
    'Copilot keyword extraction failed.',
    error
  );
}

async function extractKeywordsWithCopilot(input) {
  const validation = validateNaturalLanguageInput(input);
  if (!validation.valid) {
    throw new CopilotServiceError(validation.reasonCode, validation.message);
  }

  const token = getGithubToken();
  if (!token) {
    throw new CopilotServiceError(
      ERROR_CODES.MISSING_TOKEN,
      'No GitHub token was provided for Copilot.'
    );
  }

  const model = getCopilotModel();
  logger.info('copilot', 'copilot.session.starting', { model, inputLength: input.length });

  const copilotClient = getCopilotClient(token);
  const session = await copilotClient.createSession({
    model,
    onPermissionRequest: approveAll,
    availableTools: [],
    systemMessage: {
      mode: 'append',
      content: BASE_SYSTEM_PROMPT
    }
  });

  const prompt = buildKeywordPrompt(input);
  logger.debug('copilot', 'copilot.prompt.sent', { prompt });

  let operationError = null;
  let keywords = [];
  try {
    const response = await session.sendAndWait(
      { prompt },
      RESPONSE_TIMEOUT_MS
    );
    const rawContent = getAssistantContent(response);
    logger.debug('copilot', 'copilot.response.received', { rawContent });
    keywords = parseKeywordArrayResponse(rawContent);
    logger.info('copilot', 'copilot.keywords.extracted', { keywords });
  } catch (error) {
    operationError = asCopilotServiceError(error);
    logger.error('copilot', 'copilot.error', {
      code: operationError.code,
      message: operationError.message,
      cause: operationError.cause ? String(operationError.cause) : undefined
    });
  }

  let disconnectError = null;
  try {
    await session.disconnect();
  } catch (error) {
    disconnectError = error;
  }

  if (operationError) {
    throw operationError;
  }

  if (disconnectError) {
    throw new CopilotServiceError(
      ERROR_CODES.SESSION_DISCONNECT_FAILED,
      'Copilot session cleanup failed.',
      disconnectError
    );
  }

  return keywords;
}

function __resetClientForTests() {
  client = null;
  activeToken = null;
}

module.exports = {
  ERROR_CODES,
  CopilotServiceError,
  getGithubToken,
  getCopilotModel,
  validateNaturalLanguageInput,
  parseKeywordArrayResponse,
  extractKeywordsWithCopilot,
  __resetClientForTests
};
