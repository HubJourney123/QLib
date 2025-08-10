// app/api/departments/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    
    const where = universityId ? { universityId } : {};
    
    const departments = await prisma.department.findMany({
      where,
      include: {
        university: true,
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { universityId, departments } = await request.json();
    
    // Handle bulk upload (comma-separated)
    const departmentNames = departments.split(',').map(d => d.trim()).filter(d => d);
    
    const createdDepartments = await Promise.all(
      departmentNames.map(name =>
        prisma.department.create({
          data: { name, universityId }
        }).catch(error => {
          if (error.code === 'P2002') {
            return { error: `Department "${name}" already exists` };
          }
          throw error;
        })
      )
    );
    
    const successful = createdDepartments.filter(d => !d.error);
    const failed = createdDepartments.filter(d => d.error);
    
    return NextResponse.json({
      message: `Created ${successful.length} departments`,
      successful: successful.length,
      failed: failed.length,
      errors: failed.map(f => f.error)
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create departments' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name } = await request.json();
    
    const department = await prisma.department.update({
      where: { id },
      data: { name }
    });
    
    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await prisma.department.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}

// ===================================