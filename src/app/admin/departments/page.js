// app/admin/departments/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ universityId: '', departments: '' });

  useEffect(() => {
    fetchDepartments();
    fetchUniversities();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      if (response.ok) {
        const data = await response.json();
        setUniversities(data);
      }
    } catch (error) {
      toast.error('Failed to fetch universities');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => toast.error(error));
        }
        setShowForm(false);
        setFormData({ universityId: '', departments: '' });
        fetchDepartments();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete all related courses and questions.')) {
      return;
    }

    try {
      const response = await fetch(`/api/departments?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Department deleted');
        fetchDepartments();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setFormData({ universityId: '', departments: '' });
          }}
          className="flex items-center gap-2 btn-primary"
        >
          <FiPlus />
          Add Departments
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Departments (Bulk Upload)</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University *
                </label>
                <select
                  value={formData.universityId}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select University</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Names (comma-separated) *
                </label>
                <textarea
                  value={formData.departments}
                  onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                  className="input-field"
                  placeholder="Computer Science, Electrical Engineering, Mechanical Engineering"
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Add Departments
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ universityId: '', departments: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                University
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((department) => (
              <tr key={department.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {department.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {department.university.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {department._count?.courses || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(department.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
