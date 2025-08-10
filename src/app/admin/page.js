// app/admin/page.js
'use client';

import { useState, useEffect } from 'react';
import { FiGlobe, FiLayers, FiBook, FiFileText } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    universities: 0,
    departments: 0,
    courses: 0,
    questions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all data to get counts
      const [univRes, deptRes, courseRes, questRes] = await Promise.all([
        fetch('/api/universities'),
        fetch('/api/departments'),
        fetch('/api/courses'),
        fetch('/api/questions')
      ]);

      if (univRes.ok && deptRes.ok && courseRes.ok && questRes.ok) {
        const [universities, departments, courses, questions] = await Promise.all([
          univRes.json(),
          deptRes.json(),
          courseRes.json(),
          questRes.json()
        ]);

        setStats({
          universities: universities.length,
          departments: departments.length,
          courses: courses.length,
          questions: questions.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    { label: 'Universities', value: stats.universities, icon: FiGlobe, href: '/admin/universities', color: 'bg-blue-500' },
    { label: 'Departments', value: stats.departments, icon: FiLayers, href: '/admin/departments', color: 'bg-green-500' },
    { label: 'Courses', value: stats.courses, icon: FiBook, href: '/admin/courses', color: 'bg-purple-500' },
    { label: 'Questions', value: stats.questions, icon: FiFileText, href: '/admin/questions', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <Icon className={`text-2xl ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                </div>
                <h3 className="text-gray-600 font-medium">{stat.label}</h3>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/universities" className="btn-primary text-center">
            Manage Universities
          </Link>
          <Link href="/admin/departments" className="btn-primary text-center">
            Manage Departments
          </Link>
          <Link href="/admin/courses" className="btn-primary text-center">
            Manage Courses
          </Link>
          <Link href="/admin/questions" className="btn-primary text-center">
            Upload Questions
          </Link>
        </div>
      </div>
    </div>
  );
}