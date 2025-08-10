// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-simple';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, admin.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Set simple cookie with admin ID
    cookies().set('adminId', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
