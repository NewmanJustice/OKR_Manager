// src/utils/cors.ts
import { NextResponse } from 'next/server';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Change to your frontend URL in production
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function withCORSHeaders(headers: HeadersInit = {}) {
  return { ...headers, ...CORS_HEADERS };
}

export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
