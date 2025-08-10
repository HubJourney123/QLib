// src/app/api/auth/check/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-simple';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  return NextResponse.json({ 
    authenticated: true, 
    user: session 
  });
}