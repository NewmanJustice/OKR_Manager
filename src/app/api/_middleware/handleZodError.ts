// Centralized Zod validation error handler for API routes
import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

export function handleZodError(error: unknown) {
  // Log all errors for debugging
  console.error('API error:', error);
  if (error instanceof ZodError) {
    console.error('Zod validation error:', JSON.stringify(error.errors, null, 2));
    return NextResponse.json({
      error: error.errors[0]?.message || 'Invalid input',
      details: error.errors
    }, { status: 400 });
  }
  // For any other error, return the error as string
  return NextResponse.json({
    error: error instanceof Error ? error.message : String(error),
    details: error
  }, { status: 400 });
}
