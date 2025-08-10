// app/api/search/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        department: {
          include: {
            university: true
          }
        },
        papers: {
          select: {
            year: true,
            examType: true
          },
          distinct: ['year']
        }
      },
      take: 10
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}