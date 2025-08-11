// app/page.js
'use client';

import { useState } from 'react';
import SearchCourse from '@/components/SearchCourse';
import QuestionPaper from '@/components/QuestionPaper';
import { FiSearch, FiShuffle, FiSettings } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [shuffledPaper, setShuffledPaper] = useState(null);
  const [selectedYears, setSelectedYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleShuffle = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/shuffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          years: selectedYears.length > 0 ? selectedYears : null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setShuffledPaper(data);
      }
    } catch (error) {
      console.error('Failed to shuffle:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableYears = selectedCourse?.papers?.map(p => p.year)
    .filter((year, index, self) => self.indexOf(year) === index)
    .sort((a, b) => b - a) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-200">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">
                Question Shuffle System
              </h1>
            </div>
            <div className="flex items-center">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <FiSettings />
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Generate Shuffled Question Papers
            </h2>
            <p className="text-gray-600">
              Search for a course and generate a new question paper by shuffling previous years questions
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-4">
              <FiSearch className="text-xl" />
              <span className="font-semibold">Search Course</span>
            </div>
            
            <SearchCourse onCourseSelect={setSelectedCourse} />

            {selectedCourse && (
              <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Selected Course: {selectedCourse.code} - {selectedCourse.name}
                </h3>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>Department: {selectedCourse.department.name}</p>
                  <p>University: {selectedCourse.department.university.name}</p>
                  <p>Semester: {selectedCourse.semester} | Credits: {selectedCourse.credits}</p>
                  <p>Available Years: {availableYears.join(', ') || 'No papers available'}</p>
                </div>

                {availableYears.length > 0 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Years to Include (Optional - leave empty for all years)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableYears.map(year => (
                          <label key={year} className="flex items-center">
                            <input
                              type="checkbox"
                              value={year}
                              checked={selectedYears.includes(year)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedYears([...selectedYears, year]);
                                } else {
                                  setSelectedYears(selectedYears.filter(y => y !== year));
                                }
                              }}
                              className="mr-2 rounded text-indigo-600"
                            />
                            <span className="text-sm">{year}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleShuffle}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      <FiShuffle className="text-xl" />
                      {loading ? 'Generating...' : 'Generate Shuffled Paper'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {shuffledPaper && (
          <div className="mt-8">
            <QuestionPaper paper={shuffledPaper} />
          </div>
        )}
      </main>
    </div>
  );
}
// ===================================