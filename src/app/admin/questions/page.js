// app/admin/questions/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiUpload, FiFileText, FiTrash2, FiDownload } from 'react-icons/fi';

export default function QuestionsPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [papers, setPapers] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchPapers();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchPapers = async () => {
    try {
      const response = await fetch(`/api/questions?courseId=${selectedCourse.id}`);
      if (response.ok) {
        const questions = await response.json();
        // Group questions by paper
        const papersMap = {};
        questions.forEach(q => {
          const paperId = q.questionPaper.id;
          if (!papersMap[paperId]) {
            papersMap[paperId] = {
              ...q.questionPaper,
              questions: []
            };
          }
          papersMap[paperId].questions.push(q);
        });
        setPapers(Object.values(papersMap));
      }
    } catch (error) {
      toast.error('Failed to fetch papers');
    }
  };

  const handleUpload = async () => {
    try {
      const questionPaperData = JSON.parse(jsonInput);
      
      // Validate JSON structure
      if (!questionPaperData.year || !questionPaperData.semester || 
          !questionPaperData.courseCode || !questionPaperData.courseTitle ||
          !questionPaperData.examType || !questionPaperData.questions) {
        toast.error('Invalid JSON format. Please check the example.');
        return;
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          questionPaperData
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setShowUploadForm(false);
        setJsonInput('');
        fetchPapers();
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (!confirm('Are you sure? This will delete all questions in this paper.')) {
      return;
    }

    try {
      const response = await fetch(`/api/questions?paperId=${paperId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Paper deleted');
        fetchPapers();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const generateSampleJson = () => {
    const sample = {
      year: 2023,
      semester: 4,
      courseCode: selectedCourse?.code || "CSE2113",
      courseTitle: selectedCourse?.name || "Data Structures",
      examType: "regular",
      questions: [
        {
          questionNumber: "1(a)",
          questionText: "Define data structure. What are the different types of data structures?",
          marks: 5,
          tag: "definition",
          topic: "introduction"
        },
        {
          questionNumber: "1(b)",
          questionText: "Write an algorithm to insert a node at the beginning of a linked list.",
          marks: 7,
          tag: "algorithm",
          topic: "linked list"
        },
        {
          questionNumber: "2(a)",
          questionText: "Explain the concept of time complexity with examples.",
          marks: 6,
          tag: "theory",
          topic: "complexity analysis"
        },
        {
          questionNumber: "2(b)",
          questionText: "Derive the time complexity of binary search algorithm.",
          marks: 8,
          tag: "derivation",
          topic: "searching"
        }
      ]
    };
    
    setJsonInput(JSON.stringify(sample, null, 2));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Questions Management</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Course</h2>
        <select
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const course = courses.find(c => c.id === e.target.value);
            setSelectedCourse(course);
            setPapers([]);
          }}
          className="input-field"
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name} ({course.department.name})
            </option>
          ))}
        </select>

        {selectedCourse && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Department:</strong> {selectedCourse.department.name}<br />
              <strong>University:</strong> {selectedCourse.department.university.name}<br />
              <strong>Semester:</strong> {selectedCourse.semester} | <strong>Credits:</strong> {selectedCourse.credits}
            </p>
          </div>
        )}
      </div>

      {selectedCourse && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Question Papers</h2>
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 btn-primary"
            >
              <FiUpload />
              Upload Questions
            </button>
          </div>

          {showUploadForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Upload Question Paper (JSON)</h3>
              
              <div className="mb-4">
                <button
                  onClick={generateSampleJson}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <FiFileText />
                  Generate Sample JSON
                </button>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="input-field font-mono text-sm"
                rows="20"
                placeholder="Paste your JSON here..."
              />

              <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
                <strong>JSON Format:</strong>
                <ul className="mt-2 list-disc list-inside">
                  <li>year: Question paper year (number)</li>
                  <li>semester: Semester number</li>
                  <li>courseCode: Course code</li>
                  <li>courseTitle: Course title</li>
                  <li>examType: "regular" or "backlog"</li>
                  <li>questions: Array of question objects</li>
                </ul>
                <strong className="mt-2 block">Each question should have:</strong>
                <ul className="mt-1 list-disc list-inside">
                  <li>questionNumber: e.g., "1(a)", "1(b)", "2(a)"</li>
                  <li>questionText: The actual question</li>
                  <li>marks: Number of marks (optional)</li>
                  <li>tag: "definition", "mathematical problem", "theory", or "derivation"</li>
                  <li>topic: Topic name (optional)</li>
                </ul>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={handleUpload} className="btn-primary">
                  Upload
                </button>
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setJsonInput('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {papers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                No question papers uploaded yet for this course.
              </div>
            ) : (
              papers.map((paper) => (
                <div key={paper.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {paper.year} - {paper.examType === 'regular' ? 'Regular' : 'Backlog'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {paper.courseCode} - {paper.courseTitle} | Semester: {paper.semester}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePaper(paper.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Questions ({paper.questions.length}):</h4>
                    {paper.questions.sort((a, b) => 
                      a.questionNumber.localeCompare(b.questionNumber, undefined, { numeric: true })
                    ).map((question) => (
                      <div key={question.id} className="pl-4 py-2 border-l-2 border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm">
                              <strong>{question.questionNumber}.</strong> {question.questionText}
                            </p>
                            <div className="flex gap-2 mt-1 text-xs">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {question.tag}
                              </span>
                              {question.topic && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                  {question.topic}
                                </span>
                              )}
                            </div>
                          </div>
                          {question.marks && (
                            <span className="ml-4 text-sm font-medium text-gray-600">
                              {question.marks} marks
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}