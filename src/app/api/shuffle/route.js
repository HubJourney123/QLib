// app/api/shuffle/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { courseId, years } = await request.json();
    
    // Fetch all questions from selected years
    const papers = await prisma.questionPaper.findMany({
      where: {
        courseId,
        year: years ? { in: years } : undefined
      },
      include: {
        questions: true,
        course: true
      }
    });
    
    if (papers.length === 0) {
      return NextResponse.json(
        { error: 'No question papers found for the selected criteria' },
        { status: 404 }
      );
    }
    
    // Group questions by question number pattern (1(a), 1(b), 2(a), etc.)
    const questionGroups = {};
    papers.forEach(paper => {
      paper.questions.forEach(question => {
        const mainNumber = question.questionNumber.match(/^\d+/)?.[0];
        if (!questionGroups[mainNumber]) {
          questionGroups[mainNumber] = {};
        }
        if (!questionGroups[mainNumber][question.questionNumber]) {
          questionGroups[mainNumber][question.questionNumber] = [];
        }
        questionGroups[mainNumber][question.questionNumber].push({
          ...question,
          year: paper.year,
          examType: paper.examType
        });
      });
    });
    
    // Shuffle and pick questions
    const shuffledPaper = {
      courseCode: papers[0].courseCode,
      courseTitle: papers[0].courseTitle,
      course: papers[0].course,
      semester: papers[0].semester,
      generatedFrom: [...new Set(papers.map(p => p.year))].sort((a, b) => b - a),
      questions: []
    };
    
    // For each main question number, randomly select sub-questions
    Object.keys(questionGroups).sort().forEach(mainNumber => {
      const subQuestions = questionGroups[mainNumber];
      Object.keys(subQuestions).sort().forEach(questionNumber => {
        const availableQuestions = subQuestions[questionNumber];
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        shuffledPaper.questions.push(availableQuestions[randomIndex]);
      });
    });
    
    return NextResponse.json(shuffledPaper);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to generate shuffled paper' },
      { status: 500 }
    );
  }
}

// ===================================
