// app/api/courses/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    
    const where = departmentId ? { departmentId } : {};
    
    const courses = await prisma.course.findMany({
      where,
      include: {
        department: {
          include: {
            university: true
          }
        },
        _count: {
          select: { papers: true }
        }
      },
      orderBy: { code: 'asc' }
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { departmentId, courses } = await request.json();
    
    // Parse bulk upload format: "code,name,semester,credits"
    const courseLines = courses.split('\n').map(line => line.trim()).filter(line => line);
    const coursesData = [];
    
    for (const line of courseLines) {
      const [code, name, semester, credits] = line.split(',').map(item => item.trim());
      if (code && name && semester && credits) {
        coursesData.push({
          code,
          name,
          semester: parseInt(semester),
          credits: parseInt(credits),
          departmentId
        });
      }
    }
    
    const createdCourses = await Promise.all(
      coursesData.map(data =>
        prisma.course.create({ data }).catch(error => {
          if (error.code === 'P2002') {
            return { error: `Course "${data.code}" already exists in this department` };
          }
          throw error;
        })
      )
    );
    
    const successful = createdCourses.filter(c => !c.error);
    const failed = createdCourses.filter(c => c.error);
    
    return NextResponse.json({
      message: `Created ${successful.length} courses`,
      successful: successful.length,
      failed: failed.length,
      errors: failed.map(f => f.error)
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create courses' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, code, name, semester, credits } = await request.json();
    
    const course = await prisma.course.update({
      where: { id },
      data: { code, name, semester, credits }
    });
    
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await prisma.course.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}