// components/SearchCourse.js
'use client';

import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchCourse({ onCourseSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCourses();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const searchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course code or name..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {loading && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg p-4">
          <div className="animate-pulse">Searching...</div>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((course) => (
            <button
              key={course.id}
              onClick={() => {
                onCourseSelect(course);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition border-b last:border-b-0"
            >
              <div className="font-semibold text-gray-800">
                {course.code} - {course.name}
              </div>
              <div className="text-sm text-gray-600">
                {course.department.name}, {course.department.university.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Semester: {course.semester} | Credits: {course.credits} | 
                Papers: {course.papers.length}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================================