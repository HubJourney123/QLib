// app/api/questions/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const paperId = searchParams.get('paperId');
    
    let where = {};
    if (paperId) {
      where = { questionPaperId: paperId };
    } else if (courseId) {
      where = { questionPaper: { courseId } };
    }
    
    const questions = await prisma.question.findMany({
      where,
      include: {
        questionPaper: {
          include: {
            course: true
          }
        }
      },
      orderBy: [
        { questionPaper: { year: 'desc' } },
        { questionNumber: 'asc' }
      ]
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { courseId, questionPaperData } = await request.json();
    
    // Create or update question paper
    const paper = await prisma.questionPaper.upsert({
      where: {
        courseId_year_examType: {
          courseId,
          year: questionPaperData.year,
          examType: questionPaperData.examType
        }
      },
      update: {
        semester: questionPaperData.semester,
        courseCode: questionPaperData.courseCode,
        courseTitle: questionPaperData.courseTitle
      },
      create: {
        year: questionPaperData.year,
        semester: questionPaperData.semester,
        courseCode: questionPaperData.courseCode,
        courseTitle: questionPaperData.courseTitle,
        examType: questionPaperData.examType,
        courseId
      }
    });
    
    // Delete existing questions for this paper if updating
    await prisma.question.deleteMany({
      where: { questionPaperId: paper.id }
    });
    
    // Create new questions
    const questions = await prisma.question.createMany({
      data: questionPaperData.questions.map(q => ({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks || null,
        tag: q.tag,
        topic: q.topic || null,
        questionPaperId: paper.id
      }))
    });
    
    return NextResponse.json({
      message: 'Question paper uploaded successfully',
      paperId: paper.id,
      questionsCreated: questions.count
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to upload questions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const paperId = searchParams.get('paperId');
    
    if (paperId) {
      // Delete entire question paper
      await prisma.questionPaper.delete({
        where: { id: paperId }
      });
      return NextResponse.json({ message: 'Question paper deleted successfully' });
    } else if (id) {
      // Delete individual question
      await prisma.question.delete({
        where: { id }
      });
      return NextResponse.json({ message: 'Question deleted successfully' });
    }
    
    return NextResponse.json(
      { error: 'No ID provided' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
