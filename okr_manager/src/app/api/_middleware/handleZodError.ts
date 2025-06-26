// Centralized Zod validation error handler for API routes
import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

export function handleZodError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: 'Invalid input',
      details: error.errors
    }, { status: 400 });
  }
  throw error;
}
