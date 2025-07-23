require('@testing-library/jest-dom');

// jest.setup.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
  },
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

global.mockPrisma = mockPrisma;

global.Request = class Request {
  constructor(input, init) {
    this.input = input;
    this.init = init;
    this.headers = {
      get: () => null,
    };
  }
  async json() { return {}; }
};

global.Response = class Response {
  constructor(body = {}, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new Map();
    this.redirected = false;
    this.statusText = "OK";
    this.type = "default";
    this.url = "";
    this.bodyUsed = false;
  }
  async json() { return this.body; }
  async arrayBuffer() { return new ArrayBuffer(0); }
  async blob() { return new Blob(); }
  async formData() { return new FormData(); }
  async text() { return ""; }
  clone() { return this; }
};

const nextServer = require('next/server');

nextServer.NextResponse.json = (data, init) => ({
  status: init?.status || 200,
  json: async () => data,
});