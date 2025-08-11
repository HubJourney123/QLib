// components/QuestionPaper.js
'use client';

import { FiPrinter, FiDownload } from 'react-icons/fi';
import { renderQuestionText } from './MathDisplay';

export default function QuestionPaper({ paper }) {
  if (!paper) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.courseCode}_shuffled_question_paper.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateTextContent = () => {
    let content = `${paper.courseCode} - ${paper.courseTitle}\n`;
    content += `Semester: ${paper.semester}\n`;
    content += `Generated from years: ${paper.generatedFrom.join(', ')}\n`;
    content += '='.repeat(60) + '\n\n';

    const groupedQuestions = {};
    paper.questions.forEach(q => {
      const mainNumber = q.questionNumber.match(/^\d+/)?.[0];
      if (!groupedQuestions[mainNumber]) {
        groupedQuestions[mainNumber] = [];
      }
      groupedQuestions[mainNumber].push(q);
    });

    Object.keys(groupedQuestions).sort((a, b) => parseInt(a) - parseInt(b)).forEach(mainNumber => {
      groupedQuestions[mainNumber].forEach(q => {
        // Remove KaTeX/LaTeX formatting from text content
        let cleanText = q.questionText
          .replace(/\$\$([^$]+)\$\$/g, '$1')  // Remove block math delimiters
          .replace(/\$([^$]+)\$/g, '$1')      // Remove inline math delimiters
          .replace(/\\begin\{[^}]+\}/g, '')   // Remove LaTeX environments
          .replace(/\\end\{[^}]+\}/g, '')
          .replace(/\\[a-zA-Z]+/g, '')        // Remove LaTeX commands
          .replace(/[{}]/g, '')               // Remove braces
          .replace(/\s+/g, ' ')               // Normalize whitespace
          .trim();
        
        content += `${q.questionNumber}. ${cleanText}`;
        if (q.marks) content += ` [${q.marks} marks]`;
        content += '\n';
        content += `   Tag: ${q.tag}`;
        if (q.topic) content += ` | Topic: ${q.topic}`;
        content += ` | From: ${q.year} (${q.examType})`;
        content += '\n\n';
      });
      content += '\n';
    });

    return content;
  };

  // Group questions by main number
  const groupedQuestions = {};
  paper.questions.forEach(q => {
    const mainNumber = q.questionNumber.match(/^\d+/)?.[0];
    if (!groupedQuestions[mainNumber]) {
      groupedQuestions[mainNumber] = [];
    }
    groupedQuestions[mainNumber].push(q);
  });

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 print:shadow-none">
      {/* Header Section */}
      <div className="mb-6 pb-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {paper.courseCode} - {paper.courseTitle}
            </h2>
            <p className="text-gray-600 mt-2">Semester: {paper.semester}</p>
            <p className="text-sm text-gray-500 mt-1">
              Generated from years: {paper.generatedFrom.join(', ')}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FiPrinter />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FiDownload />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Questions Section with optimized spacing */}
      <div className="space-y-6">
        {Object.keys(groupedQuestions)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(mainNumber => (
          <div key={mainNumber} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Question {mainNumber}
            </h3>
            {groupedQuestions[mainNumber].map(question => (
              <div 
                key={question.id || question.questionNumber} 
                className="ml-4 p-3 bg-gray-50 rounded-lg border-l-4 border-orange-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Question number and text with controlled spacing */}
                    <div className="font-medium text-gray-800 question-math">
                      <span className="font-bold text-indigo-600 mr-2 inline-block">
                        {question.questionNumber}.
                      </span>
                      <div className="inline-block align-top question-content">
                        {renderQuestionText(question.questionText)}
                      </div>
                    </div>
                    
                    {/* Tags section */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-medium">
                        Tag: {question.tag}
                      </span>
                      {question.topic && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                          Topic: {question.topic}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md font-medium">
                        From: {question.year} ({question.examType})
                      </span>
                    </div>
                  </div>
                  
                  {/* Marks badge */}
                  {question.marks && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm">
                        {question.marks} marks
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-500">
        Generated by Question Shuffle System • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

// ===================================