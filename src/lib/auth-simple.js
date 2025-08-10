// src/lib/auth-simple.js
import { cookies } from 'next/headers';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function getSession() {
  const cookieStore = cookies();
  const adminId = cookieStore.get('adminId')?.value;
  
  if (!adminId) return null;
  
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, username: true }
    });
    return admin;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}