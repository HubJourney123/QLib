// app/api/universities/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: { departments: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(universities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch universities' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();
    
    const university = await prisma.university.create({
      data: { name, description }
    });
    
    return NextResponse.json(university, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'University with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create university' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name, description } = await request.json();
    
    const university = await prisma.university.update({
      where: { id },
      data: { name, description }
    });
    
    return NextResponse.json(university);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update university' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await prisma.university.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'University deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete university' },
      { status: 500 }
    );
  }
}