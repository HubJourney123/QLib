// components/QuestionPaper.js
'use client';

import { FiPrinter, FiDownload } from 'react-icons/fi';

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

    Object.keys(groupedQuestions).sort().forEach(mainNumber => {
      groupedQuestions[mainNumber].forEach(q => {
        content += `${q.questionNumber}. ${q.questionText}`;
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

      <div className="space-y-8">
        {Object.keys(groupedQuestions).sort().map(mainNumber => (
          <div key={mainNumber} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Question {mainNumber}
            </h3>
            {groupedQuestions[mainNumber].map(question => (
              <div key={question.id || question.questionNumber} className="ml-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {question.questionNumber}. {question.questionText}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Tag: {question.tag}
                      </span>
                      {question.topic && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          Topic: {question.topic}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded">
                        From: {question.year} ({question.examType})
                      </span>
                    </div>
                  </div>
                  {question.marks && (
                    <span className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded font-semibold">
                      {question.marks} marks
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================================