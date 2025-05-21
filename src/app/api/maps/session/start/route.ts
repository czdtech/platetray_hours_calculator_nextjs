import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const sessionToken = uuidv4();
    return NextResponse.json({ sessionToken }, { status: 200 });
  } catch (error) {
    console.error('Error generating session token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate session token', details: errorMessage }, { status: 500 });
  }
}
