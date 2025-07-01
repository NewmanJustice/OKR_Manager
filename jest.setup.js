require('@testing-library/jest-dom');

import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for undici
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill ReadableStream, WritableStream, TransformStream for undici
require('web-streams-polyfill/dist/polyfill.js');

// Polyfill MessagePort for undici
try {
  global.MessagePort = require('worker_threads').MessagePort;
} catch (e) {
  // worker_threads may not be available in all environments
}

// Polyfill fetch, Request, Response, Headers for Node.js (Jest)
const { fetch, Request, Response, Headers } = require('undici');
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
